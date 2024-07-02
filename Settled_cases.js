const express = require('express');
const app = expres();
const mysql = require('mysql');
const cors = require('corrs');
app.use(cors());

const connection= mysql.createConnection({
    host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
    user: 'justact',
    password: 'justact123!',
    database:'justact_staging' 
})
connection.connect(function(err){
    if (err) throw err;
    console.log("Connected");
})

app.get('/api/get-settled',(req,res)=>{
    
});


// http://localhost:3000/api/get-settled