/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ2FicmllbDc3NzciLCJhIjoiY2xtNG81cHk2MDF4bDNrbW1jbG4weTB1byJ9.8UM_j0K4l-OkBPgJpKB33w';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gabriel7777/clm4owga200u601r7hzdq1r8l',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
