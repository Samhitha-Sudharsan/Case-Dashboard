const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
  user: 'justact',
  password: 'justact123!',
  database: 'justact_staging'
});

const qry = `
  CREATE TABLE IF NOT EXISTS mis_cases_parties (

    caseId varchar(255) PRIMARY KEY,
    caseTitle varchar(255),
    case_created_at datetime,
    parties json,
    borrowerName varchar(255),
    contractNumber varchar(255),

    caseOwnerId int ,   
    
    totalClaimValue decimal(17,4),
    hearingDatesSet json,
    arbitratorName varchar(255),
    caseStatus enum('pending','draft','completed'),
    exactStatus enum('draft','pendingRegistrationFee','awaitingRespondentAcceptance','negotiationOngoing','negotiationReached','claimantPaidNegotiationSuccessFee','respondentPaidNegotiationSuccessFee','bothPaidNegotiationSuccessFee','quitByClaimant','quitByRespondent','respondentDeniedAcceptance','closedByCaseManager','arbitrationReference','noticeToArbitrate','appointmentOfArbitrator','acceptanceByArbitrator','firstHearingIntimation','filingStatementofClaim','filingofSection17','section17OrderPassed','filingofStatementofDefence','rejoinderfromClaimant','surrejoinderFromRespondent','2ndNoticeMOM','crossExaminationClaimantWitness','crossExaminationRespondentWitness','arguments','finalAward','reservedForAward','waitingForCaseApproval','waitingForArbitratorConfirmation'),
    noticeDates datetime,
    noticeDispatchDates datetime,
    Sec17raisedDate datetime,
    Sec17type varchar(255),
    Sec17petitionDate datetime,
    awardDate datetime,
    awardDispatchDate datetime,
    Sec21dispatchDate datetime,
    firstNoticeDate datetime,
    secondNoticeDate datetime,
    thirdNoticeDate datetime,
    firstNoticeDispatchDate datetime,
    secondNoticeDispatchDate datetime,
    thirdNoticeDispatchDate datetime,
    lotID varchar(255)

  );
`;


// partyRole enum("claimant","respondent"),
//     partykind enum("individual","organization","others"),
//     partyname varchar(255),


const qry2 = `
  CREATE TABLE IF NOT EXISTS mis_party_agents (
    
    partyid int ,
    partyname varchar(255),
    agentrole enum("primary","normal"),
    agentId int ,
    agentCaseIds json,
    agentEmail varchar(255)

  );
`;



const query = `
  INSERT INTO mis_cases_parties (caseId, case_created_at,caseTitle, borrowerName, caseOwnerId, totalClaimValue, hearingDatesSet, contractNumber,caseStatus, exactStatus)
  SELECT id, created_at, title, respondentName, ownerId, totalClaimValue, hearingDatesSet, loanAccountNo, summaryStatus, status
  FROM cases
  ON DUPLICATE KEY UPDATE case_created_at = VALUES(case_created_at), caseId = VALUES(caseId), caseTitle = VALUES(caseTitle), borrowerName = VALUES(borrowerName), contractNumber = VALUES(contractNumber), caseStatus = VALUES(caseStatus), exactStatus = VALUES(exactStatus);
`;



//Take caseId from mis_case_parties , check caseId in case_parties , collect all the partyIds and partyRoles corresponding to th erelevant caseId tyhen go and get party name and partykind for those partyIds from the patries table and make it as a json , for eg:  {{partyid:1,partyrole:"respondent",partykind:"organization", partyname: "Anand"}, {partyid:2,partyrole:"respondent",partykind:"individual", partyname: "Samhitha"}} for caseId 1 . parties json will be of the form {{parttyid:int, partrole : enum("respondent","claimant"), partykind : enum('individual','organization','others'), partyname: varchar(255)}}. partykind and partyname is stored as kind and name in parties. partyrole and partyid is stored as partyId and partyRole in case_parties. 



 const query2 = `
  UPDATE mis_cases_parties mc
  JOIN (
    SELECT 
      cp.caseId,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'partyid', cp.partyId,
          'partyrole', cp.partyRole,
          'partykind', p.kind,
          'partyname', p.name
        )
      ) AS parties
    FROM case_parties cp
    JOIN parties p ON cp.partyId = p.id
    GROUP BY cp.caseId
  ) AS temp ON mc.caseId = temp.caseId
  SET mc.parties = temp.parties;
`;

// need to check if there is more than one partyId alloted for a given caseId by checking all instances of the caseId in case_parties table nd if multiple partties exist they should also be included in the json with partyId1 and partyId2 as two seperate gropus inside the parties json. current code only considers only the first occurence of the caseId in case_parties table and takes the partyId corresponding only to the first. Its almost like a nested json object







const query3 = `
  INSERT INTO mis_party_agents (partyid, agentrole, agentId, agentEmail)
  SELECT a.partyId, a.role, a.id, a.email
  FROM agents a
  ON DUPLICATE KEY UPDATE partyid = VALUES(partyid), agentrole = VALUES(agentrole), agentId = VALUES(agentId), agentEmail = VALUES(agentEmail);
`;



const query4 = `
  UPDATE mis_party_agents mpa
  JOIN parties p ON mpa.partyid = p.id
  SET mpa.partyname = p.name;
`;




