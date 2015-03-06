// Initialize the Bookshelf where we're going to keep our data
var path = require("path");

var _getPoolSettings = function() {
	if (['test', 'circle'].indexOf(process.env.NODE_ENV) != -1) {
		return {min: 1, max: 1};
	}
	else {
		return {min: 1, max: 5};
	}
};

var dbSettings =  {
			host: process.env.PG_HOST || '127.0.0.1',
			database:  process.env.PG_DB || 'cheers_local',
			user: process.env.PG_USER || 'root',
			password: process.env.PG_PASSWORD || ''
	};
var client = "mysql";
if(process.env.DATABASE_URL){
	dbSettings = process.env.DATABASE_URL;
	client = "pg";
}
var knex = require("knex")({
	client: client,
	connection: dbSettings,
	pool: _getPoolSettings()
	// , debug: true
});
var bookshelf = require("bookshelf")(knex);

// Use the registry plugin to avoid circular dependencies
bookshelf.plugin('registry');

module.exports = bookshelf;

// Now make sure we have require'd in all of the model files, so that
// they're present in the models registry.
var fs = require("fs");
fs.readdirSync(__dirname).forEach(function(file) {
	if (path.extname(file) == ".js") {
		// logger.debug({file: file}, "requiring model");
		require("./" + file);
	}
});
