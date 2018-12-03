var phones = [{
        id: 'android',
        selected: true,
        layer: 'enf.android',
        color: '#00fca8',
        name: 'Android'
    }, {
        id: 'iphone',
        selected: true,
        color: '#ff0000',
        layer: 'enf.iphone',
        name: 'iPhone'
    }, {
        id: 'blackberry',
        selected: true,
        color: '#9045d2',
        layer: 'enf.blackberry',
        name: 'Blackberry'
    }, {
        id: 'other',
        color: '#85548b',
        selected: true,
        layer: 'enf.other-phones',
        name: 'Other'
    }
];


var map = L.mapbox.map('map', null, { zoomControl: false, maxZoom: 82 })
    .setView([-2.160942, -79.8900], 12);

var comp = getComp();
var labelsLayer = L.mapbox.tileLayer('tmcw.map-m90iqp6p');
labelsLayer.setOpacity(0.2);

L.control.zoom({ position: 'topright' }).addTo(map);

map.addLayer(comp);
map.addLayer(labelsLayer);

var layerLink = d3.select('.legend')
    .selectAll('a.layer')
    .data(phones)
    .enter()
    .append('a')
    .attr('class', function(d) {
        return 'layer selected ' + d.id;
    })
    .style('background', function(d) {
        return d.color;
    })
    .attr('href', '#');

layerLink
    .append('span')
    .attr('class', function(d) {
        return 'sprite ' + d.id;
    });

layerLink
    .append('span')
    .classed('label', true)
    .text(function(d) {
        return d.name;
    });

layerLink.on('click', toggleLayer);

L.hash(map);

var geocoder = L.mapbox.geocoder('tmcw.map-7s15q36b');

var coder = L.mapbox.geocoderControl('tmcw.map-7s15q36b').addTo(map);

d3.select('#geocoder').node().appendChild(coder.getContainer());

if (navigator.geolocation) {
    d3.select('#geocoder').append('button')
        .attr('class', 'geolocate')
        .attr('title', 'Find Me')
        .on('click', function() {
            map.locate();
        });
}

// Once we've got a position, zoom and center the map
// on it, and add a single marker.
map.on('locationfound', function(e) {
    map.fitBounds(e.bounds);
});

map.on('moveend', _.debounce(showLocation, 500));

function showLocation() {
    geocoder.reverseQuery(map.getCenter(), function(err, result) {
        if (result.results && result.results[0]) {
            var s = _.uniq(result.results[0].map(function(r) {
                return r.name;
            })).join(', ');
            d3.select('.geolocation').text(s);
        }
    });
}

function getComp() {
    return L.mapbox.tileLayer(compositeId(), {
        detectRetina: true
    });
}

function compositeId() {
    return phones.filter(function(d) {
        return d.selected;
    }).map(function(phone) {
        return phone.layer;
    }).join(',');
}

function toggleLayer(d) {
    d.selected = !d.selected;
    d3.select(this).classed('selected', d.selected);
    map.removeLayer(comp);
    comp = getComp();
    map.addLayer(comp);
}
