var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {

  db.createTable('tokens', {
    id: { type: 'int', primaryKey: true,  autoIncrement: true  },
    phone: 'string',
    token: 'string'
 }, callback);

};

exports.down = function(db, callback) {
	db.dropTable('tokens', callback);
};
