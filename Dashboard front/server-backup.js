const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
app.use(cors());

const connection = mysql.createConnection({
    host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
    user: 'justact',
    password: 'justact123!',
    database: 'justact_staging'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    app.get('/api/get-parties-and-cases', (req, res) => {
        const useremail = 'anandsingh039@gmail.com';
        const fromDate = req.query.from; 
        const toDate = req.query.to; 

        console.log(`fromDate: ${fromDate}, toDate: ${toDate}`);

        const query1 = `
            SELECT DISTINCT partyname 
            FROM mis_party_agents 
            WHERE agentEmail = ?
        `;
        connection.query(query1, [useremail], function(err, result) {
            if (err) throw err;
            if (result.length === 0) {
                console.log('No agents or parties found for this email');
                return res.json({ parties: [], cases: [] }); 
            }
            const parties = result.map(row => row.partyname); 
            // console.log(`parties: ${parties}`);

            const query2 = `
                SELECT caseId, caseTitle, lotID, caseStatus, parties 
                FROM mis_cases_parties 
                WHERE case_created_at BETWEEN ? AND ? and parties is not null
            `;
            connection.query(query2, [fromDate, toDate], function(err, result) {
                if (err) throw err;
                const caseDetails = result.map(row => {
                    const caseParties = JSON.parse(row.parties).map(p => p.partyname);
                    return {
                        caseId: row.caseId,
                        caseTitle: row.caseTitle,
                        lotID: row.lotID,
                        caseStatus: row.caseStatus,
                        parties: caseParties
                    };
                });
                // console.log(`caseDetails: ${JSON.stringify(caseDetails)}`);

                res.json({ parties, cases: caseDetails });
            });
        });
    });
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});


//contract number , remove parties , add another column named case stage where we show the exact status under 6 main headers
// give them a way to select from what case to what case 