const socket = io();
let map = null;
const footerButtons = document.querySelectorAll('.footer-btn');
const meetBtn = document.getElementById('meet-btn');
const shareLocationCheckbox = document.getElementById('share-location-checkbox');
const mapContainer = document.getElementById('map');
const currentUser = mapContainer.dataset.userid;
console.log(currentUser, "current test user" + typeof currentUser);

// Objects for caching and keeping track of HTML marker objects (for performance)
let markers = {};
let markersOnScreen = {};

// Initialize the map
const initMap = async () => {
    const secretKeys = await getSecretKeys();
    const apiKey = secretKeys.MAPBOX_API_KEY;
    mapboxgl.accessToken = apiKey;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-123.3656, 54.0913],
        zoom: 1
    });
    const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
        showUserHeading: true
    });
    map.addControl(geolocateControl);
    geolocateControl.on('geolocate', async function (event) {
        const userLocation = { latitude: event.coords.latitude, longitude: event.coords.longitude };
        await updateUserLocationOnServer(userLocation);
    });
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        map.addSource('markers', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'markers',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    100,
                    '#f1f075',
                    750,
                    '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'markers',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        // Set the debounce timeout to 1000ms
        // const debounceTimeout = 1000;
        // Initialize the debounce timer variable
        // let debounceTimer;
        map.on('moveend', async () => {
            try {
                // clearTimeout(debounceTimer);
                // debounceTimer = setTimeout(() => {
                const mapCenter = map.getCenter();
                socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
                socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
                // }, debounceTimeout);
            } catch (error) {
                console.error(error);
            }
        });
    });
};

// Fetch icon from the server
const getIcon = async (userId) => {
    try {
        const response = await fetch(`/api-user/${userId}/icon`);
        const icon = await response.json();
        return icon;
    } catch (error) {
        console.error(error);
    }
};

// Add marker when new user shares their location
socket.on('addMarker', async ({ userId, lat, lng, iconUrl }) => {
    addMarkerToSource(map, userId, lat, lng, iconUrl);
});

// Remove marker when user stops sharing their location
socket.on('removeMarker', ({ userId }) => {
    removeMarkerFromSource(map, userId);
});

// Get stored locations from the server
socket.on('nearbySharedLocations', async (data) => {
    let storedLocations = data.nearbyUsers;
    console.log(storedLocations, "stored locations from server");
    storedLocations = storedLocations.filter(location => location.userId !== currentUser);
    // console.log(data.icons, "icons from server");
    await renderNearbyMarkers(map, storedLocations, data.icons);
});

// Render clusters and markers on the map
const renderNearbyMarkers = async (map, storedLocations, icons) => {
    const newMarkers = {};
    const userId = currentUser;
    storedLocations = storedLocations.filter(location => location.userId !== userId);

    // Create an array of GeoJSON feature collections for each point
    const markersData = storedLocations.map(location => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
        },
        properties: {
            userId: location.userId,
            icon: location.userId,
        }
    }));
    const markersSource = map.getSource('markers');
    if (markersSource) {
        markersSource.setData({ type: 'FeatureCollection', features: markersData });
    }

    // For each cluster on the screen, create an HTML marker for it (if didn't create yet),
    // and add it to the map if it's not there already
    const features = map.querySourceFeatures('markers');
    features.forEach(feature => {
        if (!feature.properties.cluster) {
            let marker = markers[feature.properties.userId];
            if (!marker) {
                const el = document.createElement('div');
                el.className = 'marker';
                el.id = userId;
                el.classList.add('marker', 'w-16', 'h-16', 'rounded-full', 'bg-no-repeat', 'bg-center', 'bg-cover', 'border-2', 'border-white', 'shadow-lg');
                el.style.backgroundImage = `url(${icons[feature.properties.userId]})`;
                el.style.backgroundSize = '100%';
                const link = document.createElement('a');
                link.href = '/user-profile/' + feature.properties.userId;
                link.appendChild(el);
                marker = markers[feature.properties.userId] = new mapboxgl.Marker(link)
                    .setLngLat(feature.geometry.coordinates);
            }
            newMarkers[feature.properties.userId] = marker;
            if (!markersOnScreen[feature.properties.userId]) marker.addTo(map);
        };
    });
    // For each marker added previously, remove those that are no longer visible
    for (const userId in markersOnScreen) {
        if (!newMarkers[userId]) markersOnScreen[userId].remove();
    }
    markersOnScreen = newMarkers;
};

