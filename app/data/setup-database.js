var fs = require('fs');
var sqlSchema = fs.readFileSync('app/data/user-schema.sql').toString();

module.exports = function(db) {
    db.serialize(function() {
        db.run(sqlSchema);
    });
};


