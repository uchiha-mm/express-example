var http = require('http');
var redis = require('redis')
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var multer = require('multer');
var express = require('express');
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})



/**************Running Proxy on port 9000****************/
/**************Running Main.js on port 3000 and 3001****************/


var options = {};
var proxy = httpProxy.createProxyServer(options);

var server = http.createServer(function(req, res){
	console.log(req.method, req.url);
	
	client.get(req.url, function(err, value){
		if(value){
			console.log('The queue has elements :', value)
			if(value == 0){
				console.log('No server to serve this feature');
				proxy.web(req, res, {target: 'http://127.0.0.1:3000'});
			}
			else if (value>0){
				  	client.rpop('hotqueue:server_'+req.url, function(err,value){
				  	console.log("Popped server name is : ", value); 
				  	var ip = value.slice(2, 23)
				  	console.log('ip now is :', ip)
				  	proxy.web(req, res, {target: ip});
				  	client.lpush(['hotqueue:server_'+req.url, value], function(err, reply){	
				  		console.log(reply);	
				  	})  
				  })
			}
		}
		else{
			client.rpop('servers', function(err,value){
			  	console.log("Popped server name is : ", value); 
			  	proxy.web(req, res, {target: value});
			  	client.lpush(['servers', value], function(err, reply){	
			  		console.log(reply);	
			  	})  
			 })
		}
		
	});

});
server.listen (9000);