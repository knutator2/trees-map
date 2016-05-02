var _map = null, _marker = null;

$(document).ready(function() {
    _map = L.map('map');

    var view = {
        "center": [52.51,13.37628],
        "zoom": 15
    };

    var base = {
        'Open Street Map': L.tileLayer("https://trees.codefor.de/tiles/osm/{z}/{x}/{y}.png", {
            "attribution": "Map data © 2012 OpenStreetMap contributors",
            "minZoom": 8,
            "maxZoom": 20
        })
    };

    var overlay = {
        'Alle Bäume': L.tileLayer("https://trees.codefor.de/tiles/trees/{z}/{x}/{y}.png", {
            "attribution": "Geoportal Berlin / Baumbestand Berlin",
            "minZoom": 8,
            "maxZoom": 20
        })
    };

    base['Open Street Map'].addTo(_map);

    L.control.layers(base, overlay, { collapsed: false }).addTo(_map);

    _map.setView(view.center, view.zoom);

    _map.on('click', function(e) {
        _map.clicked = true;

        setTimeout(function(){
            if (_map.clicked){
                $.ajax({
                    url: 'https://trees.codefor.de/api/trees/',
                    data: {
                        dist: 5,
                        point: e.latlng.lng + ',' + e.latlng.lat
                    },
                    success: function(response) {
                        if (response.count > 0) {
                            var feature = response.features[0];

                            var lat = feature.geometry.coordinates[1],
                                lon = feature.geometry.coordinates[0];


                            var html = '';
                            $.each(feature.properties, function(key, value) {
                                html += '<div><strong>' + key + '</strong> ' + value + '/<div>';
                            });

                            if (_marker !== null) {
                                _map.removeLayer(_marker);
                            }

                            _marker = L.marker([lat, lon]).addTo(_map);
                            _marker.bindPopup(html).openPopup();
                        }
                    }
                });
            }
         }, 300);
    });

    _map.on('dblclick', function(event){
        _map.clicked = false;
        _map.zoomIn();
    });

});
