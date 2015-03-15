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
					var verifyReturn = {verified:false};
					resolve(verifyReturn);
					return verifyReturn;
				}
				else {
					var cheerioBody = cheerio.load(body);
					if(cheerioBody.html().indexOf("Whoops") > -1){
						var verifyReturn = {verified:false};
						resolve(verifyReturn);
						return verifyReturn;
					}
					else{
						var email = cheerioBody('p.active-account strong').text();
						var verifyReturn = {verified: true, email:email};
						resolve(verifyReturn);
						return verifyReturn;
					}
				}
			});
		});
		return verifiedToken;
	}
}
