var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
	db.addColumn('tokens', 'email', {type:'text'}, callback)
};

exports.down = function(db, callback) {
	db.removeColumn('tokens', 'email', callback)
};
