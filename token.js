var cheerio = require("cheerio");
var request = require("request");
var when = require("when");
var parseEmailData = require("./parseEmailData");
var getURI = "https://www.tinypulse.com/user_portal/cheers/new?response_token=";

var getEmailData = function(body) {
	var scripts = body("script");
	var script = "";
	scripts.each(function() {
		var text = body(this).text();


		if(text.indexOf(".cheers-autocomplete") != -1) {
			script = text;
		}
	});

	var emailData = parseEmailData(script);

	return emailData;
};

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
						var emailData = getEmailData(cheerioBody);
						var verifyReturn = {
							verified: true,
							email: emailData.sender,
							possibleRecipients: emailData.emails,
							domain: emailData.domain 
						};
						resolve(verifyReturn);
						return verifyReturn;
					}
				}
			});
		});
		return verifiedToken;
	},
	possibleEmails: function(token, nameFragment) {
		var possibleEmails = when.promise(function(resolve, reject, notify) { 
			request(getURI + token, function(err, res, body){
				if(err) {
					console.error(err);
					var found = {found:false};
					resolve(found);
					return found;
				}
				else {
					var cheerioBody = cheerio.load(body);
					if(cheerioBody.html().indexOf("Whoops") > -1){
						var found = {found:false};
						resolve(found);
						return found;
					}
					else{
						var emailData = getEmailData(cheerioBody);
						var matchingEmails = [];
						 emailData.emails.forEach(function(email){
						 	if(email.indexOf(nameFragment) > -1){
						 		matchingEmails.push(email.split("@")[0])
						 	}
						 })
						var found = {
							found: true,
							possibleRecipients: matchingEmails,
						};
						resolve(found);
						return found;
					}
				}
			});
		});

		return possibleEmails;	
	}
}
