!(function () {
  var t = {
    808: function () {
      (L.DistortableCollection = L.FeatureGroup.extend({
        options: {
          editable: !0,
          exportOpts: {
            exportStartUrl: "//export.mapknitter.org/export",
            statusUrl: "//export.mapknitter.org",
            exportUrl: "http://export.mapknitter.org/",
          },
        },
        initialize: function (t) {
          L.setOptions(this, t),
            L.FeatureGroup.prototype.initialize.call(this, t),
            L.Utils.initTranslation.call(this),
            (this.editable = this.options.editable);
        },
        onAdd: function (t) {
          L.FeatureGroup.prototype.onAdd.call(this, t),
            (this._map = t),
            this.editable && this.editing.enable(),
            this.on("layeradd", this._addEvents, this),
            this.on("layerremove", this._removeEvents, this);
        },
        onRemove: function () {
          this.editing && this.editing.disable(),
            this.off("layeradd", this._addEvents, this),
            this.off("layerremove", this._removeEvents, this);
        },
        _addEvents: function (t) {
          var e = t.layer;
          L.DomEvent.on(
            e,
            { dragstart: this._dragStartMultiple, drag: this._dragMultiple },
            this
          ),
            L.DomEvent.on(
              e.getElement(),
              {
                mousedown: this._deselectOthers,
                contextmenu: this._longPressMultiSelect,
              },
              this
            );
        },
        _removeEvents: function (t) {
          var e = t.layer;
          L.DomEvent.off(
            e,
            { dragstart: this._dragStartMultiple, drag: this._dragMultiple },
            this
          ),
            L.DomEvent.off(
              e.getElement(),
              {
                mousedown: this._deselectOthers,
                contextmenu: this._longPressMultiSelect,
              },
              this
            );
        },
        _longPressMultiSelect: function (t) {
          var e = this;
          this.editable &&
            (t.preventDefault(),
            this.eachLayer(function (i) {
              var o = i.editing;
              i.getElement() === t.target &&
                o.enabled() &&
                (L.DomUtil.toggleClass(i.getElement(), "collected"),
                e.anyCollected()
                  ? (i.deselect(), e.editing._addToolbar())
                  : e.editing._removeToolbar());
            }));
        },
        isCollected: function (t) {
          return L.DomUtil.hasClass(t.getElement(), "collected");
        },
        anyCollected: function () {
          return this.getLayers().some(this.isCollected.bind(this));
        },
        _toggleCollected: function (t, e) {
          t.shiftKey &&
            e.editing.enabled() &&
            L.DomUtil.toggleClass(t.target, "collected"),
            this.anyCollected() ? e.deselect() : this.editing._removeToolbar();
        },
        _deselectOthers: function (t) {
          var e = this;
          this.editable &&
            (this.eachLayer(function (i) {
              i.getElement() !== t.target
                ? i.deselect()
                : e._toggleCollected(t, i);
            }),
            t && L.DomEvent.stopPropagation(t));
        },
        _dragStartMultiple: function (t) {
          var e,
            i = t.target,
            o = this._map;
          this.isCollected(i) &&
            this.eachLayer(function (t) {
              for (t._dragStartPoints = {}, t.deselect(), e = 0; e < 4; e++) {
                var i = t.getCorner(e);
                t._dragStartPoints[e] = o.latLngToLayerPoint(i);
              }
            });
        },
        _dragMultiple: function (t) {
          var e = t.target,
            i = this._map;
          if (this.isCollected(e)) {
            var o = i.latLngToLayerPoint(e.getCorner(0)),
              n = e._dragStartPoints[0].subtract(o);
            this._updateCollectionFromPoints(n, e);
          }
        },
        _toRemove: function () {
          var t = this;
          return this.getLayers().filter(function (e) {
            var i = e.editing._mode;
            return t.isCollected(e) && "lock" !== i;
          });
        },
        _toMove: function (t) {
          var e = this;
          return this.getLayers().filter(function (i) {
            var o = i.editing._mode;
            return i !== t && e.isCollected(i) && "lock" !== o;
          });
        },
        _updateCollectionFromPoints: function (t, e) {
          var i,
            o = this._toMove(e),
            n = new L.Transformation(1, -t.x, 1, -t.y);
          o.forEach(function (t) {
            var e = {};
            for (i = 0; i < 4; i++) e[i] = n.transform(t._dragStartPoints[i]);
            t.setCornersFromPoints(e);
          });
        },
        _getAvgCmPerPixel: function (t) {
          return (
            t.reduce(function (t, e) {
              return t + e.cm_per_pixel;
            }, 0) / t.length
          );
        },
        generateExportJson: function () {
          var t = { images: [] };
          return (
            this.eachLayer(function (e) {
              if (this.isCollected(e)) {
                var i = e._image.src.split("/"),
                  o = i[i.length - 1],
                  n = e.getCorners(),
                  a = [
                    { lat: n[0].lat, lon: n[0].lng },
                    { lat: n[1].lat, lon: n[1].lng },
                    { lat: n[3].lat, lon: n[3].lng },
                    { lat: n[2].lat, lon: n[2].lng },
                  ];
                t.images.push({
                  id: this.getLayerId(e),
                  src: e._image.src,
                  width: e._image.width,
                  height: e._image.height,
                  image_file_name: o,
                  nodes: a,
                  cm_per_pixel: L.ImageUtil.getCmPerPixel(e),
                });
              }
            }, this),
            (t.images = t.images.reverse()),
            (t.avg_cm_per_pixel = this._getAvgCmPerPixel(t.images)),
            t
          );
        },
      })),
        (L.distortableCollection = function (t, e) {
          return new L.DistortableCollection(t, e);
        });
    },
    477: function () {
      (L.DistortableImageOverlay = L.ImageOverlay.extend({
        options: {
          height: 200,
          crossOrigin: !0,
          edgeMinWidth: 50,
          editable: !0,
          mode: "distort",
          selected: !1,
        },
        initialize: function (t, e) {
          L.setOptions(this, e),
            L.Utils.initTranslation.call(this),
            (this.edgeMinWidth = this.options.edgeMinWidth),
            (this.editable = this.options.editable),
            (this._selected = this.options.selected),
            (this._url = t),
            (this.rotation = {});
        },
        onAdd: function (t) {
          var e = this;
          (this._map = t),
            this.getElement() || this._initImage(),
            t.on("viewreset", this._reset, this),
            this.options.corners &&
              ((this._corners = this.options.corners),
              t.options.zoomAnimation &&
                L.Browser.any3d &&
                t.on("zoomanim", this._animateZoom, this)),
            L.DomEvent.on(this.getElement(), "load", function () {
              if (
                (e.getPane().appendChild(e.getElement()),
                e._initImageDimensions(),
                e.options.rotation)
              ) {
                var i = e.options.rotation.deg ? "deg" : "rad";
                e.setAngle(e.options.rotation[i], i);
              } else (e.rotation = { deg: 0, rad: 0 }), e._reset();
              e._corners ||
                (t.options.zoomAnimation &&
                  L.Browser.any3d &&
                  t.on("zoomanim", e._animateZoom, e));
              var o = e._eventParents;
              o
                ? ((e.eP = o[Object.keys(o)[0]]),
                  e.eP.editable && e.editing.enable())
                : (e.editable && e.editing.enable(), (e.eP = null));
            }),
            L.DomEvent.on(this.getElement(), "click", this.select, this),
            L.DomEvent.on(
              t,
              {
                singleclickon: this._singleClickListeners,
                singleclickoff: this._resetClickListeners,
                singleclick: this._singleClick,
              },
              this
            ),
            t.doubleClickZoom.enabled() ||
              t.doubleClickLabels.enabled() ||
              L.DomEvent.on(t, "click", this.deselect, this),
            this.fire("add");
        },
        onRemove: function (t) {
          L.DomEvent.off(this.getElement(), "click", this.select, this),
            L.DomEvent.off(
              t,
              {
                singleclickon: this._singleClickListeners,
                singleclickoff: this._resetClickListeners,
                singleclick: this._singleClick,
              },
              this
            ),
            L.DomEvent.off(t, "click", this.deselect, this),
            this.editing && this.editing.disable(),
            this.fire("remove"),
            L.ImageOverlay.prototype.onRemove.call(this, t);
        },
        _initImageDimensions: function () {
          var t = this._map,
            e = L.DomUtil.getStyle(this.getElement(), "width"),
            i = L.DomUtil.getStyle(this.getElement(), "height"),
            o = parseInt(e) / parseInt(i),
            n = this.options.height,
            a = parseInt(o * n),
            s = t.project(t.getCenter()),
            r = L.point(a, n).divideBy(2);
          this.options.corners
            ? (this._corners = this.options.corners)
            : (this._corners = [
                t.unproject(s.subtract(r)),
                t.unproject(s.add(L.point(r.x, -r.y))),
                t.unproject(s.add(L.point(-r.x, r.y))),
                t.unproject(s.add(r)),
              ]),
            (this._initialDimensions = {
              center: s,
              offset: r,
              zoom: t.getZoom(),
            }),
            this.setBounds(L.latLngBounds(this.getCorners()));
        },
        _singleClick: function (t) {
          "singleclick" === t.type && this.deselect();
        },
        _singleClickListeners: function () {
          var t = this._map;
          L.DomEvent.off(t, "click", this.deselect, this),
            L.DomEvent.on(t, "singleclick", this.deselect, this);
        },
        _resetClickListeners: function () {
          var t = this._map;
          L.DomEvent.on(t, "click", this.deselect, this),
            L.DomEvent.off(t, "singleclick", this.deselect, this);
        },
        isSelected: function () {
          return this._selected;
        },
        deselect: function () {
          var t = this.editing;
          if (t.enabled())
            return (
              t._removeToolbar(),
              t._hideMarkers(),
              (this._selected = !1),
              this.fire("deselect"),
              this
            );
        },
        select: function (t) {
          var e = this.editing,
            i = this.eP;
          if (e.enabled()) {
            if (
              (t && L.DomEvent.stopPropagation(t),
              this._programmaticGrouping(),
              (this._selected = !0),
              e._addToolbar(),
              e._showMarkers(),
              this.fire("select"),
              !i || !i.anyCollected())
            )
              return this;
            this.deselect();
          }
        },
        _programmaticGrouping: function () {
          this._map.eachLayer(function (t) {
            t instanceof L.DistortableImageOverlay && t.deselect();
          });
        },
        setCorner: function (t, e) {
          var i = this.editing;
          return (
            (this._corners[t] = e),
            this.setBounds(L.latLngBounds(this.getCorners())),
            this.fire("update"),
            i.toolbar &&
              i.toolbar instanceof L.DistortableImage.PopupBar &&
              i._updateToolbarPos(),
            (this.edited = !0),
            this
          );
        },
        _cornerExceedsMapLats: function (t, e, i) {
          return (
            i.options.crs != L.CRS.Simple &&
            (0 === t
              ? ((o = i.project(e).y < 2), (n = i.project(e).y >= 255))
              : ((o = i.project(e).y / t < 2),
                (n = i.project(e).y / Math.pow(2, t) >= 255)),
            o || n)
          );
          var o, n;
        },
        setCorners: function (t) {
          var e = this._map,
            i = e.getZoom(),
            o = this.editing,
            n = 0;
          for (var a in t)
            if (this._cornerExceedsMapLats(i, t[a], e))
              return (
                this.setBounds(L.latLngBounds(this.getCorners())),
                void this.fire("update")
              );
          for (a in t) (this._corners[n] = t[a]), (n += 1);
          return (
            this.setBounds(L.latLngBounds(this.getCorners())),
            this.fire("update"),
            o.toolbar &&
              o.toolbar instanceof L.DistortableImage.PopupBar &&
              o._updateToolbarPos(),
            (this.edited = !0),
            this
          );
        },
        setCornersFromPoints: function (t) {
          var e = this._map,
            i = e.getZoom(),
            o = this.editing,
            n = 0;
          for (var a in t) {
            var s = e.layerPointToLatLng(t[a]);
            if (this._cornerExceedsMapLats(i, s, e))
              return (
                this.setBounds(L.latLngBounds(this.getCorners())),
                void this.fire("update")
              );
          }
          for (a in t)
            (this._corners[n] = e.layerPointToLatLng(t[a])), (n += 1);
          return (
            this.setBounds(L.latLngBounds(this.getCorners())),
            this.fire("update"),
            o.toolbar &&
              o.toolbar instanceof L.DistortableImage.PopupBar &&
              o._updateToolbarPos(),
            (this.edited = !0),
            this
          );
        },
        scaleBy: function (t) {
          var e,
            i,
            o = this._map,
            n = o.project(this.getCenter()),
            a = {};
          if (0 !== t) {
            for (e = 0; e < 4; e++)
              (i = o
                .project(this.getCorner(e))
                .subtract(n)
                .multiplyBy(t)
                .add(n)),
                (a[e] = o.unproject(i));
            return this.setCorners(a), this;
          }
        },
        getAngle: function () {
          var t =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "deg",
            e = this.getElement()
              .style[L.DomUtil.TRANSFORM].split("matrix3d")[1]
              .slice(1, -1)
              .split(","),
            i = e[0],
            o = e[1],
            n = e[4],
            a = e[5],
            s = i * a - o * n,
            r = L.TrigUtil.calcAngle(i, o, "rad");
          return (
            s < 0 && (r += r < 0 ? Math.PI : -Math.PI),
            r < 0 && (r = 2 * Math.PI + r),
            "deg" === t
              ? Math.round(L.TrigUtil.radiansToDegrees(r))
              : L.Util.formatNum(r, 2)
          );
        },
        setAngle: function (t) {
          var e =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "deg",
            i = this.getAngle(e),
            o = t - i;
          return this.rotateBy(o, e), this;
        },
        rotateBy: function (t) {
          var e,
            i,
            o,
            n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "deg",
            a = this._map,
            s = a.project(this.getCenter()),
            r = {};
          for (
            "deg" === n && (t = L.TrigUtil.degreesToRadians(t)), e = 0;
            e < 4;
            e++
          )
            (i = a.project(this.getCorner(e)).subtract(s)),
              (o = L.point(
                Math.cos(t) * i.x - Math.sin(t) * i.y,
                Math.sin(t) * i.x + Math.cos(t) * i.y
              )),
              (r[e] = a.unproject(o.add(s)));
          return this.setCorners(r), this;
        },
        dragBy: function (t, e) {
          var i,
            o,
            n = this._map,
            a = {},
            s = n.project(t).subtract(n.project(e));
          for (i = 0; i < 4; i++)
            (o = n.project(this.getCorner(i)).subtract(s)),
              (a[i] = n.unproject(o));
          this.setCorners(a);
        },
        restore: function () {
          for (
            var t = this._map,
              e = this._initialDimensions.center,
              i = this._initialDimensions.offset,
              o = this._initialDimensions.zoom,
              n = [
                e.subtract(i),
                e.add(L.point(i.x, -i.y)),
                e.add(L.point(-i.x, i.y)),
                e.add(i),
              ],
              a = 0;
            a < 4;
            a++
          )
            t.unproject(n[a], o).equals(this.getCorner(a)) ||
              this.setCorner(a, t.unproject(n[a], o));
          return (this.edited = !1), this.fire("restore"), this;
        },
        _getTranslateString: function (t) {
          var e = L.Browser.webkit3d,
            i = (e ? ",0" : "") + ")";
          return (
            "translate" + (e ? "3d" : "") + "(" + t.x + "px," + t.y + "px" + i
          );
        },
        _reset: function () {
          var t = this._map,
            e = this.getElement(),
            i = L.bind(t.latLngToLayerPoint, t),
            o = this._calculateProjectiveTransform(i),
            n = i(this.getCorner(0)),
            a = L.DomUtil.getMatrixString(o),
            s = this._getTranslateString(n);
          (e._leaflet_pos = n),
            (e.style[L.DomUtil.TRANSFORM] = [s, a].join(" ")),
            (e.style[L.DomUtil.TRANSFORM + "-origin"] = "0 0 0"),
            (this.rotation.deg = this.getAngle()),
            (this.rotation.rad = this.getAngle("rad"));
        },
        _animateZoom: function (t) {
          var e = this._map,
            i = this.getElement(),
            o = function (i) {
              return e._latLngToNewLayerPoint(i, t.zoom, t.center);
            },
            n = this._calculateProjectiveTransform(o),
            a = o(this.getCorner(0)),
            s = L.DomUtil.getMatrixString(n),
            r = this._getTranslateString(a);
          (i._leaflet_pos = a),
            (i.style[L.DomUtil.TRANSFORM] = [r, s].join(" "));
        },
        getCorners: function () {
          return this._corners;
        },
        getCorner: function (t) {
          return this._corners[t];
        },
        getCenter: function () {
          var t = this._map,
            e = this.getCorners().reduce(function (e, i) {
              return e.add(t.project(i));
            }, L.point(0, 0));
          return t.unproject(e.divideBy(4));
        },
        _calculateProjectiveTransform: function (t) {
          var e,
            i = t(this.getCorner(0)),
            o = this.getElement().offsetWidth || 500,
            n = this.getElement().offsetHeight || 375,
            a = [];
          for (e = 0; e < 4; e++) a.push(t(this.getCorner(e))._subtract(i));
          return L.MatrixUtil.general2DProjection(
            0,
            0,
            a[0].x,
            a[0].y,
            o,
            0,
            a[1].x,
            a[1].y,
            0,
            n,
            a[2].x,
            a[2].y,
            o,
            n,
            a[3].x,
            a[3].y
          );
        },
      })),
        (L.distortableImageOverlay = function (t, e) {
          return new L.DistortableImageOverlay(t, e);
        }),
        L.Map.addInitHook(function () {
          L.DomUtil.hasClass(this.getContainer(), "ldi") ||
            L.DomUtil.addClass(this.getContainer(), "ldi");
        });
    },
    782: function () {
      var t = this;
      (L.DomUtil = L.DomUtil || {}),
        (L.DistortableImage = L.DistortableImage || {}),
        (L.distortableImage = L.DistortableImage),
        (L.DistortableImage.Keymapper = L.Handler.extend({
          options: { position: "topright" },
          initialize: function (t, e) {
            (this._map = t), L.setOptions(this, e);
          },
          addHooks: function () {
            this._keymapper ||
              ((this._container = this._buildContainer()),
              (this._scrollWrapper = this._wrap()),
              (this._toggler = this._createButton()),
              this._setMapper(
                this._container,
                this._scrollWrapper,
                this._toggler
              ),
              L.DomEvent.on(
                this._toggler,
                "click",
                this._toggleKeymapper,
                this
              ),
              L.DomEvent.disableClickPropagation(this._container),
              L.DomEvent.disableScrollPropagation(this._container));
          },
          removeHooks: function () {
            this._keymapper &&
              (L.DomEvent.off(
                this._toggler,
                "click",
                this._toggleKeymapper,
                this
              ),
              L.DomUtil.remove(this._toggler),
              L.DomUtil.remove(this._scrollWrapper),
              L.DomUtil.remove(this._container),
              (this._keymapper = !1));
          },
          _buildContainer: function () {
            var t = L.DomUtil.create("div", "ldi-keymapper-hide");
            t.setAttribute("id", "ldi-keymapper");
            var e = L.DomUtil.create("br", "divider");
            return t.appendChild(e), t;
          },
          _createButton: function () {
            var t = L.DomUtil.create("a", "");
            return (
              (t.innerHTML = L.IconUtil.create("keyboard_open")),
              t.setAttribute("id", "toggle-keymapper"),
              t.setAttribute("href", "#"),
              t.setAttribute("title", "Show keymap"),
              t.setAttribute("role", "button"),
              t.setAttribute("aria-label", "Show keymap"),
              t
            );
          },
          _wrap: function () {
            var t = L.DomUtil.create("div", "");
            return (
              t.setAttribute("id", "keymapper-wrapper"),
              (t.style.display = "none"),
              t
            );
          },
          _setMapper: function (t, e, i) {
            (this._keymapper = L.control({ position: this.options.position })),
              (this._keymapper.onAdd = function () {
                return (
                  t.appendChild(e),
                  e.insertAdjacentHTML(
                    "beforeend",
                    '<table><tbody><hr id="keymapper-hr"><tr><td><div class="left"><span>Rotate Mode</span></div><div class="right"><kbd>R</kbd></div></td></tr><tr><td><div class="left"><span>RotateScale Mode</span></div><div class="right"><kbd>r</kbd></div></td></tr><tr><td><div class="left"><span>Scale Mode</span></div><div class="right"><kbd>s</kbd></div></td></tr><tr><td><div class="left"><span>Distort Mode</span></div><div class="right"><kbd>d</kbd></div></td></tr><tr><td><div class="left"><span>Drag Mode</span></div><div class="right"><kbd>D</kbd></div></td></tr><tr><td><div class="left"><span>Lock (Mode) / Unlock Image</span></div><div class="right"><kbd>l</kbd> <kbd>u</kbd></div></td></tr><tr><td><div class="left"><span>Stack up / down</span></div><div class="right"><kbd>q</kbd> <kbd>a</kbd></div></td></tr><tr><td><div class="left"><span>Add / Remove Image Border</span></div><div class="right"><kbd>b</kbd></div></td></tr><tr><td><div class="left"><span>Toggle Opacity</span></div><div class="right"><kbd>o</kbd></div></td></tr><tr><td><div class="left"><span>Deselect All</span></div><div class="right"><kbd>esc</kbd></div></td></tr><tr><td><div class="left"><span>Delete Image(s)</span></div><div class="right"><kbd>delete</kbd> <kbd>backspace</kbd></div></td></tr><tr><td><div class="left"><span>Export Image(s)</span></div><div class="right"><kbd>e</kbd></div></td></tr></tbody></table>'
                  ),
                  t.appendChild(i),
                  t
                );
              }),
              this._keymapper.addTo(this._map);
          },
          _toggleKeymapper: function (t) {
            t.preventDefault(),
              (this._container.className =
                "ldi-keymapper leaflet-control" === this._container.className
                  ? "ldi-keymapper-hide leaflet-control"
                  : "ldi-keymapper leaflet-control"),
              (this._scrollWrapper.style.display =
                "none" === this._scrollWrapper.style.display
                  ? "block"
                  : "none"),
              (this._toggler.innerHTML =
                "close" === this._toggler.innerHTML
                  ? L.IconUtil.create("keyboard_open")
                  : "close"),
              L.IconUtil.toggleTitle(
                this._toggler,
                "Show keymap",
                "Hide keymap"
              ),
              L.DomUtil.toggleClass(this._toggler, "close-icon");
          },
          _injectIconSet: function () {
            if (!document.querySelector("#keymapper-iconset")) {
              var t = L.DomUtil.create("div", "");
              (t.id = "keymapper-iconset"),
                t.setAttribute("hidden", "hidden"),
                (this._iconset = new L.KeymapperIconSet().render()),
                (t.innerHTML = this._iconset),
                document
                  .querySelector(".leaflet-control-container")
                  .appendChild(t);
            }
          },
        })),
        L.DistortableImage.Keymapper.addInitHook(function () {
          (L.DistortableImage.Keymapper.prototype._n = L.DistortableImage
            .Keymapper.prototype._n
            ? L.DistortableImage.Keymapper.prototype._n + 1
            : 1),
            1 !== L.DistortableImage.Keymapper.prototype._n ||
              L.Browser.mobile ||
              (t.enable(), t._injectIconSet());
        }),
        (L.distortableImage.keymapper = function (t, e) {
          return new L.DistortableImage.Keymapper(t, e);
        });
    },
    428: function () {
      (L.DistortableImage = L.DistortableImage || {}),
        (L.DistortableCollection.Edit = L.Handler.extend({
          options: { keymap: L.distortableImage.group_action_map },
          initialize: function (t, e) {
            (this._group = t),
              (this._exportOpts = t.options.exportOpts),
              L.setOptions(this, e),
              (L.distortableImage.group_action_map.Escape = "_decollectAll");
          },
          addHooks: function () {
            var t = this._group._map;
            (this.editActions = this.options.actions),
              (this.runExporter = L.bind(
                L.Utils.getNestedVal(this, "_exportOpts", "exporter") ||
                  this.startExport,
                this
              )),
              L.DomEvent.on(document, "keydown", this._onKeyDown, this),
              t.doubleClickZoom.enabled() ||
                t.doubleClickLabels.enabled() ||
                L.DomEvent.on(t, "click", this._decollectAll, this),
              L.DomEvent.on(
                t,
                {
                  singleclickon: this._singleClickListeners,
                  singleclickoff: this._resetClickListeners,
                  singleclick: this._singleClick,
                  boxcollectend: this._addCollections,
                },
                this
              ),
              (this._group.editable = !0),
              this._group.eachLayer(function (t) {
                return t.editing.enable();
              });
          },
          removeHooks: function () {
            var t = this._group._map;
            L.DomEvent.off(document, "keydown", this._onKeyDown, this),
              t.doubleClickZoom.enabled() ||
                t.doubleClickLabels.enabled() ||
                L.DomEvent.off(t, "click", this._decollectAll, this),
              L.DomEvent.off(
                t,
                {
                  singleclickon: this._singleClickListeners,
                  singleclickoff: this._resetClickListeners,
                  singleclick: this._singleClick,
                  boxcollectend: this._addCollections,
                },
                this
              ),
              this._decollectAll(),
              (this._group.editable = !1),
              this._group.eachLayer(function (t) {
                return t.editing.disable();
              });
          },
          enable: function () {
            return (this._enabled = !0), this.addHooks(), this;
          },
          disable: function () {
            return (this._enabled = !1), this.removeHooks(), this;
          },
          _onKeyDown: function (t) {
            var e = this.options.keymap[t.key];
            this[e] && this._group.anyCollected() && this[e].call(this);
          },
          _singleClick: function (t) {
            "singleclick" === t.type && this._decollectAll(t);
          },
          _singleClickListeners: function () {
            var t = this._group._map;
            L.DomEvent.off(t, "click", this._decollectAll, this),
              L.DomEvent.on(t, "singleclick", this._decollectAll, this);
          },
          _resetClickListeners: function () {
            var t = this._group._map;
            L.DomEvent.on(t, "click", this._decollectAll, this),
              L.DomEvent.off(t, "singleclick", this._decollectAll, this);
          },
          _decollectAll: function (t) {
            var e;
            t && (e = t.originalEvent),
              (e && (e.shiftKey || e.target instanceof HTMLImageElement)) ||
                (this._group.eachLayer(function (t) {
                  L.DomUtil.removeClass(t.getElement(), "collected"),
                    t.deselect();
                }),
                this._removeToolbar(),
                t && L.DomEvent.stopPropagation(t));
          },
          _unlockGroup: function () {
            var t = this;
            this.hasTool(L.UnlockAction) &&
              this._group.eachLayer(function (e) {
                t._group.isCollected(e) && (e.editing._unlock(), e.deselect());
              });
          },
          _lockGroup: function () {
            var t = this;
            this.hasTool(L.LockAction) &&
              this._group.eachLayer(function (e) {
                t._group.isCollected(e) &&
                  (e.editing._lock(),
                  L.DomUtil.addClass(e.getElement(), "collected"));
              });
          },
          _addCollections: function (t) {
            var e = this,
              i = t.boxCollectBounds,
              o = this._group._map;
            this._group.eachLayer(function (t) {
              var n = t.editing;
              t.isSelected() && t.deselect();
              var a = o.getZoom(),
                s = o.getCenter(),
                r = L.latLngBounds(t.getCorner(2), t.getCorner(1));
              (r = o._latLngBoundsToNewLayerBounds(r, a, s)),
                i.intersects(r) &&
                  n.enabled() &&
                  (e.toolbar || e._addToolbar(),
                  L.DomUtil.addClass(t.getElement(), "collected"));
            });
          },
          _removeGroup: function (t) {
            var e = this;
            if (this.hasTool(L.DeleteAction)) {
              var i = this._group._toRemove(),
                o = i.length;
              0 !== o &&
                (L.DomUtil.confirmDeletes(o) &&
                  (i.forEach(function (t) {
                    e._group.removeLayer(t);
                  }),
                  this._group.anyCollected() || this._removeToolbar()),
                t && L.DomEvent.stopPropagation(t));
            }
          },
          cancelExport: function () {
            this.customCollection || (this._exportOpts.collection = void 0),
              clearInterval(this.updateInterval);
          },
          _addToolbar: function () {
            var t = this._group,
              e = t._map;
            t.options.suppressToolbar ||
              this.toolbar ||
              (this.toolbar = L.distortableImage
                .controlBar({ actions: this.editActions, position: "topleft" })
                .addTo(e, t));
          },
          _removeToolbar: function () {
            var t = this._group._map;
            if (!this.toolbar) return !1;
            t.removeLayer(this.toolbar), (this.toolbar = !1);
          },
          hasTool: function (t) {
            return this.editActions.some(function (e) {
              return e === t;
            });
          },
          addTool: function (t) {
            return (
              "leaflet-toolbar-icon" !== t.baseClass ||
                this.hasTool(t) ||
                (this._removeToolbar(),
                this.editActions.push(t),
                this._addToolbar()),
              this
            );
          },
          removeTool: function (t) {
            var e = this;
            return (
              this.editActions.some(function (i, o) {
                return (
                  e.editActions[o] === t &&
                  (e._removeToolbar(),
                  e.editActions.splice(o, 1),
                  e._addToolbar(),
                  !0)
                );
              }),
              this
            );
          },
          startExport: function () {
            var t = this;
            if (this.hasTool(L.ExportAction))
              return new Promise(function (e) {
                var i,
                  o = t._exportOpts;
                (o.resolve = e),
                  (t.updateInterval = null),
                  (t.customCollection = !!o.collection),
                  t.customCollection ||
                    (o.collection = t._group.generateExportJson().images),
                  (o.frequency = o.frequency || 3e3),
                  (o.scale = o.scale || 100),
                  (o.updater =
                    o.updater ||
                    function (n) {
                      (n = JSON.parse(n)).status_url &&
                        (i !== n.status_url &&
                          n.status_url.match(".json") &&
                          (i = n.status_url),
                        "complete" === n.status &&
                          (clearInterval(t.updateInterval),
                          t.customCollection ||
                            (t._exportOpts.collection = void 0),
                          e(),
                          null !== n.jpg &&
                            alert("Export succeeded. " + o.exportUrl + n.jpg)),
                        console.log(n));
                    }),
                  (o.handleStatusRes =
                    o.handleStatusRes ||
                    function (e) {
                      (i = o.statusUrl + e),
                        (t.updateInterval = setInterval(function () {
                          var t = new Request(
                            "".concat(i, "?").concat(Date.now()),
                            { method: "GET" }
                          );
                          fetch(t)
                            .then(function (t) {
                              if (t.ok) return t.text();
                            })
                            .then(o.updater);
                        }, o.frequency));
                    }),
                  (o.fetchStatusUrl =
                    o.fetchStatusUrl ||
                    function (t) {
                      var e = new FormData();
                      e.append("collection", JSON.stringify(t.collection)),
                        e.append("scale", t.scale),
                        e.append("upload", !0);
                      var i = { method: "POST", body: e },
                        o = new Request(t.exportStartUrl, i);
                      fetch(o)
                        .then(function (t) {
                          if (t.ok) return t.text();
                        })
                        .then(t.handleStatusRes);
                    }),
                  o.fetchStatusUrl(o);
              });
          },
        })),
        (L.distortableCollection.edit = function (t, e) {
          return new L.DistortableCollection.Edit(t, e);
        });
    },
    397: function () {
      (L.DistortableImage = L.DistortableImage || {}),
        (L.DistortableImage.Edit = L.Handler.extend({
          options: {
            opacity: 0.7,
            outline: "1px solid red",
            keymap: L.distortableImage.action_map,
          },
          initialize: function (t, e) {
            (this._overlay = t),
              (this._toggledImage = !1),
              (this._mode = t.options.mode),
              (this._transparent = !1),
              (this._outlined = !1),
              L.setOptions(this, e),
              (L.distortableImage.action_map.Escape = "_deselect");
          },
          addHooks: function () {
            var t = this._overlay;
            (this.editActions = this.options.actions),
              t.bringToFront(),
              this._initModes(),
              this._initHandles(),
              this._appendHandlesandDragable(),
              t.isSelected() &&
                !t.options.suppressToolbar &&
                this._addToolbar(),
              (this.parentGroup = !!t.eP && t.eP),
              L.DomEvent.on(t.getElement(), { dblclick: this.nextMode }, this),
              L.DomEvent.on(window, "keydown", this._onKeyDown, this);
          },
          removeHooks: function () {
            var t = this._overlay,
              e = this.parentGroup;
            for (var i in (this._disableDragging(),
            this.toolbar && this._removeToolbar(),
            this._handles))
              L.DomUtil.remove(i);
            L.DomUtil.hasClass(t.getElement(), "collected") &&
              L.DomUtil.removeClass(t.getElement(), "collected"),
              e &&
                !e.anyCollected() &&
                e.editing.toolbar &&
                e.editing._removeToolbar(),
              L.DomEvent.off(t.getElement(), { dblclick: this.nextMode }, this),
              L.DomEvent.off(window, "keydown", this._onKeyDown, this);
          },
          disable: function () {
            return this._enabled
              ? (this._overlay.deselect(),
                (this._enabled = !1),
                this.removeHooks(),
                this)
              : this;
          },
          _initModes: function () {
            for (var t in ((this._modes = {}), L.DistortableImage.Edit.MODES)) {
              var e = L.DistortableImage.Edit.MODES[t];
              -1 !== this.editActions.indexOf(e) && (this._modes[t] = e);
            }
            this._modes[this._mode] ||
              (this._mode = Object.keys(this._modes)[0]);
          },
          _initHandles: function () {
            var t,
              e = this._overlay;
            for (this._dragHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._dragHandles.addLayer(L.dragHandle(e, t));
            for (this._scaleHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._scaleHandles.addLayer(L.scaleHandle(e, t));
            for (this._distortHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._distortHandles.addLayer(L.distortHandle(e, t));
            for (this._rotateHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._rotateHandles.addLayer(L.rotateHandle(e, t));
            for (this._freeRotateHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._freeRotateHandles.addLayer(L.freeRotateHandle(e, t));
            for (this._lockHandles = L.layerGroup(), t = 0; t < 4; t++)
              this._lockHandles.addLayer(L.lockHandle(e, t, { draggable: !1 }));
            this._handles = {
              drag: this._dragHandles,
              scale: this._scaleHandles,
              distort: this._distortHandles,
              rotate: this._rotateHandles,
              freeRotate: this._freeRotateHandles,
              lock: this._lockHandles,
            };
          },
          _appendHandlesandDragable: function () {
            var t = this._overlay;
            this._mode
              ? (this._updateHandle(),
                !t.isSelected() &&
                  this.currentHandle &&
                  this.currentHandle.eachLayer(function (t) {
                    t.setOpacity(0), t.dragging && t.dragging.disable();
                  }),
                this.isMode("lock") || this._enableDragging())
              : this._enableDragging();
          },
          _onKeyDown: function (t) {
            var e = this.options.keymap[t.key],
              i = this._overlay,
              o = this.parentGroup;
            (o && o.anyCollected()) ||
              void 0 === this[e] ||
              i.options.suppressToolbar ||
              (i.isSelected() && this.toolbar && this[e].call(this));
          },
          replaceTool: function (t, e) {
            var i = this;
            return (
              "leaflet-toolbar-icon" !== e.baseClass ||
                this.hasTool(e) ||
                this.editActions.some(function (o, n) {
                  if (o === t) {
                    for (var a in (i._removeToolbar(),
                    (i.editActions[n] = e),
                    i._addToolbar(),
                    L.DistortableImage.Edit.MODES))
                      L.DistortableImage.Edit.MODES[a] === t
                        ? (delete i._modes[a], i._nextOrNone(a))
                        : L.DistortableImage.Edit.MODES[a] === e &&
                          (i._modes[a] = e);
                    return !0;
                  }
                }),
              this
            );
          },
          addTool: function (t) {
            if ("leaflet-toolbar-icon" === t.baseClass && !this.hasTool(t)) {
              for (var e in (this._removeToolbar(),
              this.editActions.push(t),
              this._addToolbar(),
              L.DistortableImage.Edit.MODES))
                L.DistortableImage.Edit.MODES[e] === t && (this._modes[e] = t);
              this._overlay.isSelected() || this._removeToolbar();
            }
            return this;
          },
          hasTool: function (t) {
            return this.editActions.some(function (e) {
              return e === t;
            });
          },
          removeTool: function (t) {
            var e = this;
            return (
              this.editActions.some(function (i, o) {
                if (i === t) {
                  for (var n in (e._removeToolbar(),
                  e.editActions.splice(o, 1),
                  e._addToolbar(),
                  L.DistortableImage.Edit.MODES))
                    L.DistortableImage.Edit.MODES[n] === t &&
                      (delete e._modes[n], e._nextOrNone(n));
                  return !0;
                }
              }),
              this._overlay.isSelected() || this._removeToolbar(),
              this
            );
          },
          _nextOrNone: function (t) {
            this.isMode(t) &&
              (Object.keys(this.getModes()).length >= 1
                ? this.nextMode()
                : ("lock" === t && this._enableDragging(),
                  (this._mode = ""),
                  this._updateHandle()));
          },
          _removeToolbar: function () {
            var t = this._overlay._map;
            this.toolbar && (t.removeLayer(this.toolbar), (this.toolbar = !1));
          },
          _enableDragging: function () {
            var t = this,
              e = this._overlay,
              i = e._map;
            (this.dragging = new L.Draggable(e.getElement())),
              this.dragging.enable(),
              this.dragging.on("dragstart", function () {
                e.fire("dragstart"), t._removeToolbar();
              }),
              (this.dragging._updatePosition = function () {
                var t,
                  o,
                  n = e.getCorner(0),
                  a = this._newPos.subtract(i.latLngToLayerPoint(n)),
                  s = {};
                for (this.fire("predrag"), o = 0; o < 4; o++)
                  (t = i.latLngToLayerPoint(e.getCorner(o))),
                    (s[o] = i.layerPointToLatLng(t.add(a)));
                e.setCorners(s), e.fire("drag"), this.fire("drag");
              }),
              this.dragging.on("dragend", function () {
                e.fire("dragend");
              });
          },
          _disableDragging: function () {
            this.dragging && (this.dragging.disable(), delete this.dragging);
          },
          _dragMode: function () {
            this.setMode("drag");
          },
          _scaleMode: function () {
            this.setMode("scale");
          },
          _distortMode: function () {
            this.setMode("distort");
          },
          _rotateMode: function () {
            this.setMode("rotate");
          },
          _freeRotateMode: function () {
            this.setMode("freeRotate");
          },
          _toggleLockMode: function () {
            this.isMode("lock") ? this._unlock() : this._lock();
          },
          _toggleOpacity: function () {
            var t,
              e = this._overlay.getElement();
            this.hasTool(L.OpacityAction) &&
              ((this._transparent = !this._transparent),
              (t = this._transparent ? this.options.opacity : 1),
              L.DomUtil.setOpacity(e, t),
              e.setAttribute("opacity", t),
              this._refresh());
          },
          _toggleBorder: function () {
            var t,
              e = this._overlay.getElement();
            this.hasTool(L.BorderAction) &&
              ((this._outlined = !this._outlined),
              (t = this._outlined ? this.options.outline : "none"),
              (e.style.outline = t),
              this._refresh());
          },
          _toggleOrder: function () {
            this._toggledImage ? this._stackUp() : this._stackDown();
          },
          _removeOverlay: function () {
            var t = this._overlay,
              e = this.parentGroup;
            !this.isMode("lock") &&
              this.hasTool(L.DeleteAction) &&
              L.DomUtil.confirmDelete() &&
              (this._removeToolbar(),
              e ? e.removeLayer(t) : t._map.removeLayer(t));
          },
          _getExport: function () {
            var t = this._overlay,
              e = t._map,
              i = t.getElement();
            if (this.hasTool(L.ExportAction)) {
              var o = new Image();
              (o.id = o.id || "tempId12345"),
                document.body.appendChild(o),
                (o.onload = function () {
                  var i = o.height,
                    n = o.width,
                    a = e.latLngToLayerPoint(t.getCorner(0)),
                    s = e.latLngToLayerPoint(t.getCorner(1)),
                    r = e.latLngToLayerPoint(t.getCorner(2)),
                    l = e.latLngToLayerPoint(t.getCorner(3));
                  (o.onload = function () {
                    L.DomUtil.remove(o);
                  }),
                    window &&
                      window.hasOwnProperty("warpWebGl") &&
                      warpWebGl(
                        o.id,
                        [0, 0, n, 0, n, i, 0, i],
                        [a.x, a.y, s.x, s.y, l.x, l.y, r.x, r.y],
                        !0
                      );
                }),
                (o.src = t.options.fullResolutionSrc || i.src);
            }
          },
          _stackUp: function () {
            this._toggledImage &&
              this.hasTool(L.StackAction) &&
              ((this._toggledImage = !1),
              this._overlay.bringToFront(),
              this._refresh());
          },
          _stackDown: function () {
            !this._toggledImage &&
              this.hasTool(L.StackAction) &&
              ((this._toggledImage = !0),
              this._overlay.bringToBack(),
              this._refresh());
          },
          _unlock: function () {
            var t = this._overlay,
              e = t._map,
              i = this.parentGroup;
            this.isMode("lock") &&
              (((!i || i.isCollected(t)) && i) || this.hasTool(L.LockAction)) &&
              (this.currentHandle && e.removeLayer(this.currentHandle),
              "lock" !== t.options.mode && this.hasMode(t.options.mode)
                ? (this._mode = t.options.mode)
                : ((this._mode = ""), (this.currentHandle = "")),
              this._updateHandle(),
              this._enableDragging(),
              this._refresh());
          },
          _lock: function () {
            var t = this._overlay,
              e = t._map,
              i = this.parentGroup;
            this.isMode("lock") ||
              ((((!i || i.isCollected(t)) && i) ||
                this.hasTool(L.LockAction)) &&
                (this.currentHandle && e.removeLayer(this.currentHandle),
                (this._mode = "lock"),
                this._updateHandle(),
                this._disableDragging(),
                this._refresh()));
          },
          _deselect: function () {
            this._overlay.deselect();
          },
          _showMarkers: function (t) {
            var e = this.parentGroup;
            this.currentHandle &&
              ((!this.isMode("lock") && e && e.anyCollected()) ||
                this.currentHandle.eachLayer(function (t) {
                  t.setOpacity(1),
                    t.dragging && t.dragging.enable(),
                    L.DomUtil.addClass(t.getElement(), "leaflet-interactive");
                }));
          },
          _hideMarkers: function () {
            var t = this._overlay,
              e = this.parentGroup;
            this._handles || this._initHandles(),
              this.currentHandle &&
                ((this.isMode("lock") && e && e.isCollected(t)) ||
                  this.currentHandle.eachLayer(function (t) {
                    t.setOpacity(0),
                      t.dragging && t.dragging.disable(),
                      L.DomUtil.removeClass(
                        t.getElement(),
                        "leaflet-interactive"
                      );
                  }));
          },
          _updateHandle: function () {
            var t = this._overlay._map,
              e = this.getMode();
            this.currentHandle && t.removeLayer(this.currentHandle),
              (this.currentHandle = "" === e ? "" : this._handles[e]),
              "" !== this.currentHandle && t.addLayer(this.currentHandle);
          },
          _addToolbar: function () {
            var t = this._overlay,
              e = this.parentGroup,
              i = t._map,
              o = t.getCorners(),
              n = -1 / 0;
            if (e && e.anyCollected()) e.editing._addToolbar();
            else if (!t.options.suppressToolbar && !this.toolbar) {
              for (var a = 0; a < o.length; a++) o[a].lat > n && (n = o[a].lat);
              var s = t.getCenter();
              (s.lat = n),
                (this.toolbar = L.distortableImage
                  .popupBar(s, { actions: this.editActions })
                  .addTo(i, t)),
                t.fire("toolbar:created");
            }
          },
          _refresh: function () {
            this.toolbar && this._removeToolbar(), this._addToolbar();
          },
          _updateToolbarPos: function () {
            var t = this._overlay,
              e = t.getCorners(),
              i = this.toolbar,
              o = -1 / 0;
            if (i && i instanceof L.DistortableImage.PopupBar) {
              for (var n = 0; n < e.length; n++) e[n].lat > o && (o = e[n].lat);
              var a = t.getCenter();
              (a.lat = o),
                t.options.suppressToolbar || this.toolbar.setLatLng(a);
            }
          },
          hasMode: function (t) {
            return !!this._modes[t];
          },
          getMode: function () {
            if (this.enabled()) return this._mode;
          },
          getModes: function () {
            return this._modes;
          },
          isMode: function (t) {
            return !!this.enabled() && this._mode === t;
          },
          setMode: function (t) {
            var e = this._overlay,
              i = this.parentGroup;
            if (this.getMode() !== t && this.hasMode(t) && this.enabled())
              return (
                this.toolbar && this.toolbar.clickTool(t),
                this.isMode("lock") && !this.dragging && this._enableDragging(),
                (this._mode = t),
                this.isMode("lock") && this._disableDragging(),
                this._updateHandle(),
                this._refresh(),
                i && i.isCollected(e) && e.deselect(),
                this
              );
          },
          nextMode: function (t) {
            var e = this.getMode(),
              i = this.parentGroup,
              o = Object.keys(this.getModes()),
              n = o.indexOf(e),
              a = o[(n + 1) % o.length];
            if (t) {
              if (i && i.anyCollected()) return;
              L.DomEvent.stop(t);
            }
            return this.setMode(a);
          },
        })),
        (L.distortableImage.edit = function (t, e) {
          return new L.DistortableImage.Edit(t, e);
        });
    },
    426: function () {
      L.BorderAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n,
            a = e.editing,
            s = a._mode;
          a._outlined
            ? ((o = "border_outer"), (n = e.options.translation.removeBorder))
            : ((o = "border_clear"), (n = e.options.translation.addBorder)),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: o,
              tooltip: n,
              className: "lock" === s ? "disabled" : "",
            }),
            (L.DistortableImage.action_map.b =
              "lock" === s ? "" : "_toggleBorder"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing;
          L.IconUtil.toggleXlink(this._link, "border_clear", "border_outer"),
            L.IconUtil.toggleTitle(this._link, "Remove Border", "Add Border"),
            t._toggleBorder();
        },
      });
    },
    114: function () {
      L.DeleteAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n = e.editing;
          n instanceof L.DistortableImage.Edit
            ? ((o = e.options.translation.deleteImage),
              (L.DistortableImage.action_map.Backspace =
                "lock" === n._mode ? "" : "_removeOverlay"))
            : ((o = e.options.translation.deleteImages),
              (L.DistortableImage.group_action_map.Backspace =
                "lock" === n._mode ? "" : "_removeGroup")),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: "delete_forever",
              tooltip: o,
              className: "lock" === n._mode ? "disabled" : "",
            }),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing;
          t instanceof L.DistortableImage.Edit
            ? t._removeOverlay()
            : t._removeGroup();
        },
      });
    },
    231: function () {
      L.DistortAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "distort",
            tooltip: e.options.translation.distortImage,
            className: "distort",
          }),
            (L.DistortableImage.action_map.d = "_distortMode"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._distortMode();
        },
      });
    },
    541: function () {
      L.DragAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "drag",
            tooltip: e.options.translation.dragImage,
            className: "drag",
          }),
            (L.DistortableImage.action_map.D = "_dragMode"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._dragMode();
        },
      });
    },
    280: function () {
      (L.DistortableImage = L.DistortableImage || {}),
        (L.distortableImage = L.DistortableImage),
        (L.DistortableImage.action_map = {}),
        (L.EditAction = L.Toolbar2.Action.extend({
          options: {
            toolbarIcon: { svg: !1, html: "", className: "", tooltip: "" },
          },
          initialize: function (t, e, i) {
            (this._overlay = e),
              (this._map = t),
              L.setOptions(this, i),
              L.Toolbar2.Action.prototype.initialize.call(this, i),
              this._injectIconSet();
          },
          _createIcon: function (t, e, i) {
            var o = this,
              n = this.options.toolbarIcon,
              a = n.className,
              s = this._overlay.editing;
            (this.toolbar = t),
              (this._icon = L.DomUtil.create("li", "", e)),
              (this._link = L.DomUtil.create("a", "", this._icon)),
              n.svg
                ? (this._link.innerHTML = L.IconUtil.create(n.html))
                : (this._link.innerHTML = n.html),
              this._link.setAttribute("href", "#"),
              this._link.setAttribute("title", n.tooltip),
              this._link.setAttribute("role", "button"),
              L.DomUtil.addClass(this._link, this.constructor.baseClass),
              a &&
                (L.DomUtil.addClass(this._link, a),
                "disabled" === a && L.DomUtil.addClass(this._icon, a),
                a === s._mode
                  ? L.DomUtil.addClass(this._link, "selected-mode")
                  : L.DomUtil.removeClass(this._link, "selected-mode")),
              L.DomEvent.on(this._link, "click", this.enable, this),
              L.DomEvent.on(this._overlay, "update", function () {
                var t = o._link.innerHTML.match(/xlink:href="#restore"/);
                t && 1 === t.length && o._enableAction();
              }),
              this._addSubToolbar(t, this._icon, i);
          },
          _injectIconSet: function () {
            if (!document.querySelector("#iconset")) {
              var t = document.createElement("div");
              (t.id = "iconset"),
                t.setAttribute("hidden", "hidden"),
                (t.innerHTML = new L.ToolbarIconSet().render()),
                document.querySelector(".leaflet-marker-pane").appendChild(t);
            }
          },
          _enableAction: function () {
            L.DomUtil.removeClass(this._link.parentElement, "disabled"),
              L.DomUtil.removeClass(this._link, "disabled");
          },
          _disableAction: function () {
            L.DomUtil.addClass(this._link.parentElement, "disabled"),
              L.DomUtil.addClass(this._link, "disabled");
          },
        })),
        (L.editAction = function (t, e, i) {
          return new L.EditAction(t, e, i);
        });
    },
    149: function () {
      L.ExportAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n = e.editing;
          (this.isExporting = !1),
            (this.mouseLeaveSkip = !0),
            (this.isHooksExecuted = !1),
            n instanceof L.DistortableImage.Edit
              ? ((L.DistortableImage.action_map.e = "_getExport"),
                (o = e.options.translation.exportImage))
              : ((L.DistortableImage.group_action_map.e = "runExporter"),
                (o = e.options.translation.exportImages)),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: "get_app",
              tooltip: o,
            }),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing;
          if (t instanceof L.DistortableImage.Edit) t._getExport();
          else if (!this.isHooksExecuted) {
            this.isHooksExecuted = !0;
            var e = this._link.parentElement;
            (this.mouseEnterHandler = this.handleMouseEnter.bind(this)),
              (this.mouseLeaveHandler = this.handleMouseLeave.bind(this)),
              L.DomEvent.on(
                e,
                "click",
                function () {
                  if (this.isExporting) {
                    if (this.mouseLeaveSkip) return;
                    this.resetState(),
                      this.detachMouseEventListeners(e),
                      t.cancelExport();
                  } else
                    (this.isExporting = !0),
                      this.renderExportIcon(),
                      setTimeout(
                        this.attachMouseEventListeners.bind(this, e),
                        100
                      ),
                      t.runExporter().then(
                        function () {
                          this.resetState(), this.detachMouseEventListeners(e);
                        }.bind(this)
                      );
                },
                this
              );
          }
        },
        resetState: function () {
          this.renderDownloadIcon(),
            (this.isExporting = !1),
            (this.mouseLeaveSkip = !0);
        },
        attachMouseEventListeners: function (t) {
          t.addEventListener("mouseenter", this.mouseEnterHandler),
            t.addEventListener("mouseleave", this.mouseLeaveHandler);
        },
        detachMouseEventListeners: function (t) {
          t.removeEventListener("mouseenter", this.mouseEnterHandler),
            t.removeEventListener("mouseleave", this.mouseLeaveHandler);
        },
        handleMouseEnter: function () {
          this.renderCancelIcon();
        },
        handleMouseLeave: function () {
          this.mouseLeaveSkip
            ? (this.mouseLeaveSkip = !1)
            : this.renderExportIcon();
        },
        renderDownloadIcon: function () {
          L.IconUtil.toggleXlink(this._link, "get_app", "spinner"),
            L.IconUtil.toggleTitle(this._link, "Export Images", "Loading..."),
            L.DomUtil.removeClass(this._link.firstChild, "loader");
        },
        renderExportIcon: function () {
          L.IconUtil.toggleXlink(this._link, "spinner"),
            L.IconUtil.toggleTitle(this._link, "Export Images", "Loading..."),
            L.IconUtil.addClassToSvg(this._link, "loader");
        },
        renderCancelIcon: function () {
          L.IconUtil.toggleXlink(this._link, "cancel"),
            L.IconUtil.toggleTitle(this._link, "Cancel Export", "Loading..."),
            L.DomUtil.removeClass(this._link.firstChild, "loader");
        },
      });
    },
    74: function () {
      L.FreeRotateAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "crop_rotate",
            tooltip: e.options.translation.freeRotateImage,
            className: "freeRotate",
          }),
            (L.DistortableImage.action_map.f = "_freeRotateMode"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._freeRotateMode();
        },
      });
    },
    691: function () {
      L.GeolocateAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o = e.editing;
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "explore",
            tooltip: e.options.translation.geolocateImage,
            className: "lock" === o._mode ? "disabled" : "",
          }),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.getElement();
          EXIF.getData(t, L.EXIF(t));
        },
      });
    },
    105: function () {
      L.LockAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n,
            a = e.editing;
          a instanceof L.DistortableImage.Edit
            ? ((L.DistortableImage.action_map.u = "_unlock"),
              (L.DistortableImage.action_map.l = "_lock"),
              (n = e.options.translation.lockMode),
              (o = a.isMode("lock") ? "lock" : "unlock"))
            : ((L.DistortableImage.group_action_map.l = "_lockGroup"),
              (n = e.options.translation.lockImages),
              (o = "lock")),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: o,
              tooltip: n,
              className: "lock",
            }),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing;
          t instanceof L.DistortableImage.Edit
            ? t._toggleLockMode()
            : t._lockGroup();
        },
      });
    },
    944: function () {
      L.OpacityAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n,
            a = e.editing,
            s = a._mode;
          a._transparent
            ? ((o = "opacity_empty"),
              (n = e.options.translation.makeImageOpaque))
            : ((o = "opacity"),
              (n = e.options.translation.makeImageTransparent)),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: o,
              tooltip: n,
              className: "lock" === s ? "disabled" : "",
            }),
            (L.DistortableImage.action_map.o =
              "lock" === s ? "" : "_toggleOpacity"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing,
            e = this._link;
          L.IconUtil.toggleXlink(e, "opacity", "opacity_empty"),
            L.IconUtil.toggleTitle(
              e,
              "Make Image Transparent",
              "Make Image Opaque"
            ),
            t._toggleOpacity();
        },
      });
    },
    954: function () {
      L.RestoreAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o = L.Utils.getNestedVal(e, "editing", "_mode"),
            n = e.edited;
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "restore",
            tooltip: e.options.translation.restoreImage,
            className: n && "lock" !== o ? "" : "disabled",
          }),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay;
          L.DomEvent.on(
            t,
            { edit: this._enableAction, restore: this._disableAction },
            this
          ),
            t.restore();
        },
      });
    },
    178: function () {
      L.RotateAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "rotate",
            tooltip: e.options.translation.rotateImage,
            className: "rotate",
          }),
            (L.DistortableImage.action_map.r = "_rotateMode"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._rotateMode();
        },
      });
    },
    547: function () {
      L.ScaleAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "scale",
            tooltip: e.options.translation.scaleImage,
            className: "scale",
          }),
            (L.DistortableImage.action_map.s = "_scaleMode"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._scaleMode();
        },
      });
    },
    886: function () {
      L.StackAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          var o,
            n,
            a = e.editing;
          a._toggledImage
            ? ((o = "flip_to_back"), (n = e.options.translation.stackToFront))
            : ((o = "flip_to_front"), (n = e.options.translation.stackToBack)),
            ((i = i || {}).toolbarIcon = {
              svg: !0,
              html: o,
              tooltip: n,
              className: "lock" === a._mode ? "disabled" : "",
            }),
            (L.DistortableImage.action_map.q =
              "lock" === a._mode ? "" : "_stackUp"),
            (L.DistortableImage.action_map.a =
              "lock" === a._mode ? "" : "_stackDown"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          var t = this._overlay.editing;
          L.IconUtil.toggleXlink(this._link, "flip_to_front", "flip_to_back"),
            L.IconUtil.toggleTitle(
              this._link,
              "Stack to Front",
              "Stack to Back"
            ),
            t._toggleOrder();
        },
      });
    },
    129: function () {
      L.UnlockAction = L.EditAction.extend({
        initialize: function (t, e, i) {
          ((i = i || {}).toolbarIcon = {
            svg: !0,
            html: "unlock",
            tooltip: e.options.translation.unlockImages,
          }),
            (L.DistortableImage.group_action_map.u = "_unlockGroup"),
            L.EditAction.prototype.initialize.call(this, t, e, i);
        },
        addHooks: function () {
          this._overlay.editing._unlockGroup();
        },
      });
    },
    743: function () {
      L.EXIF = function (t) {
        if (0 !== Object.keys(EXIF.getAllTags(t)).length) {
          console.log(EXIF.getAllTags(t));
          var e = EXIF.getAllTags(t);
          void 0 !== e.GPSLatitude &&
            void 0 !== e.GPSLongitude &&
            (e.GPSLatitude[0],
            e.GPSLatitude[1],
            e.GPSLatitude[2],
            e.GPSLongitude[0],
            e.GPSLongitude[1],
            e.GPSLongitude[2],
            e.GPSLatitudeRef,
            e.GPSLongitudeRef),
            "T" === e.GPSImgDirectionRef || "M" === e.GPSImgDirectionRef
              ? (Math.PI,
                e.GPSImgDirection.numerator,
                e.GPSImgDirection.denominator)
              : console.log("No compass data found"),
            console.log("Orientation:", e.Orientation),
            (6 === e.Orientation ||
              8 === e.Orientation ||
              3 === e.Orientation) &&
              Math.PI,
            void 0 !== e.GPSAltitude &&
              void 0 !== e.GPSAltitudeRef &&
              void 0 !== e.GPSAltitude &&
              void 0 !== e.GPSAltitudeRef &&
              (e.GPSAltitude.numerator,
              e.GPSAltitude.denominator,
              e.GPSAltitudeRef);
        } else alert("EXIF initialized. Press again to view data in console.");
      };
    },
    92: function () {
      (L.DistortHandle = L.EditHandle.extend({
        options: {
          TYPE: "distort",
          icon: L.icon({
            iconUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        _onHandleDrag: function () {
          this._handled.setCorner(this._corner, this.getLatLng());
        },
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
      })),
        (L.distortHandle = function (t, e, i) {
          return new L.DistortHandle(t, e, i);
        });
    },
    194: function () {
      (L.DragHandle = L.EditHandle.extend({
        options: {
          TYPE: "drag",
          icon: L.icon({
            iconUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsVJREFUeNrMVztLXEEUvnNVFAVBAhY2aRKbTZEHJNpYabuNjSgYg/GxdsmPSJkUAa/ZdVEX8mgWYVutbHxAHkVskjQBuUUgBISVhCQk3wnfwMlk1rusN1wHPubOzJlzvjlz5sxc01Ma/hUEwQnwDIjqc7uvgv9YYO86qgIwCXQbdNTlQ8kcCBHgBch8TcloF6oJGr6phk6EQAkfdz3zvgDr9Mr7Fg1fptEZoM8jsmrokpfsiIFO4IIjuE2v1EDmR4LRdlR5Gh51hj8D34ABtm8YTtqna0TgklIw5CgQguKxIojEjmFROg/MKQO27NkFAB+4wAPouGUJiIvWKHwbAxX2XyWRKWkqhT+pbJntJZJuUzISW0+5hW+obxrVBsfvoH/dqCCJuU97GBh2VteLSiYvArmErT8EVoAK9Bw7enbpVYmvAQlyowYforrH5jXL2rPHI/TKONDB7u9AlavdaTBPvPmazUeQuy8f7UomUgTEwIJPEQ3sQGE/6ll2l9H/KcEzBcfWn2IclluM3DpddJxSHujlFkscbUPvmB0LHVnLrId7nlaZVkEc6QGXQI1MAwZcWmVRHeNaQwJMMiU2cwy4s7p/RJ2ckpvIQs+cIs+5GzitloLKHUV3MPREuXbTOKO91dX387gGTONxIgEWm+E61FFrpcyqXLHsEwiDjEsjAksqw5XPoL9MHVrn6QR4q+XZrDaR4RoWzq2ymafuRA/Mq1stSsHLVkcbdf9VjOcx8ZH3+SFWcCWlVPyWuUBOwUWdC1wP5NVjYiXFWLO69PZ6CRTUY6KSIoEKdf6T3IzzgHxnsyHctNBEkmn6Oob8ExUDg/ahGybd177cDjzH5xHwgDiSvoS7I/LZyvxJZj0wod7tkX5G0XVC7rEyLhfLJjBGbKoLLEfZWObyKeZ6oY82g+yf5Zn/mJyHX7PMf04z/T3/LcAAu4E6iiyJqf0AAAAASUVORK5CYII=",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        _onHandleDrag: function () {
          var t = this._handled,
            e = t.getCorner(this._corner),
            i = this.getLatLng();
          t.dragBy(e, i);
        },
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
      })),
        (L.dragHandle = function (t, e, i) {
          return new L.DragHandle(t, e, i);
        });
    },
    988: function () {
      L.EditHandle = L.Marker.extend({
        initialize: function (t, e, i) {
          var o = t.getCorner(e);
          L.setOptions(this, i), (this._handled = t), (this._corner = e);
          var n = { draggable: !0, zIndexOffset: 10 };
          i && i.hasOwnProperty("draggable") && (n.draggable = i.draggable),
            L.Marker.prototype.initialize.call(this, o, n);
        },
        onAdd: function (t) {
          L.Marker.prototype.onAdd.call(this, t),
            this._bindListeners(),
            this.updateHandle();
        },
        onRemove: function (t) {
          this._unbindListeners(), L.Marker.prototype.onRemove.call(this, t);
        },
        _onHandleDragStart: function () {
          this._handled.fire("editstart");
        },
        _onHandleDragEnd: function () {
          this._fireEdit();
        },
        _fireEdit: function () {
          (this._handled.edited = !0), this._handled.fire("edit");
        },
        _bindListeners: function () {
          this.on(
            {
              contextmenu: L.DomEvent.stop,
              dragstart: this._onHandleDragStart,
              drag: this._onHandleDrag,
              dragend: this._onHandleDragEnd,
            },
            this
          ),
            this._handled._map.on("zoomend", this.updateHandle, this),
            this._handled.on("update", this.updateHandle, this);
        },
        _unbindListeners: function () {
          this.off(
            {
              contextmenu: L.DomEvent.stop,
              dragstart: this._onHandleDragStart,
              drag: this._onHandleDrag,
              dragend: this._onHandleDragEnd,
            },
            this
          ),
            this._handled._map.off("zoomend", this.updateHandle, this),
            this._handled.off("update", this.updateHandle, this);
        },
        _calculateScalingFactor: function (t, e) {
          var i = this._handled,
            o = i._map,
            n = o.latLngToLayerPoint(i.getCenter()),
            a = o.latLngToLayerPoint(t),
            s = o.latLngToLayerPoint(e),
            r = this._d2(n, a),
            l = this._d2(n, s);
          return Math.sqrt(l / r);
        },
        _d2: function (t, e) {
          var i = t.x - e.x,
            o = t.y - e.y;
          return Math.pow(i, 2) + Math.pow(o, 2);
        },
        calculateAngleDelta: function (t, e) {
          var i = this._handled,
            o = i._map,
            n = o.latLngToLayerPoint(i.getCenter()),
            a = o.latLngToLayerPoint(t),
            s = o.latLngToLayerPoint(e),
            r = Math.atan2(n.y - a.y, n.x - a.x);
          return Math.atan2(n.y - s.y, n.x - s.x) - r;
        },
      });
    },
    206: function () {
      (L.FreeRotateHandle = L.EditHandle.extend({
        options: {
          TYPE: "freeRotate",
          icon: L.icon({
            iconUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        _onHandleDrag: function () {
          var t = this._handled,
            e = t._map,
            i = t.getCorner(this._corner),
            o = this.getLatLng(),
            n = this.calculateAngleDelta(i, o),
            a = this._calculateScalingFactor(i, o);
          0 !== n && t.rotateBy(n, "rad");
          var s = t.edgeMinWidth;
          s || (s = 50);
          var r = e.latLngToContainerPoint(t.getCorner(0)),
            l = e.latLngToContainerPoint(t.getCorner(1)),
            c = Math.abs(r.x - l.x),
            d = Math.abs(r.y - l.y);
          Math.sqrt(c * c + d * d) > s || a > 1 ? t.scaleBy(a) : t.scaleBy(1);
        },
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
      })),
        (L.freeRotateHandle = function (t, e, i) {
          return new L.FreeRotateHandle(t, e, i);
        });
    },
    789: function () {
      (L.LockHandle = L.EditHandle.extend({
        options: {
          TYPE: "lock",
          interactive: !1,
          icon: L.icon({
            iconUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        onRemove: function (t) {
          this.unbindTooltip(), L.EditHandle.prototype.onRemove.call(this, t);
        },
        _bindListeners: function () {
          var t = this.getElement();
          L.EditHandle.prototype._bindListeners.call(this),
            L.DomEvent.on(
              t,
              { mousedown: this._tooltipOn, mouseup: this._tooltipOff },
              this
            ),
            L.DomEvent.on(document, "pointerleave", this._tooltipOff, this);
        },
        _unbindListeners: function () {
          var t = this.getElement();
          L.EditHandle.prototype._bindListeners.call(this),
            L.DomEvent.off(
              t,
              { mousedown: this._tooltipOn, mouseup: this._tooltipOff },
              this
            ),
            L.DomEvent.off(document, "pointerleave", this._tooltipOff, this);
        },
        _onHandleDrag: function () {},
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
        _tooltipOn: function (t) {
          var e = this._handled.parentGroup,
            i = e ? e.editing : this._handled.editing;
          if (
            !t.shiftKey &&
            (this._handled.isSelected() || !e || e.isCollected(this._handled))
          ) {
            var o = i._lockHandles;
            this._timer = setTimeout(
              L.bind(function () {
                this._timeout && clearTimeout(this._timeout),
                  this.getTooltip()
                    ? o.eachLayer(function (t) {
                        this !== t && t.closeTooltip();
                      })
                    : this.bindTooltip("Locked!", { permanent: !0 }),
                  this.openTooltip();
              }, this),
              500
            );
          }
        },
        _tooltipOff: function (t) {
          var e = this._handled.parentGroup,
            i = e ? e.editing : this._handled.editing;
          if (
            !t.shiftKey &&
            (this._handled.isSelected() || !e || e.isCollected(this._handled))
          ) {
            var o = i._lockHandles;
            t.currentTarget === document &&
              o.eachLayer(function (t) {
                t.closeTooltip();
              }),
              this._timer && clearTimeout(this._timer),
              (this._timeout = setTimeout(
                L.bind(function () {
                  this.closeTooltip();
                }, this),
                400
              ));
          }
        },
      })),
        (L.lockHandle = function (t, e, i) {
          return new L.LockHandle(t, e, i);
        });
    },
    337: function () {
      (L.RotateHandle = L.EditHandle.extend({
        options: {
          TYPE: "rotate",
          icon: L.icon({
            iconUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        _onHandleDrag: function () {
          var t = this._handled,
            e = t.getCorner(this._corner),
            i = this.getLatLng(),
            o = this.calculateAngleDelta(e, i);
          t.rotateBy(o, "rad");
        },
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
      })),
        (L.rotateHandle = function (t, e, i) {
          return new L.RotateHandle(t, e, i);
        });
    },
    350: function () {
      (L.ScaleHandle = L.EditHandle.extend({
        options: {
          TYPE: "scale",
          icon: L.icon({
            iconUrl:
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0NTkiIGhlaWdodD0iNDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iIj48cmVjdCBpZD0iYmFja2dyb3VuZHJlY3QiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHg9IjAiIHk9IjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgY2xhc3M9IiIgc3R5bGU9IiIvPjxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjx0aXRsZT5MYXllciAxPC90aXRsZT48cGF0aCBkPSJNNDU5LjA0OTE1OTUzMDQ3MTM0LDg2LjkyNjIzNDUxMjU1MDAyIFYwIGgtODUuNzE0NTczMzU2MzEyMDkgdjI3LjA0MzcxNzQwMzkwNDQ1MiBIODUuNzE0NTczMzU2MzEyMDMgVjAgSDAgdjg2LjkyNjIzNDUxMjU1MDAyIGgyNS43MTQzNzIwMDY4OTM2MjYgdjI4OS43NTQxMTUwNDE4MzM0IEgwIHY4Ni45MjYyMzQ1MTI1NTAwMiBoODUuNzE0NTczMzU2MzEyMDkgdi0yNy4wNDM3MTc0MDM5MDQ0NTIgaDI4NS43MTUyNDQ1MjEwNDAzIHYyNy4wNDM3MTc0MDM5MDQ0NTIgaDg1LjcxNDU3MzM1NjMxMjA5IHYtODYuOTI2MjM0NTEyNTUwMDIgaC0yMy44MDk2MDM3MTAwODY2OSBWODYuOTI2MjM0NTEyNTUwMDIgSDQ1OS4wNDkxNTk1MzA0NzEzNCB6TTM4NC43NjMxOTU5NTUwMDA5LDEyLjU1NjAxMTY1MTgxMjc4MSBoNjEuOTA0OTY5NjQ2MjI1Mzk2IHY2Mi43ODAwNTgyNTkwNjM5MSBoLTYxLjkwNDk2OTY0NjIyNTM5NiBWMTIuNTU2MDExNjUxODEyNzgxIHpNMTIuMzgwOTkzOTI5MjQ1MDUsMTIuNTU2MDExNjUxODEyNzgxIGg2MS45MDQ5Njk2NDYyMjUzOTYgdjYyLjc4MDA1ODI1OTA2MzkxIEgxMi4zODA5OTM5MjkyNDUwNSBWMTIuNTU2MDExNjUxODEyNzgxIHpNNzQuMjg1OTYzNTc1NDcwNTMsNDUxLjA1MDU3MjQxNTEyMDY2IEgxMi4zODA5OTM5MjkyNDUwNSB2LTYyLjc4MDA1ODI1OTA2MzkxIGg2MS45MDQ5Njk2NDYyMjUzOTYgVjQ1MS4wNTA1NzI0MTUxMjA2NiB6TTQ0NS43MTU3ODE0NTI4MjI3NCw0NTEuMDUwNTcyNDE1MTIwNjYgaC02Mi44NTczNTM3OTQ2Mjg4NjQgdi02Mi43ODAwNTgyNTkwNjM5MSBoNjIuODU3MzUzNzk0NjI4ODY0IFY0NTEuMDUwNTcyNDE1MTIwNjYgek00MDcuNjIwNDE1NTE2Njg0MjYsMzc2LjY4MDM0OTU1NDM4MzQ0IGgtMzYuMTkwNTk3NjM5MzMxNzcgdjMyLjgzODc5OTcwNDc0MTEyIEg4NS43MTQ1NzMzNTYzMTIwMyB2LTMyLjgzODc5OTcwNDc0MTEyIEg0OS41MjM5NzU3MTY5ODAzMiBWODYuOTI2MjM0NTEyNTUwMDIgaDM2LjE5MDU5NzYzOTMzMTc3IFY1MC4yMjQwNDY2MDcyNTExMjUgaDI4Ny42MjAwMTI4MTc4NDcyIHYzNi43MDIxODc5MDUyOTg5IGgzNC4yODU4MjkzNDI1MjQ4MzUgVjM3Ni42ODAzNDk1NTQzODM0NCB6IiBpZD0ic3ZnXzIiIGNsYXNzPSIiIGZpbGw9IiMxYTFhZWIiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        },
        _onHandleDrag: function () {
          var t = this._handled,
            e = t._map,
            i = t.edgeMinWidth,
            o = t.getCorner(this._corner),
            n = this.getLatLng(),
            a = this._calculateScalingFactor(o, n);
          i || (i = 50);
          var s = e.latLngToLayerPoint(t.getCorner(0)),
            r = e.latLngToLayerPoint(t.getCorner(1)),
            l = Math.abs(s.x - r.x),
            c = Math.abs(s.y - r.y);
          Math.sqrt(l * l + c * c) > i || a > 1 ? t.scaleBy(a) : t.scaleBy(1);
        },
        updateHandle: function () {
          this.setLatLng(this._handled.getCorner(this._corner));
        },
      })),
        (L.scaleHandle = function (t, e, i) {
          return new L.ScaleHandle(t, e, i);
        });
    },
    719: function () {
      (L.distortableImage = L.DistortableImage || {}),
        (L.distortableImage = L.DistortableImage),
        (L.DistortableImage.group_action_map = {}),
        (L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({})),
        (L.distortableImage.controlBar = function (t) {
          return new L.DistortableImage.ControlBar(t);
        }),
        L.DistortableCollection.addInitHook(function () {
          (this.ACTIONS = [
            L.ExportAction,
            L.DeleteAction,
            L.LockAction,
            L.UnlockAction,
          ]),
            (L.DistortableCollection.Edit.MODES = {
              lock: L.LockAction,
              unlock: L.UnlockAction,
            });
          var t = this.options.actions ? this.options.actions : this.ACTIONS;
          this.editing = L.distortableCollection.edit(this, { actions: t });
        });
    },
    93: function () {
      (L.DistortableImage = L.DistortableImage || {}),
        (L.distortableImage = L.DistortableImage),
        (L.DistortableImage.action_map = {}),
        (L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
          options: { anchor: [0, -10] },
          initialize: function (t, e) {
            L.setOptions(this, e),
              L.Toolbar2.Popup.prototype.initialize.call(this, t, e);
          },
          addHooks: function (t, e) {
            (this.map = t), (this.ov = e);
          },
          tools: function () {
            if (this._ul) return this._ul.children;
          },
          clickTool: function (t) {
            for (var e = this.tools(), i = 0; i < e.length; i++) {
              var o = e.item(i).children[0];
              if (L.DomUtil.hasClass(o, t)) return o.click(), o;
            }
            return !1;
          },
        })),
        (L.distortableImage.popupBar = function (t, e) {
          return new L.DistortableImage.PopupBar(t, e);
        }),
        L.DistortableImageOverlay.addInitHook(function () {
          (this.ACTIONS = [
            L.DragAction,
            L.ScaleAction,
            L.DistortAction,
            L.RotateAction,
            L.FreeRotateAction,
            L.LockAction,
            L.OpacityAction,
            L.BorderAction,
            L.ExportAction,
            L.DeleteAction,
          ]),
            (L.DistortableImage.Edit.MODES = {
              drag: L.DragAction,
              scale: L.ScaleAction,
              distort: L.DistortAction,
              rotate: L.RotateAction,
              freeRotate: L.FreeRotateAction,
              lock: L.LockAction,
            });
          var t = this.options.actions ? this.options.actions : this.ACTIONS;
          this.editing = L.distortableImage.edit(this, { actions: t });
        });
    },
    376: function () {
      L.IconSet = L.Class.extend({
        _svg: '<svg xmlns="http://www.w3.org/2000/svg">',
        _symbols: "",
        render: function () {
          return this.addSymbols(this._symbols), this._svg;
        },
        addSymbols: function (t) {
          this._svg += t;
        },
      });
    },
    261: function () {
      L.KeymapperIconSet = L.IconSet.extend({
        _symbols:
          '<symbol viewBox="0 0 25 25" id="keyboard_open"><path d="M12 23l4-4H8l4 4zm7-15h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></symbol>',
      });
    },
    929: function () {
      L.ToolbarIconSet = L.IconSet.extend({
        _symbols:
          '<symbol viewBox="0 0 18 18" id="border_clear"><path d="M5.25 3.75h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm3-3h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm6 6h1.5v-1.5h-1.5v1.5zm6 3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0-9h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm6-4.5v1.5h1.5v-1.5h-1.5zm-6 1.5h1.5v-1.5h-1.5v1.5zm3 12h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5z"/></symbol><symbol viewBox="0 0 18 18" id="border_outer"><path d="M9.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5zm-10.5-6v13.5h13.5V2.25H2.25zm12 12H3.75V3.75h10.5v10.5zm-4.5-3h-1.5v1.5h1.5v-1.5zm-3-3h-1.5v1.5h1.5v-1.5z"/></symbol><symbol viewBox="0 0 18 18" id="cancel"><path d="M13.279 5.779l-1.058-1.058L9 7.942 5.779 4.721 4.721 5.779 7.942 9l-3.221 3.221 1.058 1.058L9 10.057l3.221 3.222 1.058-1.058L10.057 9z"/></symbol><symbol viewBox="0 0 18 18" id="crop_rotate"><path d="M5.603 16.117C3.15 14.947 1.394 12.57 1.125 9.75H0C.383 14.37 4.245 18 8.963 18c.172 0 .33-.015.495-.023L6.6 15.113l-.997 1.005zM9.037 0c-.172 0-.33.015-.495.03L11.4 2.888l.998-.998a7.876 7.876 0 0 1 4.477 6.36H18C17.617 3.63 13.755 0 9.037 0zM12 10.5h1.5V6A1.5 1.5 0 0 0 12 4.5H7.5V6H12v4.5zM6 12V3H4.5v1.5H3V6h1.5v6A1.5 1.5 0 0 0 6 13.5h6V15h1.5v-1.5H15V12H6z"/></symbol><symbol viewBox="0 0 18 18" id="delete_forever"><path d="M4.5 14.25c0 .825.675 1.5 1.5 1.5h6c.825 0 1.5-.675 1.5-1.5v-9h-9v9zm1.845-5.34l1.058-1.058L9 9.443l1.59-1.59 1.058 1.058-1.59 1.59 1.59 1.59-1.058 1.058L9 11.558l-1.59 1.59-1.058-1.058 1.59-1.59-1.597-1.59zM11.625 3l-.75-.75h-3.75l-.75.75H3.75v1.5h10.5V3h-2.625z"/></symbol><symbol viewBox="0 0 18 18" id="distort"><path d="M1.7 1.4H6v1.4h5.8V1.4h4.3v4.3h-1.4v5.8h1.4v4.4h-4.3v-1.5H6v1.5H1.7v-4.4h1.4V5.7H1.7V1.4zm10.1 4.3V4.3H6v1.4H4.6v5.8H6V13h5.8v-1.5h1.4V5.7h-1.4zM3.1 2.8v1.5h1.5V2.8H3.1zm10.1 0v1.5h1.5V2.8h-1.5zM3.1 13v1.4h1.5V13H3.1zm10.1 0v1.4h1.5V13h-1.5z"/></symbol><symbol viewBox="0 0 18 18" id="explore"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5zM9 15c-3.308 0-6-2.693-6-6 0-3.308 2.692-6 6-6 3.307 0 6 2.692 6 6 0 3.307-2.693 6-6 6zm-4.125-1.875l5.633-2.617 2.617-5.633-5.633 2.617-2.617 5.633zM9 8.175c.457 0 .825.367.825.825A.823.823 0 0 1 9 9.825.823.823 0 0 1 8.175 9c0-.457.367-.825.825-.825z"/></symbol><symbol viewBox="0 0 18 18" id="flip_to_back"><path d="M6.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm0-6a1.5 1.5 0 0 0-1.5 1.5h1.5v-1.5zm3 9h-1.5v1.5h1.5v-1.5zm4.5-9v1.5h1.5c0-.825-.675-1.5-1.5-1.5zm-4.5 0h-1.5v1.5h1.5v-1.5zm-3 10.5v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm7.5-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6c.825 0 1.5-.675 1.5-1.5h-1.5v1.5zm-10.5-7.5h-1.5v9a1.5 1.5 0 0 0 1.5 1.5h9v-1.5h-9v-9zm7.5-1.5h1.5v-1.5h-1.5v1.5zm0 9h1.5v-1.5h-1.5v1.5z"/></symbol><symbol viewBox="0 0 18 18" id="flip_to_front"><path d="M2.25 9.75h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm1.5 3v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm-1.5-9h1.5v-1.5h-1.5v1.5zm9 9h1.5v-1.5h-1.5v1.5zm3-13.5h-7.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h7.5c.825 0 1.5-.675 1.5-1.5v-7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-7.5v-7.5h7.5v7.5zm-6 4.5h1.5v-1.5h-1.5v1.5zm-3 0h1.5v-1.5h-1.5v1.5z"/></symbol><symbol viewBox="0 0 18 18" id="get_app"><path d="M14.662 6.95h-3.15v-4.5H6.787v4.5h-3.15L9.15 12.2l5.512-5.25zM3.637 13.7v1.5h11.025v-1.5H3.637z"/></symbol><symbol viewBox="0 0 18 18" id="lock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zM6.75 4.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6h-4.5V4.5zM13.5 15h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol><symbol viewBox="0 0 18 18" id="opacity"><path d="M13.245 6L9 1.763 4.755 6A6.015 6.015 0 0 0 3 10.23c0 1.5.585 3.082 1.755 4.252a5.993 5.993 0 0 0 8.49 0A6.066 6.066 0 0 0 15 10.23c0-1.5-.585-3.06-1.755-4.23zM4.5 10.5c.008-1.5.465-2.453 1.32-3.3L9 3.952l3.18 3.285c.855.84 1.313 1.763 1.32 3.263h-9z"/></symbol><symbol viewBox="0 0 14 18" id="opacity_empty"><path stroke="#0078A8" stroke-width="1.7" d="M10.708 6.25A5.113 5.113 0 0 1 12.2 9.846c0 1.275-.497 2.62-1.492 3.614a5.094 5.094 0 0 1-7.216 0A5.156 5.156 0 0 1 2 9.846c0-1.275.497-2.601 1.492-3.596L7.1 2.648l3.608 3.602zm0 0L7.1 2.648 3.492 6.25A5.113 5.113 0 0 0 2 9.846c0 1.275.497 2.62 1.492 3.614a5.094 5.094 0 0 0 7.216 0A5.156 5.156 0 0 0 12.2 9.846a5.113 5.113 0 0 0-1.492-3.596z"/></symbol><symbol viewBox="0 0 18 18" id="restore"><path d="M15.67 3.839a.295.295 0 0 0-.22.103l-5.116 3.249V4.179a.342.342 0 0 0-.193-.315.29.29 0 0 0-.338.078L3.806 7.751v-4.63h-.002l.002-.022c0-.277-.204-.502-.456-.502h-.873V2.6c-.253 0-.457.225-.457.503l.002.026v10.883h.005c.021.257.217.454.452.455l.016-.002h.822c.013.001.025.004.038.004.252 0 .457-.225.457-.502a.505.505 0 0 0-.006-.068V9.318l6.001 3.811a.288.288 0 0 0 .332.074.34.34 0 0 0 .194-.306V9.878l5.12 3.252a.288.288 0 0 0 .332.073.34.34 0 0 0 .194-.306V4.18a.358.358 0 0 0-.09-.24.296.296 0 0 0-.218-.1z"/></symbol><symbol viewBox="0 0 18 18" id="rotate"><path d="M5.505 4.808L.645 9.675l4.867 4.86 4.868-4.86-4.875-4.868zM2.768 9.675L5.513 6.93 8.25 9.675 5.505 12.42 2.768 9.675zM14.52 4.98A6.713 6.713 0 009.75 3V.57L6.57 3.75l3.18 3.18V4.5a5.23 5.23 0 013.713 1.537 5.255 5.255 0 010 7.426 5.23 5.23 0 01-5.843 1.08L6.503 15.66a6.76 6.76 0 003.247.84c1.725 0 3.457-.66 4.77-1.98a6.735 6.735 0 000-9.54z"/></symbol><symbol viewBox="0 0 18 18" id="scale"><path d="M8.25 9h-6a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h6a.75.75 0 00.75-.75v-6A.75.75 0 008.25 9zm-.75 6H3v-4.5h4.5V15zm8.94-13.035a.75.75 0 00-.405-.405.75.75 0 00-.285-.06h-4.5a.75.75 0 000 1.5h2.692L9.967 6.968a.75.75 0 000 1.064.75.75 0 001.065 0L15 4.057V6.75a.75.75 0 101.5 0v-4.5a.75.75 0 00-.06-.285z" /></symbol><symbol viewBox="0 0 18 18" id="spinner"><path d="M9 6.48c-.216 0-.36-.144-.36-.36V3.24c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36z"/><path d="M9 15.12c-.216 0-.36-.144-.36-.36v-2.88c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36zm1.44-8.28c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144zm-4.32 7.488c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144z" opacity=".3"/><path d="M7.56 6.84c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108L7.848 6.3c.108.144.036.36-.108.468-.072.072-.108.072-.18.072z" opacity=".93"/><path d="M11.88 14.328c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108l1.44 2.484c.108.144.036.36-.108.468-.072.036-.108.072-.18.072z" opacity=".3"/><path d="M6.12 9.36H3.24c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".65"/><path d="M14.76 9.36h-2.88c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".3"/><path d="M6.516 7.884c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".86"/><path d="M14.004 12.204c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".3"/><path d="M3.996 12.204c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.036.072-.108.072-.18.072z" opacity=".44"/><path d="M11.484 7.884c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.072.072-.108.072-.18.072z" opacity=".3"/></symbol><symbol viewBox="0 0 18 18" id="drag"><path d="M2.3 16.5c-0.2 0-0.4-0.1-0.5-0.2 -0.2-0.2-0.3-0.5-0.2-0.8l2.5-6.5 -2.5-6.5C1.5 2.3 1.5 2 1.7 1.8c0.2-0.2 0.5-0.3 0.8-0.2l6.5 2.5 6.5-2.5c0.3-0.1 0.6 0 0.8 0.2 0.2 0.2 0.3 0.5 0.2 0.8l-2.5 6.5 2.5 6.5c0.1 0.3 0 0.6-0.2 0.8 -0.2 0.2-0.5 0.3-0.8 0.2l-6.5-2.5 -6.5 2.5C2.4 16.5 2.3 16.5 2.3 16.5zM3.6 3.6l2 5.1c0.1 0.2 0.1 0.4 0 0.5l-2 5.1 5.1-2c0.2-0.1 0.4-0.1 0.5 0l5.1 2L12.4 9.3c-0.1-0.2-0.1-0.4 0-0.5l2-5.1L9.3 5.6c-0.2 0.1-0.4 0.1-0.5 0L3.6 3.6z" /></symbol><symbol viewBox="0 0 18 18" id="unlock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5h1.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>',
      });
    },
    496: function () {
      L.Map.mergeOptions({ boxCollector: !0, boxZoom: !1 }),
        (L.Map.BoxCollector = L.Map.BoxZoom.extend({
          initialize: function (t) {
            (this._map = t),
              (this._container = t._container),
              (this._pane = t._panes.overlayPane),
              (this._resetStateTimeout = 0),
              t.on("unload", this._destroy, this);
          },
          addHooks: function () {
            L.DomEvent.on(
              this._container,
              "mousedown",
              this._onMouseDown,
              this
            );
          },
          removeHooks: function () {
            L.DomEvent.off(
              this._container,
              "mousedown",
              this._onMouseDown,
              this
            );
          },
          moved: function () {
            return this._moved;
          },
          _destroy: function () {
            L.DomUtil.remove(this._pane), delete this._pane;
          },
          _resetState: function () {
            (this._resetStateTimeout = 0), (this._moved = !1);
          },
          _clearDeferredResetState: function () {
            0 !== this._resetStateTimeout &&
              (clearTimeout(this._resetStateTimeout),
              (this._resetStateTimeout = 0));
          },
          _onMouseDown: function (t) {
            if (!t.shiftKey || (1 !== t.which && 1 !== t.button)) return !1;
            this._clearDeferredResetState(),
              this._resetState(),
              L.DomUtil.disableTextSelection(),
              L.DomUtil.disableImageDrag(),
              (this._startPoint = this._map.mouseEventToContainerPoint(t)),
              L.DomEvent.on(
                document,
                {
                  contextmenu: L.DomEvent.stop,
                  mousemove: this._onMouseMove,
                  mouseup: this._onMouseUp,
                },
                this
              );
          },
          _onMouseMove: function (t) {
            this._moved ||
              ((this._moved = !0),
              (this._box = L.DomUtil.create(
                "div",
                "leaflet-zoom-box",
                this._container
              )),
              L.DomUtil.addClass(this._container, "leaflet-crosshair"),
              this._map.fire("boxzoomstart")),
              (this._point = this._map.mouseEventToContainerPoint(t)),
              (this._bounds = L.bounds(this._startPoint, this._point));
            var e = this._bounds.getSize();
            L.DomUtil.setPosition(this._box, this._bounds.min),
              (this._box.style.width = e.x + "px"),
              (this._box.style.height = e.y + "px");
          },
          _finish: function () {
            this._moved &&
              (L.DomUtil.remove(this._box),
              L.DomUtil.removeClass(this._container, "leaflet-crosshair")),
              L.DomUtil.enableTextSelection(),
              L.DomUtil.enableImageDrag(),
              L.DomEvent.off(
                document,
                {
                  contextmenu: L.DomEvent.stop,
                  mousemove: this._onMouseMove,
                  mouseup: this._onMouseUp,
                },
                this
              );
          },
          _onMouseUp: function (t) {
            if (
              (1 === t.which || 1 === t.button) &&
              (this._finish(), this._moved)
            ) {
              this._clearDeferredResetState(),
                (this._resetStateTimeout = setTimeout(
                  L.Util.bind(this._resetState, this),
                  0
                ));
              var e = L.latLngBounds(
                  this._map.containerPointToLatLng(
                    this._bounds.getBottomLeft()
                  ),
                  this._map.containerPointToLatLng(this._bounds.getTopRight())
                ),
                i = this._map.getZoom(),
                o = this._map.getCenter();
              (e = this._map._latLngBoundsToNewLayerBounds(e, i, o)),
                this._map.fire("boxcollectend", { boxCollectBounds: e });
            }
          },
        })),
        L.Map.addInitHook("addHandler", "boxCollector", L.Map.BoxCollector);
    },
    291: function () {
      L.Map.mergeOptions({ doubleClickLabels: !0 }),
        (L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
          enable: function () {
            var t = this._map;
            return (
              this._enabled ||
                (t.doubleClickZoom.enabled() && t.doubleClickZoom.disable(),
                this._map.fire("singleclickon"),
                (this._enabled = !0),
                this.addHooks()),
              this
            );
          },
          disable: function () {
            return this._enabled
              ? ((this._enabled = !1), this.removeHooks(), this)
              : this;
          },
          _fireIfSingle: function (t) {
            var e = this._map,
              i = t.originalEvent;
            (i && i.shiftKey) ||
              ((e._clicked += 1),
              (this._map._clickTimeout = setTimeout(function () {
                1 === e._clicked
                  ? ((e._clicked = 0),
                    e.fire("singleclick", { type: "singleclick" }))
                  : L.Browser.touch &&
                    i &&
                    i.sourceCapabilities.firesTouchEvents &&
                    e.fire("dblclick");
              }, 250)));
          },
          _onDoubleClick: function () {
            var t = this._map,
              e = t._labels;
            setTimeout(function () {
              (t._clicked = 0), clearTimeout(t._clickTimeout);
            }, 0),
              e &&
                (1 === e.options.opacity
                  ? ((e.options.opacity = 0), e.setOpacity(0))
                  : ((e.options.opacity = 1), e.setOpacity(1)));
          },
        })),
        L.Map.addInitHook(
          "addHandler",
          "doubleClickLabels",
          L.Map.DoubleClickLabels
        );
    },
    752: function () {
      L.Map.DoubleClickZoom.include({
        addHooks: function () {
          this._map.on(
            { click: this._fireIfSingle, dblclick: this._onDoubleClick },
            this
          );
        },
        removeHooks: function () {
          this._map.off(
            { click: this._fireIfSingle, dblclick: this._onDoubleClick },
            this
          );
        },
        enable: function () {
          return (
            this._enabled ||
              (this._map.doubleClickLabels &&
                this._map.doubleClickLabels.enabled()) ||
              (this._map.fire("singleclickon"),
              (this._enabled = !0),
              this.addHooks()),
            this
          );
        },
        disable: function () {
          return this._enabled
            ? (this._map.fire("singleclickoff"),
              (this._enabled = !1),
              this.removeHooks(),
              this)
            : this;
        },
        _fireIfSingle: function (t) {
          var e = this._map,
            i = t.originalEvent;
          (i && i.shiftKey) ||
            ((e._clicked += 1),
            (this._map._clickTimeout = setTimeout(function () {
              1 === e._clicked
                ? ((e._clicked = 0),
                  e.fire("singleclick", { type: "singleclick" }))
                : L.Browser.touch &&
                  i &&
                  i.sourceCapabilities.firesTouchEvents &&
                  e._fireDOMEvent(i, "dblclick", [e]);
            }, 250)));
        },
        _onDoubleClick: function (t) {
          var e = this._map,
            i = t.originalEvent;
          if (
            (setTimeout(function () {
              (e._clicked = 0), clearTimeout(e._clickTimeout);
            }, 0),
            !i)
          )
            return !1;
          var o = e.getZoom(),
            n = e.options.zoomDelta,
            a = i.shiftKey ? o - n : o + n;
          "center" === e.options.doubleClickZoom
            ? e.setZoom(a)
            : e.setZoomAround(t.containerPoint, a);
        },
      });
    },
    131: function () {
      L.Map.include({
        _clicked: 0,
        addGoogleMutant: function (t) {
          return (
            (t = this.mutantOptions =
              L.extend(
                {
                  mutantOpacity: 0.8,
                  maxZoom: 24,
                  maxNativeZoom: 20,
                  minZoom: 0,
                  labels: !0,
                  labelOpacity: 1,
                  doubleClickLabels: !0,
                },
                t
              )).labels ||
              (this.mutantOptions = L.extend(this.mutantOptions, {
                labelOpacity: t.labels ? 1 : void 0,
                doubleClickLabels: !!t.labels || void 0,
              })),
            (this._googleMutant = L.tileLayer(
              "http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
              {
                maxZoom: t.maxZoom,
                maxNativeZoom: t.maxNativeZoom,
                minZoom: t.minZoom,
                opacity: t.mutantOpacity,
              }
            ).addTo(this)),
            t.labels ? this._addLabels(t) : (this.doubleClickLabels = void 0),
            this
          );
        },
        _addLabels: function (t) {
          return (
            0 !== t.labelOpacity &&
              1 !== t.labelOpacity &&
              (t.labelOpacity = 1),
            (this._labels = L.tileLayer(
              "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}",
              {
                attribution:
                  'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                subdomains: "abcd",
                interactive: !1,
                opacity: t.labelOpacity,
                maxZoom: t.maxZoom,
                maxNativeZoom: t.maxNativeZoom,
                minZoom: t.minZoom,
                ext: "png",
              }
            ).addTo(this)),
            this.mutantOptions.doubleClickLabels &&
              this.doubleClickLabels.enable(),
            this
          );
        },
      }),
        L.Map.addInitHook(function () {
          this.doubleClickLabels.disable(), this.doubleClickZoom.enable();
        });
    },
    999: function () {
      L.DomUtil = L.extend(L.DomUtil, {
        initTranslation: function (t) {
          this.translation = t;
        },
        getMatrixString: function (t) {
          var e = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
            i = [
              t[0],
              t[3],
              0,
              t[6],
              t[1],
              t[4],
              0,
              t[7],
              0,
              0,
              1,
              0,
              t[2],
              t[5],
              0,
              t[8],
            ],
            o = e ? "matrix3d(" + i.join(",") + ")" : "";
          return (
            e ||
              console.log(
                "Your browser must support 3D CSS transformsin order to use DistortableImageOverlay."
              ),
            o
          );
        },
        toggleClass: function (t, e) {
          var i = e;
          return this.hasClass(t, i)
            ? this.removeClass(t, i)
            : this.addClass(t, i);
        },
        confirmDelete: function () {
          return window.confirm(this.translation.confirmImageDelete);
        },
        confirmDeletes: function (t) {
          if (1 === t) return this.confirmDelete();
          var e,
            i = this.translation.confirmImagesDeletes;
          return (e = "function" == typeof i ? i(t) : i), window.confirm(e);
        },
      });
    },
    85: function () {
      L.IconUtil = {
        create: function (t) {
          return (
            /^#/.test(t) && (t = t.replace(/^#/, "")),
            '<svg class="ldi-icon ldi-' +
              t +
              '"role="img" focusable="false"><use xlink:href="#' +
              t +
              '"></use></svg>'
          );
        },
        addClassToSvg: function (t, e) {
          var i = t.querySelector("svg");
          i && L.DomUtil.addClass(i, e);
        },
        toggleXlink: function (t, e, i) {
          /^#/.test(e) || (e = "#" + e), /^#/.test(i) || (i = "#" + i);
          var o = t.querySelector("use");
          if (o) {
            var n = o.getAttribute("xlink:href") === e ? i : e;
            return o.setAttribute("xlink:href", n), n;
          }
          return !1;
        },
        toggleTitle: function (t, e, i) {
          var o = t.getAttribute("title") === e ? i : e;
          return (
            t.setAttribute("title", o),
            t.hasAttribute("aria-label") && t.setAttribute("aria-label", o),
            o
          );
        },
      };
    },
    351: function () {
      L.ImageUtil = {
        getCmPerPixel: function (t) {
          var e = t._map;
          return (
            (100 *
              e
                .latLngToLayerPoint(t.getCorner(0))
                .distanceTo(e.latLngToLayerPoint(t.getCorner(1)))) /
            t.getElement().width
          );
        },
      };
    },
    360: function () {
      L.MatrixUtil = {
        adj: function (t) {
          return [
            t[4] * t[8] - t[5] * t[7],
            t[2] * t[7] - t[1] * t[8],
            t[1] * t[5] - t[2] * t[4],
            t[5] * t[6] - t[3] * t[8],
            t[0] * t[8] - t[2] * t[6],
            t[2] * t[3] - t[0] * t[5],
            t[3] * t[7] - t[4] * t[6],
            t[1] * t[6] - t[0] * t[7],
            t[0] * t[4] - t[1] * t[3],
          ];
        },
        multmm: function (t, e) {
          var i,
            o = [];
          for (i = 0; i < 3; i++)
            for (var n = 0; n < 3; n++) {
              for (var a = 0, s = 0; s < 3; s++)
                a += t[3 * i + s] * e[3 * s + n];
              o[3 * i + n] = a;
            }
          return o;
        },
        multmv: function (t, e) {
          return [
            t[0] * e[0] + t[1] * e[1] + t[2] * e[2],
            t[3] * e[0] + t[4] * e[1] + t[5] * e[2],
            t[6] * e[0] + t[7] * e[1] + t[8] * e[2],
          ];
        },
        multsm: function (t, e) {
          for (var i = [], o = 0, n = e.length; o < n; o++) i.push(t * e[o]);
          return i;
        },
        basisToPoints: function (t, e, i, o, n, a, s, r) {
          var l = [t, i, n, e, o, a, 1, 1, 1],
            c = L.MatrixUtil.multmv(L.MatrixUtil.adj(l), [s, r, 1]);
          return L.MatrixUtil.multmm(l, [c[0], 0, 0, 0, c[1], 0, 0, 0, c[2]]);
        },
        project: function (t, e, i) {
          var o = L.MatrixUtil.multmv(t, [e, i, 1]);
          return [o[0] / o[2], o[1] / o[2]];
        },
        general2DProjection: function (
          t,
          e,
          i,
          o,
          n,
          a,
          s,
          r,
          l,
          c,
          d,
          h,
          g,
          m,
          u,
          p
        ) {
          var _ = L.MatrixUtil.basisToPoints(t, e, n, a, l, c, g, m),
            v = L.MatrixUtil.basisToPoints(i, o, s, r, d, h, u, p),
            f = L.MatrixUtil.multmm(v, L.MatrixUtil.adj(_));
          return L.MatrixUtil.multsm(1 / f[8], f);
        },
      };
    },
    682: function () {
      L.TrigUtil = {
        calcAngle: function (t, e) {
          var i =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : "deg";
          return "deg" === i
            ? this.radiansToDegrees(Math.atan2(e, t))
            : Math.atan2(e, t);
        },
        radiansToDegrees: function (t) {
          return (180 * t) / Math.PI;
        },
        degreesToRadians: function (t) {
          return (t * Math.PI) / 180;
        },
      };
    },
    866: function () {
      L.Utils = {
        initTranslation: function () {
          var t = {
            deleteImage: "Delete Image",
            deleteImages: "Delete Images",
            distortImage: "Distort Image",
            dragImage: "Drag Image",
            exportImage: "Export Image",
            exportImages: "Export Images",
            removeBorder: "Remove Border",
            addBorder: "Add Border",
            freeRotateImage: "Free rotate Image",
            geolocateImage: "Geolocate Image",
            lockMode: "Lock Mode",
            lockImages: "Lock Images",
            makeImageOpaque: "Make Image Opaque",
            makeImageTransparent: "Make Image Transparent",
            restoreImage: "Restore Natural Image",
            rotateImage: "Rotate Image",
            scaleImage: "Scale Image",
            stackToFront: "Stack to Front",
            stackToBack: "Stack to Back",
            unlockImages: "Unlock Images",
            confirmImageDelete:
              "Are you sure? This image will be permanently deleted from the map.",
            confirmImagesDeletes:
              "Are you sure? These images will be permanently deleted from the map.",
          };
          if (this.options.translation)
            for (var e in t)
              this.options.translation.hasOwnProperty(e) ||
                (this.options.translation[e] = t[e]);
          else this.options.translation = t;
          L.DomUtil.initTranslation(this.options.translation);
        },
        getNestedVal: function (t, e, i) {
          return [e, i].reduce(function (t, e) {
            return t && t[e];
          }, t);
        },
      };
    },
  };
  t[999](),
    t[85](),
    t[351](),
    t[360](),
    t[682](),
    t[866](),
    t[477](),
    t[808](),
    t[743](),
    t[988](),
    t[92](),
    t[194](),
    t[206](),
    t[789](),
    t[337](),
    t[350](),
    t[376](),
    t[261](),
    t[929](),
    t[280](),
    t[426](),
    t[114](),
    t[231](),
    t[541](),
    t[149](),
    t[74](),
    t[691](),
    t[105](),
    t[944](),
    t[954](),
    t[178](),
    t[547](),
    t[886](),
    t[129](),
    t[93](),
    t[719](),
    t[397](),
    t[428](),
    t[782](),
    t[752](),
    t[496](),
    t[291](),
    t[131]();
})();
//# sourceMappingURL=leaflet.distortableimage.js.map
