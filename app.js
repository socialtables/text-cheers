var path = require("path");
var koa = require("koa");
var app = koa();
var bodyParser = require('koa-bodyparser');
var render = require('koa-ejs');
var router = require("koa-router");
var twilio = require("twilio");
var cheers = require("./cheers");
var Token = require("./models/token");
var verifyToken = require("./token");

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
	if(this.request.body.token && (this.request.body.number || this.request.body.email)) {
		var existingToken = new Token;
		var email = this.request.body.email;
		var number = this.request.body.number;
		var token = yield existingToken.findByPhoneNumberOrEmail(number, email);

		if(!token){
	
			if(!email) {
			    var newToken = new Token({
			      phone: number,
			      token: this.request.body.token
			    });
			}
			else if(!number) {
			    var newToken = new Token({
			      email: email,
			      token: this.request.body.token
			    });				
			}
			else{
			    var newToken = new Token({
			      phone: number,	
			      email: email,
			      token: this.request.body.token
			    });				
			}
		    newToken = yield newToken.save();
		    var verify = yield verifyToken.verify(newToken.attributes.token);
		    if(verify){
		    	this.body={verified:true , message:"Thank you for adding your token!"};
		    }
		    else{
		    	this.body={verified:false , message:"The token you entered was incorrect, please make sure you have entered the correct token"};
		    }
		}
		else{
			if(!email){
				var updateToken = yield new Token({id: token.attributes.id})
		 			.save({token: this.request.body.token, phone:number}, {patch: true});
	 		}
	 		else if(!number) {
	 		var updateToken = yield new Token({id: token.attributes.id})
		 		.save({token: this.request.body.token, email:email}, {patch: true});	
	 		}
	 		else {
	 		var updateToken = yield new Token({id: token.attributes.id})
		 		.save({token: this.request.body.token, phone:number, email:email}, {patch: true});	
	 		}
	 		var verify = yield verifyToken.verify(updateToken.attributes.token);
		    if(verify){
		    	this.body={verified:true , message:"Thank you for adding your token!"};
		    }
		    else{
		    	this.body={verified:false , message:"The token you entered was incorrect, please make sure you have entered the correct token"};
		    }
		}
	}
	else{
		this.body={verified:false , message:"You did not enter a token or phone number, please try again"};
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
	

})

process.env.PORT || (process.env.PORT = 1987);
app.listen(process.env.PORT);
console.log("App listening on " + (process.env.PORT));

