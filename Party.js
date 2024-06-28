const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
app,use(cors());

const connection = mysql.createConnection({
    host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
    user: 'justact',
    password: 'justact123!',
    database: 'justact_staging'
})

connection.connect(function(err){
    if(err) throw err;
    console.log("Connected!");

app.get('/api/get-parties', (req,res)=>{
    const useremail = 'anandsingh039@gmail.com';

    const query1 = `
    SELECT partyname 
    FROM mis_party_agents 
    WHERE agentEmail = ?
    `
    connection.query(query1, [useremail], function(err, result){
        if (err) throw err;
        if(results.length ==0){
            console.log('no agents or parties found for this email')
        }
        console.log(results);
        const parties = results.map(row=> row.partyname);
        console.log("Parties");
        res.json(parties);
    
    });
});
    
});
app.listen(3000,()=> {
    console.log("Server listening on port 3000");
});