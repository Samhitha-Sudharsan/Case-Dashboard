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

app.get('/api/get-hold',(req,res)=>{
    const useremail = 'anandsingh039@gmail.com';

    connection.query()`
        	SELECT caseId, caseTitle, case_crated_at, borrowerName, contractNumber, totalClaimValue FROM mis_cases_parties WHERE caseStatus = 'Hold'`,(err,result)=>{
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: 'Error fetching lot dates' });
                  } else {
                    console.log(result)
                    const settled = result.map(row => row.case_created_at);
                    console.log("Cases fetched and returned");
                    res.json(settled);
                  }
            } 
    
});
app.listen(3000,()=>{
    console.log("Server listening at port 3000");
});

// http://localhost:3000/api/get-hold