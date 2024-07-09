const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
app.use(cors());

const connection = mysql.createConnection({
    host: 'dbhost',
    user: 'dbuser',
    password: 'dbpwd!',
    database: 'dbname'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    app.get('/api/get-parties-and-cases', (req, res) => {
        const useremail = 'example@gmial.com';
        const fromDate = req.query.from;
        const toDate = req.query.to;
        const fromCaseID = req.query.fromCaseID; // Retrieve from-case-id from query parameters
        const toCaseID = req.query.toCaseID; // Retrieve to-case-id from query parameters

        console.log(`fromDate: ${fromDate}, toDate: ${toDate}, fromCaseID: ${fromCaseID}, toCaseID: ${toCaseID}`);

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

            let query2 = `
                SELECT caseId, caseTitle, lotID, contractNumber, caseStatus, exactStatus, parties 
                FROM mis_cases_parties 
                WHERE case_created_at BETWEEN ? AND ? and parties is not null
            `;
            const queryParams = [fromDate, toDate];

            // Append caseID range condition if provided
            if (fromCaseID && toCaseID) {
                query2 += ` AND caseId BETWEEN ? AND ?`;
                queryParams.push(fromCaseID);
                queryParams.push(toCaseID);
            }

            connection.query(query2, queryParams, function(err, result) {
                if (err) throw err;
                const caseDetails = result.map(row => {
                    const caseParties = JSON.parse(row.parties).map(p => p.partyname);
                    return {
                        caseId: row.caseId,
                        caseTitle: row.caseTitle,
                        lotID: row.lotID,
                        contractNumber: row.contractNumber,
                        caseStatus: row.caseStatus,
                        exactStatus: row.exactStatus,
                        parties: caseParties
                    };
                });

                res.json({ parties, cases: caseDetails });
            });
        });
    });
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
