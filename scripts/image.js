/**
* A class for warpable raster images. Note that mousedown events are
* handled in the Warper namespace. Corner manipulation is handled in
* the Warper.ControlPoint class.
* @class
*/
Warper.Image = Class.create(
{
  type: 'Warper.Image',
  initialize: function(nodes,image,id,natural_size) {
    this.id = id
    this.opacity_low = 0.5
    this.opacity_high = 1.0
    this.opacity = this.opacity_high
    this.locked = false
    this.outline = false
    this.highlight = false
    this.highlight_start = 0
    this.highlight_length = 0
    this.start_timestamp = Date.now()
    this.age = 0
  
    this.subdivision_limit = 5
    this.offset_x = 0
    this.offset_y = 0
    
    this.active = false
    this.mask = false
    this.active_point = false
    this.dragging = false
    this.points = $A()
    this.old_coordinates = []
    this.diddit = false

    this.history = []
        
    nodes.each(function(node) {
      this.points.push(new Warper.ControlPoint(node[0], node[1], 10, this))
    }, this)

    this.reset_centroid()
    this.area = Geometry.poly_area(this.points)
  
    this.image = new Image()
    this.image.src = image
    this.natural_size = natural_size
    this.waiting_for_natural_size = natural_size | false
  },
  /**
* Toggles drawn borders around the image
*/
  toggle_outline: function() {
    this.outline = !this.outline
    $('tool_warp_outline').toggleClassName('down')
  },
  /**
* Calculates the (what the hell is this?) --
* probably its the size of the gridding for distortion
*/
  patch_size: function() {
    return 100/Map.zoom
  },
  /**
* Highlights image for x seconds
*/
  highlight_for: function(seconds) {
    var ms = seconds*1000
    this.highlight = true
    this.highlight_start = Date.now()
    this.highlight_length = ms
  },

  /**
* Duh.
*/
  delete_mask: function() {
    this.mask = false
  },

  /**
* Executes every frame; draws warped image.
*/
  draw: function() {
    this.age = Date.now() - this.start_timestamp
    if (this.highlight && (this.highlight_start + this.highlight_length - Date.now() < 0)) {
      this.highlight = false
    }

    if (this.waiting_for_natural_size) {
      this.set_to_natural_size()
    }

    $C.save()
    if (this.mask && this.mask.points && this.mask.points.length > 2) {
      $C.begin_path()
      $C.move_to(this.mask.points[0].x, this.mask.points[0].y)
      this.mask.points.each(function(point) {
        $C.line_to(point.x, point.y)
      })
      $C.line_to(this.mask.points[0].x, this.mask.points[0].y)
      $C.canvas.closePath();
      if (this.mask.enabled) $C.canvas.clip()
      else $C.stroke()
      // LEARN HOW TO USE CLIP, PILGRIM!!
    }
    
    $C.opacity(this.opacity)
    // draw warped image:
    if (!this.outline) this.update()

    $C.restore()
    // Draw outline
    $C.opacity(1)
    $C.save()
    $C.fill_style('#222')
    $C.begin_path()
    $C.move_to(this.points[0].x, this.points[0].y)
    this.points.each(function(point) {
      $C.line_to(point.x, point.y)
    })
    $C.line_to(this.points[0].x, this.points[0].y)
    
    // Draw outline's shading
    $C.opacity(0.1)
    if (this.active) $C.opacity(0.2)
    
    $C.opacity(1)
    $C.stroke_style('#d00')
    $C.line_width(1)
    if (this.outline) $C.stroke()
    $C.stroke_style('#AED11C')
    $C.line_width(20/Map.zoom)
    if (this.highlight && (this.highlight_start + this.highlight_length - Date.now() > 0)) {
      $C.opacity(1-(Date.now()-this.highlight_start)/(0.01+this.highlight_length))
    }
    if (this.highlight) $C.stroke()
    $C.opacity(0.1)

    $C.stroke_style('#000')
    if (this.active) {
      $C.fill()
      // Draw points
      $C.line_width(2)
      this.points.each(function(point) {
        point.draw()
      })
    }
    
    $C.restore()
    
  },
  move_x: function(px) {
    this.points.each(function(point){
      point.x += px
    },this)
  },
  move_y: function(px) {
    this.points.each(function(point){
      point.y += px
    },this)
  },

  set_to_natural_size: function() {
    this.opacity = 1.0
    this.outline = false
    if (this.image.width) {
      // the image loaded completely, and we can use its dimensions
      this.points[1].x = this.points[0].x
      this.points[1].y = this.points[0].y
      this.points[2].x = this.points[0].x
      this.points[2].y = this.points[0].y
      this.points[3].x = this.points[0].x
      this.points[3].y = this.points[0].y

      this.points[1].x += this.image.width/(Map.zoom*2)
      this.points[2].x += this.image.width/(Map.zoom*2)
      this.points[2].y += this.image.height/(Map.zoom*2)
      this.points[3].y += this.image.height/(Map.zoom*2)
      this.reset_centroid()
      this.area = Geometry.poly_area(this.points)
      this.waiting_for_natural_size = false
    }
  },
  select: function() {
    this.active = true
    Events.arrow_keys_enabled = false
    Event.observe(document, 'keyup', Warper.keyup) // custom keyup handler
    Glop.trigger_draw()
  },
  deselect: function() {
    this.active = false
    this.active_point = false
    Events.arrow_keys_enabled = true
    Event.stopObserving(document, 'keyup', Warper.keyup) // custom keyup handler
    Knitter.update_map_to_center()
  },

  select_point: function(point) {
    if (this.active_point) { this.active_point.deselect() }
    point.select()
  },
  is_inside: function() {
    return (this.is_in_point() || Geometry.is_point_in_poly(this.points, Map.pointer_x(), Map.pointer_y()))
  },
  is_in_point: function() {
    var inside_point = false
    this.points.each(function(point) {
      if (point.is_inside()) inside_point = true
    })
    return inside_point
  },

  drag: function() {
    if (!this.locked) {
    if (!this.dragging) {
      this.dragging = true
    }
    if (!this.active_point) {
      this.points.each(function(point) {
        // 'true' = all points drag together
        point.drag(true)
      })
      if (this.mask && this.mask.points) {
        this.mask.points.each(function(point) {
          // 'true' = all points drag together
          point.drag(true)
        })
      }
      $C.cursor('move')
    }
    } else {
      Tool.Pan.drag()
    }
  },
  cancel_drag: function() {
    $C.cursor('auto')
    this.dragging = false
    this.points.each(function(point) {
      point.dragging = false
    })
  },
  /**
* Saves current point positions to history
*/
  save_state: function() {
    if (this.history.last() != this.serialize_points()) this.history.push(this.serialize_points())
  },
  /**
* Returns to most recent saved state
*/
  undo: function() {
    if (this.history.last() == this.serialize_points()) this.history.pop()
    if (this.history.length > 0) this.import_points(this.history.pop())
  },
  /**
* Repositions image based on a JSON serialized "saved state", such as
* generated by .serialize_points(), below.
*/
  import_points: function(saved) {
    saved = saved.evalJSON()
    this.points.each(function(point,index) {
      point.x = saved[index][0]
      point.y = saved[index][1]
    })
  },
  /**
* Generates an array of point pairs which can be stored in this.history
*/
  serialize_points: function() {
    var prejson = []
    this.points.each(function(point){
      prejson.push([point.x,point.y])
    })
    return prejson.toJSON()
  },
  /**
* Double click handler. Called from Warper.dblclick(), which finds the top
* image and calls its dblclick()
*/
  dblclick: function() {
    if (Tool.active != "Mask") {
      if (this.opacity == this.opacity_low) this.opacity = this.opacity_high
      else this.opacity = this.opacity_low
      $('tool_warp_transparent').toggleClassName('down')
    }
  },
  /**
* A function to generate an array of coordinate pairs as in [lat,lon] for the image corners
*/
  coordinates: function() {
    coordinates = []
    this.points.each(function(point) {
      var lon = Projection.x_to_lon(-point.x)
      var lat = Projection.y_to_lat(point.y)
      coordinates.push([lon,lat])
    })
    return coordinates
  },
  /**
* Asyncronously upload distorted point coordinates to server
*/
  save: function() {
    // mask_coordinate_string may end up being useless depending on if
    // we mask in GDAL or ImageMagick
    var coordinate_string = '', first = true, mask_coordinate_string = ''
    this.coordinates().each(function(coord){
      if (first) first = false
      else coordinate_string += ':'
      coordinate_string += coord[0]+','+coord[1]
    })
    first = true
    if (this.mask) {
      this.mask.coordinates().each(function(coord){
        if (first) first = false
        else mask_coordinate_string += ':'
        mask_coordinate_string += coord[0]+','+coord[1]
      })
    }
    new Ajax.Request('/warper/update', {
        method: 'post',
      parameters: { 'warpable_id': this.id,'points': coordinate_string, 'locked': this.locked, 'mask': mask_coordinate_string },
      onSuccess: function(response) {
        $l('updated warper points')
      }
    })
    this.reset_centroid()
    this.area = Geometry.poly_area(this.points)
    Warper.sort_images()
  },
  reset_centroid: function() {
    this.centroid = Geometry.poly_centroid(this.points)
    this.centroid[0] *= 2
    this.centroid[1] *= 2
  },
  /**
*
*/
  cleanup: function() {
           Glop.stopObserving('dblclick', this.dblclick_handler)
  },
  /**
* Update transform based on position of 4 corners.
*/
  update: function() {
    // Update points
    this.points.each(function(point) {
      point.update()
    })

    // Get extents.
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.points.each(function(point) {
      minX = Math.min(minX, Math.floor(point.x));
      maxX = Math.max(maxX, Math.ceil(point.x));
      minY = Math.min(minY, Math.floor(point.y));
      maxY = Math.max(maxY, Math.ceil(point.y));
    })
    
    //$l($H({'minX': minX, 'minY': minY}))

    minX--; minY--; maxX++; maxY++;
    var width = maxX - minX;
    var height = maxY - minY;

    // Measure texture.
    iw = this.image.width;
    ih = this.image.height;
    
    // Set up basic drawing context.
    //$C.translate(-minX, -minY);

    transform = Warper.getProjectiveTransform(this.points);

    // Begin subdivision process.
    var ptl = transform.transformProjectiveVector([0, 0, 1]);
    var ptr = transform.transformProjectiveVector([1, 0, 1]);
    var pbl = transform.transformProjectiveVector([0, 1, 1]);
    var pbr = transform.transformProjectiveVector([1, 1, 1]);

    $C.canvas.save();
    //$C.translate(-minX, -minY)
    $C.canvas.beginPath();
    $C.canvas.moveTo(ptl[0], ptl[1]);
    $C.canvas.lineTo(ptr[0], ptr[1]);
    $C.canvas.lineTo(pbr[0], pbr[1]);
    $C.canvas.lineTo(pbl[0], pbl[1]);
    // $C.canvas.stroke();
    $C.canvas.closePath();
    $C.canvas.clip();
    
    this.divide(0, 0, 1, 1, ptl, ptr, pbl, pbr, this.subdivision_limit);
    $C.canvas.restore()
    
  },

  /**
* Render a projective patch.
*/
  divide: function(u1, v1, u4, v4, p1, p2, p3, p4, limit) {
    // See if we can still divide.
    if (limit) {
      // Measure patch non-affinity.
      var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
      var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
      var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
      var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

      // Measure patch area.
      d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
      d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
      var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

      // Check area > patch_size pixels (note factor 4 due to not averaging d1 and d2)
      // The non-affinity measure is used as a correction factor.
      if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.patch_size() * this.patch_size()))) {
        // Calculate subdivision points (middle, top, bottom, left, right).
        var umid = (u1 + u4) / 2;
        var vmid = (v1 + v4) / 2;
        var pmid = transform.transformProjectiveVector([umid, vmid, 1]);
        var pt = transform.transformProjectiveVector([umid, v1, 1]);
        var pb = transform.transformProjectiveVector([umid, v4, 1]);
        var pl = transform.transformProjectiveVector([u1, vmid, 1]);
        var pr = transform.transformProjectiveVector([u4, vmid, 1]);

        // Subdivide.
        limit--;
        this.divide(u1, v1, umid, vmid, p1, pt, pl, pmid, limit);
        this.divide(umid, v1, u4, vmid, pt, p2, pmid, pr, limit);
        this.divide(u1, vmid, umid, v4, pl, pmid, p3, pb, limit);
        this.divide(umid, vmid, u4, v4, pmid, pr, pb, p4, limit);


        return;
      }
    }

    // Render this patch.
    $C.canvas.save();

    // Set clipping path.
    $C.canvas.beginPath();
    $C.canvas.moveTo(p1[0], p1[1]);
    $C.canvas.lineTo(p2[0], p2[1]);
    $C.canvas.lineTo(p4[0], p4[1]);
    $C.canvas.lineTo(p3[0], p3[1]);
    $C.canvas.closePath();
    //$C.canvas.clip();

    // Get patch edge vectors.
    var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
    var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
    var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
    var d31 = [p1[0] - p3[0], p1[1] - p3[1]];
    
    // Find the corner that encloses the most area
    var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
    var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
    var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
    var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
    var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
    var dx = 0, dy = 0, padx = 0, pady = 0;

    // Align the transform along this corner.
    switch (amax) {
      case a1:
        //$l($H({'case': 'a1'}))
        $C.canvas.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
        // Calculate 1.05 pixel padding on vector basis.
        if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
        if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
        break;
      case a2:
        //$l($H({'case': 'a2'}))
        $C.canvas.transform(d12[0], d12[1], d24[0], d24[1], p2[0], p2[1]);
        // Calculate 1.05 pixel padding on vector basis.
        if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
        if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
        dx = -1;
        break;
      case a4:
        //$l($H({'case': 'a4'}))
        $C.canvas.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
        // Calculate 1.05 pixel padding on vector basis.
        if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
        if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
        dx = -1;
        dy = -1;
        break;
      case a3:
        //$l($H({'case': 'a3'}))
        // Calculate 1.05 pixel padding on vector basis.
        $C.canvas.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
        if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
        if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
        dy = -1;
        break;
    }

    // Calculate image padding to match.
    var du = (u4 - u1);
    var dv = (v4 - v1);
    var padu = padx * du;
    var padv = pady * dv;
    
    //dx += this.points[0].x
    //dy += this.points[0].y
    
    $l($H({
      'dx, dy': Warper.p([dx, dy]),
      'px, py': Warper.p([padx, pady])
    }))
        
    if (this.image.width) {
      $C.canvas.drawImage(
        this.image,
        u1 * iw,
        v1 * ih,
        Math.min(u4 - u1 + padu, 1) * iw,
        Math.min(v4 - v1 + padv, 1) * ih,
        dx, dy,
        1 + padx, 1 + pady
      );
    }
    
    $C.canvas.restore();
  }
}
)