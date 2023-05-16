const dropButton = document.getElementById('drop-button');
const header = document.getElementById('nav-bar-header');
const container = document.getElementById('nav-bar-container');
const listItems = document.querySelectorAll('#actions-list li');

dropButton.addEventListener("click", function(){
    container.classList.toggle('active');
});
header.addEventListener("click", function(){
    container.classList.toggle('active');
});

listItems.forEach((listItem) => {
  listItem.addEventListener('click', function() {
    const icon = this.querySelector('i.fa');

    icon.classList.toggle('yellow-icon');
  });
});

mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWFuZGFuIiwiYSI6ImNsaHEwNjV3MTF6MDkzZXMxMXA3Y3g2MHQifQ.ctXan-bPt75vCnWVnsR2CQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 4,
    center: [-98.83, 40.52]
});

map.on('load', () => {

    // Array of state names to highlight
const highlightedStates = ['California', 'New York', 'Texas', 'Georgia'];

// Set up the map source and layers
map.addSource('states', {
  'type': 'geojson',
  'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson'
});

map.addLayer({
  'id': 'state-fills',
  'type': 'fill',
  'source': 'states',
  'layout': {},
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
  'layout': {},
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
});