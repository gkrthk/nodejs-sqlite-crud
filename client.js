var http = require('http');

test1();

function invokeApi(data, options, callback) {
    var req;
    req = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log(chunk);
            callback(chunk);
        });
    });
    if (data) {
        req.write(JSON.stringify(data));
    }
    req.end();
}

function test1() {
    http.get("http://localhost:3000/api", (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (typeof chunk !== undefined && chunk != null && chunk === "collection empty") {
                testpost1();
            }
        });
    });
}

function test3() {
    console.log("test3");
    const postData = [{ "name": "Larissa", "email": "larissa@gmail.com", "phone": "289-441-3333" }, { "name": "David", "email": "david@david.org", "phone": "905-456-1235" }];
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(postData, options, (res) => {
        if (res === "REPLACE COLLECTION SUCCESSFUL") {
            test4();
        }
    });
}

function testpost1() {
    console.log("testpost1");
    const postData = { "name": "T", "email": "t@gmail.com", "phone": "123-123-1235" };
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(postData, options, (res) => {
        if (res === "CREATE ENTRY SUCCESSFUL") {
            testpost2();
        }
    });
}

function testpost2() {
    console.log("testpost2");
    const postData = { "name": "r", "email": "r@gmail.com", "phone": "123-123-1245" };
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(postData, options, (res) => {
        if (res === "CREATE ENTRY SUCCESSFUL") {
            test3();
        }
    });
}

function test4() {
    console.log("test4");
    http.get("http://localhost:3000/api/1", (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if (chunk.length != 0) {
                console.log(chunk);
                test5();
            }
        });
    });
}

function test5() {
    console.log("test5");
    const postData = { "name": "a", "email": "a@gmail.com", "phone": "123-123-1345" };
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/2',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(postData, options, (res) => {
        if (res === "UPDATE ITEM SUCCESSFUL") {
            test6();
        }
    });
}

function test6() {
    console.log("test6");
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/2',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(null, options, (res) => {
        if (res === "DELETE ITEM SUCCESSFUL") {
            test7();
        }
    });
}

function test7() {
    console.log("test7");
    let options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    invokeApi(null, options, (res) => {
        if (res === "DELETE COLLECTION SUCCESSFUL") {
            http.get("http://localhost:3000/api", (res) => {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    if (typeof chunk !== undefined && chunk != null && chunk === "collection empty") {
                        console.log("All Tests Passed");
                    }
                });
            });
        }
    });
}
