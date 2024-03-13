L.DragHandle = L.EditHandle.extend({
  options: {
    TYPE: 'drag',
    icon: L.icon({
      // eslint-disable-next-line max-len
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsVJREFUeNrMVztLXEEUvnNVFAVBAhY2aRKbTZEHJNpYabuNjSgYg/GxdsmPSJkUAa/ZdVEX8mgWYVutbHxAHkVskjQBuUUgBISVhCQk3wnfwMlk1rusN1wHPubOzJlzvjlz5sxc01Ma/hUEwQnwDIjqc7uvgv9YYO86qgIwCXQbdNTlQ8kcCBHgBch8TcloF6oJGr6phk6EQAkfdz3zvgDr9Mr7Fg1fptEZoM8jsmrokpfsiIFO4IIjuE2v1EDmR4LRdlR5Gh51hj8D34ABtm8YTtqna0TgklIw5CgQguKxIojEjmFROg/MKQO27NkFAB+4wAPouGUJiIvWKHwbAxX2XyWRKWkqhT+pbJntJZJuUzISW0+5hW+obxrVBsfvoH/dqCCJuU97GBh2VteLSiYvArmErT8EVoAK9Bw7enbpVYmvAQlyowYforrH5jXL2rPHI/TKONDB7u9AlavdaTBPvPmazUeQuy8f7UomUgTEwIJPEQ3sQGE/6ll2l9H/KcEzBcfWn2IclluM3DpddJxSHujlFkscbUPvmB0LHVnLrId7nlaZVkEc6QGXQI1MAwZcWmVRHeNaQwJMMiU2cwy4s7p/RJ2ckpvIQs+cIs+5GzitloLKHUV3MPREuXbTOKO91dX387gGTONxIgEWm+E61FFrpcyqXLHsEwiDjEsjAksqw5XPoL9MHVrn6QR4q+XZrDaR4RoWzq2ymafuRA/Mq1stSsHLVkcbdf9VjOcx8ZH3+SFWcCWlVPyWuUBOwUWdC1wP5NVjYiXFWLO69PZ6CRTUY6KSIoEKdf6T3IzzgHxnsyHctNBEkmn6Oob8ExUDg/ahGybd177cDjzH5xHwgDiSvoS7I/LZyvxJZj0wod7tkX5G0XVC7rEyLhfLJjBGbKoLLEfZWObyKeZ6oY82g+yf5Zn/mJyHX7PMf04z/T3/LcAAu4E6iiyJqf0AAAAASUVORK5CYII=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag() {
    var overlay = this._handled;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();

    overlay.dragBy(formerLatLng, newLatLng);
  },

  updateHandle() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.dragHandle = function(overlay, idx, options) {
  return new L.DragHandle(overlay, idx, options);
};
