const dropButton = document.getElementById('drop-button');
const header = document.getElementById('nav-bar-header');
const container = document.getElementById('nav-bar-container');
const listItems = document.querySelectorAll('#actions-list li');
let statuePopulation;

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

//Functions to fetch data from the database

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
        console.log(data);
        const features = data.map(city => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [city.lng, city.lat],
            },
            properties: {
                city_name: city.city,
                population: city.population,
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
            properties: {
                city_name: city.city,
                population: city.population,
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

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

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
      
      addImageLayer(
        '/images/willis-tower.png',
        'willis-tower',
        [-87.635918, 41.878876],
        'willis-image',
        0.048
      );
      
      addImageLayer(
        '/images/statue-of-liberty.png',
        'statue-of-liberty',
        [-74.044502, 40.689247],
        'statue-image',
        0.04
      );
      
    //Code to generate dots for the closest 20 zips near Willis Tower

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
                    'circle-color': '#fad25c',
                    'circle-radius': 4,
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();

    //Code to generate a layer to represent the states with a population over 10 million

    (async () => {
        try {
            let highlightedStates = await statesOver10Million();
    
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
                        highlightedStates.map(state => state.state_name),
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
                        highlightedStates.map(state => state.state_name),
                        '#ffc106',
                        'rgba(0, 0, 0, 0)'
                    ],
                    'line-width': 1
                }
            });

            const statePopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
        
            map.on('mousemove', 'state-fills', (e) => {
                const stateId = e.features[0].properties.STATE_NAME;
                const stateData = highlightedStates.find(state => state.state_name === stateId);
                if (stateData) {
                    statePopup.setHTML(`<h3>${stateData.state_name}</h3><p>Total population: ${stateData.totalPopulation}</p>`)
                        .setLngLat(e.lngLat)
                        .addTo(map);
                    map.getCanvas().style.cursor = 'pointer';
                }
            });
        
            map.on('mouseleave', 'state-fills', () => {
                map.getCanvas().style.cursor = '';
                statePopup.remove();
            });

        } catch (error) {
            console.error('Error:', error);
        }
    })();

    //Code to generate a layer to represent the smallest county in a state

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

    //Code to generate a layer to represent the largest county in a state

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

    //Function to generate a circle to represent the population between 50 and 200kms around the Statue of Liberty

    function generateCircleAroundStatue() {
        const statueCoordinates = [-74.044502, 40.689247];
        const options = {
          units: 'kilometers'
        };
        const outerRadius = 200;
        const innerRadius = 50;
      
        const outerCircle = turf.circle(statueCoordinates, outerRadius, options);
        const innerCircle = turf.circle(statueCoordinates, innerRadius, options);
      
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
      
        const statuePopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });
      
        map.on('mousemove', 'circle-layer', (e) => {
          const population = statuePopulation;
          if (population) {
            statuePopup
              .setLngLat(e.lngLat)
              .setHTML(`<h3>Population around Statue of Liberty</h3><p>Population in the range 50 to 200 kilometers around the Statue: ${population.totalPopulation}</p>`)
              .addTo(map);
          }
        });
      
        map.on('mouseleave', 'circle-layer', () => {
          statuePopup.remove();
        });
    }
      
    generateCircleAroundStatue();

    //Code to generate a population marker in the middle of each state

    (async () => {
        try {
            const geojson = await getCentroidCoordinates();

            let centerMarker = '/images/population.png'
            map.loadImage(centerMarker, function(error, image) {
                if (error) throw error;
                map.addImage('population', image);
            });
            
            map.addLayer({
                'id': 'state-centers',
                'type': 'symbol',
                'layout': {
                    'visibility': 'none',
                    'icon-image': 'population',
                    'icon-size': 0.1
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                },
            });

            const averagePopulationPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });
        
            map.on('mousemove', 'state-centers', (e) => {
                const stateId = e.features[0].properties.state_id;
        
                const stateData = avgPopulation.find(state => state.state_id === stateId);
                if (stateData) {
                    const population = stateData.averageCityPopulation;
                    const stateName = stateData.state_name;
                    averagePopulationPopup.setLngLat(e.features[0].geometry.coordinates)
                        .setHTML(`<h3>${stateName}</h3><p>Average city population: ${population}</p>`)
                        .addTo(map);
                }
            });
        
            map.on('mouseleave', 'state-centers', () => {
                averagePopulationPopup.remove();
            });
        } catch (error) {
            console.error('Error:', error);
        }
    })();
    
    //Code to generate a marker for the smallest city in a state

    (async () => {
        try {
            const geojson = await smallestCity();

            let smallestCityMarker = '/images/small-city.png'
            map.loadImage(smallestCityMarker, function(error, image) {
                if (error) throw error;
                map.addImage('smallest-city-marker', image);
            });

            map.addLayer({
                'id': 'smallest-cities',
                'type': 'symbol',
                'layout': {
                    'visibility': 'none',
                    'icon-image': 'smallest-city-marker',
                    'icon-size': 0.1
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                }
            });

            const smallestCityPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mousemove', 'smallest-cities', (e) => {
                const cityName = e.features[0].properties.city_name;
                const cityPopulation = e.features[0].properties.population;
                smallestCityPopup.setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(`<h3>${cityName}</h3><p>City population: ${cityPopulation}</p>`)
                    .addTo(map);
            });
        
            map.on('mouseleave', 'smallest-cities', () => {
                smallestCityPopup.remove();
            });

        } catch (error) {
            console.error('Error:', error);
        }
    })();

    //Code to generate a marker for the largest city in a state

    (async () => {
        try {
            const geojson = await largestCity();

            let largestCityMarker = '/images/large-city.png'
            map.loadImage(largestCityMarker, function(error, image) {
                if (error) throw error;
                map.addImage('largest-city-marker', image);
            });

            map.addLayer({
                'id': 'largest-cities',
                'type': 'symbol',
                'layout': {
                    'visibility': 'none',
                    'icon-image': 'largest-city-marker',
                    'icon-size': 0.1
                },
                'source': {
                    'type': 'geojson',
                    'data': geojson,
                }
            });

            const smallestCityPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mousemove', 'largest-cities', (e) => {
                const cityName = e.features[0].properties.city_name;
                const cityPopulation = e.features[0].properties.population;
                smallestCityPopup.setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(`<h3>${cityName}</h3><p>City population: ${cityPopulation}</p>`)
                    .addTo(map);
            });
        
            map.on('mouseleave', 'largest-cities', () => {
                smallestCityPopup.remove();
            });

        } catch (error) {
            console.error('Error:', error);
        }
    })();

});