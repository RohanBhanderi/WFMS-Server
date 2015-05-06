'use strict';

var mysql = require('../util/mysql'), 
	moment = require('moment'),
	dateutil = require('../util/dateutil');
var crypto = require('crypto');


exports.handle_request = function(msg,callback){
	var operation = msg.operation;
	var message = msg.message;
	
	switch(operation){
		
		case "createGuard" : 
			createGuard(message,callback);
			break;
		
		case "updateGuard" : 
			updateGuard(message,callback);
			break;

			
		case "listAllGuards" :
			listAllGuards(message,callback);
			break;
			
			
		case "deleteGuard" : 
			deleteGuard(message,callback);
			break;	
		
			
		case "getGuard" :
			getGuard(message,callback);
			break;
			
		case "searchGuard" :
			searchGuard(message,callback);
			break;


		case "getGuardSchedule" :
			getGuardSchedule(message,callback);
			break;
			
		case "addPatrol" :
			console.log("Add patrol record");
			addPatrolRecord(message,callback);
			break;
			
		case "getGuardInfo" :
			
			getGuardInfo(message,callback);
			break;


	}
};

// Create Guard
function createGuard(msg,callback){
	try{
	console.log("create guard inside");
    var pwu = msg.password;
    var un = msg.email;
    var fn = msg.fname;
    var ln = msg.lname;
    var usertype = msg.usertype;
    var address = msg.address;
    var city = msg.city;
    var state = msg.state;
    var zipcode = msg.zipcode;
    var phonenumber = msg.phonenumber;
     
    var new_salt = Math.round((new Date().valueOf() * Math.random())) + '';
    var pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex');
    var created = dateutil.now();
    
    var data={
        email:un,
        password_hash:pw,
        status:true,
        type:usertype,
        created_date:created,
        last_login:created,
        password_salt:new_salt
    };

    mysql.queryDb('insert into login set ?',data,function(err,result){
      if(err) {
        console.log(err);
            callback({ status : 500, message : "Please try again later" });
      } else {
            
        var idperson = result.insertId;

        mysql.queryDb('insert into person set ?',{idperson: idperson,fname : fn,
                  lname : ln,
                  email : un,
                  address: address,
                  city:city,
                  state:state,
                  zipcode:zipcode,
                  phonenumber:phonenumber
                  },
        function(err,result){
          if(err) {
           callback({ status : 500, message : "Please try again later" });
          } else {
        	  		var queryParam = {
      				idperson :	idperson,
      				idguard:msg.idguard,
      				start_date :moment(msg.start_date,'DD-MM-YYYY').toDate(),
      				end_date : moment(msg.end_date,'DD-MM-YYYY').toDate(),
      				weekly_working_set : msg.weekly_working_set,
      				bgstatus: msg.bgstatus,
      				status:"Active"
        	  		}

      		mysql.queryDb("INSERT INTO guard SET ?", queryParam, function(err, response) {
      			if (err) {
      				console.log("Error while perfoming query !!!");
      				callback({ status : 500, message : "Please try again later" });
      			} else {
      				console.log("success so far");
      				callback({ status : 200, message : "Guard has been added Succesfully" });
      			}
      		});
        	  
          }
        });
      }
    });
    mysql.queryDb("select *  from person where ?",[{email:un}],function(err,result){
		
        if(err) {
        	     callback({ status : 500, message : "Please try again later" });
        		} 
        		    		
         else {
        	 console.log(result.length);
        	 if(!(result.length==0))
        		 {
        		 console.log("inside if"+result.length);
        		 callback({ status : 200, message : "User-EmailID already Exists-" });
        		  console.log("Email ID already Exists");
        		 }
        	 else
        		 {
        		 mysql.queryDb('insert into login set ?',data,function(err,result){
        		      if(err) {
        		        console.log(err);
        		            callback({ status : 500, message : "Please try again later" });
        		      } else {
        		            
        		        var idperson = result.insertId;

        		        mysql.queryDb('insert into person set ?',{idperson: idperson,fname : fn,
        		                  lname : ln,
        		                  email : un,
        		                  address: address,
        		                  city:city,
        		                  state:state,
        		                  zipcode:zipcode,
        		                  phonenumber:phonenumber
        		                  },
        		        function(err,result){
        		          if(err) {
        		           callback({ status : 500, message : "Please try again later" });
        		          } else {
        		        	  		var queryParam = {
        		        	  		
        		      				idperson :	idperson,
        		      				idguard:msg.idguard,
        		      				start_date : msg.start_date,
        		      				end_date : msg.end_date,
        		      				weekly_working_set : msg.weekly_working_set,
        		      				bgstatus: msg.bgstatus,
        		      				status:"Active"
        		        	  		}

        		      		mysql.queryDb("INSERT INTO guard SET ?", queryParam, function(err, response) {
        		      			if (err) {
        		      				console.log("Error while perfoming query !!!");
        		      				callback({ status : 500, message : "Please try again later" });
        		      			} else {
        		      				console.log("success so far");
        		      				callback({ status : 200, message : "Guard has been added Succesfully" });
        		      			}
        		      		});
        		        	  
        		          }
        		        });
        		      }
        		    });
        		 }
        		 }
        	});
   
	}catch(e){console.log(e);
	}
}


