L.Control.AffineToolbox = L.Control.extend({
    options: {
        position: 'topright'
    },

    initialize: function (affineLayer) {
        this._affineLayer = affineLayer;
    },

    onAdd: function (map) {
        var $controlContainer = $(map._controlContainer);

        if ($controlContainer.children('.leaflet-top.leaflet-right').length === 0) {
            $controlContainer.append('<div class="leaflet-top leaflet-right"></div>');
            map._controlCorners.topcenter = $controlContainer.children('.leaflet-top.leaflet-right').first()[0];
        }

        this._map = map;
        this._toolbox = L.DomUtil.create('div', 'leaflet-affine-toolbox');
        this._toolbox.id = 'affine-toolbox';
        this._toolbox.className = 'leaflet-affine-toolbox';

        var acceptBttn = document.createElement('a');
        acceptBttn.className = 'accept-affine-image';
        $(acceptBttn).on("click", $.proxy(function () {
            this._affineLayer._map.removeLayer(this._affineLayer._resizersLayer);
            this._affineLayer._removeToolbox();
         },this));

        var removeBttn = document.createElement('a');
        removeBttn.className = 'remove-affine-image';
        $(removeBttn).on("click", $.proxy(function () {
            this._affineLayer._map.removeLayer(this._affineLayer._resizersLayer);
            this._affineLayer._map.removeLayer(this._affineLayer);
            this._affineLayer._removeToolbox();
         },this));

        var sliderBttn = document.createElement('a');
        sliderBttn.id = 'opacity-slider';

        $(this._toolbox).append(acceptBttn, removeBttn, sliderBttn);

        this._slider = sliderBttn;

        this.initSlider(sliderBttn);

        return this._toolbox;
    },

    initSlider: function(){
        var map = this._map;
        var slider = this._slider;

        $(slider).parent().removeClass('leaflet-bar-item');
        $(slider).parent().addClass('leaflet-bar-item');

        $(slider).slider({min: 10, max: 100}); //Setting range...
        $(slider).slider( "option", "value", 70 ); //Initializing at middle

        $(slider).on("mouseover", function(c) { 
            map.dragging.disable();
        });

        $(slider).on("mouseout", function(c) { 
            map.dragging.enable();
        });
    },

    slider: function(){
        return this._slider;
    }

});