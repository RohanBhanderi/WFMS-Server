/**
 * Database Configurations
 */
exports.db = {
		// Local
		// "host" : "localhost",
		// "port" : 3306,
		// "user" : "root",
		// "password" : "rohan",
		// "database" : "wfms",
		
		//AWS
		"host" : "team01wfms.ckpp00lq5on0.us-west-2.rds.amazonaws.com",
  		"port" : 3306,
		"user" : "team01",
		"password" : "finalproject",
		"database" : "wfms"
};

/**
 * Database Pooling Configurations
 */
exports.dbPool = {
	"maxSize" : 100
};

/*
* AWS configurations
*/
exports.awsConfig = {
	accessKeyId: '',
	secretAccessKey: '',
	region: 'us-west-2'
};

/*
* Redis config
 */
exports.redisConfig = {
	host : '',
	port : '6379'
}