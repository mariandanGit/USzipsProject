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
        console.log(avgPopulation);
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

      console.log(geojson);
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
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
  }
}

smallestCity();

async function largestCity() {
  try {
      const response = await fetch('http://localhost:3000/population/largest-city');
      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
  }
}

largestCity();

mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWFuZGFuIiwiYSI6ImNsaHEwNjV3MTF6MDkzZXMxMXA3Y3g2MHQifQ.ctXan-bPt75vCnWVnsR2CQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 4,
    center: [-98.83, 40.52]
});

map.on('load', () => {

    // Set up the map source and layers
    map.addSource('states', {
        'type': 'geojson',
        'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson'
    });

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
                '#fad25c', // Highlighted color
                'rgba(0, 0, 0, 0)' // Default color (transparent)
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
                '#ffc106', // Highlighted color
                'rgba(0, 0, 0, 0)' // Default color (transparent)
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

    // Find the state population from the population data based on the state ID
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
});