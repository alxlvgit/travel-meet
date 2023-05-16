const socket = io();
let map = null;
const footerButtons = document.querySelectorAll('.footer-btn');
const meetBtn = document.getElementById('meet-btn');
const shareLocationCheckbox = document.getElementById('share-location-checkbox');
const pickedUser = document.getElementById('users');
const markers = [];
let currentTestUser = "1";
let isSharingLocation = false;
const mapContainer = document.getElementById('map');
const userId = mapContainer.dataset.userid;
console.log(userId, "user id from map container");



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
    map.on('dragend', async () => {
        try {
            const mapCenter = map.getCenter();
            socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentTestUser });
            socket.emit('getStoredLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentTestUser });
        } catch (error) {
            console.error(error);
        }
    });
    map.on('zoomend', async () => {
        try {
            const mapCenter = map.getCenter();
            socket.emit('userTraversingOnMap', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentTestUser });
            socket.emit('getStoredLocations', { lat: mapCenter.lat, lng: mapCenter.lng, userId: currentTestUser });
        } catch (error) {
            console.error(error);
        }
    });
};

// Add marker when new user shares their location
socket.on('newLocation', ({ userId, lat, lng }) => {
    // alert('new shared location received in your area');
    const existingMarker = document.getElementById(userId);
    if (existingMarker) {
        console.log('marker already exists');
        existingMarker.remove();
    } else {
        console.log('adding new marker');
        const el = document.createElement('div');
        const width = 40;
        const height = 40;
        el.className = 'marker';
        el.id = userId;
        el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
        el.style.borderRadius = '50%';
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundSize = '100%';

        el.addEventListener('click', () => {
            window.alert(`User ${userId} is here!`);
        });
        // Add markers to the map.
        const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map);
        markers.push(marker);
    }
});

// Remove marker when user stops sharing their location
socket.on('removeLocation', ({ userId }) => {
    // alert('user removed their shared location in your area');
    const existingMarker = document.getElementById(userId);
    if (existingMarker) {
        console.log('marker already exists');
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
    const storedLocations = data.nearbyUsers;
    console.log(storedLocations, "stored locations from server");
    if (data.userId === currentTestUser) {
        await renderNearbyMarkers(map, storedLocations);
    } else {
        console.log('not current user');
    }
});


// Fetch icon from the server
const getIcon = async (userId) => {
    const response = await fetch(`/api-user/${userId}/icon`);
    const icon = await response.json();
    return icon;
};

// Render markers for nearby users
const renderNearbyMarkers = async (map, storedLocations) => {
    if (storedLocations.length === 0) {
        markers.forEach(marker => marker.remove());
        return;
    }
    const userId = currentTestUser;
    storedLocations = storedLocations.filter(location => location.userId !== userId);
    markers.forEach(marker => marker.remove());
    // console.log(storedLocations, "filtered stored locations to exclude current user's location");
    if (storedLocations.length > 0) {
        for (const location of storedLocations) {
            // const icon = await getIcon(location.userId);
            const el = document.createElement('div');
            const width = 40;
            const height = 40;
            el.className = 'marker';
            el.id = location.userId;
            // temporary icons
            // el.style.backgroundImage = `url(https://source.unsplash.com/featured/300x20${Number(location.userId)}/)`;
            el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            el.style.borderRadius = '50%';
            el.style.backgroundSize = '100%';
            el.addEventListener('click', () => {
                window.alert(`User ${location.userId} is here!`);
            });
            const marker = new mapboxgl.Marker(el)
                .setLngLat([location.lng, location.lat])
                .addTo(map);
            markers.push(marker);
        };
    }
};

// Generate random location within the test user's area
const generateRandomLocationForTestUser = async (userLocation) => {
    // console.log(userLocation, "user location in random location function");
    const { latitude, longitude } = userLocation;
    const randomLat = latitude + (Math.random() - 0.5) * 0.1;
    const randomLng = longitude + (Math.random() - 0.5) * 0.1;
    return { randomLat, randomLng };
};

// Pick test user to share location and see other users' locations
// pickedUser.addEventListener('change', (e) => {
//     const userId = e.target.value;
//     currentTestUser = userId;
//     markers.forEach(marker => marker.remove());
//     console.log(currentTestUser, "current test user id");
//     // shareLocationCheckbox.dataset.id = userId;
//     socket.emit('join', { userId: currentTestUser });
// });

// Share location
// shareLocationCheckbox.addEventListener('click', async () => {
//     isSharingLocation = shareLocationCheckbox.checked;
//     console.log(isSharingLocation + "is sharing location" + currentTestUser);
//     try {
//         const userLocation = await getCurrentUserLocation();
//         // console.log(userLocation, "user location");
//         const { randomLat, randomLng } = await generateRandomLocationForTestUser(userLocation);
//         // console.log(randomLat, randomLng, "random location");
//         if (isSharingLocation) {
//             console.log("handling add new shared location for" + currentTestUser);
//             socket.emit('addNewSharedLocation', { userId: currentTestUser, lat: randomLat, lng: randomLng });
//         } else {
//             console.log("handling remove shared location for" + currentTestUser);
//             socket.emit('removeSharedLocation', { userId: currentTestUser, lat: randomLat, lng: randomLng });
//         }
//     } catch (error) {
//         console.error(error);
//     }
// });

// Initialize map
initMap();

// Join the room when the window loads
window.addEventListener('load', () => {
    socket.emit('join', { userId: currentTestUser });
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    meetBtn.classList.add('text-[#878d26]');
}
);

// Leave the room when the window closes
window.addEventListener('beforeunload', () => {
    socket.emit('leave', { userId: currentTestUser });
}
);


