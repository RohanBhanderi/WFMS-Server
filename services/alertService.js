'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');

exports.handle_request = function(msg,callback){
	var operation = msg.operation;
	var message = msg.message;
	
	switch(operation){
		
		case "createAlert" : 
			createAlert(message,callback);
			break;

		case "alertPerBuilding" : 
			alertPerBuilding(message,callback);
			break;
			
		case "updateClient" :
			updateClient(message,callback);
			break;
			
		case "getClient" :
			getClient(message,callback);
			break;
			
		case "deleteClient" :
			deleteClient(message,callback);
			break;
			
		case "listAllClients" :
			listAllClients(message,callback);
			break;

		case "alertPerClient":
			alertPerClient(message,callback);
			break;
		case "seenByClient":
			seenByClient(message,callback);
			break;
			
		default : 
			callback({status : 400,message : "Bad Request"});
	}
};

// Save or update client
function createAlert(msg,callback){
	console.log("DateMy: "+msg.datemy);
	var datemy = moment(msg.datemy).format('YYYY-MM-DD');
	console.log("DateMy: "+datemy);
	var timemy = moment(msg.timemy).format('HH-MM');

	 var queryParam = {
		      idbuilding : msg.idbuilding,
		      severity : msg.severity,
		      datemy : datemy,
		      idguard : msg.idguard,
		      status : 'F',
		      seenByClient : 'F',
		      description : msg.description,
		      time : timemy
		    };
		    mysql
		        .queryDb(
		            'SELECT idreport FROM wfms.report where ?? = ?',
		            [ 'date',datemy],
		            function(err,resultIdReport) {
		              if (err) {
		                console.log("Error while perfoming query  !!!");
		                callback({
		                  status : 500,
		                  message : "Please try again later"
		                });
		              } else {
		            	  console.log("resultIdReport"+ resultIdReport);
		                if (resultIdReport.length==0) {
		                  console.log(" first idreport "
		                      + resultIdReport);
		                  var queryParam = {
		                    idbuilding : msg.idbuilding,
		                    date : datemy,
		                    idguard : msg.idguard

		                  };
		                  mysql
		                      .queryDb(
		                          "INSERT INTO `wfms`.`report` SET ?",
		                          queryParam,
		                          function(err, result) {
		                            if (err) {
		                              console
		                                  .log("Error while perfoming query !!!");
		                              callback(
		                                      {
		                                        status : 500,
		                                        message : "Please try again later"
		                                      });
		                            } else {
		                            	console.log(result);
		                              var reportId = result.insertId;
		                              console.log("reportid on line 62:"+reportId);

		                              var data = {
		                                idbuilding : msg.idbuilding,
		                                idreport : reportId,
		                                severity : msg.severity,
		                                date : datemy,
		                                idguard : msg.idguard,
		                                status : 'F',
		                                seenByClient : 'F',
		                                description : msg.description,
		                                time : timemy
		                              }
		                              mysql
		                                  .queryDb(
		                                      "INSERT INTO `wfms`.`alertinfo` SET ?",
		                                      data,
		                                      function(
		                                          err,
		                                          rest) {
		                                        if (err) {
		                                          console
		                                              .log("Error while perfoming query- cant insert t alertinfo !!!");
		                                          callback(
		                                                  {
		                                                    status : 500,
		                                                    message : "Please try again later"
		                                                  });
		                                        } else {

		                                         callback(
		                                                  {
		                                                    status : 200,
		                                                    message : "Alert successfully inserted",
		                                                    resultPatrol : rest
		                                                  });
		                                        }
		                                      });

		                            }
		                          });
		                }

		                else {
		                  //console.log("idreport " + resultIdReport[0].idreport);
		                  var data2 = {
		                    idbuilding : msg.idbuilding,
		                    idguard : msg.idguard,
		                    date : datemy

		                  }
		                  mysql
		                      .queryDb(
		                          "INSERT INTO `wfms`.`report` SET ?",
		                          data2,
		                          function(err, resultAlert) {
		                            if (err) {
		                              console
		                                  .log("Error while perfoming query !!!");
		                             callback(
		                                      {
		                                        status : 500,
		                                        message : "Please try again later"
		                                      });
		                            } else {
		                              console
		                                  .log("idreport "
		                                      + resultIdReport[0].idreport);
		                              var data3 = {
		                                idbuilding : msg.idbuilding,
		                                idreport : resultIdReport[0].idreport,
		                                severity : msg.severity,
		                                date : datemy,
		                                idguard : msg.idguard,
		                                status : 'F',
		                                seenByClient : 'F',
		                                description : msg.description,
		                                time : timemy
		                              }
		                              mysql
		                                  .queryDb(
		                                      "INSERT INTO `wfms`.`alertinfo` SET ?",
		                                      data3,
		                                      function(
		                                          err,
		                                          resultAlert) {
		                                        if (err) {
		                                          console
		                                              .log("Error while perfoming query !!!");
		                                         callback(
		                                                  {
		                                                    status : 500,
		                                                    message : "Please try again later"
		                                                  });
		                                        } else {

		                                         callback(
		                                                  {
		                                                    status : 200,
		                                                    message : "Alert insertedSuccefully",
		                                                    resultAlert : resultAlert
		                                                  });
		                                        }
		                                      });

		                            }
		                            ;

		                          });

		                }
		                
		              };
		              
		            });
}

