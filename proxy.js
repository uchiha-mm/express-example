var http = require('http');
var redis = require('redis')
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var multer = require('multer');
var express = require('express');
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

/**************Running Proxy on port 9000****************/
/**************Running Main.js on port 3000 and 3001****************/
client.del('servers');
client.lpush(['servers', 'http://127.0.0.1:3000'], function(err, reply){
	console.log(reply);
})
client.lpush(['servers', 'http://127.0.0.1:3001'], function(err, reply){
	console.log(reply);
})

var options = {};
var proxy = httpProxy.createProxyServer(options);

var server = http.createServer(function(req, res){
	client.rpoplpush('servers', 'servers', function(err,value){
		proxy.web(req, res, {target: value});
			console.log("Server is running on port : ", value)
	})
});
server.listen (9000);