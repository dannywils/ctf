/*
*	Map object and functionality including
*	Google Maps and HTML5 Geolocation API
*/

//global markers and circles variables
var markers = [],
	circles = [];

function mapper() {
	google.maps.visualRefresh = true;
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
		backgroundColor: '#4b59dc',
		draggable: true,
		/*styles: [
				  {
				    "featureType": "water",
				    "stylers": [
				      { "color": "#FF9546" }
				    ]
				  },{
				    "featureType": "road.arterial",
				    "stylers": [
				      { "color": "#5a5a5a" }
				    ]
				  },{
				    "featureType": "landscape.man_made",
				    "stylers": [
				      { "color": "#ffffff" }
				    ]
				  },{
				    "featureType": "road.local",
				    "elementType": "labels.text",
				    "stylers": [
				      { "visibility": "off" }
				    ]
				  },{
				    "featureType": "road.arterial",
				    "elementType": "labels.text.fill",
				    "stylers": [
				      { "color": "#ffffff" }
				    ]
				  },{
				    "elementType": "labels.icon",
				    "stylers": [
				      { "visibility": "off" }
				    ]
				  },{
				    "featureType": "poi",
				    "elementType": "labels.text",
				    "stylers": [
				      { "visibility": "off" }
				    ]
				  },{
				    "featureType": "landscape",
				    "stylers": [
				      { "color": "#ffffff" }
				    ]
				  },{
				    "featureType": "road.highway",
				    "stylers": [
				      { "color": "#2d2d2d" }
				    ]
				  },{
				    "featureType": "poi.park",
				    "stylers": [
				      { "visibility": "simplified" }
				    ]
				  },{
				    "featureType": "poi.park",
				    "elementType": "labels.icon",
				    "stylers": [
				      { "visibility": "off" }
				    ]
				  },{
				    "featureType": "administrative"  },{
				    "featureType": "poi.park",
				    "stylers": [
				      { "color": "#dcdcdc" }
				    ]
				  },{
				    "featureType": "poi.medical",
				    "stylers": [
				      { "color": "#ffffff" }
				    ]
				  },{
				    "featureType": "poi.school",
				    "stylers": [
				      { "visibility": "off" }
				    ]
				  },{
				    "featureType": "landscape.man_made"  },
				  {
					"featureType": "transit.line",
					"stylers": [
						{ "color": "#aa0001" }
					]
				  },{
					"featureType": "transit.line",
					"elementType": "labels.text.fill",
					"stylers": [
						{ "color": "#ffffff" }
					]
				  }
				  ]*/
	});
	this.map = map;

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
			if(marker.getMap() == null){
				marker.setMap(map);
			}
			// if the location has changed, update it
			if (!marker.getPosition().equals(latlng)) {
				marker.setPosition(latlng);
				if(uuid == user.uuid){
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			}
		}
	};

	this.createMarker = function (uuid, latlng, text, icon) {
		var zindex = 0, isCurrentUser = false;
		//current user is always on top
		if(uuid == user.uuid){
			zindex = 1;
			isCurrentUser = true;
		}

		var marker = new google.maps.Marker({
			map: map,
			position: latlng,
			zIndex: zindex,
		});

		if(isCurrentUser){
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}

		marker.setIcon(icon);
		markers[uuid] = marker;
		//add info window
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent('<strong>' + text + '</strong><br>');
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
			radius: 10
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
