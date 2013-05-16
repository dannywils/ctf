var user = null;
$('document').ready(function () {

	//create the data handler

	//create the database object
	var db = new mongolab();
	//check if the player has a cookie
	var username = $.cookie('username');
	if (username === undefined) {
		username = prompt("Please enter your name", "Enter Name");
		$.cookie('username', username, {
			expires: 1
		});
	}

	// check if the user exists in the database, if not insert them
	db.select("users", {
		username: username
	}, function(data) {
		if (data.length == 0) {
			db.insert("users", {username: username,	team: 1	}, function(data){
				user = [data];
				$('p.result').html(data.username);
				domap();
			});
		} else {
			$('p.result').html('Username: '+data[0].username);
			user = data;
			domap();
		}
	});

	function domap(){
		var map = new mapper();

		watchLocation(function (coords) {
			$('p.coords').html('Location: ' + coords.latitude + ',' + coords.longitude);
			var locate = [coords.latitude + ',' + coords.longitude];
			map.plotLocation(locate);
			db.update('users', user[0]._id.$oid, { location: locate[0] }, function(data){ });
			console.log('Sent update to server.');
		}, function () {
			$('p.coords').html('error');
		});
	}
});
