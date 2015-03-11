var cheerio = require("cheerio");
var request = require("request");
var when = require("when");
var getURI = "https://www.tinypulse.com/user_portal/cheers/new?response_token=";

module.exports = verifyToken = {

	verify: function(token) {
		var verifiedToken = when.promise(function(resolve, reject, notify) { 
			request(getURI + token, function(err, res, body){
				if(err) {
					console.error(err);
					resolve(false);
					return false;
				}
				else {
					var cheerioBody = cheerio.load(body);
					if(cheerioBody.html().indexOf("Whoops") > -1){
						resolve(false);
						return false;
					}
					else{
						resolve(true);
						return(true);
					}
				}
			});
		});
		return verifiedToken;
	}
}
