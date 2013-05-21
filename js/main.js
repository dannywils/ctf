//global user variable
var user = null;
$('document').ready(function () {
	//create the database object
	var db = new mongolab();
	//check if the player has a cookie
	var username = $.cookie('username');
	var uuid = $.cookie('uuid');

	if (username === undefined || uuid === undefined) {
		username = prompt("Please enter your name", "Enter Name");
		$.cookie('username', username, {expires: 1});
		$.cookie('uuid', UUID(), {expires: 1});
	}

	// check if the user exists in the database, if not insert them
	checkUser(username, uuid, function (data) {
		//if the user doesn't exists, add them and refresh
		if (data.length == 0) {
			//check what team they should be on
			getTeam(function (team, captain) {
				db.insert("users", {
					username: username,
					team: team,
					uuid: uuid,
					captain: captain,
					date: new Date().toISOString(),
					flag: null
				}, function () {
					//refresh after insert
					document.location = '';
				});
			});
			//otherwise show the map
		} else {
			startGame(data);
		}
	});


	//check if the user exists and is active
	function checkUser(username, uuid, callback) {
		var timeout = new Date(new Date().getTime() - 600000).toISOString();
		db.select("users", {
			username: username,
			uuid: uuid,
			"date": {
				"$gt": timeout
			}
		},
			callback
		);
	}

	//will pass team to callback

	function getTeam(callback) {
		console.log("getting teams");
		db.select("users", {}, function (data) {
			var teams = [];
			var captain = false;
			teams[1] = 0;
			teams[2] = 0;
			for (var i = data.length - 1; i >= 0; i--) {
				if (data[i].team === undefined) {
					continue;
				}
				var team = data[i].team;
				if (team == 1) {
					teams[1]++;
				} else if (team == 2) {
					teams[2]++;
				}
			};
			// assign the user to the lowest team
			var team = 1;
			if (teams[1] > teams[2]) {
				team = 2;
			}
			// if the user is the first on the team, make them a captain
			if (teams[team] == 0) {
				captain = true;
			}
			callback(team, captain);
		});
	}

	function startGame(data) {
		$('p.result').html('Username: ' + data[0].username);
		user = data[0];
		if (user.captain) {
			$('.captain').show();
		}
		//check if there is a captain
		$('.player').show();
		$(".team").html("You are on team "+user.team);
		showMap();
		//center the map on the user
		if(user.location !== undefined){
			var latlng = new google.maps.LatLng(user.location.split(",")[0],user.location.split(",")[1]);
			map.center(latlng);
		}
		setInterval(getUsers, 2000);
	}

	var map = new mapper();

	function getUsers() {
		//only show people who have been active within the last 10 minutes
		var timeout = new Date(new Date().getTime() - 600000).toISOString();
		//select all users that are not you
		db.select('users', {
			"date": {
				"$gt": timeout
			}
		}, function (data) {
			console.log('Data received.', data);
			map.clear();
			lastUpdate = new Date().toISOString();
			//plot the other users
			for (var i = data.length - 1; i >= 0; i--) {
				//if it is the current user
				if(user._id.$oid == data[i]._id.$oid){
					map.geocodeUser(user.location, 'You', 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');
				} else {
					map.geocodeUser(data[i].location, data[i].username);
				}
				//if we have a flag
				if(data[i].flag != null){
					var flag = null;
					if(data[i].team == 1){
						flag = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
					} else {
						flag = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
					}
					map.geocodeUser(data[i].flag, 'Flag '+ data[i].team, flag);
				}
				//map the user

			};

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

	//refresh on button press
	$('button.captureflag').click(function () {
		console.debug('Capture flag attempted');
	});
	$('button.placeflag').click(function () {
		db.update('users', user._id.$oid, {
				flag: user.location
			}, function (data) {
				console.log('Placed flag',data);
				$('button.placeflag').attr("disabled", true);
		});
	});

});
