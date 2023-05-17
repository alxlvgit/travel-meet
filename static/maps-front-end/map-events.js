// DOM elements
const dropDownEvents = document.getElementById('dropdown-events');

// Fetch events from ticketmaster API
const getEvents = async (userLocation) => {
    const API_KEYS = await getSecretKeys();
    let { TICKETMASTER_API_KEY } = API_KEYS;
    let locationQuery = "";
    // If user location is available, use it to get events within 50km radius or else get events from Canada
    userLocation ? locationQuery = `latlong=${userLocation.latitude},${userLocation.longitude}&unit=km&radius=50&sort=date,asc&size=100` : locationQuery = "countryCode=CA&sort=random&size=100";
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

// Make geoJSON object from events
const makeFeatures = async (eventsObject) => {
    const features = [];
    eventsObject.events.forEach(event => {
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
                image: event.images[0].url,
            }
        }
        features.push(eventGeoJSON);
    }
    );
    return features;
}


// Create events marker
const createEventsMarker = (feature) => {
    const el = document.createElement('div');
    el.classList.add('marker', 'w-16', 'h-16', 'rounded-full', 'bg-no-repeat', 'bg-center', 'bg-cover', 'border-2', 'border-white', 'shadow-lg');
    el.style.backgroundImage = `url(${feature.properties.image})`;
    el.style.backgroundSize = '100%';
    const link = document.createElement('a');
    link.href = feature.properties.url;
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
        console.log(features, "features from map, events");
        features.forEach(feature => {
            if (!feature.properties.cluster) {
                let marker = markers[feature.properties.id];
                if (!marker) {
                    const eventsMarkerElement = createEventsMarker(feature);
                    marker = markers[feature.properties.id] = new mapboxgl.Marker(eventsMarkerElement)
                        .setLngLat(feature.geometry.coordinates);
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
