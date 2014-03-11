require(['./ImageDistort'], function(ImageOverlay) {
                $(document).ready(function() {
                    var map = init_map("map");
                    var ImageDistort;
                    var image = new Image();

                    image.onload = function() {
                        imageOverlay = new ImageOverlay(
                            map, image, 'theCanvas'
                        );
                    };
                    image.src = "./aerialimage.png";                    
                    return;
                });
            });

            function init_map(map_div) {
                var map = new L.Map(map_div);
                var tileAttrib = 
                    '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> ' +
                    'contributors, CC-BY-SA, Image Copyright of ' +
                    '<a href="http://cloudmade.com">' +
                    'CloudMade</a>';
                var tiles = new L.TileLayer(
                    'http://{s}.tile.cloudmade.com/6815a3f75aee402fb680db5a62841051/997/256/{z}/{x}/{y}.png',
                    {attribution: tileAttrib}
                );
                map.setView([51.505, -0.09], 13).addLayer(tiles);

                return map;
            }
