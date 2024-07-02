const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
    user: 'justact',
    password: 'justact123!',
    database: 'justact_staging'
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });