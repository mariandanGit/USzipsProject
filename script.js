const dropButton = document.getElementById('drop-button');
const header = document.getElementById('nav-bar-header');
const container = document.getElementById('nav-bar-container');
const listItems = document.querySelectorAll('#actions-list li');

dropButton.addEventListener("click", function() {
    container.classList.toggle('active');
});
header.addEventListener("click", function() {
    container.classList.toggle('active');
});

function toggleLayer(layerId) {
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    if (visibility === 'visible') {
      map.setLayoutProperty(layerId, 'visibility', 'none');
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    }
  }

listItems.forEach((listItem) => {
    listItem.addEventListener('click', function() {
      const icon = this.querySelector('i.fa');
      icon.classList.toggle('checked');
  
      const layerIds = this.getAttribute('data-layer').split(',');
      layerIds.forEach(layerId => {
        toggleLayer(layerId);
      });
    });
  });

async function statesOver10Million() {
    try {
        const response = await fetch('http://localhost:3000/population/10-million');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
let highlightedStates;

(async () => {
    try {
        highlightedStates = await statesOver10Million();
    } catch (error) {
        console.error('Error:', error);
    }
})();

async function avgPopulationByState() {
    try {
        const response = await fetch('http://localhost:3000/population/state-average');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

let avgPopulation;

(async () => {
    try {
        avgPopulation = await avgPopulationByState();
    } catch (error) {
        console.error('Error:', error);
    }
})();

async function getCentroidCoordinates() {
    try {
        const response = await fetch('http://api.geonames.org/childrenJSON?geonameId=6252001&username=mariandan');
        const data = await response.json();

        const features = data.geonames.map(state => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [state.lng, state.lat],
            },
            properties: {
                state_id: state.adminCode1,
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };

        return geojson;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function smallestCity() {
    try {
        const response = await fetch('http://localhost:3000/population/smallest-city');
        const data = await response.json();

        const features = data.map(city => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [city.lng, city.lat],
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };

        return geojson;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function largestCity() {
    try {
        const response = await fetch('http://localhost:3000/population/largest-city');
        const data = await response.json();

        const features = data.map(city => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [city.lng, city.lat],
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };

        return geojson;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function smallestCounty() {
    try {
        const response = await fetch('http://localhost:3000/population/smallest-county');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function largestCounty() {
    try {
        const response = await fetch('http://localhost:3000/population/largest-county');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function zipsNearWillis() {
    try {
        const response = await fetch('http://localhost:3000/zips/zips-near-willis');
        const data = await response.json();

        console.log(data);

        const features = data.map(zips => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [zips.lng, zips.lat],
            },
        }));

        const geojson = {
            type: 'FeatureCollection',
            features: features,
        };

        return geojson;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function populationNearStatue() {
    try {
        const response = await fetch('http://localhost:3000/population/population-near-statue');
        const data = await response.json();

        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
let statuePopulation;

(async () => {
    try {
        statuePopulation = await populationNearStatue();
    } catch (error) {
        console.error('Error:', error);
    }
})();

mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWFuZGFuIiwiYSI6ImNsaHEwNjV3MTF6MDkzZXMxMXA3Y3g2MHQifQ.ctXan-bPt75vCnWVnsR2CQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 4,
    center: [-98.83, 40.52]
});

map.on('load', () => {

    map.addSource('states', {
        'type': 'geojson',
        'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson'
    });

    map.addSource('counties', {
        'type': 'geojson',
        'data': '/counties.geojson'
    });

    function addImageLayer(imageUrl, imageId, coordinates, layerId, iconSize) {
        map.loadImage(imageUrl, (error, image) => {
          if (error) throw error;
      
          map.addImage(imageId, image);
      
          map.addSource(layerId, {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': [
                {
                  'type': 'Feature',
                  'geometry': {
                    'type': 'Point',
                    'coordinates': coordinates
                  }
                }
              ]
            }
          });
      
          map.addLayer({
            'id': layerId,
            'type': 'symbol',
            'source': layerId,
            'layout': {
              'icon-image': imageId,
              'icon-size': iconSize
            }
          });
        });
      }
      
      // Add Willis Tower image
      addImageLayer(
        '/images/willis-tower.png',
        'willis-tower',
        [-87.635918, 41.878876],
        'willis-image',
        0.048
      );
      
      // Add Statue of Liberty image
      addImageLayer(
        '/images/statue-of-liberty.png',
        'statue-of-liberty',
        [-74.044502, 40.689247],
        'statue-image',
        0.04
      );
      
    
    (async () => {
        try {
            const geojson = await zipsNearWillis();

            map.addLayer({
                'id': 'zips-near-willis',
                'type': 'circle',
                'layout': {
                    'visibility': 'none'
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
                'paint': {
                    'circle-color': '#2fe55c',
                    'circle-radius': 4,
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();

    map.addLayer({
        'id': 'state-fills',
        'type': 'fill',
        'source': 'states',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-color': [
                'match',
                ['get', 'STATE_NAME'],
                highlightedStates,
                '#fad25c',
                'rgba(0, 0, 0, 0)'
            ],
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        'id': 'state-borders',
        'type': 'line',
        'source': 'states',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'line-color': [
                'match',
                ['get', 'STATE_NAME'],
                highlightedStates,
                '#ffc106',
                'rgba(0, 0, 0, 0)'
            ],
            'line-width': 1
        }
    });
    (async () => {
        try {
            let smallestCounties = await smallestCounty();
            map.addLayer({
                id: 'smallest-counties',
                type: 'fill',
                source: 'counties',
                layout: {
                    'visibility': 'none'
                },
                paint: {
                    'fill-color': [
                        'match',
                        ['get', 'GEOID'],
                        smallestCounties.map(county => county.county_fips),
                        '#fad25c',
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-opacity': 0.5
                }
            }, 'building');

            const countyPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mousemove', 'smallest-counties', (e) => {
                const countyId = e.features[0].properties.GEOID;
                const countyData = smallestCounties.find(county => county.county_fips === countyId);
                if (countyData) {
                    countyPopup.setHTML(`<h3>${countyData.county_name}, ${countyData.state}</h3><p>Population: ${countyData.population}</p>`)
                        .setLngLat(e.lngLat)
                        .addTo(map);
                    map.getCanvas().style.cursor = 'pointer';
                }
            });

            map.on('mouseleave', 'smallest-counties', () => {
                map.getCanvas().style.cursor = '';
                countyPopup.remove();
            });

        } catch (error) {
            console.error('Error:', error);
        }
    })();

    (async () => {
        try {
            let largestCounties = await largestCounty();

            map.addLayer({
                id: 'largest-counties',
                type: 'fill',
                source: 'counties',
                layout: {
                    'visibility': 'none'
                },
                paint: {
                    'fill-color': [
                        'match',
                        ['get', 'GEOID'],
                        largestCounties.map(county => county.county_fips),
                        '#5cc7e8',
                        'rgba(0, 0, 0, 0)'
                    ],
                    'fill-opacity': 0.5
                }
            }, 'building');

            const countyPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mousemove', 'largest-counties', (e) => {
                const countyId = e.features[0].properties.GEOID;
                const countyData = largestCounties.find(county => county.county_fips === countyId);
                if (countyData) {
                    countyPopup.setHTML(`<h3>${countyData.county_name}, ${countyData.state}</h3><p>Population: ${countyData.population}</p>`)
                        .setLngLat(e.lngLat)
                        .addTo(map);
                    map.getCanvas().style.cursor = 'pointer';
                }
            });

            map.on('mouseleave', 'largest-counties', () => {
                map.getCanvas().style.cursor = '';
                countyPopup.remove();
            });

        } catch (error) {
            console.error('Error:', error);
        }
    })();

    const centerCoordinates = [-74.044502, 40.689247];

    const options = {
        units: 'kilometers'
    };

    const outerRadius = 200;
    const innerRadius = 50;

    const outerCircle = turf.circle(centerCoordinates, outerRadius, options);
    const innerCircle = turf.circle(centerCoordinates, innerRadius, options);

    const shape = turf.difference(outerCircle, innerCircle);

    map.addSource('circle-source', {
        type: 'geojson',
        data: shape,
    });

    map.addLayer({
        id: 'circle-layer',
        type: 'fill',
        source: 'circle-source',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.5
        },
    });

    map.on('mouseenter', 'circle-layer', (e) => {

        const population = statuePopulation;
        if (population) {
            popup.setLngLat(e.lngLat)
                .setHTML(`<h3>Population around Statue of Liberty</h3><p>Population in the range 50 to 200 kilometers around the Statue: ${population.totalPopulation}</p>`)
                .addTo(map);
        }
    });

    map.on('mouseleave', 'circle-layer', () => {
        popup.remove();
    });
    
    (async () => {
        try {
            const geojson = await getCentroidCoordinates();

            map.addLayer({
                'id': 'state-centers',
                'type': 'circle',
                'layout': {
                    'visibility': 'none'
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
                'paint': {
                    'circle-color': '#a1a1a1',
                    'circle-radius': 6,
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'state-centers', (e) => {
        const stateId = e.features[0].properties.state_id;

        const stateData = avgPopulation.find(state => state.state_id === stateId);
        if (stateData) {
            const population = stateData.averageCityPopulation;
            const stateName = stateData.state_name;
            popup.setLngLat(e.features[0].geometry.coordinates)
                .setHTML(`<h3>${stateName}</h3><p>Average city population: ${population}</p>`)
                .addTo(map);
        }
    });

    map.on('mouseleave', 'state-centers', () => {
        popup.remove();
    });

    (async () => {
        try {
            const geojson = await smallestCity();

            map.addLayer({
                'id': 'smallest-cities',
                'type': 'circle',
                'layout': {
                    'visibility': 'none'
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
                'paint': {
                    'circle-color': '#2fe55c',
                    'circle-radius': 4,
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();

    (async () => {
        try {
            const geojson = await largestCity();

            map.addLayer({
                'id': 'largest-cities',
                'type': 'circle',
                'layout': {
                    'visibility': 'none'
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
                'paint': {
                    'circle-color': '#2fe55c',
                    'circle-radius': 6,
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();

});