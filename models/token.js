var knex = require("knex");
var bookshelf = require("./index");

var Token = bookshelf.Model.extend({
	tableName: "tokens",

	findByPhoneNumberOrEmail: function(number, email){
		var mail = email;
		var phone = number;
		if(!mail){
			mail = "";
		}
		if(!phone){
			phone = "";
		}
		return this.query({where: {phone: phone}, orWhere: {email: mail}}).fetch();
	}
});

module.exports = bookshelf.model("Token", Token);