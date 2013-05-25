// LOW LEVEL MONGOLABS API FUNCTIONS
function mongolab(){
	//private methods
	var API_KEY = "KWOsyikz7NuciZf8MhXdXZmZf9-Nxo51";
	var DATABASE = "capturetheflag";
	// insert document content into collection
	this.select = function(collection, query, callback){
		query = JSON.stringify(query);
		$.ajax({
			url: 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+collection+'?q='+query+'&apiKey='+ API_KEY,
			type: "GET",
			contentType: "application/json",
			success: function (data) {
				callback(data);
			}
		});
	}

	this.insert = function(collection, content, callback){
		$.ajax({
			url: "https://api.mongolab.com/api/1/databases/"+DATABASE+"/collections/"+collection+"?apiKey=" + API_KEY,
			data: JSON.stringify(content),
			type: "POST",
			contentType: "application/json",
			success: function (data) {
				callback(data);
			}
		});
	}

	this.update = function(collection, query, update, callback){
		var result;
		$.ajax({
			url: 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+collection+'?apiKey=' + API_KEY + '&q='+JSON.stringify(query),
			data: JSON.stringify( { "$set" : update } ),
			type: "PUT",
			contentType: "application/json",
			success: function (data) {
				callback === undefined || callback(data);
			},
		});
	}

	this.delete = function(collection, id, callback){
		var result;
		$.ajax({ url: "https://api.mongolab.com/api/1/databases/"+DATABASE+"/collections/"+collection+"/"+id+"?apiKey=myAPIKey",
		       type: "DELETE",
		       async: true,
		       timeout: 300000,
		       success: function (data) {
		       	callback(data);
		       },
		       error: function (xhr, status, err) { }
		   });
	}
}




