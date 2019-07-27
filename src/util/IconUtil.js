L.IconUtil = {
  /** creates an svg elemenet with built in accessibility properties and standardized 
   * classes for styling, takes in the fragment identifier (id) of the symbol to reference.
   * note for symplicity we allow providing the icon target with or without the '#' prefix */
  create: function(ref) {
    if (/^#/.test(ref)) { ref = ref.replace(/^#/, ''); }

    return (
      '<svg class="ldi-icon ldi-' + ref + '"role="img" focusable="false">' + 
      '<use xlink:href="#' + ref + '"></use>' + 
      '</svg>'
    );
  }
};
