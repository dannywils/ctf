function mapper() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 19,
		center: new google.maps.LatLng(44.648900999999995, -63.57533499999999),
		mapTypeId: google.maps.MapTypeId.ROADMAP
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

	this.geocodeUser = function (user, icon) {
		var geocoder = new google.maps.Geocoder();
		var createMarker = this.createMarker;
		geocoder.geocode({
			'address': user.location
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//map.setCenter(results[0].geometry.location);
				createMarker(results[0].geometry.location, user, icon);
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	};

	this.createMarker = function (latlng, user, icon) {
		var marker = new google.maps.Marker({
			map: map,
			position: latlng,
		});
		markers.push(marker);
		marker.setIcon(icon);
		//add info window
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent(user.username + '<br>' + user.location);
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
