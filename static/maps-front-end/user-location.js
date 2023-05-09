
let userLocation = null;
const loadingWindow = document.getElementById("loading");
const loadingStatus = document.querySelector(".loading-status");

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
        const locationStored = await getLocationFromServer();
        const permissionGranted = await checkIfPermissionGranted();
        if (locationStored && permissionGranted) {
            return;
        }
        loadingWindow.classList.remove("hidden");
        const position = await getLocation();
        loadingWindow.classList.add("hidden");
        userLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        await updateUserLocationOnServer(userLocation);
        return;
    } catch (error) {
        loadingStatus.innerText = "Failed to get your location. App will work with limited functionality.";
        setTimeout(() => {
            loadingWindow.classList.add("hidden");
        }, 4000);
        console.log(error);
        return;
    }
}

// Get the user's location from the server
async function getLocationFromServer() {
    try {
        if (userLocation) return;
        const response = await fetch("/getLocation");
        const data = await response.json();
        if (data) {
            userLocation = data;
            return userLocation;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Update the user's location on the server
async function updateUserLocationOnServer(location) {
    try {
        const response = await fetch("/updateLocation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(location)
        });
        if (response.ok) {
            return;
        }
    } catch (error) {
        console.log(error);
        return;
    }
}

// Check if permission is granted to get the user's location
async function checkIfPermissionGranted() {
    try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "granted") {
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}