/*
*	Event handlers
*/
//refresh on button press
$(function(){
	//pick up the flag
	$('button.captureflag').click(function () {
		$(this).hide();
		$(".message").show();
		db.update('teams', { team: otherTeam(user.team) }, { pickedup: true });
		db.update('users',{ uuid: user.uuid }, { hasflag: true });

	});

	//place the flag
	$('button.placeflag').click(function () {
		$(this).hide();
		db.insert('teams', {
			flag: user.location,
			base: user.location,
			team: user.team,
			uuid: UUID(),
			date: new Date().toISOString(),
			score: 0
		});
	});

	//rotate the compass when the device orientation changes
	if (window.DeviceOrientationEvent) {
		window.addEventListener("deviceorientation", function (e) {
			var deg = (360 - (e.alpha % 360));
			$(".compass").css({ "-webkit-transform": "rotate(" + deg + "deg)"});
		}, false);
	}

	//full screen when the user clicks the page
	//cannot be done automatically for security reasons
	$('body').click(function(){
		$(this)[0].webkitRequestFullScreen();
	});
});