//updateGuard


function updateGuard(msg,callback){
	var newParam ={
			
			weekly_working_set : msg.body.weekly_working_set,
			bgstatus: msg.body.bgstatus,
			start_date :moment(msg.body.start_date,'DD-MM-YYYY').toDate(), 
			end_date : moment(msg.body.end_date,'DD-MM-YYYY').toDate()
	};
	
	
	
	mysql.queryDb("UPDATE guard SET ? WHERE ?? = ?", 
		[newParam,'idguard',msg.idguard], 
		function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!" + err);
			callback({ status : 500, message : "Please try again later" });
		} 
		else
			{
			var newParam ={
					
					fname : msg.body.fname,
					lname: msg.body.lname,
					address: msg.body.address,
					city: msg.body.city,
					state: msg.body.state,
					zipcode: msg.body.zipcode,
					email: msg.body.email,
					phonenumber: msg.body.phonenumber,
				};
		
			
			mysql.queryDb("UPDATE person SET ? WHERE ?? = ?", 
				[newParam,'idperson',msg.body.idperson], 
				function(err, response) {
				if (err) {
					console.log("Error while perfoming query !!!" + err);
					callback({ status : 500, message : "Please try again later" });
				} 
			else {
			
				callback({ status : 200, message : "Guard has been added Succesfully" });
				
		}
		});
			}
	});
}


//listAll Guards
function listAllGuards(msg,callback){
	mysql.queryDb('select guard.*, person.*, gbs.idbuilding, building.buildingname from guard left join person on guard.idperson = person.idperson left join gaurdbuildingschedule as gbs on guard.idguard = gbs.idguard left join building on gbs.idbuilding = building.idbuilding where guard.status="Active"',function(err,rows){

	//mysql.queryDb('select guard.*, person.*, gbs.idbuilding, building.buildingname from guard left join person on guard.idperson = person.idperson left join gaurdbuildingschedule as gbs on guard.idguard = gbs.idguard left join building on gbs.idbuilding = building.idbuilding',function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
			//console.log("Error while listing all the guard details !!!"  + err);
			//res.status(500).json({ status : 500, message : "Error while listing guard details !!!" });
		} else {
			callback({ status : 200, message : "Value is coming",data:rows });

			//res.status(200).json({ status : 200, data : rows});
		}
	});
}


// DeleteGuard
function deleteGuard(msg,callback){
	try{
	console.log(msg.idguard);
	//idguard = msg.idguard;
	
	var newParam = {
			status : "Disable"
		};

//	mysql.queryDb('UPDATE building SET ? WHERE ?? = ?',[newParam,'idbuilding',msg.buildingid],function(err,response){

	mysql.queryDb('UPDATE guard SET ? WHERE ?? = ?',[newParam,'idguard',msg.idguard],function(err,response){

	//mysql.queryDb('DELETE FROM guard WHERE ?',[{idguard:msg.idguard}],function(err,response){
		if (err) {
			//console.log("Error while deleting guard details !!!");
			//console.log(err);
			callback({ status : 500, message : "Error while deleting guard details !!!" });
		} else {
			callback({ status : 200, message : "Guard details has been deleted Succesfully" });
		}
	});
	}
	catch(e){console.log(e)}

}


/// get guard

