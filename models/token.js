var knex = require("knex");
var bookshelf = require("./index");

var Token = bookshelf.Model.extend({
	tableName: "tokens",

	findByPhoneNumber: function(number){
		return this.where({ phone: number } ).fetch()
	}
});

module.exports = bookshelf.model("Token", Token);