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
      L.DistortableImage.group_action_map.e = 'startExport';
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
    var self = this;

    if (edit instanceof L.DistortableImage.Edit) {
      edit._getExport();
      return;
    }

    // Make sure that addHooks is executed only once, event listeners will handle the rest
    if (self.isHooksExecuted) {
      return;
    } else {
      self.isHooksExecuted = true;
    }

    var toolbarExportElement = self._link.parentElement;

    self.mouseEnterHandler = self.handleMouseEnter.bind(self);
    self.mouseLeaveHandler = self.handleMouseLeave.bind(self);

    toolbarExportElement.addEventListener('click', function() {
      if (!self.isExporting) {
        self.isExporting = true;
        self.renderExportIcon();

        setTimeout(self.attachMouseEventListeners.bind(self, this), 100);

        edit.startExport().then(function() {
          self.resetState();
          self.detachMouseEventListeners.call(self, this);
        }.bind(this));
      } else {
        self.resetState();
        self.detachMouseEventListeners.call(self, this);
        edit.cancelExport();
      }
    });
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
