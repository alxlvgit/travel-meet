// DOM elements
let apiKeySearchQueryParam = "";

// Fetch events from ticketmaster API
const getEvents = async (userLocation) => {
    const API_KEYS = await getSecretKeys();
    let { TICKETMASTER_API_KEY } = API_KEYS;
    let locationQuery = "";
    // If user location is available, use it to get events within 30km radius
    userLocation ? locationQuery = `latlong=${userLocation.latitude},${userLocation.longitude}&unit=km&radius=50&sort=date,asc&size=100` : locationQuery = "countryCode=CA&sort=random&size=50";
    // If user has searched for a specific category for event, use that query param to get events
    const querySearchParam = apiKeySearchQueryParam ? `classificationName=${apiKeySearchQueryParam}` : "classificationName=";
    const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&${locationQuery}&${querySearchParam}`;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const events = data._embedded;
        return events;
    }
    catch (error) {
        console.log(error);
    }
}

// Filter events to get unique events
const filterEvents = async (foundEvents) => {
    const uniqueNames = [];
    const uniqueEvents = [];
    foundEvents.events.some(event => {
        if (!uniqueNames.includes(event.name)) {
            if (event._embedded.attractions) {
                if (!uniqueNames.includes(event._embedded.attractions[0].name)) {
                    uniqueNames.push(event.name);
                    uniqueNames.push(event._embedded.attractions[0].name);
                    uniqueEvents.push(event);
                }
            } else {
                uniqueNames.push(event.name);
                uniqueEvents.push(event);
            }
        }
    });
    return uniqueEvents;
};

// Filter images to get image with ratio 4:3 and width 305
const filterEventImages = async (event) => {
    const eventImage = event.images.filter(image => image.ratio === '4_3' && image.width === 305);
    return eventImage[0].url;
}

// Get icons for events based on category
const getIconsByCategory = (event) => {
    if (!event.classifications) {
        return "fas fa-question";
    }
    const category = event.classifications[0].segment.name;
    const icons = {
        "Arts & Theatre": "fas fa-theater-masks",
        "Miscellaneous": "fas fa-question",
        "Music": "fas fa-music",
        "Sports": "fas fa-football-ball",
        "Undefined": "fas fa-question",
    }
    return icons[category];
}

// Make features for events
const makeEventsFeatures = async (eventsObject) => {
    const filteredEvents = await filterEvents(eventsObject);
    const features = [];
    for (const event of filteredEvents) {
        const eventVenue = event._embedded.venues[0];
        const { longitude, latitude } = eventVenue.location;
        applyOffsetToMarker(longitude, latitude, event.id, eventsMarkersLocationCache, eventsOffsets);
        const eventImage = await filterEventImages(event);
        const eventDate = event.dates.start.localDate ? event.dates.start.localDate : "TBD";
        const eventTime = event.dates.start.noSpecificTime ? "N/A" : event.dates.start.localTime.split(":").slice(0, 2).join(":");
        const eventGeoJSON = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: eventsOffsets[event.id].length > 0 ? eventsOffsets[event.id] : [longitude, latitude]
            },
            properties: {
                title: event.name,
                id: event.id,
                url: event.url,
                image: eventImage,
                icon: getIconsByCategory(event),
                popupHTML: ` <div class="flex flex-col justify-center items-center">
                                <img src="${eventImage}" class="w-32 h-24 rounded-md shadow-lg mb-2">
                                <h3 class="text-sm font-semibold text-center">${event.name}</h3>
                                <div class="flex flex-row justify-center items-center space-x-2">
                                <i class="far fa-calendar-alt"></i>
                                <p class="text-xs text-center">${eventDate}</p>
                                <i class="far fa-clock"></i>
                                <p class="text-xs text-center">${eventTime}</p>
                                </div>
                                <div class = "flex flex-row justify-center items-center space-x-3 mt-1">
                                <a href="${event.url}" target="_blank" class="text-xs text-center text-[#878d26] hover:text-[#a3a82c]">Buy Tickets</a>
                                <a href="/event/${event.id}" target="_blank" class="text-xs text-center text-[#878d26] hover:text-[#a3a82c]">Groups</a>
                                </div>
                            </div>`,
            },
        };

        features.push(eventGeoJSON);
    }
    return features;
};

// Create events marker
const createEventsMarker = (feature) => {
    const overlay = document.createElement('div');
    overlay.className = 'w-full h-full bg-black/25 absolute rounded-full absolute top-0 left-0'
    const el = document.createElement('div');
    el.style.backgroundSize = '100%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.backgroundSize = 'cover';
    el.className = 'marker w-8 h-8 rounded-full border-2 border-[#878d26] shadow-lg cursor-pointer';
    const icon = document.createElement('i');
    icon.className = feature.properties.icon;
    icon.classList.add('text-sm', 'text-white', 'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'z-10');
    el.appendChild(icon);
    el.appendChild(overlay);
    el.style.backgroundImage = `url(${feature.properties.image})`;
    return el;
}

// Add events to the map
const addEventsToMap = async (map) => {
    // const newMarkers = {};
    // Add events to the map
    const mapLocation = map.getCenter();
    const userLocation = { latitude: mapLocation.lat, longitude: mapLocation.lng };
    const events = await getEvents(userLocation);
    if (!events) return;
    const eventFeatures = await makeEventsFeatures(events);
    const eventsSource = map.getSource('events');
    if (eventsSource) {
        eventsSource.setData({ type: 'FeatureCollection', features: eventFeatures });
        map.on("render", () => {
            if (switchToEvents) {
                handleUnclusteredMarkers(map, "events");
            }
        });
    } else {
        console.log("no events source");
    }
}

