/*
*	Event handlers
*/
//refresh on button press
$(function(){
	$('button.captureflag').click(function () {
		$(this).hide();
		$(".message").show();
		db.update('teams', { team: otherTeam(user.team) }, { pickedup: true });
		db.update('users',{ uuid: user.uuid }, { hasflag: true });

	});
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

  var rotate = function (deg) {
      $(".compass").css({ "-moz-transform": "rotate(0deg)"});
      $(".compass").css({ "-moz-transform": "rotate(" + deg + "deg)"});

      $(".compass").css({ "-o-transform": "rotate(0deg)"});
      $(".compass").css({ "-o-transform": "rotate(" + deg + "deg)"});

      $(".compass").css({ "-ms-transform": "rotate(0deg)"});
      $(".compass").css({ "-ms-transform": "rotate(" + deg + "deg)"});

      $(".compass").css({ "-webkit-transform": "rotate(0deg)"});
      $(".compass").css({ "-webkit-transform": "rotate(" + deg + "deg)"});

      $(".compass").css({ "transform": "rotate(0deg)"});
      $(".compass").css({ "transform": "rotate(" + deg + "deg)"});
  };
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (e) {
      rotate(360 - e.alpha);
    }, false);
  }

});
