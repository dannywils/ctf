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
	});

	var infowindow = new google.maps.InfoWindow({
		size: new google.maps.Size(150, 50)
	});


	var markers = [];

	this.clear = function(){
		for(var i=0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		markers = new Array();
	};

	this.center = function(latlng){
		map.setCenter(latlng);
	}

	this.geocodeUser = function (location, text, icon) {
		if(text == undefined){
			var text = '';
		}
		if(location != undefined){
			this.createMarker(strToLat(location), text, icon);
		}
	};

	this.createCircle = function(location, color){
		var options = {
			strokeColor: color,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: 0.35,
			map: map,
			center: strToLat(location),
			radius: 5
		};
		var circle = new google.maps.Circle(options);
		markers.push(circle);
	}

	this.createMarker = function (latlng, text, icon) {
		var marker = new google.maps.Marker({
			map: map,
			position: latlng,
		});
		markers.push(marker);
		marker.setIcon(icon);
		//add info window
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent('<strong>'+ text + '</strong><br>' + latlng.toString());
			infowindow.open(map, marker);
		});

		//end of adding info window
		return marker;
	};

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
