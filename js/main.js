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
			user = data[0];
			showMap();
			getUsers();
			setInterval(getUsers,10000);
		}

	});


	$('button').click(function(){
		getUsers();
	});
	var map = new mapper();


	function getUsers(){
		db.select('users',{ "username": { "$ne" : user.username }},function(data){
			console.log('data received');
			//plot the other users
			map.clear();
			for (var i = data.length - 1; i >= 0; i--) {
				map.geocodeUser(data[i]);
			};
			//plot yourself
			map.geocodeUser(user, 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
		});
	}
	function showMap(){
		console.log('showmap called');
		watchLocation(function (coords) {
			$('p.coords').html('Location: ' + coords.latitude + ',' + coords.longitude);
			var locate = coords.latitude + ',' + coords.longitude;
			//send your location to the server
			db.update('users', user._id.$oid, { location: locate, date: new Date().toISOString() }, function(data){ console.log(data); });
			//get the other users
			user.location = locate;
			getUsers();
			console.log('Sent update to server.');
		}, function () {
			$('p.coords').html('error');
		});
	}

});
