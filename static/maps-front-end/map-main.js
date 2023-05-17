const socket = io();
let map = null;
let switchToEvents = false;

// Objects for caching and keeping track of HTML marker objects (for performance)
let markers = {};
let markersOnScreen = {};

// DOM elements
const footerButtons = document.querySelectorAll('.footer-btn');
const meetBtn = document.getElementById('meet-btn');
const shareLocationCheckbox = document.getElementById('share-location-checkbox');
const mapContainer = document.getElementById('map');
const infoWindow = document.getElementById('infoWindow');
const closeInfoWindow = document.getElementById('closeInfoWindow');
const infoWindowContent = document.getElementById('info-message');
const dropdown = document.getElementById('dropdown');
const toggleLocationButton = document.getElementById('toggleLocationButton');
const toggleLocationButtonIcon = document.querySelector('.toggle-button i');

// Global user id variable
const currentUser = mapContainer.dataset.userid;
console.log(currentUser, "current test user" + typeof currentUser);

// Add layers to the map
const addLayers = (map) => {
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
            'text-size': 14
        }
    });

    map.addSource('events', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    map.addLayer({
        id: 'events-clusters',
        type: 'circle',
        source: 'events',
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
        id: 'events-cluster-count',
        type: 'symbol',
        source: 'events',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
        }
    });
};


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
        addLayers(map);
    });

    // Set the debounce timeout to 1000ms
    // const debounceTimeout = 1000;
    // Initialize the debounce timer variable
    // let debounceTimer;
    map.on('moveend', async () => {
        try {
            if (switchToEvents) {
                addEventsToMap(map);
            } else {
                // clearTimeout(debounceTimer);s
                // debounceTimer = setTimeout(() => {
                const mapCenter = map.getCenter();
                socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
                socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
                // }, debounceTimeout);
            }
        } catch (error) {
            console.error(error);
        }
    });
};

// Initialize the map
initMap();

// Add marker when new user shares their location
socket.on('addMarker', async ({ userId, lat, lng, iconUrl }) => {
    if (switchToEvents) return;
    addMarkerToSource(map, userId, lat, lng, iconUrl);
});

// Remove marker when user stops sharing their location
socket.on('removeMarker', ({ userId }) => {
    if (switchToEvents) return;
    removeMarkerFromSource(map, userId);
});

// Get stored locations from the server
socket.on('nearbySharedLocations', async (data) => {
    let storedLocations = data.nearbyUsers;
    console.log(storedLocations, "stored locations from server");
    storedLocations = storedLocations.filter(location => location.userId !== currentUser);
    console.log(data.icons, "icons from server");
    addUserMarkersToMap(map, storedLocations, data.icons);
});

// Create user marker feature
const createUserMarkerFeature = (userId, lat, lng, icon) => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        },
        properties: {
            userId: userId,
            icon: icon,
        }
    };
};

// Create a marker for a user
const createUserMarker = (icon, feature, userId) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.id = userId;
    el.classList.add('marker', 'w-16', 'h-16', 'rounded-full', 'bg-no-repeat', 'bg-center', 'bg-cover', 'border-2', 'border-white', 'shadow-lg');
    el.style.backgroundImage = `url(${icon})`;
    el.style.backgroundSize = '100%';
    const link = document.createElement('a');
    link.href = '/user-profile/' + feature.properties.userId;
    link.target = '_blank';
    link.appendChild(el);
    return link;
};