function getGuard(msg,callback){



idguard = msg.idguard,

mysql.queryDb('SELECT * FROM guard WHERE ? and status ="Active"',[{idguard:idguard}],function(err,rows){



if (err) {

callback({ status : 500, message : "Error while retrieving data" });

} else {

callback({ status : 200, data : rows });

}

});


/*

mysql.queryDb('SELECT * FROM client WHERE ?',[{idperson:msg.idperson}],function(err,rows){

if (err) {

callback({ status : 500, message : "Error while retrieving data" });

} else {

callback({ status : 200, data : rows });

}

});

*/

}




/// get guard Info
function getGuardInfo(msg,callback){
	
	console.log("Here  in getGuardInfo");
	//idguard = msg.idguard;
	var idperson = msg.idperson;
	
	console.log('id'+idperson);
	/*callback({ status : 200, data : "Success" });*/
	
	mysql.queryDb('SELECT * FROM guard g JOIN person p on g.idperson = p.idperson where p.idperson =? ;',[idperson],function(err,rows){
	//mysql.queryDb('SELECT * FROM guard WHERE ?',[{idguard:idguard}],function(err,rows){

		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});
	
	/*
	mysql.queryDb('SELECT * FROM client WHERE ?',[{idperson:msg.idperson}],function(err,rows){
		if (err) {
			callback({ status : 500, message : "Error while retrieving data" });
		} else {
			callback({ status : 200, data : rows });
		}
	});*/
	
}


//searchGuard

function searchGuard(msg,callback){
	
	
	mysql.queryDb('select concat(?? , " " , ??) as name, ?? from person left outer join login on ?? = ?? where login.type= "Guard"',['person.fname','person.lname','person.email','person.idperson','login.idperson','Guard'],function(err,rows){
		if (err) {
			console.log("Error while listing all the guard details !!!"  + err);
			callback({ status : 500, message : "Error while listing guard details !!!" });
		} else {
			callback({ status : 200, data : rows});
		}
	});

}

function addPatrolRecord(msg,callback){

		var datemy = moment(msg.datemy).format('YYYY-MM-DD');
		var timemy = moment(msg.timemy).format('HH');
		console.log(datemy+"date");
		

		 var queryParam = {
			      idbuilding : msg.idbuilding,
			      datemy : datemy,
			      idguard : msg.idguard,
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
			                                date : datemy,
			                                idguard : msg.idguard,
			                                description : msg.description,
			                                time : timemy
			                              }
			                              mysql
			                                  .queryDb(
			                                      "INSERT INTO `wfms`.`patrol` SET ?",
			                                      data,
			                                      function(
			                                          err,
			                                          rest) {
			                                        if (err) {
			                                          console
			                                              .log("Error while perfoming query- cant insert t patrol !!!");
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
				                          function(err, resultPatrol) {
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
				                                date : datemy,
				                                idguard : msg.idguard,
				                                description : msg.description,
				                                time : timemy
				                              }
				                              mysql
				                                  .queryDb(
				                                      "INSERT INTO `wfms`.`patrol` SET ?",
				                                      data3,
				                                      function(
				                                          err,
				                                          resultPatrol) {
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
				                                                    message : "Patrol insertedSuccefully",
				                                                    resultPatrol : resultPatrol
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


	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	///////////////////
	/*var patrolDate = moment(msg.date,'YYYY-MM-DD').toDate();
	var time =moment(msg.time, 'HH-MM-SS').toTime();
	console.log("inside patrol add srevice");
	var queryParam = {
			
			date    : patrolDate,
			description : msg.description,
			idguard   : msg.idguard,
			idbuilding : msg.idbuilding,
			idreport : msg.idreport,
			time : msg.time
			
	};
	mysql.queryDb("INSERT INTO patrol SET ?", queryParam, function(err, response) {
		if (err) {
			console.log("Error while perfoming query !!!");
			callback({ status : 500, message : "Please try again later" });
		} else {
			callback({ status : 200, message : "Patrol record has been added Succesfully" });
		}
	});
}
*/

function getGuardSchedule(msg, callback){

	var	 idguard = msg.idguard;
	
//idguard = req.msg.idguard;
mysql.queryDb('select b.buildingname,b.idbuilding,g.from, g.to, b.address from gaurdbuildingschedule g JOIN building b on g.idbuilding=b.idbuilding where ?',[{idguard:idguard}],function(err,rows){
	if (err) {
		console.log("Error while fetchung Guard Schedule!!!"  + err);
		callback({ status : 500, message : "Error while listing guard schedule !!!" });
	} else {
		callback({ status : 200, data : rows});
	}
});

};
