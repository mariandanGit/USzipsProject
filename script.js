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

listItems.forEach((listItem) => {
    listItem.addEventListener('click', function() {
        const icon = this.querySelector('i.fa');

        icon.classList.toggle('yellow-icon');
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
        console.log(highlightedStates);
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

smallestCounty();

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

largestCounty();

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

    (async () => {
        try {
          let smallestCounties = await smallestCounty();
          console.log(smallestCounties);
          map.addLayer({
            id: 'smallest-counties',
            type: 'fill',
            source: 'counties',
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
          const geojson = await getCentroidCoordinates();
          console.log(geojson);
  
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