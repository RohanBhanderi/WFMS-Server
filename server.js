var amqp = require('amqp');
var mysql = require('./util/mysql');
var admin = require('./services/admin');
var alert = require('./services/alert');
var building = require('./services/building');
var client = require('./services/client');
var guard = require('./services/guard');
var report = require('./services/report');
	
//DB Pool Initilization
mysql.createConnPool();

var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
	console.log("WFMS-Server listening on service queues");
	
	//Admin Service
	cnn.queue('admin_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			admin.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});
	
	//Alert Service
	cnn.queue('alert_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			alert.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//building Service
	cnn.queue('building_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			building.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//client Service
	cnn.queue('client_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			client.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//guard Service
	cnn.queue('guard_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			guard.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

	//report Service
	cnn.queue('report_queue', function(q){
		q.subscribe(function(message, headers, deliveryInfo, m){
			console.log("Message: "+JSON.stringify(message));
			report.handle_request(message, function(res){
				publishQueue(cnn,m,res);
			});
		});
	});

});

function logQueueReq(message, headers, deliveryInfo, m){
	console.log("Message: "+JSON.stringify(message));
	console.log("Headers: "+JSON.stringify(headers));
	console.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
}

function publishQueue(conn,m,response){
	console.log("----------------------------------");
	console.log("Publishing To \nQueue: "+m.replyTo + "\nResponse:" + JSON.stringify(response));
	console.log("----------------------------------");
	conn.publish(m.replyTo, response, {
		contentType:'application/json',
		contentEncoding:'utf-8',
		correlationId:m.correlationId
	});
}