function alertPerBuilding(msg,callback){
	var idbuilding=msg.idbuilding
	mysql.queryDb('SELECT wfms.alertinfo.severity, wfms.alertinfo.date, wfms.alertinfo.idalertInfo FROM wfms.alertinfo where ?? = ?;',['idbuilding',idbuilding],function(err,resultAlert){
		if (err) {
			 callback({ status : 500, message : "Error while retrieving data" });
		} else {
			 callback({ status : 200, resultAlert:resultAlert });
		}
	});
}

function alertPerClient(msg,callback){
	var idclient=msg.idclient;
	var seenByClient=msg.seenByClient;
	
	mysql.queryDb('SELECT * FROM wfms.alertinfo left outer join wfms.building on ?? = ?? where ?? = ? AND ?? = ?;',['wfms.building.idbuilding','wfms.alertinfo.idbuilding','idclient',idclient,'seenByClient',seenByClient],function(err,resultAlert){

		if (err) {
			 callback({ status : 500, message : "Error while retrieving data" });
		} else {
			 callback({ status : 200, message : "Report for Alert", resultAlert:resultAlert});
		}
	});
}

function seenByClient(msg,callback){
	
	var seenByClient=msg.seenByClient;
	var idalertInfo = msg.idalertInfo;
	mysql.queryDb('UPDATE `wfms`.`alertinfo` SET ??= ? WHERE ?? = ?;',['seenByClient',seenByClient,'idalertInfo',idalertInfo],function(err,resultAlert){

		if (err) {
			 callback({ status : 500, message : "Error while retrieving data" });
		} else {
			 callback({ status : 200, message : "Report for Alert", resultAlert:resultAlert});
		}
	});
}	

function alertPerDay(msg,callback){
	var Date = moment(msg.date,'DD-MM-YYYY').toDate();

	mysql.queryDb("SELECT * FROM wfms.alertinfo where ?? LIKE '"+date+"%'",[Date], function(err, resultAlert) {
		if (err) {
			console.log("Error while perfoming query !!!");
			 callback({ status : 500, message : "Please try again later" });
		} else {
			
			 callback({ status : 200, message : "Report for Patrol", resultAlert:resultAlert});
		}
	});
}
function seenByAdmin(msg,callback){

	var status=msg.status;
	var idalertInfo=msg.idalertInfo;
	mysql.queryDb('UPDATE `wfms`.`alertinfo` SET ??= ? WHERE ?? = ?;',['status',status,'idalertInfo',idalertInfo],function(err,result){

		if (err) {
			 callback({ status : 500, message : "Error while retrieving data" });
		} else {
			 callback({ status : 200, message : "Alert Updated", result:result});
		}
	});
}




// Save updateClientBillingInfo
