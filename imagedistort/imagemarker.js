L.ImageMarker = L.Marker.extend({
				options: {
			pane: 'markerPane',
			icon: new L.Icon({iconUrl:'imagedistort/images/imarker.png'}),
			// title: '',
			// alt: '',
			clickable: true,
			draggable: true,
			keyboard: true,
			zIndexOffset: 0,
			opacity: 1,
			riseOnHover: true,
			riseOffset: 250
			}

		});
