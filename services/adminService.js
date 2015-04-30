'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');

exports.handle_request = function(req,callback){
	var operation = req.operation;
	var message = req.message;
	
	switch(operation){
		
		case "createAlert" : 
			createAlert(message,callback);
			break;

		case "publishAlert" : 
			publishAlert(message,callback);
			break;
			
		case "addPatrolRecord" :
			addPatrolRecord(message,callback);
			break;
			
		default : 
			callback({status : 400,message : "Bad Request"});
	}
};

// Save alert
function createAlert(msg,callback){
	var queryParam = {
			idalert : msg.idalert,
			heading : msg.heading,
			description : msg.description
	}

	mysql.queryDb("INSERT INTO alert SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Alert has been added Succesfully" });
		}
	});
	
}

// publish Alert
function publishAlert(msg,callback){
	var queryParam = {
			idguard : msg.idguard,
			idalert : msg.idalert,
			severity : msg.severity,
			date : msg.date
			
	}

	mysql.queryDb("INSERT INTO alertinfo SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Alert has been added Succesfully" });
		}
	});
}

//add petrol record
function addPatrolRecord(msg,callback){
	var queryParam = {
			date    : msg.date,
			description : msg.description,
			idgaurd   : msg.idgaurd,
			idbuilding : msg.idgaurd,
			idreport : msg.idreport
	}

	mysql.queryDb("INSERT INTO patrol SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Patrol record has been added Successfully" });
		}
	});
}