// Add marker to the map when a new user shares their location
const addMarkerToSource = (map, userId, lat, lng, iconUrl) => {
    if (markersOnScreen[userId]) {
        console.log("marker already on screen");
        return;
    }
    // Add new marker to the markers source
    const markersSource = map.getSource('markers');
    if (markersSource) {
        const currentData = markersSource._data;
        const markerData = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            properties: {
                userId: userId,
                icon: iconUrl
            }
        };
        currentData.features.push(markerData);
        markersSource.setData(currentData);

        // Create the HTML marker element and add it to the map
        const el = document.createElement('div');
        el.className = 'marker';
        el.id = userId;
        el.classList.add('marker', 'w-16', 'h-16', 'rounded-full', 'bg-no-repeat', 'bg-center', 'bg-cover', 'border-2', 'border-white', 'shadow-lg');
        el.style.backgroundImage = `url(${iconUrl})`;
        el.style.backgroundSize = '100%';
        const link = document.createElement('a');
        link.href = '/user-profile/' + userId;
        link.appendChild(el);
        const marker = new mapboxgl.Marker(link).setLngLat([lng, lat]);
        markersOnScreen[userId] = marker;
        markers[userId] = marker;
        marker.addTo(map);

        // Update the cluster layer's source data
        const clusterSource = map.getSource('clusters');
        if (clusterSource) {
            const clusterData = clusterSource._data;
            clusterData.features[0].properties.cluster = true;
            clusterSource.setData(clusterData);
        }

    }
};

// Remove marker from the map when a user stops sharing their location
const removeMarkerFromSource = (map, userId) => {
    const markersSource = map.getSource('markers');
    if (markersSource) {
        const currentData = markersSource._data;
        const filteredFeatures = currentData.features.filter(
            feature => feature.properties.userId !== userId
        );
        currentData.features = filteredFeatures;
        markersSource.setData(currentData);

        // Remove the marker from the map
        const marker = markersOnScreen[userId];
        if (marker) {
            console.log("removing marker from screen");
            marker.remove();
            delete markersOnScreen[userId];
            delete markers[userId];
        }
    }
};

// Share location checkbox handler
// shareLocationCheckbox.addEventListener('click', async () => {
//     const isSharingLocation = shareLocationCheckbox.checked;
//     console.log(currentUser + "is sharing location: " + isSharingLocation);
//     try {
//         const userLocation = await getCurrentUserLocation();
//         // const { randomLat, randomLng } = await generateRandomLocationForTestUser(userLocation);
//         if (isSharingLocation) {
//             console.log("handling add new shared location for" + currentUser);
//             const icon = await getIcon(currentUser);
//             const iconUrl = icon.profileImageURI;
//             socket.emit('addNewSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude, iconUrl });
//         } else {
//             console.log("handling remove shared location for" + currentUser);
//             socket.emit('removeSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude });
//         }
//     } catch (error) {
//         console.error(error);
//     }
// });

const toggleLocationButton = document.getElementById('toggleLocationButton');
const toggleLocationButtonIcon = document.querySelector('.toggle-button i');
toggleLocationButton.addEventListener('click', async () => {
    const isSharingLocation = !toggleLocationButton.classList.contains('active');
    toggleLocationButton.classList.toggle('active', isSharingLocation);
    console.log(currentUser + ' is sharing location: ' + isSharingLocation);
    try {
        const userLocation = await getCurrentUserLocation();
        if (isSharingLocation) {
            console.log('Handling add new shared location for ' + currentUser);
            const icon = await getIcon(currentUser);
            const iconUrl = icon.profileImageURI;
            socket.emit('addNewSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude, iconUrl });
            toggleLocationButtonIcon.classList.remove('text-black');
            toggleLocationButtonIcon.classList.add('text-[#ffffff]');
        } else {
            console.log('Handling remove shared location for ' + currentUser);
            socket.emit('removeSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude });
            toggleLocationButtonIcon.classList.remove('text-[#ffffff]');
            toggleLocationButtonIcon.classList.add('text-black');
        }
    } catch (error) {
        console.error(error);
    }
});

// Initialize map
initMap();

// Join the room when the window loads
window.addEventListener('load', () => {
    socket.emit('join', { userId: currentUser });
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    meetBtn.classList.add('text-[#878d26]');
}
);



// Used for testing purposes. Offsets the user's location by a random amount
// Generate random location within the test user's area
// const generateRandomLocationForTestUser = async (userLocation) => {
//     const { latitude, longitude } = userLocation;
//     const randomLat = latitude + (Math.random() - 0.5) * 0.05;
//     const randomLng = longitude + (Math.random() - 0.5) * 0.05;
//     return { randomLat, randomLng };
// };
