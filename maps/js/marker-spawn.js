// Defines viewing boundary around contiguous US

var maxBounds = L.latLngBounds(
    L.latLng(-55.499550, -150.276413), //Southwest
    L.latLng(83.162102, -52.233040)  //Northeast
);

// Initializes map

var map = L.map( 'map', {
  // center: [40.0, -100.0],
  minZoom: 4,
  zoom: 3,
  'maxBounds': maxBounds
}).fitBounds(maxBounds);

map.setView(new L.LatLng(45.071419, -89.865789), 6);

// Superimposes openstreetmap over screen

L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 subdomains: ['a','b','c']
}).addTo( map );

// Defines state outlines

function getColor(d) {
    return d >= 50 ? 'rgba(7, 3, 28, 0.9)' :
           d >= 30 ? 'rgba(3, 32, 58, 0.9)' :
           d >= 20  ? 'rgba(5, 45, 82, 0.9)' :
           d >= 15  ? 'rgba(10, 85, 158,0.9)' :
           d >= 10  ? 'rgba(10, 85, 158,0.9)' :
           d >= 5   ? 'rgba(215,231,207,0.7)' :
           d >= 1   ? 'rgba(99,171,54,0.4)' :
           d > 0   ? 'rgba(199, 223, 247,0.7)' :
                      'rgba(265,265,265,0.1)';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.membership),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Info state control

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info command'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =  (props ?
        '<b><span class="state-header">' + " " + props.county_nam + '</span></b><br /><div class="sub-header"><span class="local-chapters">' + " " + props.dnr_region + '<br / >' + " " + "general@ycatwi.org"
        : 'Hover over a county</div>');
};

info.addTo(map);

// Highlight state on hover

function highlightFeature(e) {
    var layer = e.target;
    
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

var geojson;

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}



// Custom legend control

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 5, 10, 15, 20, 30],
        labels = [];

    // loop through our membership intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// legend.addTo(map);

// Superimposes state effects onto map

 geojson = L.geoJson(statesData, {
    style: style
}).addTo(map);

 geojson = L.geoJson(countiesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

// Defines markers

var myURL = jQuery( 'script[src$="marker-initialize.js"]' ).attr( 'src' ).replace( 'marker-initialize.js', '' );

var myIcon = L.icon({
  iconUrl: myURL + '../images/pin48.png',
  iconRetinaUrl: myURL + '../images/pin48.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
});

var markerClusters = L.markerClusterGroup();

// Adds pop-ups to markers

for ( var i = 0; i < markers.length; ++i )
{
  var popup = '<b><span class="chapter-name">' + markers[i].Location + '</span></b>' +
              '<br/><b>Date:</b> ' + markers[i].Date +
              '<br/><b>Organizer: </b>' + markers[i].Organizer +
              '<br/><b>Email:</b> ' + '<a href=mailto:' + markers[i].Email + '>' + markers[i].Email + '</a>' +
              '<br/><b>Phone:</b> ' + markers[i].Phone;  

  var m = L.marker( [markers[i].lat, markers[i].lng], {icon: myIcon} )
                  .bindPopup( popup );

  markerClusters.addLayer( m );
}

// Superimposes markers onto map

map.addLayer( markerClusters );
