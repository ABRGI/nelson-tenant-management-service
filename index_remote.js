const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

var port = 4000;
var app = express();

app.use(createProxyMiddleware('/api/tenant/listtenants', {
    target: 'http://test.nelson.management',
    changeOrigin: true
}));

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});