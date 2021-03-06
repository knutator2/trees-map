var _map = null, _marker = null, _names = {};

$(document).ready(function() {
    _map = L.map('map');

    $.ajax({
        url: 'https://trees.codefor.de/names/column-names.json',
        success: function(response) {
            _names = response;
        }
    });

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
        'Straßenbäume': L.tileLayer("https://trees.codefor.de/tiles/strassenbaeume/{z}/{x}/{y}.png", {
            "attribution": "Geoportal Berlin / Baumbestand Berlin",
            "minZoom": 8,
            "maxZoom": 20
        }),
        'Anlagenbäume': L.tileLayer("https://trees.codefor.de/tiles/anlagenbaeume/{z}/{x}/{y}.png", {
            "attribution": "Geoportal Berlin / Baumbestand Berlin",
            "minZoom": 8,
            "maxZoom": 20
        }),
        'Birken': L.tileLayer("https://trees.codefor.de/tiles/birken/{z}/{x}/{y}.png", {
            "attribution": "Geoportal Berlin / Baumbestand Berlin",
            "minZoom": 8,
            "maxZoom": 20
        }),
        'Kastanien': L.tileLayer("https://trees.codefor.de/tiles/kastanien/{z}/{x}/{y}.png", {
            "attribution": "Geoportal Berlin / Baumbestand Berlin",
            "minZoom": 8,
            "maxZoom": 20
        })
    };

    base['Open Street Map'].addTo(_map);

    overlay['Straßenbäume'].addTo(_map);
    overlay['Anlagenbäume'].addTo(_map);

    L.control.layers(base, overlay, { collapsed: false }).addTo(_map);

    _map.setView(view.center, view.zoom);

    function getColumnName(key) {
        if( undefined !== _names[key]) {
            return _names[key].label.de;
        }

		var ret = '&lt;' + key + '&gt;';

		$.each(_names, function(identifier, properties) {
            $.each(properties.alternatives, function(id, value) {
                if((key === value) || (key.toLowerCase() === value)) {
                    ret = _names[identifier].label.de;
                }
            });
        });

        return ret;
    }

    _map.on('click', function(e) {
        _map.clicked = true;

        setTimeout(function(){
            if (_map.clicked){
                $.ajax({
                    url: 'https://trees.codefor.de/api/trees/closest/',
                    data: {
                        point: e.latlng.lng + ',' + e.latlng.lat
                    },
                    success: function(feature) {
                        var lat = feature.geometry.coordinates[1],
                            lon = feature.geometry.coordinates[0];

                        var headline;
                        var list = [];
                        $.each(feature.properties, function(key, value) {
                            if (key === 'species_german') {
                                headline = value;
                            } else {
                                var string = '<td><strong>' + getColumnName(key) + '</strong></td>';
                                string += '<td>' + value + '</td>';
                                list.push(string);
                            }
                        });

                        var html = '<h4>' + headline + '</h4>';
                        html += '<table><tr>';
                        html += list.join('</tr><tr>');
                        html += '</tr></table>';

                        if (_marker !== null) {
                            _map.removeLayer(_marker);
                        }

                        _marker = L.marker([lat, lon]).addTo(_map);
                        _marker.bindPopup(html).openPopup();

                    }
                });
            }
         }, 300);
    });

    _map.on('dblclick', function(event){
        _map.clicked = false;
        _map.zoomIn();
    });

    $.ajax({
        url: 'https://trees.codefor.de/names/column-names.json',
        success: function(response) {
            _names = response;
        }
    });
});
