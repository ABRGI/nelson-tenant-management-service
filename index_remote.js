const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

var port = process.env.PORT;
var app = express();

app.use(createProxyMiddleware('/api/tenant/listtenants', {
    target: 'http://test.nelson.management',
    changeOrigin: true
}));

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});