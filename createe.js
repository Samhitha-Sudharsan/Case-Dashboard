const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
  user: 'justact',
  password: 'justact123!',
  database: 'justact_staging'
});

const qry1 = `
  CREATE TABLE IF NOT EXISTS mis_cases_parties (
    caseId varchar(255),
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

const insertCasesQuery = `
  INSERT INTO mis_cases_parties (caseId, case_created_at, caseTitle, borrowerName, caseOwnerId, totalClaimValue, hearingDatesSet, contractNumber, caseStatus, exactStatus)
  SELECT id, created_at, title, respondentName, ownerId, totalClaimValue, hearingDatesSet, loanAccountNo, summaryStatus, status
  FROM cases
  ON DUPLICATE KEY UPDATE 
    case_created_at = VALUES(case_created_at), 
    caseId = VALUES(caseId), 
    caseTitle = VALUES(caseTitle), 
    borrowerName = VALUES(borrowerName), 
    contractNumber = VALUES(contractNumber), 
    caseStatus = VALUES(caseStatus), 
    exactStatus = VALUES(exactStatus);
`;

const updatePartiesQuery = `
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

const insertAgentsQuery = `
  INSERT INTO mis_party_agents (partyid, agentrole, agentId, agentEmail)
  SELECT a.partyId, a.role, a.id, a.email
  FROM agents a
  ON DUPLICATE KEY UPDATE 
    partyid = VALUES(partyid), 
    agentrole = VALUES(agentrole), 
    agentId = VALUES(agentId), 
    agentEmail = VALUES(agentEmail);
`;

const updateAgentPartyNameQuery = `
  UPDATE mis_party_agents mpa
  JOIN parties p ON mpa.partyid = p.id
  SET mpa.partyname = p.name;
`;

const updateAgentCaseIdsQuery = `
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

const updateLotIDQuery = `
UPDATE mis_cases_parties mc
JOIN parties p ON mc.partyid = p.id
SET mc.lotID = CONCAT(p.name, '_', DATE_FORMAT(mc.case_created_at, '%Y%m%d'));
`;

// Connecting and executing queries
connection.connect(function(err) {
if (err) throw err;
console.log("Connected!");

connection.query(qry1, function(err, result) {
  if (err) throw err;
  console.log("Created mis_cases_parties table successfully");

  connection.query(qry2, function(err, result) {
    if (err) throw err;
    console.log("Created mis_party_agents table successfully");

    connection.query(insertCasesQuery, function(err, result) {
      if (err) throw err;
      console.log("Inserted cases successfully");

      connection.query(updatePartiesQuery, function(err, result) {
        if (err) throw err;
        console.log("Updated parties successfully");

        connection.query(insertAgentsQuery, function(err, result) {
          if (err) throw err;
          console.log("Inserted agents successfully");

          connection.query(updateAgentPartyNameQuery, function(err, result) {
            if (err) throw err;
            console.log("Updated agent party names successfully");

            connection.query(updateAgentCaseIdsQuery, function(err, result) {
              if (err) throw err;
              console.log("Updated agent case IDs successfully");

              connection.query(updateLotIDQuery, function(err, result) {
                if (err) throw err;
                console.log("Updated lotID successfully");

                connection.query("SHOW TABLES;", function(err, result) {
                  if (err) throw err;
                  console.log("Showing tables\n");
                  for (var i = 0; i < result.length; i++) {
                    console.log(JSON.stringify(result[i]));
                  }
                  connection.end();
                });
              });
            });
          });
        });
      });
    });
  });
});
});




const retryQuery = (query, retries = 3) => {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      connection.query(query, (err, result) => {
        if (err) {
          if ((err.code === 'ER_LOCK_WAIT_TIMEOUT' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') && retries > 0) {
            console.log(`Timeout error, retrying... (${retries} retries left)`);
            retries--;
            setTimeout(attempt, 1000);
          } else {
            reject(err);
          }
        } else {
          resolve(result);
        }
      });
    };
    attempt();
  });
};

const processInBatches = async (batchSize = 1000) => {
    let offset = 0;
    let totalProcessed = 0;
    let continueProcessing = true;
  
    while (continueProcessing) {
      const selectQuery = `
        SELECT cp.caseId, p.name AS partyname, mc.case_created_at
        FROM case_parties cp
        JOIN parties p ON cp.partyId = p.id
        JOIN mis_cases_parties mc ON cp.caseId = mc.caseId
        WHERE cp.partyRole = 'claimant'
        LIMIT ${batchSize} OFFSET ${offset};
      `;
  
      try {
        const result = await retryQuery(selectQuery);
        if (result.length === 0) {
          continueProcessing = false; // No more data to process
          break;
        }
  
        const batchData = result.map(row => ({
          caseId: row.caseId,
          lotID: `${row.partyname}_${row.case_created_at.toISOString().split('T')[0].replace(/-/g, '')}`
        }));
  
        for (const data of batchData) {
          const updateQuery = `
            UPDATE mis_cases_parties 
            SET lotID = '${data.lotID}' 
            WHERE caseId = '${data.caseId}';
          `;
          console.log(`Executing: ${updateQuery}`); // Log the query for debugging
          await retryQuery(updateQuery);
        }
  
        totalProcessed += batchData.length;
        offset += batchSize;
      } catch (err) {
        console.error("An error occurred:", err);
        continueProcessing = false;
      }
    }
  
    return totalProcessed;
  };
  
const createTables = async () => {
  const queries = [
    `
    CREATE TABLE IF NOT EXISTS mis_cases_parties (
      caseId varchar(255),
      caseTitle varchar(255),
      case_created_at datetime,
      parties json,
      borrowerName varchar(255),
      contractNumber varchar(255),
      caseOwnerId int,
      totalClaimValue decimal(17,4),
      hearingDatesSet json,
      arbitratorName varchar(255),
      caseStatus varchar(255),
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
    `,
    `
    CREATE TABLE IF NOT EXISTS mis_party_agents (
      partyid int,
      partyname varchar(255),
      agentrole enum('primary','normal'),
      agentId int,
      agentCaseIds json,
      agentEmail varchar(255)
    );
    `
  ];

  for (const query of queries) {
    await retryQuery(query);
  }
};



const main = async () => {
  connection.connect(async function (err) {
    if (err) throw err;
    console.log("Connected!");

    try {
      await createTables();
      console.log("Tables created successfully");

      const totalUpdated = await processInBatches();
      console.log(`Updated lotID column in mis_cases_parties successfully for ${totalUpdated} rows`);
    } catch (err) {
      console.error("An error occurred:", err);
    } finally {
      connection.end();
    }
  });
};

main();
 