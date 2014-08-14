	var clicked=false;
	var pl;
			function outline(){
			    clicked = !clicked;
			    if(clicked)
			    {
				   newimg.setOpacity(0.0);
				   console.log(markers[0].getLatLng().lat);
				   pl= new L.polyline([[markers[0].getLatLng().lat,markers[0].getLatLng().lng],[markers[1].getLatLng().lat,markers[1].getLatLng().lng],[markers[3].getLatLng().lat,markers[3].getLatLng().lng],[markers[2].getLatLng().lat,markers[2].getLatLng().lng],[markers[0].getLatLng().lat,markers[0].getLatLng().lng]])
				   pl.addTo(map);
			    }
			    else
			    {
				   newimg.setOpacity(1);
				   map.removeLayer(pl);
			    }
			};
