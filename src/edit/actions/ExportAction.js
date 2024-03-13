L.ExportAction = L.EditAction.extend({
  // This function is executed every time we select an image
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var tooltip;

    this.isExporting = false;
    this.mouseLeaveSkip = true;
    this.isHooksExecuted = false;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.e = '_getExport';
      tooltip = overlay.options.translation.exportImage;
    } else {
      L.DistortableImage.group_action_map.e = 'runExporter';
      tooltip = overlay.options.translation.exportImages;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: tooltip,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) {
      edit._getExport();
      return;
    }

    // Make sure that addHooks is executed only once, event listeners will handle the rest
    if (this.isHooksExecuted) {
      return;
    } else {
      this.isHooksExecuted = true;
    }

    var exportTool = this._link.parentElement;

    this.mouseEnterHandler = this.handleMouseEnter.bind(this);
    this.mouseLeaveHandler = this.handleMouseLeave.bind(this);

    L.DomEvent.on(exportTool, 'click', function() {
      if (!this.isExporting) {
        this.isExporting = true;
        this.renderExportIcon();

        setTimeout(this.attachMouseEventListeners.bind(this, exportTool), 100);
        edit.runExporter().then(
            function() {
              this.resetState();
              this.detachMouseEventListeners(exportTool);
            }.bind(this)
        );
      } else {
        // Clicking on the export icon after export has started will be ignored
        if (this.mouseLeaveSkip) {
          return;
        }

        this.resetState();
        this.detachMouseEventListeners(exportTool);
        edit.cancelExport();
      }
    }, this);
  },

  resetState: function() {
    this.renderDownloadIcon();
    this.isExporting = false;
    this.mouseLeaveSkip = true;
  },

  attachMouseEventListeners: function(element) {
    element.addEventListener('mouseenter', this.mouseEnterHandler);
    element.addEventListener('mouseleave', this.mouseLeaveHandler);
  },

  detachMouseEventListeners: function(element) {
    element.removeEventListener('mouseenter', this.mouseEnterHandler);
    element.removeEventListener('mouseleave', this.mouseLeaveHandler);
  },

  handleMouseEnter: function() {
    this.renderCancelIcon();
  },

  handleMouseLeave: function() {
    if (!this.mouseLeaveSkip) {
      this.renderExportIcon();
    } else {
      this.mouseLeaveSkip = false;
    }
  },

  renderDownloadIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
    L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
    L.DomUtil.removeClass(this._link.firstChild, 'loader');
  },

  renderExportIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'spinner');
    L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
    L.IconUtil.addClassToSvg(this._link, 'loader');
  },

  renderCancelIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'cancel');
    L.IconUtil.toggleTitle(this._link, 'Cancel Export', 'Loading...');
    L.DomUtil.removeClass(this._link.firstChild, 'loader');
  },
});
