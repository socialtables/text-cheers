var path = require("path");
var koa = require("koa");
var app = koa();
var bodyParser = require('koa-bodyparser');
var render = require('koa-ejs');
var router = require("koa-router");
var twilio = require("twilio");
var thunkify = require("thunkify-wrap");
var cheers = require("./cheers");
var Token = require("./models/token");
var verifyToken = require("./token");
var tpCheers = require("tinypulse").Cheers;
var tpToken = require("tinypulse").Token;
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
	var email = cheer[1].toLowerCase().trim();
	var message = cheer.slice(2).join(" ");
	var isAnonymous = cheer[cheer.length - 1] === "anon" ? 1 : 0;
	if(isAnonymous){
		message = message.split(" ");
		message[message.length - 1] = "";
		message = message.join(" ");
	}
	var cheer = yield cheers.sendCheers({
		token: token.attributes.token,
		email: email,
		message: message,
		isAnonymous: isAnonymous
	});
	this.set('Content-Type', 'text/xml');
	if(cheer) {
		this.body = "<Response><Sms>Cheers Sent!</Sms></Response>"; 
	}
	else {
		this.body = "<Response><Sms>Hmmm, there was a problem sending your cheers, make sure you have the correct token on www.cheers.rocks</Sms></Response>"; 
	}
});

app.get("/cheers/received", function* (next){
	var token = this.query.token;
	var getCheers = thunkify(tpCheers.getCheersPage);
	var page = this.query.page || 1;
	var cheers = yield getCheers({page: page, type: "received", token: token, numResults: 10});
	this.body = JSON.stringify(cheers);
});

app.get("/cheers/sent", function* (next){
	var token = this.query.token;
	var getCheers = thunkify(tpCheers.getCheersPage);
	var page = this.query.page || 1;
	var cheers = yield getCheers({page: page, type: "sent", token: token, numResults: 10});
	this.body = JSON.stringify(cheers);
});

process.env.PORT || (process.env.PORT = 1987);
app.listen(process.env.PORT);
console.log("App listening on " + (process.env.PORT));

