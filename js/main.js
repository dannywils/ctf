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
		//if the user doesn't exists, add them and refresh
		if (data.length == 0) {
			db.insert("users", {username: username,	team: 1	}, function(data){
				document.location = '';
			});
		//otherwise show the map
		} else {
			$('p.result').html('Username: '+data[0].username);
			user = data;
			showMap();
		}
	});

	function showMap(){
		watchLocation(function (coords) {
			var map = new mapper();
			$('p.coords').html('Location: ' + coords.latitude + ',' + coords.longitude);
			var locate = [coords.latitude + ',' + coords.longitude];
			//send your location to the server
			db.update('users', user[0]._id.$oid, { location: locate[0], date: new Date().toISOString() }, function(data){ });
			//get the other users
			db.select('users',{ "username": { "$ne" : user[0].username }},function(data){
				//plot the other users
				for (var i = data.length - 1; i >= 0; i--) {
					map.plotLocation([data[i].location]);
				};
				//plot yourself
				map.plotLocation(locate);
			});
			console.log('Sent update to server.');
		}, function () {
			$('p.coords').html('error');
		});
	}
});
