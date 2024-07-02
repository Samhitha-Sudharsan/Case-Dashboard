const mysql = require('mysql');
const xlsx = require('xlsx');

const connection = mysql.createConnection({
  host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
  user: 'justact',
  password: 'justact123!',
  database: 'justact_staging'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  const userEmail = 'anandsingh039@gmail.com';

  const query1 = `
    SELECT agentId, partyid, agentCaseIds
    FROM mis_party_agents
    WHERE agentEmail = ?
  `;

  connection.query(query1, [userEmail], function(err, results) {
    if (err) throw err;
    if (results.length === 0) {
      console.log("No agents found for this email");
      connection.end();
      return;
    }

    const agentData = results;
    let allCaseIds = [];

    agentData.forEach(agent => {
      if (agent.agentCaseIds) {
        const caseIds = JSON.parse(agent.agentCaseIds);
        allCaseIds = allCaseIds.concat(caseIds.map(caseId => ({
          agentId: agent.agentId,
          partyid: agent.partyid,
          caseId: caseId
        })));
      }
    });

    if (allCaseIds.length === 0) {
      console.log("No case IDs found for the agents");
      connection.end();
      return;
    }

    const caseIdList = allCaseIds.map(item => item.caseId);
    const query2 = `
      SELECT caseId, caseTitle, case_created_at, totalClaimValue, hearingDatesSet, parties,
            borrowerName, contractNumber, arbitratorName, caseStatus,
            firstNoticeDate, secondNoticeDate, thirdNoticeDate,
            firstNoticeDispatchDate, secondNoticeDispatchDate, thirdNoticeDispatchDate,
            Sec17raisedDate, Sec17type, Sec17petitionDate,
            awardDate, awardDispatchDate, Sec21dispatchDate, lotID
      FROM mis_cases_parties
      WHERE caseId IN (?)
    `;

    connection.query(query2, [caseIdList], function(err, caseResults) {
      if (err) throw err;
      console.log("Retrieved case data successfully");

      const caseDataMap = caseResults.reduce((acc, caseItem) => {
        acc[caseItem.caseId] = caseItem;
        return acc;
      }, {});

      const workbook = xlsx.utils.book_new();
      const worksheetData = [
        [
          'CASE ID', 'CASE TITLE', 'DATE OF CREATION', 'TOTAL CLAIM VALUE',
          'HEARING DATES', 'AGENT ID', 'PARTY ID', 'BORROWER NAME', 'CONTRACT NUMBER',
          'ARBITRATOR NAME', 'CASE STATUS', 'FIRST NOTICE DATE', 'SECOND NOTICE DATE',
          'THIRD NOTICE DATE', 'FIRST NOTICE DISPATCH DATE', 'SECOND NOTICE DISPATCH DATE',
          'THIRD NOTICE DISPATCH DATE', 'SECTION 17 RAISED DATE', 'SECTION 17 TYPE',
          'SECTION 17 PETITION DATE', 'AWARD DATE', 'AWARD DISPATCH DATE', 'SECTION 21 DISPATCH DATE','LOTID'
        ]
      ];

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      allCaseIds.forEach(item => {
        const caseData = caseDataMap[item.caseId];
        if (caseData) {
          worksheetData.push([
            caseData.caseId ? caseData.caseId.toString() : '',
            caseData.caseTitle ? caseData.caseTitle : '',
            caseData.case_created_at ? formatDate(caseData.case_created_at) : '',
            caseData.totalClaimValue ? caseData.totalClaimValue.toString() : '',
            caseData.hearingDatesSet ? caseData.hearingDatesSet.toString() : '',
            item.agentId.toString(),
            item.partyid.toString(),
            caseData.borrowerName ? caseData.borrowerName : '',
            caseData.contractNumber ? caseData.contractNumber : '',
            caseData.arbitratorName ? caseData.arbitratorName : '',
            caseData.caseStatus ? caseData.caseStatus : '',
            caseData.firstNoticeDate ? caseData.firstNoticeDate : '',
            caseData.secondNoticeDate ? caseData.secondNoticeDate : '',
            caseData.thirdNoticeDate ? caseData.thirdNoticeDate : '',
            caseData.firstNoticeDispatchDate ? caseData.firstNoticeDispatchDate : '',
            caseData.secondNoticeDispatchDate? caseData.secondNoticeDispatchDate : '',
            caseData.thirdNoticeDispatchDate? caseData.thirdNoticeDispatchDate : '',
            caseData.Sec17raisedDate? caseData.Sec17raisedDate : '',
            caseData.Sec17Type? caseData.Sec17Type : '',
            caseData.Sec17petitionDate? caseData.Sec17petitionDate : '',
            caseData.awardDate? caseData.awardDate : '',
            caseData.awardDispatchDate? caseData.awardDispatchDate : '',
            caseData.Sec21DispatchDate? caseData.Sec21DispatchDate : '',
            caseData.lotID? caseData.lotID : ''
          ]);
        }
      });

      const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

      // Apply bold styling to the header row
      const headerRange = xlsx.utils.decode_range(worksheet['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cell_address = xlsx.utils.encode_cell({ c: C, r: 0 });
        if (!worksheet[cell_address]) continue;
        worksheet[cell_address].s = {
          font: {
            bold: true
          }
        };
      }

      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate XLS file
      const wbout = xlsx.write(workbook, {
        bookType: "xls",
        type: "binary"
      });

      // Return the generated XLS file data
      return wbout;
    });
  });
});

const MIS = {
  getCaseData: function() {
    return wbout;
  }
};

module.exports = MIS;