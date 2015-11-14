var http = require('http');
var sleep = require('sleep');
var redis = require('redis')
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var multer = require('multer');
var express = require('express');
var fs      = require('fs');
var raq = require("redis-as-queue");
var app = express()
// REDIS
var featureName = process.argv[2];
var featureStatus = process.argv[3];
var featureServer = process.argv[4];

var normalQueue = new raq.NormalQueue('server_'+featureName, 6379, '127.0.0.1', {});

console.log("featureName : ", featureName, "featureServer : ", featureServer, "featureStatus : ", featureStatus);


var funcPrint = function(){
normalQueue.get(-1, function(err, messages) {
    //console.log(err);
    for(var i = 0; i < messages.length; i++) console.log("Final queue items : ", messages[i]);
});
}

if(featureStatus == 'ON') {
	normalQueue.push('http://127.0.0.1:'+featureServer, function(err,value){
		console.log(value);
	});

	
}
else {
	
	normalQueue.length(function(err, len) {
    	console.log("Length is :", len);
		normalQueue.get(-1, function(err, messages) {
    		//console.log(err);
			for(var i = 0; i < messages.length; i++) {
				normalQueue.get(function(err, messages) {
					    //console.log(err);
					if(messages.length){
						console.log("head of the queue is" , messages[0]);
						normalQueue.removeAmount(1, function(err) {
						//console.log(err);
							console.log("Removing : ", messages[0]);
							if(messages[0] == ('http://127.0.0.1:'+featureServer)){
								console.log("Removed :", messages[0]);
								return;
							}
							else{
								normalQueue.push(messages[0], function(err) {
									//console.log(err);
		    						console.log("Pushed :", messages[0]);
		    					});
							}

						});
					}

				});
			}
			funcPrint();

		});
		
	});
}

