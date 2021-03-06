var path = require("path");
var koa = require("koa");
var app = koa();
var bodyParser = require('koa-bodyparser');
var render = require('koa-ejs');
var router = require("koa-router");
var twilio = require("twilio");
var thunkify = require("thunkify");
var Token = require("./models/token");
var verifyToken = require("./token");
var cheers = require("tinypulse").Cheers;
var tpToken = require("tinypulse").Token;
var request = require("koa-request");
app.bookshelf = require("./models/index");
app.use(bodyParser());

var serve = require('koa-static');
app.use(serve("./public"));

render(app, {
    root: path.join(__dirname, 'views'),
    viewExt: 'ejs',
    layout: "index",
    locals: {
    site_title: "Cheers SMS",
    page_css: "",
    page_title: ""
    },
    cache: false,
    debug: false
});

app.use(router(app));

app.get("/", function*() {
	
	yield this.render("index");
});

app.post("/token/new", function* () {
	//test
	if(this.request.body.token) {
		var existingToken = new Token;
		var number = this.request.body.number;
		var verify = yield verifyToken.verify(this.request.body.token);
		var token = yield existingToken.findByPhoneNumberOrEmail(number, verify.email);

		if(!token){
			if(verify.verified){
				if(!number) {
				    var newToken = new Token({
				      email: verify.email,
				      token: this.request.body.token
				    });				
				}
				else{
				    var newToken = new Token({
				      phone: number,	
				      email: verify.email,
				      token: this.request.body.token
				    });				
				}
			    newToken = yield newToken.save();
			    this.body={
			    	verified:true,
			    	message:"Thank you for adding your token!",
			    	token: newToken.attributes.token,
			    	email: newToken.attributes.email,
			    	possibleRecipients: verify.possibleRecipients,
			    	domain: verify.domain
			    };
			}
			else{
				this.body={
					verified:false,
					message:"The token you entered was incorrect, please make sure you have entered the correct token",
					token: this.request.body.token
				};
			}
			
		}
		else{
			if(verify.verified){
		 		if(!number) {
		 		var updateToken = yield new Token({id: token.attributes.id})
			 		.save({token: this.request.body.token, email:verify.email}, {patch: true});	
		 		}
		 		else {
		 		var updateToken = yield new Token({id: token.attributes.id})
			 		.save({token: this.request.body.token, phone:number, email:verify.email}, {patch: true});	
		 		}
					this.body={
						verified:true,
						message:"Thank you for adding your token!",
						token: updateToken.attributes.token,
						email: updateToken.attributes.email,
						possibleRecipients: verify.possibleRecipients,
			    		domain: verify.domain
					};
			    }
			else{
				this.body={
					verified:false,
					message:"The token you entered was incorrect, please make sure you have entered the correct token",
					token:this.request.body.token
				};
			}
		}
	}
	else{
		this.body={
			verified:false,
			message:"You did not send a token, please try again"
		};
	}

})


app.post("/send", function* (next) {
	var newToken = new Token; 
	var token = yield newToken.findByPhoneNumberOrEmail(this.request.body.From.slice(2), this.request.body.email);
	var cheer = this.request.body.Body.split(" ");
	var purpose = cheer[0];
	if(purpose.toLowerCase() === "which"){
		var possibleEmails = yield verifyToken.possibleEmails(token.attributes.token, cheer[1].toLowerCase().trim());
		
		if(possibleEmails.possibleRecipients.length){
			var response = "Did you possibly mean one of these? " + possibleEmails.possibleRecipients.join(",")
			if(possibleEmails.possibleRecipients.length === 1){
				response = "Did you mean " + possibleEmails.possibleRecipients.join("") + "?";

			}
		}
		else{
			response = "We were unable to locate anyone who met that criteria"
		}
		this.body = "<Response><Sms>"+response+"</Sms></Response>"; 
	}
	else if(purpose.toLowerCase() === "cheers"){
		var email = cheer[1].toLowerCase().trim();
		var message = cheer.slice(2).join(" ");
		var isAnonymous = cheer[cheer.length - 1] === "anon" ? 1 : 0;
		if(isAnonymous){
			message = message.split(" ");
			message[message.length - 1] = "";
			message = message.join(" ");
		}
		var sendCheers = thunkify(cheers.sendCheers);
		var send = yield sendCheers({
			token: token.attributes.token,
			email: email,
			message: message,
			isAnonymous: isAnonymous
		});
		this.set('Content-Type', 'text/xml');
		if(send) {
			this.body = "<Response><Sms>Cheers Sent!</Sms></Response>"; 
		}
		else {
			this.body = "<Response><Sms>Hmmm, there was a problem sending your cheers, make sure you have the correct token on www.cheers.rocks</Sms></Response>"; 
		}
	}
});

app.get("/cheers/received", function* (next){
	var token = this.query.token;
	var getCheers = thunkify(cheers.getCheersPage);
	var page = this.query.page || 1;
	var received = yield getCheers({page: page, type: "received", token: token, numResults: 10});
	this.body = JSON.stringify(received);
});

app.get("/cheers/sent", function* (next){
	var token = this.query.token;
	var getCheers = thunkify(cheers.getCheersPage);
	var page = this.query.page || 1;
	var sent = yield getCheers({page: page, type: "sent", token: token, numResults: 10});
	this.body = JSON.stringify(sent);
});


app.post("/cheer/:token", function*(next){
	var self = this;
	var email = this.request.body.email;
	var message = this.request.body.message;
	var isAnonymous = this.request.body.anon || false;
	var sendCheers = thunkify(cheers.sendCheers);
	var send = yield sendCheers({
		token: self.params.token,
		email: email,
		message: message,
		isAnonymous: isAnonymous
	});
	if(send) {
		this.body = {sent:true}
	}
	else{
		this.body = {sent:false}
	}
});

app.post("/slack", function*(next) {
	var nameReplace = {
			"jessecolligan":"jessec", 
			"john": "johne", 
			"mcmanus": "mattm", 
			"ramparimi": "ram", 
			"scicotello": "sam", 
			"scott":"scotts", 
			"tdmoyer":"tim", 
			"willh":"will"};

	var userNames = Object.keys(nameReplace);
	var user = this.request.body.user_name;
	if(userNames.indexOf(this.request.body.user_name) > -1){
		user = nameReplace[user];
	}
	var from = user + "@socialtables.com";
	var to = this.request.body.text.split(" ")[0].replace("@", "").trim();
	if(userNames.indexOf(to) > -1){
		to = nameReplace[to];
	}
	var message = this.request.body.text.split(" ").slice(1).join(" ");
	var number = "";
	var existingToken = new Token;
	var token = yield existingToken.findByPhoneNumberOrEmail(number, from);
	var isAnonymous = false;
	if(!token) {
		this.body = "We did not have a token on file for you, please download the chrome extension and visit your latest tinypulse email to add your token";
	}
	else{
		var sendCheers = thunkify(cheers.sendCheers);
		var send = yield sendCheers({
			token: token.attributes.token,
			email: to,
			message: message,
			isAnonymous: isAnonymous
		});
		if(send){
			this.body = "cheers sent to " + to;	
		}
		else {
			this.body = "We were unable to send your cheers";
		}
	}

})


process.env.PORT || (process.env.PORT = 1987);
app.listen(process.env.PORT);
console.log("App listening on " + (process.env.PORT));

