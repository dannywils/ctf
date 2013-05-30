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
});
