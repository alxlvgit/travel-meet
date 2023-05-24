// Global variables
const socket = io();
let map = null;
let switchToEvents = false;

// Objects for caching and keeping track of HTML marker objects (for performance)
let markers = {};
let markersOnScreen = {};

// Cache the shared users' locations to apply offsets to markers with the same location
const usersLocationsCache = new Set();
const usersOffsets = {};

// Cache the locations of events to apply offsets to events with same location
const eventsMarkersLocationCache = new Set();
const eventsOffsets = {};

// DOM elements
const footerButtons = document.querySelectorAll('.footer-btn');
const meetBtn = document.getElementById('meet-btn');
const shareLocationCheckbox = document.getElementById('share-location-checkbox');
const mapContainer = document.getElementById('map');
const infoWindow = document.getElementById('infoWindow');
const closeInfoWindow = document.getElementById('closeInfoWindow');
const infoButton = document.querySelector('.info-button');
const dropdown = document.getElementById('dropdown');
const toggleLocationButton = document.getElementById('toggleLocationButton');
const toggleLocationContainer = document.querySelector('.toggle-location-container');
const toggleLocationButtonIcon = document.querySelector('.toggle-button i');
const searchButton = document.getElementById('searchButton');
const dropDownEvents = document.getElementById('dropdown-events');

// Global variables
const currentUser = mapContainer.dataset.userid;
const currentUserName = mapContainer.dataset.username;
console.log(currentUser, "current test user" + currentUser + currentUserName);

// Initialize the map
const initMap = async () => {
    const secretKeys = await getSecretKeys();
    const apiKey = secretKeys.MAPBOX_API_KEY;
    let loadEventsTriggered = false;
    mapboxgl.accessToken = apiKey;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
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

    map.on('load', async () => {
        addLayers(map);
        dropdown.selectedIndex = 0;
        searchButton.addEventListener('click', handleSearch);
        const userLocation = await getCurrentUserLocation();
        if (!userLocation) {
            return;
        }
        map.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 10,
            speed: 1,
            curve: 1.5,
        });
    });
    // Set the debounce timeout to 1000ms
    // const debounceTimeout = 1000;
    // Initialize the debounce timer variable
    // let debounceTimer;
    map.on('moveend', async () => {
        const mapCenter = map.getCenter();
        // clearTimeout(debounceTimer);
        // debounceTimer = setTimeout(() => {
        socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
        // }, debounceTimeout);
    });

    map.on('zoomend', async () => {
        if (loadEventsTriggered) {
            searchButton.classList.remove('hidden');
            return;
        }
        if (switchToEvents) {
            addEventsToMap(map);
        } else {
            const mapCenter = map.getCenter();
            socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
            socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
        }
        loadEventsTriggered = true;
    });

};

// Initialize the map
initMap();

// Add marker when new user shares their location
socket.on('addMarker', async ({ userId, lat, lng, iconUrl, username }) => {
    if (switchToEvents) return;
    addUserMarker(map, userId, lat, lng, iconUrl, username);
});

// Remove marker when user stops sharing their location
socket.on('removeMarker', ({ userId }) => {
    if (switchToEvents) return;
    removeUserMarker(map, userId);
    const mapCenter = map.getCenter();
    socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
});

// Get stored locations from the server
socket.on('nearbySharedLocations', async (data) => {
    let storedLocations = data.nearbyUsers;
    const usernames = data.usernames;
    const icons = data.icons;
    console.log(data, "all nearby shared locations from server");
    storedLocations = storedLocations.filter(location => location.userId !== currentUser);
    // console.log(data.icons, "icons from server");
    addNearbyUsersMarkersToMap(map, storedLocations, icons, usernames);
});

// Create user marker feature
const createUserMarkerFeature = (userId, lat, lng, icon, username) => {
    applyOffsetToMarker(lng, lat, userId, usersLocationsCache, usersOffsets);
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: usersOffsets[userId].length > 0 ? usersOffsets[userId] : [lng, lat]
        },
        properties: {
            id: userId,
            icon: icon,
            popupHTML: `<div class="flex flex-col items-center justify-center">
            <div class="flex items-center justify-center">
                <img src="${icon}" class="w-16 h-16 rounded-full object-cover border border-[#FFFFFF] outline-[#878d26] outline outline-2 shadow-lg" />
            </div>
            <div class="flex items-center justify-center mt-2">
                <a href="/user-profile/${userId}" class="text-[#878d26] font-semibold text-lg hover:text-black outline-none">${username}</a>
            </div>
        </div>`
        }
    };
};

// Create a marker for a user
const createUserMarker = (feature) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.id = feature.properties.id;
    el.style.backgroundSize = '100%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.backgroundSize = 'cover';
    el.classList.add('marker', 'w-8', 'h-8', 'rounded-full', 'shadow-lg', 'border-[#FFFFFF]', 'border', 'outline-[#878d26]', 'outline', 'outline-2');
    el.style.backgroundImage = `url(${feature.properties.icon})`;
    return el;
};

// Render clusters and markers on the map
const addNearbyUsersMarkersToMap = async (map, storedLocations, icons, usernames) => {
    // Create an array of GeoJSON feature collections for each point
    const featuresData = storedLocations.map(location => {
        return createUserMarkerFeature(location.userId, location.lat, location.lng, icons[location.userId], usernames[location.userId]);
    });
    // For each cluster on the screen, create an HTML marker for it (if didn't create yet),and add it to the map if it's not there already
    const markersSource = map.getSource('markers');
    if (markersSource) {
        markersSource.setData({ type: 'FeatureCollection', features: featuresData });
        map.on('render', () => {
            if (switchToEvents) return;
            handleUnclusteredMarkers(map, "markers");
        });
    }
};

// Add marker to the map when a new user shares their location
const addUserMarker = (map, userId, lat, lng, iconUrl, username) => {
    if (markersOnScreen[userId]) {
        console.log("marker already on screen");
        return;
    }
    // Add new marker to the markers source
    const markersSource = map.getSource('markers');
    if (markersSource) {
        const currentData = markersSource._data;
        const markerFeature = createUserMarkerFeature(userId, lat, lng, iconUrl, username);
        currentData.features.push(markerFeature);
        markersSource.setData(currentData);
        const userMarkerElement = createUserMarker(markerFeature);
        const marker = new mapboxgl.Marker(userMarkerElement)
            .setLngLat(markerFeature.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).addClassName('z-50')
                .setHTML(markerFeature.properties.popupHTML));
        markersOnScreen[userId] = marker;
        markers[userId] = marker;
        marker.addTo(map);
        const clusterSource = map.getSource('clusters');
        if (clusterSource) {
            const clusterData = clusterSource._data;
            clusterData.features[0].properties.cluster = true;
            clusterSource.setData(clusterData);
        }
    }
};

// Remove marker from the map when a user stops sharing their location
const removeUserMarker = (map, userId) => {
    const markersSource = map.getSource('markers');
    if (markersSource) {
        const currentData = markersSource._data;
        const filteredFeatures = currentData.features.filter(
            feature => feature.properties.id !== userId
        );
        currentData.features = filteredFeatures;
        markersSource.setData(currentData);
        // Remove the marker from the map
        const marker = markersOnScreen[userId];
        if (marker) {
            console.log("removing marker from screen");
            usersLocationsCache.delete(userId);
            delete usersOffsets[userId];
            marker.remove();
            delete markersOnScreen[userId];
            delete markers[userId];
        }
    }
};

//------------------------------------------------------------------------------------------------------------//
// DOM events
//------------------------------------------------------------------------------------------------------------//

// Handle "search in the area" button click
const handleSearch = async () => {
    searchButton.classList.add('hidden');
    if (switchToEvents) {
        await addEventsToMap(map);
        return;
    }
    const mapCenter = map.getCenter();
    socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
};

// Toggle sharing location
toggleLocationButton.addEventListener('click', async () => {
    const isSharingLocation = !toggleLocationButton.classList.contains('active-sharing');
    toggleLocationButton.classList.toggle('active-sharing', isSharingLocation);
    const iconTower = toggleLocationButton.querySelector('i');
    iconTower.classList.toggle('animate-pulse');
    try {
        const userLocation = await getCurrentUserLocation();
        if (!userLocation) {
            toggleLocationButton.classList.remove('active-sharing');
            iconTower.classList.remove('animate-pulse');
            console.log("user location not found");
            return;
        }
        if (isSharingLocation) {
            const icon = await getIcon(currentUser);
            const iconUrl = icon.profileImageURI;
            socket.emit('addNewSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude, iconUrl, username: currentUserName });
            toggleLocationButtonIcon.classList.remove('text-black');
            toggleLocationButtonIcon.classList.add('text-[#878d26]');
        } else {
            socket.emit('removeSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude });
            toggleLocationButtonIcon.classList.remove('text-[#878d26]');
            toggleLocationButtonIcon.classList.add('text-black');
        }
    } catch (error) {
        console.error(error);
    }
});

// Info button 
infoButton.addEventListener('click', () => {
    infoWindow.classList.toggle('hidden');
});

// Close info window
closeInfoWindow.addEventListener('click', () => {
    infoWindow.classList.add('hidden');
});

// Dropdown for switching between meet and events
dropdown.addEventListener('change', async () => {
    const selectedOption = dropdown.value;
    if (selectedOption === 'meet') {
        infoButton.classList.remove('hidden');
        dropDownEvents.classList.add('hidden');
        toggleLocationButton.classList.remove('hidden');
        toggleLocationContainer.classList.remove('hidden');
        switchToEvents = false;
        if (map.getSource('events')) {
            const currentData = map.getSource('events')._data;
            currentData.features = [];
            map.getSource('events').setData(currentData);
        }
        const mapCenter = map.getCenter();
        socket.emit('getSharedLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
    } else if (selectedOption === 'events') {
        infoButton.classList.add('hidden');
        dropDownEvents.classList.remove('hidden');
        switchToEvents = true;
        const markersSource = map.getSource('markers');
        if (markersSource) {
            const currentData = markersSource._data;
            currentData.features = [];
            markersSource.setData(currentData);
        }
        toggleLocationButton.classList.add('hidden');
        toggleLocationContainer.classList.add('hidden');
        await addEventsToMap(map);
    }
});

// Dropdown for switching between events categories
dropDownEvents.addEventListener('change', async (e) => {
    switch (e.target.value) {
        case "art":
            apiKeySearchQueryParam = "Arts & Theatre";
            break;
        case "music":
            apiKeySearchQueryParam = "Music";
            break;
        case "sports":
            apiKeySearchQueryParam = "Sports";
            break;
        case "seminars":
            apiKeySearchQueryParam = "Seminar";
            break;
        default:
            apiKeySearchQueryParam = "";
            break;
    }
    addEventsToMap(map);
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

