function xyz(){		   
		   $( "#img1" ).after( "<div id='marker0' class='corner'>TL</div>");
           $( "#marker0" ).after('<div id="marker2" class="corner">TR</div>');
           $( "#marker2" ).after('<div id="marker4" class="corner">BL</div>');
           $( "#marker4" ).after('<div id="marker6" class="corner">BR</div>');
           $('#img1').wrapAll('<div id="box">');
		   $('#box, .corner').wrapAll('<div id="imgcontainer">');
		};