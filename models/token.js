var knex = require("knex");
var bookshelf = require("./index");

var Token = bookshelf.Model.extend({
	tableName: "tokens",

	findByPhoneNumberOrEmail: function(number, email){
		// return this.where({ phone: number } ).fetch()
		var mail = email;
		var phone = number;
		if(!mail){
			mail = "";
		}
		if(!phone){
			phone = "";
		}
		return this.query('where', 'phone', '=', phone, 'or', 'email', '=', mail).fetch();
	}
});

module.exports = bookshelf.model("Token", Token);