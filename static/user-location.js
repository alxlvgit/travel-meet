let userLocation = null;
const loadingWindow = document.getElementById("loading");

// Ask the user for permission to get their location
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log("User location: Latitude: " + position.coords.latitude +
                        ", Longitude: " + position.coords.longitude);
                    resolve(position);
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
}

// Get the user's location
async function getCurrentUserLocation() {
    try {
        loadingWindow.classList.remove("hidden");
        const position = await getLocation();
        loadingWindow.classList.add("hidden");
        userLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        return;
    } catch (error) {
        loadingWindow.classList.add("hidden");
        console.log(error);
        return;
    }
}