const query5 = `
  UPDATE mis_party_agents mpa
  JOIN agents a ON mpa.agentId = a.id
  SET mpa.agentCaseIds = (
    CASE
      WHEN a.caseIds IS NULL THEN (
        SELECT JSON_ARRAYAGG(cp.caseId)
        FROM case_parties cp
        WHERE cp.partyId = mpa.partyid
      )
      WHEN a.caseIds = '[]' THEN '[]'
      ELSE a.caseIds
    END
  );
`;

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
connection.query(qry, function(err, result) {
      if (err) throw err;
      console.log("Created table successfully");
    });
connection.query(qry2, function(err, result) {
      if (err) throw err;
      console.log("Created table successfully");
    });
connection.query("SHOW TABLES;", function(err, result) {
      if (err) throw err;
      console.log("Showing tables\n");
      for (var i = 0; i < result.length; i++) {
      //   console.log(JSON.stringify(result[i]));
      }
    });
    connection.end();
  });

connection.query(query, function(err, result) {
    if (err) console.log(err);
    console.log("Inserted caseNo, caseTitle,contractnumber and case_created_at successfully");
  });

connection.query(query2, function(err, result) {
    if (err) throw err;
    console.log("Inserted parties successfully");
  });
connection.query(query3, function(err, result) {
    if (err) throw err;
    console.log("Inserted partyId,  agentrole, agentId, agentEmail into mis_party_agents successfully");
  });

connection.query(query4, function(err, result) {
    if (err) throw err;
    console.log("Updated partyname in mis_party_agents successfully");
  });
  


connection.query(query5, function(err, result) {
  if (err) throw err;
  console.log("Updated agentCaseIds in mis_party_agents successfully");
});



//once the user logs in, check the useremail and match it with the agentemail in mis_party_agents , check fro each instance of the agenemail and get the agentids assocuated with that email. CHerck the agentcaseId associated with each of the agentIds, agentcaseId is a json of the form [1,2,3], extract each one of the caseIds in the jsopn object and for each of the caseIds , get all the appropriate information regarding that caseId from the mis_case_party table and add them all under appropraite columns in an excel sheet with the column names in bold


// match partyId with partyname from parties table and insert partyname corresponding to the partyid column into mis_party_agents

//match aganetid from mis_party_agents with id from agents , check caseIds json in agents table. if caseId is NULL it means all cases under that partyId should be included in the agentcaseId json of the mis_party_agents, if caseId from agents table is [] , then agentscaseIds json of mis_party_agents should also be [], if caseIds is ana rray with with integers in it, the same array should be inserted under mis_party_agents too You can get all the cases under the partyId by checking for all the caseIds corresponding to all instances of the partyId in case_parties table. Overall agentcaseIds will be a json array of the form [caseId1 int, caseId2 int, etc.]

// const query2 = `
//   UPDATE mis_cases_parties mc
//   SET mc.parties = (
//     SELECT GROUP_CONCAT(
//       CONCAT('{"partyid":', cp.partyId, ', "partyrole":"', cp.partyRole, '", "partykind":"', p.kind, '", "partyname":"', p.name, '"}')
//     )
//     FROM case_parties cp
//     JOIN parties p ON cp.partyId = p.id
//     WHERE cp.caseId = mc.caseId
//     GROUP BY cp.caseId
//   )
//   WHERE mc.caseId IN (SELECT caseId FROM mis_cases_parties);
// `












// const query = `
//   UPDATE mis_cases_parties mc
//   JOIN case_parties c ON mc.partyid = c.partyId
//   JOIN case_parties c2 ON mc.caseNo = c2.caseId
//   SET mc.partyRole = c.partyRole;
// `;

// connection.query(query, function(err, result) {
//   if (err) throw err;
//   console.log("Updated cases successfully");
// });


/*
userId , userEmail , userName, userRole : users
partyId , agentrole, agentId, agentCaseIds : agents
PartyRole : case_parties
case_created_at, totalClaimValue ,caseNo, caseTitle,  caseOwnerId, hearingDatesSet : cases
partykind , partyname : parties

requestedMediators is a json file in which we have multiple arbitrator names and their other details stored
*/

// const query = `
//   INSERT INTO mis_details (caseNo, case_created_at)
//   SELECT id, created_at
//   FROM cases
//   ON DUPLICATE KEY UPDATE case_created_at = VALUES(case_created_at);
// `;

// connection.query(query, function(err, result) {
//   if (err) throw err;
//   console.log("Inserted caseNo and case_created_at successfully");
// });

// const queryParty = `
//   INSERT INTO mis_details (PartyRole, partyid)
//   SELECT cp.partyRole, cp.partyId
//   FROM case_parties cp
//   WHERE cp.caseId IN (SELECT caseNo FROM mis_details)
//   ON DUPLICATE KEY UPDATE PartyRole = VALUES(PartyRole), partyid = VALUES(partyid);
// `;
// connection.query(queryParty, function(err, result) {
//   if (err) throw err;
//   console.log("Inserted partyrole and partyid after matching case numbers successfully");
// });


// const query = `
//   UPDATE mis_details md
//   JOIN agents a ON md.partyid = a.partyId
//   JOIN agents a ON md.agentrole = a.role
//   JOIN agents a ON md.agentCaseIds = 
//   SET md.agentId = a.id;
// `;

// connection.query(query, function(err, result) {
//   if (err) throw err;
//   console.log("Updated case_created_at successfully");
// });

// const queryParty = `
//   UPDATE mis_details md
//   JOIN case_parties cp ON md.caseNo = cp.caseId
//   SET md.PartyRole = cp.partyRole, md.partyid = cp.partyId;
// `;
// connection.query(queryParty, function(err, result) {
//   if (err) throw err;
//   console.log("Updated partyrole and partyid after matching case numbers successfully");
// });
