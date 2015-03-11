var request = require("request");
var parseEmailData = require("./parseEmailData");
var cheerio = require("cheerio");
var getURI = "https://www.tinypulse.com/user_portal/cheers/new?response_token=";
var postURI = "https://www.tinypulse.com/user_portal/cheers?response_token=";
var when = require("when");


var autoCompleteEmail = function(email, emailData) {
	var completedEmail;
	if(emailData.emails.indexOf(email) !== -1) {
		completedEmail = emailData.emails[emailData.emails.indexOf(email)];
	}
	else if(emailData.emails.indexOf(email + "@" + emailData.domain) !== -1) {
		completedEmail = emailData.emails[emailData.emails.indexOf(email + "@" + emailData.domain)];
	}
	else {
		throw new Error(email + " is not a valid " + emailData.domain + " email address.");
	}
	return completedEmail;
};

var getFormFields = function(body) {
	var form = {};

	var fields = body("input");
	fields.each(function() {
		form[body(this).attr("name")] = body(this).val();
	});

	var textareas = body("textarea");
	textareas.each(function() {
		form[body(this).attr("name")] = "";
	});
	
	return form;
};

var getEmailData = function(body) {
	var scripts = body("script");
	console.log(scripts.length);
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

module.exports = Cheers = {
	sendCheers: function(opts) {
		 var cheer = when.promise(function(resolve, reject, notify) { 
			request(getURI + opts.token, function(err, res, body){
				if(err) {
					console.error(err);
				}
				else {
					var cheerioBody = cheerio.load(body);
					if(cheerioBody.html().indexOf("Whoops") > -1){
						resolve(false);
						return false;
					}
					var emailData = getEmailData(cheerioBody);
					var email = autoCompleteEmail(opts.email, emailData);

					var form = getFormFields(cheerioBody);
					form["respond[cheers][][receiver_email]"] = email;
					form["respond[cheers][][anonymous]"] = opts.isAnonymous;
					form["respond[cheers][][praise]"] = opts.message;

					request.post({url: postURI + opts.token, form: form}, function (err, res, body) {
						console.log(err, body);
						if(body.indexOf(opts.token) !== -1) {
							resolve(true);
							return true;
						}
						else{
							resolve(false);
							return false;
						}
					});
				}
			});
		});
		return cheer;
	}
}





