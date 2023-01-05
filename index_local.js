const express = require('express');
const bodyParser = require('body-parser');
const listtenants = require('./lambda_src/listtenants');

const port = 8000;
var app = express();
app.use(bodyParser.json());

app.get('/api/tenant/listtenants', function (req, res) {
    console.log(`List tenants function accessed with data`);
    console.log(req.query);
    listtenants.handler({ queryStringParameters: req.query || {} }).then(function (ret) {
        res.statusCode = 200;
        res.send(JSON.parse(ret.body));
    }).catch(function (err) {
        console.log(err);
    })
});

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});