
// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
  
//     // Create tables
//     connection.query(qry, function(err, result) {
//       if (err) throw err;
//       console.log("Created table mis_cases_parties successfully");
  
//       connection.query(qry2, function(err, result) {
//         if (err) throw err;
//         console.log("Created table mis_party_agents successfully");
  
//         // Insert data into tables
//         connection.query(query, function(err, result) {
//           if (err) throw err;
//           console.log("Inserted caseNo, caseTitle, contract number, case_created_at, caseStatus, and exactStatus successfully");
  
//           // Execute other queries
//           connection.query(query2, function(err, result) {
//             if (err) throw err;
//             console.log("Inserted parties successfully");
  
//             connection.query(query3, function(err, result) {
//               if (err) throw err;
//               console.log("Inserted partyId,  agentrole, agentId, agentEmail into mis_party_agents successfully");
  
//               connection.query(query4, function(err, result) {
//                 if (err) throw err;
//                 console.log("Updated partyname in mis_party_agents successfully");
  
//                 connection.query(query5, function(err, result) {
//                   if (err) throw err;
//                   console.log("Updated agentCaseIds in mis_party_agents successfully");
  
//                   connection.end();
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });