const socket = io();
let map = null;
const footerButtons = document.querySelectorAll('.footer-btn');
const meetBtn = document.getElementById('meet-btn');
const shareLocationCheckbox = document.getElementById('share-location-checkbox');
const mapContainer = document.getElementById('map');
const currentUser = mapContainer.dataset.userid;
const markers = [];
console.log(currentUser, "current test user" + typeof currentUser);


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
            socket.emit('getStoredLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentUser });
            // }, debounceTimeout);
        } catch (error) {
            console.error(error);
        }
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
socket.on('newLocation', async ({ userId, lat, lng, iconUrl }) => {
    // alert('new shared location received in your area from' + userId);
    await createMarker(userId, lat, lng, iconUrl);
});

// Remove marker when user stops sharing their location
socket.on('removeLocation', ({ userId }) => {
    // alert(userId + 'removed their shared location in your area');
    const existingMarker = document.getElementById(userId);
    if (existingMarker) {
        console.log('removing marker');
        existingMarker.remove();
        markers.forEach((marker, index) => {
            if (marker.getElement().id === userId) {
                markers.splice(index, 1);
            }
        });
    } else {
        console.log('marker does not exist');
    }
});

// Get stored locations from the server
socket.on('storedLocations', async (data) => {
    let storedLocations = data.nearbyUsers;
    console.log(storedLocations, "stored locations from server");
    storedLocations = storedLocations.filter(location => location.userId !== currentUser);
    await renderNearbyMarkers(map, storedLocations, data.icons);
});

// Create marker 
const createMarker = async (userId, lat, lng, icon) => {
    const el = document.createElement('div');
    el.id = userId;
    el.classList.add('marker', 'w-12', 'h-12', 'rounded-full', 'bg-no-repeat', 'bg-center', 'bg-cover');
    el.style.backgroundImage = `url(${icon})`;
    el.style.backgroundSize = '100%';
    el.addEventListener('click', () => {
        window.alert(`User ${userId} is here!`);
    });
    const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map);
    markers.push(marker);
};

// Render markers of users that are sharing their location close to the current 
// user's position on the map
const renderNearbyMarkers = async (map, storedLocations, icons) => {
    if (storedLocations.length === 0) {
        markers.forEach(marker => marker.remove());
        return;
    }
    const userId = currentUser;
    storedLocations = storedLocations.filter(location => location.userId !== userId);
    markers.forEach(marker => marker.remove());
    if (storedLocations.length > 0) {
        for (const location of storedLocations) {
            await createMarker(location.userId, location.lat, location.lng, icons[location.userId]);
        };
    }
};

// Generate random location within the test user's area
const generateRandomLocationForTestUser = async (userLocation) => {
    const { latitude, longitude } = userLocation;
    const randomLat = latitude + (Math.random() - 0.5) * 0.05;
    const randomLng = longitude + (Math.random() - 0.5) * 0.05;
    return { randomLat, randomLng };
};

// Share location checkbox
shareLocationCheckbox.addEventListener('click', async () => {
    const isSharingLocation = shareLocationCheckbox.checked;
    console.log(currentUser + "is sharing location: " + isSharingLocation);
    try {
        const userLocation = await getCurrentUserLocation();
        const { randomLat, randomLng } = await generateRandomLocationForTestUser(userLocation);
        if (isSharingLocation) {
            console.log("handling add new shared location for" + currentUser);
            const icon = await getIcon(currentUser);
            const iconUrl = icon.profileImageURI;
            socket.emit('addNewSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude, iconUrl });
        } else {
            console.log("handling remove shared location for" + currentUser);
            socket.emit('removeSharedLocation', { userId: currentUser, lat: userLocation.latitude, lng: userLocation.longitude });
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

// Leave the room when the window closes
window.addEventListener('beforeunload', () => {
    socket.emit('leave', { userId: currentUser });
}
);


