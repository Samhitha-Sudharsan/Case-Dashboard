const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
    user: 'justact',
    password: 'justact123!',
    database: 'justact_staging',
    acquireTimeout: 1000000,
    connectTimeout: 1000000
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
 