// Render clusters and markers on the map
const addUserMarkersToMap = async (map, storedLocations, icons) => {
    const newMarkers = {};
    const userId = currentUser;
    storedLocations = storedLocations.filter(location => location.userId !== userId);
    // Create an array of GeoJSON feature collections for each point
    const markersData = storedLocations.map(location => {
        return createUserMarkerFeature(location.userId, location.lat, location.lng, icons[location.userId]);
    });
    // For each cluster on the screen, create an HTML marker for it (if didn't create yet),and add it to the map if it's not there already
    const markersSource = map.getSource('markers');
    if (markersSource) {
        console.log("markers source exists");
        markersSource.setData({ type: 'FeatureCollection', features: markersData });
        const features = map.querySourceFeatures('markers');
        console.log(features, "features from map");
        features.forEach(feature => {
            if (!feature.properties.cluster) {
                console.log("feature is not a cluster", feature.properties.userId);
                let marker = markers[feature.properties.userId];
                if (!marker) {
                    const icon = icons[feature.properties.userId];
                    const markerElement = createUserMarker(icon, feature, feature.properties.userId);
                    marker = markers[feature.properties.userId] = new mapboxgl.Marker(markerElement)
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
        const markerData = createUserMarkerFeature(userId, lat, lng, iconUrl);
        currentData.features.push(markerData);
        markersSource.setData(currentData);
        // Create the HTML marker element and add it to the map
        const userMarkerElement = createUserMarker(iconUrl, markerData, userId);
        const marker = new mapboxgl.Marker(userMarkerElement).setLngLat([lng, lat]);
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

// Fetch user profile icon from the server
const getIcon = async (userId) => {
    try {
        const response = await fetch(`/api-user/${userId}/icon`);
        const icon = await response.json();
        return icon;
    } catch (error) {
        console.error(error);
    }
};

//------------------------------------------------------------------------------------------------------------//
// DOM events
//------------------------------------------------------------------------------------------------------------//

// Toggle sharing location
toggleLocationButton.addEventListener('click', async () => {
    infoWindow.classList.toggle('hidden');
    const isSharingLocation = !toggleLocationButton.classList.contains('active-sharing');
    const sharingLocationMessage = "Your current location is shared with other users. As a tracking protection measure, next time your location will update on a map only when you disable and re-enable location sharing.";
    isSharingLocation ? infoWindowContent.innerHTML = sharingLocationMessage : infoWindowContent.innerHTML = 'Location sharing is disabled';
    toggleLocationButton.classList.toggle('active-sharing', isSharingLocation);
    try {
        const userLocation = await getCurrentUserLocation();
        if (isSharingLocation) {
            console.log('Handling add new shared location for ' + currentUser);
            const icon = await getIcon(currentUser);
            const iconUrl = icon.profileImageURI;
            socket.emit('addNewSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude, iconUrl });
            toggleLocationButtonIcon.classList.remove('text-black');
            toggleLocationButtonIcon.classList.add('text-[#878d26]');
        } else {
            console.log('Handling remove shared location for ' + currentUser);
            socket.emit('removeSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude });
            toggleLocationButtonIcon.classList.remove('text-[#878d26]');
            toggleLocationButtonIcon.classList.add('text-black');
        }
    } catch (error) {
        console.error(error);
    }
});

// Close info window
closeInfoWindow.addEventListener('click', () => {
    infoWindow.classList.add('hidden');
});

// Dropdown for switching between meet and events
dropdown.addEventListener('change', async () => {
    const selectedOption = dropdown.value;
    if (selectedOption === 'meet') {
        dropDownEvents.classList.add('hidden');
        toggleLocationButton.classList.remove('hidden');
        switchToEvents = false;
        if (map.getSource('events')) {
            const currentData = map.getSource('events')._data;
            currentData.features = [];
            map.getSource('events').setData(currentData);
        }
        const mapCenter = map.getCenter();
        const mapZoom = map.getZoom();
        map.fire('moveend');
        map.flyTo({ center: mapCenter, zoom: mapZoom });
    } else if (selectedOption === 'events') {
        dropDownEvents.classList.remove('hidden');
        switchToEvents = true;
        const markersSource = map.getSource('markers');
        if (markersSource) {
            const currentData = markersSource._data;
            currentData.features = [];
            markersSource.setData(currentData);
        }
        toggleLocationButton.classList.add('hidden');
        map.fire('moveend');
        const mapCenter = map.getCenter();
        const mapZoom = map.getZoom();
        map.fire('moveend');
        map.flyTo({ center: mapCenter, zoom: mapZoom });
    }
});

// Join the room when the window loads
window.addEventListener('load', () => {
    socket.emit('join', { userId: currentUser });
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    meetBtn.classList.add('text-[#878d26]');
}
);

// Reconnect the socket when the page is loaded from cache. Usually happens when user leaves the map and the back button is used to return to the map
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was loaded from cache (back button was used). Reconnect the socket
        socket.connect();
        socket.emit('join', { userId: currentUser });
        console.log('Reconnected socket');
    }
});

