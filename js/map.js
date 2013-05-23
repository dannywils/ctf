var markers = [],
	circles = [];

function mapper() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 25,
		center: new google.maps.LatLng(44.648900999999995, -63.57533499999999),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		scrollwheel: true,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: true,
		draggable: true,
		styles: [{
				"stylers": [{
						"saturation": 100
					}, {
						"visibility": "simplified"
					}, {
						"gamma": 0.50
					}, {
						"invert_lightness": true
					}, {
						"hue": "#22ff00"
					}
				]
			}
		]
	});

	var infowindow = new google.maps.InfoWindow({
		size: new google.maps.Size(150, 50)
	});

	this.clear = function () {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = new Array();
	};

	this.center = function (latlng) {
		map.setCenter(latlng);
	};

	this.placeMarker = function (uuid, location, text, icon) {
		if (text === undefined) {
			var text = '';
		}
		if (location !== undefined) {
			var latlng = strToLat(location);

			var marker = markers[uuid];
			//if there is no marker, place one
			if (marker === undefined) {
				this.createMarker(uuid, latlng, text, icon);
				return;
			}
			// if the location has changed, clear the marker and create a new one
			if (!marker.getPosition().equals(latlng)) {
				marker.setMap(null);
				this.createMarker(uuid, latlng, text, icon);
			} else {
				console.debug('unchanged');
			}
		}
	};

	this.createMarker = function (uuid, latlng, text, icon) {
		var marker = new google.maps.Marker({
			map: map,
			position: latlng,
		});
		marker.setIcon(icon);
		markers[uuid] = marker;
		//add info window
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent('<strong>' + text + '</strong><br>' + latlng.toString());
			infowindow.open(map, marker);
		});

		//end of adding info window
		return marker;
	};

	this.placeCircle = function (uuid, center, color) {
		var latlng = strToLat(center);
		var circle = circles[uuid];
		if (circle === undefined) {
			this.createCircle(uuid, latlng, color);
			return;
		}
		// if the location has changed, clear the marker and create a new one
		if (!circle.getCenter().equals(latlng)) {
			circle.setMap(null)
			this.createCircle(uuid, latlng, color);
		}
	};

	this.createCircle = function (uuid, latlng, color) {
		var options = {
			strokeColor: color,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: 0.35,
			map: map,
			center: latlng,
			radius: 5
		};
		var circle = new google.maps.Circle(options);
		circles[uuid] = circle;
	}
}

function watchLocation(successCallback, errorCallback) {
	successCallback = successCallback || function () {};
	errorCallback = errorCallback || function () {};
	// Try HTML5-spec geolocation.
	var geolocation = navigator.geolocation;

	if (geolocation) {
		// We have a real geolocation service.
		try {
			function handleSuccess(position) {
				successCallback(position.coords);
			}
			geolocation.watchPosition(handleSuccess, errorCallback, {
				enableHighAccuracy: true,
				maximumAge: 0 // 5 sec.
			});
		} catch (err) {
			errorCallback();
		}
	} else {
		errorCallback();
	}
}