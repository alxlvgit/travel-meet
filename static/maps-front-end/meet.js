
// Get the user's current location
// If the user's location is not stored in the session, get it from the browser
// If the user's location is stored in the session, get it from the server

async function renderMap() {
    const userLocation = await getCurrentUserLocation();
    if (userLocation) {
        // Render the map
        renderMapWithUserLocation(userLocation);
    } else {
        // Render the map without the user's location
        renderMapWithoutUserLocation();
    }
};

// // Render the map without the user's location
const renderMapWithoutUserLocation = () => {
    // Render the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 12,
        mapId: "f0b7b1f2f0b7b1f2",
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
    });
    // Render the markers
    renderMarkers();
};


// // Render the map with the user's location
const renderMapWithUserLocation = (userLocation) => {
    // Render the map
    console.log("Rendering map with user location...");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 12,
        mapId: "f0b7b1f2f0b7b1f2",
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
    });
    // Render the markers
    renderMarkers(userLocation);
};


// // Render the markers
const renderMarkers = (userLocation) => {
    userLocation ? renderCurrentUserMarker(userLocation) : null;
};

// // Render the current user's marker
const renderCurrentUserMarker = (userLocation) => {
    const marker = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map,
        title: "You are here",
    });
};


function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
    });

    const marker = new google.maps.Marker({
        position: { lat: 37.7749, lng: -122.4194 },
        map: map,
        title: "San Francisco",
    });
}


const addScript = async () => {
    const script = document.createElement('script');
    const secretKeys = await getSecretKeys();
    const apiKey = secretKeys.GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=renderMap`;
    script.defer = true;
    document.head.appendChild(script);
};

addScript();







