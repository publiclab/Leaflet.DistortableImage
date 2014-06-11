/**
* @namespace Contains functions to display raster images and distort or warp them onto a
* geographic grid; to orthorectify them.
*/
var Warper = {
  initialize: function() {
    Glop.observe('cartagen:postdraw', this.draw.bindAsEventListener(this))
    Glop.observe('mousedown',this.mousedown.bindAsEventListener(this))
    Glop.observe('mouseup',this.mouseup.bindAsEventListener(this))
    Glop.observe('dblclick', this.dblclick.bindAsEventListener(this))
  },
  /**
* The images which are currently being warped. Array members are of type Warper.Image
* @type Array
*/
  images: [],
  /**
* Whether the map is locked; a GET parameter of ?locked=true makes all warpables
* 'permanent', i.e. they will not respond to clicks or other interaction
*/
  locked: false,
  /**
* The selected image. This would be deprecated if we implement multiple selection or grouping.
*/
  active_image: false,

  /*
* Sorts the Warper.images by polygon area; largest polygons at the bottom.
*/
  sort_images: function() {
    Warper.images.sort(Warper.sort_by_area)
  },
  /**
* Compared two ways based on area, except for the active image which is sorted to top.
* @param {Warper.Image} a
* @param {Warper.Image} b
*/
  sort_by_area: function(a,b) {
    if ( a.area < b.area ) return 1;
    if ( a.area > b.area ) return -1;
    return 0; // a == b
  },
  /**
* Sorts warpable images to bring the active one to the top.
* @param {Warper.Image} a
* @param {Warper.Image} b
*/
  sort_by_active: function(a,b) {
    if (a == Warper.active_image) return 1;
    if (b == Warper.active_image) return -1;
  },

  /*
* Runs every frame upon glop:postdraw, i.e. at the end of the draw cycle.
* This places warpable images above most other features except labels.
*/
  draw: function() {
    Warper.images.each(function(image){ image.draw() })
  },
  mouseup: function() {
    if (Warper.should_save) Warper.active_image.save_state()
    Warper.should_save = false
  },

  /**
* Click event handler - defined here because if it's in Tool.Warp,
* it isn't activated unless the Warp tool is active. And for image ordering reasons.
*/
  mousedown: function() {
    if (!Warper.locked) {
    Map.x_old = Map.x
    Map.y_old = Map.y
    var inside_image = false, same_image = false
    for (i=Warper.images.length-1;i>=0;i--){
      var image = Warper.images[i]
      if (image.is_inside()) {
        if (!inside_image) {
          same_image = (Warper.active_image == image)
          Warper.active_image = image
          image.select()
          image.points.each(function(point){point.mousedown()})
          inside_image = true
          Warper.should_save = true
        }
      } else {
        // if you're clicking outside while it's active, and the corners have been moved:
        if (image.active && (image.coordinates() != image.old_coordinates)) {
          image.save()
        }
        if (image.active && !Tool.hover) {
          image.deselect()
        }
      }
    }
    if (Warper.active_image) {
      var point_clicked = false
      Warper.active_image.points.each(function(point) {
        if (point.is_inside()) {
          Warper.active_image.select_point(point)
          point_clicked = true
          Warper.should_save = true
        }
      })
      if (!point_clicked && Warper.active_image.active_point) {
        Warper.active_image.active_point.deselect()
      }
    }
    if (inside_image) {
      if (Tool.active != "Mask") {
        // 'true' forces a change, in case you have an image selected and are selecting a second one
        Tool.change('Warp',!same_image)
        Warper.images.sort(Warper.sort_by_active)
      } else {
        
      }
    } else if (!Tool.hover && Tool.active == 'Warp') Tool.change('Pan')
    }
  },

  /**
* Double click event handler - defined here because if it's in Tool.Warp,
* it isn't activated unless the Warp tool is active. And for image ordering reasons.
*/
  dblclick: function() {
    if (!Warper.locked) {
      for (i=Warper.images.length-1;i>=0;i--){
        var image = Warper.images[i]
        if (image.is_inside()) {
          image.dblclick()
          return
        }
      }
    }
  },

  /**
* A function which submits all the Images in the Warper.images array
* to the Ruby backend for full-resolution warping.
*/
  flatten: function() {
    new Ajax.Request('/warper/warp', {
      method: 'get',
      parameters: {
      images: Warper.images,
      },
      onSuccess: function(response) {
      // Should respond with a URL for a complete image, or a tileset.
      // Display the resulting image or tileset and prompt to trace.
      }
    });
  },

  /**
* Creates a Warper.Image object to contain its resulting URI and 'random' coordinates.
* Places the incoming image at Map.x, Map.y
* @param {String} url Address of image file in form http://path/to/image.xxx where xxx is any browser-readable image format.
* @param {Integer} id The unique id (primary key, from the database) of the image. Used for tracking/differentiating
* @param {Boolean} randomize Whether to randomize the corner placement to 'suggest' to the user that the image is warpable.
*/
  new_image: function(url,id,natural_size) {
    if (!natural_size) {
      Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
        [Map.x-100/Map.zoom, Map.y],
        [Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y],
        [Map.x+100/Map.zoom +(100/Map.zoom)*Math.random(), Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()],
        [Map.x-100/Map.zoom, Map.y+100/Map.zoom +(50/Map.zoom)*Math.random()]
      ]),url,id,natural_size))
    } else {
      Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
        [Map.x, Map.y],
        [Map.x, Map.y],
        [Map.x, Map.y],
        [Map.x, Map.y]
      ]),url,id,natural_size))
    }
    Knitter.new_image = Warper.images.last()
    Knitter.new_image.highlight_for(5)
  },

  /**
* Instantiates an existing image as a Warper.Image object, given an image and known points
* in an array of [lon,lat] pairs.
*/
  load_image: function(url,points,id,locked) {
    points[0][0] = Projection.lon_to_x(points[0][0])
    points[0][1] = Projection.lat_to_y(points[0][1])
    points[1][0] = Projection.lon_to_x(points[1][0])
    points[1][1] = Projection.lat_to_y(points[1][1])
    points[2][0] = Projection.lon_to_x(points[2][0])
    points[2][1] = Projection.lat_to_y(points[2][1])
    points[3][0] = Projection.lon_to_x(points[3][0])
    points[3][1] = Projection.lat_to_y(points[3][1])
    Warper.images.push(new Warper.Image($A([ // should build points clockwise from top left
      [points[0][0],points[0][1]],
      [points[1][0],points[1][1]],
      [points[2][0],points[2][1]],
      [points[3][0],points[3][1]]
    ]),url,id))
    Warper.images.last().locked = locked
  },

  /**
* Convenience method to present points as objects with .x and .y values instead of [x,y]
*/
  p: function(point) {
    if (point.x == undefined) {
      x = point[0]
      y = point[1]
    } else {
      x = point.x
      y = point.y
    }
    return '(' + x + ', ' + y + ')'
  },

  /**
* Fetches the image of the given ID (based on server-side rails primary key, typically)
*/
  get_image_by_id: function(id) {
    var match
    Warper.images.each(function(image){
      if (image.id == id) match = image
    })
    return match
  },

  getProjectiveTransform: function(points) {
    var eqMatrix = new Matrix(9, 8, [
      [ 1, 1, 1, 0, 0, 0, -points[2].x,-points[2].x,-points[2].x ],
      [ 0, 1, 1, 0, 0, 0, 0,-points[3].x,-points[3].x ],
      [ 1, 0, 1, 0, 0, 0, -points[1].x, 0,-points[1].x ],
      [ 0, 0, 1, 0, 0, 0, 0, 0,-points[0].x ],

      [ 0, 0, 0, -1,-1,-1, points[2].y, points[2].y, points[2].y ],
      [ 0, 0, 0, 0,-1,-1, 0, points[3].y, points[3].y ],
      [ 0, 0, 0, -1, 0,-1, points[1].y, 0, points[1].y ],
      [ 0, 0, 0, 0, 0,-1, 0, 0, points[0].y ]

    ]);

    var kernel = eqMatrix.rowEchelon().values;
    var transform = new Matrix(3, 3, [
      [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
      [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
      [-kernel[6][8], -kernel[7][8], 1]
    ]);
    return transform;
  },
  
  /**
* Custom keyup listener, triggered when a key is released
*/
  keyup: function(e) {
    var character = e.keyIdentifier, bump = 10 // amount in pixels to move with arrow keys
    switch(character) {
      case 'Left': if (!e.shiftKey) Warper.active_image.move_x(-bump/Map.zoom); else Map.rotate += 0.1; break
      case 'Right': if (!e.shiftKey) Warper.active_image.move_x(bump/Map.zoom); else Map.rotate -= 0.1; break
      case 'Up': Warper.active_image.move_y(-bump/Map.zoom); break
      case 'Down': Warper.active_image.move_y(bump/Map.zoom); break
    }
    e.preventDefault()
  },
}
document.observe('cartagen:init',Warper.initialize.bindAsEventListener(Warper))
//= require "control_point"
//= require "image"