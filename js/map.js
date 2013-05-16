function mapper() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 19,
		center: new google.maps.LatLng(44.648900999999995, -63.57533499999999),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var infowindow = new google.maps.InfoWindow({
		size: new google.maps.Size(150, 50)
	});

	this.plotLocation = function (locations) {
		for (var i = 0; i < locations.length; i++) {
			this.geocodeAddress(locations[i], i);
		}
	}

	this.geocodeAddress = function (location, i) {
		var geocoder = new google.maps.Geocoder();
		var createMarker = this.createMarker;
		geocoder.geocode({
			'address': location
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				createMarker(results[0].geometry.location, i);
			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}

	this.createMarker = function (latlng, i) {
		var marker = new google.maps.Marker({
			map: map,
			position: latlng
		});

		//add info window
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent(locations[i]);
			infowindow.open(map, marker);
		});

		//end of adding info window
		return marker;
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
				maximumAge: 100 // 5 sec.
			});
		} catch (err) {
			errorCallback();
		}
	} else {
		errorCallback();
	}
}
