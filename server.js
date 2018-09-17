const express = require('express');
const app = express();
const port = 3000;

var sqlite3 = require('sqlite3');
var db;
var bodyParser = require("body-parser");
var fs = require('fs');
var createsqlSchema = fs.readFileSync('app/data/user-schema.sql').toString();
var deletesqlSchema = fs.readFileSync('app/data/user-drop-schema.sql').toString();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (!fs.existsSync('app/data/api.db')) {
    fs.openSync('app/data/api.db');
}
db = new sqlite3.Database('app/data/api.db');

db.serialize(function () {
    db.run(deletesqlSchema, function () {
        db.run(createsqlSchema);
    });

});

app.get('/api', (req, res) => {
    processData(res, "SELECT * FROM users");
});

app.post('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    insertUser(req.body, res, db, (err) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).send("CREATE ENTRY SUCCESSFUL");
    });
});

app.put('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    processPut(req, res, db);
});

app.delete('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    deleteUsers(db, (err) => {
        if (err) {
            res.status(500).send(err);
        }
        res.status(200).send("DELETE COLLECTION SUCCESSFUL");
    });
});

app.put('/api/:id', (req, res) => {
    processPut(req, res, db);
});

app.delete('/api/:id', (req, res) => {
    deleteUser(req.params.id, res, db);
});

app.get('/api/:id', (req, res) => {
    processData(res, "SELECT * FROM users where userid= ?", req.params.id);
});


app.listen(port, () => {
    console.log('Backend NodeJS live on ' + port);
});

function deleteUsers(db, callback) {
    var sql = `delete from  Users;`;
    db.serialize(function () {
        db.run(sql, function (err) {
            if (err) {
                console.error(err);
                callback(err);
            }
            callback();
        });
    });
}

function insertUser(user, res, db, callback) {
    var name = user.name;
    var email = user.email;
    var phone = user.phone;
    var sql = `insert into Users (name, email, phone) 
            VALUES 
            (?, ?, ?);`;
    var values = [name, email, phone];
    db.serialize(function () {
        db.run(sql, values, function (err) {
            if (err) {
                console.error(err);
                callback(err);
            }
            callback();
        });
    });
}

function processPut(req, res, db) {
    if (Array.isArray(req.body)) {
        req.body.forEach((user, i) => {
            updateUser(user, db, ++i, (err) => {
                if (err)
                    res.status(500).send(err);
                else {
                    if (i === req.body.length) {
                        res.status(200).send("REPLACE COLLECTION SUCCESSFUL");
                    }
                }

            });
        });
    } else {
        updateUser(req.body, db, req.params.id, (err) => {
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).send("UPDATE ITEM SUCCESSFUL");
        });
    }

}

function updateUser(user, db, id, callback) {
    var name = user.name;
    var email = user.email;
    var phone = user.phone;
    var sql = `update Users
            set name = ?, email = ?, phone = ?
            where userid = ?;`;
    var values = [name, email, phone, id];
    db.serialize(function () {
        db.run(sql, values, function (err) {
            if (err) {
                console.error(err);
                callback(err);
            }
            callback();
        });
    });
}

function deleteUser(id, res, db) {
    if (!id) {
        res.status(400).send("ID is mandatory");
    }
    else {
        var sql = `delete from  Users where userid = ?;`;
        var values = [id];
        db.serialize(function () {
            db.run(sql, values, function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
                else
                    res.status(200).send("DELETE ITEM SUCCESSFUL");
            });
        });
    }
}


function processData(res, sql, params) {
    params = params ? [params] : []
    db.serialize(function () {
        db.all(sql, params,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
                sendData(res, rows);
            });
    });
}

function sendData(res, data) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (data[0])
        res.status(200).send(data);
    else {
        res.status(200).send("collection empty");
    }
}

