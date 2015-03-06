var path = require("path");
var koa = require("koa");
var app = koa();
var bodyParser = require('koa-bodyparser');
var render = require('koa-ejs');
var router = require("koa-router");
var twilio = require("twilio");
var cheers = require("./cheers");
var Token = require("./models/token");

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
	var existingToken = new Token;
	token = yield existingToken.findByPhoneNumber(this.request.body.number);
	
	if(!token){
	    var newToken = new Token({
	      phone: this.request.body.number,
	      token: this.request.body.token
	    });
	    newToken = yield newToken.save();

	    this.body = newToken;
	}
	else{
		var updateToken = yield new Token({id: token.attributes.id})
 			.save({token: this.request.body.token}, {patch: true});

 		this.body = updateToken;
	}

})


app.post("/send", function* (next) {
	var newToken = new Token; 
	var token = yield newToken.findByPhoneNumber(this.request.body.From.slice(2));
	var cheer = this.request.body.Body.split(" ");
	var email = cheer[1].toLowerCase().trim();
	var message = cheer.slice(2).join(" ");
	console.log(token);
	console.log(token.attributes.token);
	var isAnonymous = cheer[cheer.length - 1] === "anon" ? 1 : 0;
	cheers.sendCheers({
		token: token.attributes.token,
		email: email,
		message: message,
		isAnonymous: isAnonymous
	});

	this.set('Content-Type', 'text/xml');
	this.body = "<Response><Sms>Cheers Sent!</Sms></Response>"; 

})

process.env.PORT || (process.env.PORT = 1987);
app.listen(process.env.PORT);
console.log("App listening on " + (process.env.PORT));

