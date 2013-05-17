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
		scrollwheel: false,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: false,
		draggable: false,
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
		if(user.location != undefined){
			var latlng = new google.maps.LatLng(user.location.split(",")[0],user.location.split(",")[1]);
			//map.setCenter(latlng);
			this.createMarker(latlng, user, icon);
		}
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
			infowindow.setContent('<strong>'+user.username + '</strong><br>' + user.location);
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
