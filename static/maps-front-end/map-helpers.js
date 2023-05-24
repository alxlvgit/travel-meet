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
                '#708090',
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
        },
        paint: {
            'text-color': '#ffffff'
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
                '#708090',
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
        },
        paint: {
            'text-color': '#ffffff'
        }
    });
};

// Handle unclustered markers
const handleUnclusteredMarkers = (map, sourceName) => {
    const newMarkers = {};
    const markersSource = map.getSource(sourceName);
    if (markersSource) {
        const features = map.querySourceFeatures(sourceName);
        features.forEach(feature => {
            if (!feature.properties.cluster) {
                let marker = markers[feature.properties.id];
                if (!marker) {
                    let markerElement = null;
                    if (sourceName === 'events') {
                        markerElement = createEventsMarker(feature);
                    } else {
                        markerElement = createUserMarker(feature);
                    }
                    marker = markers[feature.properties.id] = new mapboxgl.Marker(markerElement)
                        .setLngLat(feature.geometry.coordinates)
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).addClassName('z-50')
                            .setHTML(feature.properties.popupHTML))
                }
                newMarkers[feature.properties.id] = marker;
                if (!markersOnScreen[feature.properties.id]) marker.addTo(map);
            };
        });
        // For each marker added previously, remove those that are no longer visible
        for (const id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    };
};

// Apply offset to markers with same location
const applyOffsetToMarker = (lng, lat, markerId, locationsCache, offsetsStorage) => {
    const longitude = Number(lng).toFixed(3);
    const latitude = Number(lat).toFixed(3);
    const locationKey = `${longitude},${latitude}`;
    if (locationsCache.has(locationKey) && !offsetsStorage[markerId]) {
        locationsCache.add(locationKey);
        const offsetDistance = 150;
        const point = turf.point([lng, lat]);

        // Generate a random bearing between 0 and 360 degrees
        const bearing = Math.random() * 360;

        const offsetPoint = turf.destination(point, offsetDistance, bearing, { units: 'meters' });
        const offsetLng = offsetPoint.geometry.coordinates[0];
        const offsetLat = offsetPoint.geometry.coordinates[1];
        offsetsStorage[markerId] = [offsetLng, offsetLat];
    } else if (!locationsCache.has(locationKey) && !offsetsStorage[markerId]) {
        locationsCache.add(locationKey);
        offsetsStorage[markerId] = [];
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

