// DOM elements
const dropDownEvents = document.getElementById('dropdown-events');

// Cache the locations of events to apply offsets to events with same location
const eventLocationCache = {};
const offsets = {};

// Fetch events from ticketmaster API
const getEvents = async (userLocation) => {
    const API_KEYS = await getSecretKeys();
    let { TICKETMASTER_API_KEY } = API_KEYS;
    let locationQuery = "";
    // If user location is available, use it to get events within 30km radius
    userLocation ? locationQuery = `latlong=${userLocation.latitude},${userLocation.longitude}&unit=km&radius=30&sort=date,asc&size=50` : locationQuery = "countryCode=CA&sort=random&size=50";
    // If user has searched for a specific category for event, use that query param to get events
    // const querySearchParam = apiKeySearchQueryParam ? `classificationName=${apiKeySearchQueryParam}` : "classificationName=art, music, sport, seminar";
    const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&${locationQuery}`;
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

// Get random offset for events with same location
const getOffset = () => {
    const offset = Math.floor(Math.random() * 201);
    return offset;
}

// Get icons for events based on category
const getIconsByCategory = (event) => {
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

// Apply offset to events with same location
const applyOffset = (event) => {
    const eventVenue = event._embedded.venues[0];
    const longitude = Number(eventVenue.location.longitude).toFixed(3);
    const latitude = Number(eventVenue.location.latitude).toFixed(3);
    const locationKey = `${longitude},${latitude}`;
    if (Object.keys(eventLocationCache).includes(locationKey) && !offsets[event.id]) {
        eventLocationCache[locationKey] = event.id;
        const offset = getOffset();
        const offset2 = getOffset();
        offsets[event.id] = [offset, offset2];
    } else if (!Object.keys(eventLocationCache).includes(locationKey) && !offsets[event.id]) {
        eventLocationCache[locationKey] = event.id;
        offsets[event.id] = [0, 0];
    } else if (offsets[event.id]) {
        console.log("offset exists");
    }
}

// Make geoJSON object from events
const makeFeatures = async (eventsObject) => {
    const filteredEvents = await filterEvents(eventsObject);
    const features = [];
    for (const event of filteredEvents) {
        applyOffset(event);
        const eventImage = await filterEventImages(event);
        const eventGeoJSON = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [event._embedded.venues[0].location.longitude, event._embedded.venues[0].location.latitude]
            },
            properties: {
                title: event.name,
                id: event.id,
                url: event.url,
                image: eventImage,
                icon: getIconsByCategory(event),
            }
        }
        features.push(eventGeoJSON);
    }
    return features;
}


// Create events marker
const createEventsMarker = (feature) => {
    const el = document.createElement('div');
    el.style.backgroundSize = '100%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.backgroundSize = 'cover';
    el.className = 'marker w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer';
    const icon = document.createElement('i');
    icon.className = feature.properties.icon;
    icon.classList.add('text-sm', 'text-white', 'absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2');
    el.appendChild(icon);
    el.style.backgroundImage = `url(${feature.properties.image})`;
    const link = document.createElement('a');
    link.href = '/event/' + feature.properties.id;
    link.target = '_blank';
    link.appendChild(el);
    return link;
}

// Add events to the map
const addEventsToMap = async (map) => {
    const newMarkers = {};
    // Add events to the map
    const mapLocation = map.getCenter();
    const userLocation = { latitude: mapLocation.lat, longitude: mapLocation.lng };
    const events = await getEvents(userLocation);
    if (!events) return;
    const eventFeatures = await makeFeatures(events);
    const eventsSource = map.getSource('events');
    if (eventsSource) {
        eventsSource.setData({ type: 'FeatureCollection', features: eventFeatures });
        const features = map.querySourceFeatures('events');
        features.forEach(feature => {
            if (!feature.properties.cluster) {
                let marker = markers[feature.properties.id];
                if (!marker) {
                    const eventsMarkerElement = createEventsMarker(feature);
                    const offset = offsets[feature.properties.id];
                    marker = markers[feature.properties.id] = new mapboxgl.Marker(eventsMarkerElement)
                        .setLngLat(feature.geometry.coordinates)
                        .setOffset(offset ? offset : [0, 0])
                }
                newMarkers[feature.properties.id] = marker;
                if (!markersOnScreen[feature.properties.id]) {
                    marker.addTo(map);
                }
            };
        });
        for (const eventId in markersOnScreen) {
            if (!newMarkers[eventId]) markersOnScreen[eventId].remove();
        }
        markersOnScreen = newMarkers;
    } else {
        console.log("no events source");
    }
}
