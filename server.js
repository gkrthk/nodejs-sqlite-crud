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

if(!fs.existsSync('app/data/api.db')){
    fs.openSync('app/data/api.db');
}
db = new sqlite3.Database('app/data/api.db');

db.serialize(function() {
    db.run(deletesqlSchema);
    db.run(createsqlSchema);
});

app.get('/api', (req, res) => {
    processData(res, "SELECT * FROM users");
});

app.post('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var data = req.body;
    processUsers(req, res, db);
});

app.put('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
     var data = req.body;
     processPut(req, res, db);
});

app.delete('/api', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var data = req.body;
    deleteUser(req, res, db);
});


app.listen(port, () => {
    console.log('Backend NodeJS live on ' + port);
});

function processPut(req,res,db){
    for (var user of req.body) {
        updateUser(user, res, db);
    } 
}

function processUsers(req, res, db) {
    for (var user of req.body) {
        insertUser(user, res, db);
    }
}

function insertUser(product, res, db) {
    var name = product.name;
    var description = product.description;
    var price = product.price;
    var currency = product.currency;

    var sql = `insert into Users (name, email, phone) 
            VALUES 
            (?, ?, ?);`;

    var values = [name, description, price, currency];

    db.serialize(function () {
        db.run(sql, values, function (err) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }

            else
                res.send();
        });
    });
}

function updateUser(user, res, db){
    var name = user.name;
    var email = user.email;
    var phone = user.phone;
    var id = user.id;

    var sql = `update Products
            set name = ?, email = ?, phone = ?
            where id = ?;`;

    var values = [name, email, phone, id];

    db.serialize(function () {
        db.run(sql, values, function (err) {
            if (err){
                console.error(err);
                res.status(500).send(err);
            }
            else
                res.send();
        });
    });
}

function deleteUser(user, res, db){
    var id = user.id;

    if(!id){
        res.status(400).send("ID is mandatory");
    }

    else{
        var sql = `delete from  Users where id = ?;`;
        var values = [id];

        db.serialize(function () {
            db.run(sql, values, function (err) {
                if (err){
                    console.error(err);
                    res.status(500).send(err);
                }
                else
                    res.send();
            });
        });
    }
}


function processData(res, sql) {
    db.serialize(function () {
        db.all(sql,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                }
                else
                    sendData(res, rows, err);
            });
    });
}

function sendData(res, data, err) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (data[0])
        res.send(data);
    else {
        res.status(404).send("User not found");
    }
}

