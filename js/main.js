var user = null;
var lastUpdate = new Date(0).toISOString();
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
	getUser(username, function (data) {
		//if the user doesn't exists, add them and refresh
		if (data.length == 0) {
			//check what team they should be on
			getTeam(
				function(team, captain){
					db.insert("users", {
						username: username,
						team: team,
						captain: captain
					}, 
						function(){
							document.location = ''
						}
					);
				}
			);
		//otherwise show the map
		} else {
			startGame(data);
		}
	});	



	function getUser(username, callback){
		db.select("users", {
			username: username
		}, 
			callback
		);
	}

	//will pass team to callback
	function getTeam(callback){
		console.log("getting teams");
		db.select("users", {}, 
			function(data){
				var teams = [];
				var captain = false;
				teams[1] = 0;
				teams[2] = 0;
				for (var i = data.length - 1; i >= 0; i--) {
					if(data[i].team === undefined){
						continue;
					}
					var team = data[i].team;
					if(team == 1){
						teams[1]++;
					} else if(team == 2){
						teams[2]++;
					}
				};
				// assign the user to the lowest team
				var team = 1;
				if(teams[1] > teams[2]) {
					team = 2;
				}
				// if the user is the first on the team, make them a captain
				if(teams[team] == 0){
					captain = true;
				}
				callback(team, captain);
			}
		);
	}

	function startGame(data){
		$('p.result').html('Username: ' + data[0].username);
		user = data[0];
		showMap();
		//setInterval(getUsers, 2000);
	}

	//refresh on button press
	$('button.getusers').click(function () {
		getUsers();
	});
	var map = new mapper();

	function getUsers() {

		//only show people who have been active within the last 10 minutes
		//remove the ^10 to enforce
		var timeout = new Date(new Date().getTime() - 600000^10).toISOString();
		//select all users that are not you
		db.select('users', {
			"username": {
				"$ne": user.username
			},
			"date": {
				"$gt": timeout
			}

		}, function (data) {
			console.log('Data received.',data);
			map.clear();
			lastUpdate = new Date().toISOString();
			//plot the other users
			for (var i = data.length - 1; i >= 0; i--) {
				map.geocodeUser(data[i]);
			};
			//plot yourself
			map.geocodeUser(user, 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
		});
	}

	function showMap() {
		watchLocation(function (coords) {
			$('p.coords').html('Location: ' + coords.latitude + ',' + coords.longitude);
			var locate = coords.latitude + ',' + coords.longitude;
			//send your location to the server
			db.update('users', user._id.$oid, {
				location: locate,
				date: new Date().toISOString()
			}, function (data) {
				//console.log(data);
			});
			//get the other users
			user.location = locate;
			getUsers();
			console.log('Sent update to server.');
		}, function () {
			$('p.coords').html('error');
		});
	}
});
