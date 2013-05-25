//refresh on button press
$(function(){
	$('button.captureflag').click(function () {
		db.update('teams', { team: otherTeam(user.team) }, { pickedup: true });
		db.update('users',{ uuid: user.uuid }, { hasflag: true });
		$(".message").show();
	});
	$('button.placeflag').click(function () {
		db.insert('teams', {
			flag: user.location,
			base: user.location,
			team: user.team,
			uuid: UUID(),
			date: new Date().toISOString(),
			score: 0
		}, function (data) {
			$('button.placeflag').hide();
		});
	});
});
