const express = require('express');
const bodyParser = require('body-parser');
const listtenants = require('./lambda_src/listtenants');
const managetenantprops = require('./lambda_src/manageTenantProps');

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

app.get('/api/tenant/:tenantname/:environmentname', function (req, res) {
    console.log(`Get tenant function accessed with data`);
    console.log({ tenantname: req.params.tenantname, environmentname: req.params.environmentname });
    managetenantprops.handler({ pathParameters: req.params, httpMethod: 'GET' }).then(function (ret) {
        res.statusCode = ret.statusCode;
        res.contentType = res.type('application/json');
        res.send(JSON.parse(ret.body));
    }).catch(function (err) {
        console.log(err);
    })
});

app.post('/api/tenant/:tenantname/:environmentname', function (req, res) {
    console.log(`Update tenant function accessed with data`);
    console.log({ tenantname: req.params.tenantname, environmentname: req.params.environmentname });
    console.log(req.body);
    managetenantprops.handler({ pathParameters: req.params, body: JSON.stringify(req.body), httpMethod: 'POST' }).then(function (ret) {
        res.statusCode = 200;
        res.send(JSON.parse(ret.body));
    }).catch(function (err) {
        console.log(err);
    })
});

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});