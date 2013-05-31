/*
*	Low level mongolab API calls
*	Use jQuery .when and .then to get data
*/

function mongolab(){
	//private methods
	var API_KEY = "KWOsyikz7NuciZf8MhXdXZmZf9-Nxo51";
	var DATABASE = "capturetheflag";
	// insert document content into collection
	this.select = function(collection, query){
		query = JSON.stringify(query);
		return $.ajax({
			url: 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+collection+'?q='+query+'&apiKey='+ API_KEY,
			type: "GET",
			contentType: "application/json"
		});
	}

	this.insert = function(collection, content){
		return $.ajax({
			url: "https://api.mongolab.com/api/1/databases/"+DATABASE+"/collections/"+collection+"?apiKey=" + API_KEY,
			data: JSON.stringify(content),
			type: "POST",
			contentType: "application/json"
		});
	}

	this.update = function(collection, query, update){
		return $.ajax({
			url: 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+collection+'?apiKey=' + API_KEY + '&q='+JSON.stringify(query),
			data: JSON.stringify( { "$set" : update } ),
			type: "PUT",
			contentType: "application/json"
		});
	}

	this.delete = function(collection, id){
		return $.ajax({ url: "https://api.mongolab.com/api/1/databases/"+DATABASE+"/collections/"+collection+"/"+id+"?apiKey=myAPIKey",
		       type: "DELETE",
		       async: true,
		       timeout: 300000
		   });
	}
}




