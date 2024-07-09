// Umbrella groups mapping (unchanged)
const umbrellaGroups = {
  'Case preparation': [
      'Draft',
      'pendingRegistrationFee',
      'waitingForCaseApproval',
      'waitingForArbitratorConfirmation',
      'awaitingRespondentAcceptance'
  ],
  'Notice to Arbitrate': [
      'arbitrationReference',
      'noticeToArbitrate',
      'appointmentOfArbitrator',
      'acceptanceByArbitrator'
  ],
  'Award': [
      'finalAward',
      'reservedForAward'
  ],
  'Success': [
      'negotiationReached'
  ],
  'Settled': [
      'claimantPaidNegotiationSuccessFee',
      'respondentPaidNegotiationSuccessFee',
      'bothPaidNegotiationSuccessFee'
  ],
  'Withdrawn': [
      'quitByClaimant',
      'quitByRespondent'
  ],
  'Resolution Failed': [
      'respondentDeniedAcceptance',
      'closedByCaseManager'
  ],
  'Case In progress': [
      'negotiationOngoing',
      'firstHearingIntimation',
      'filingStatementofClaim',
      'filingofStatementofDefence',
      'rejoinderfromClaimant',
      'surrejoinderFromRespondent',
      '2ndNoticeMOM',
      'crossExaminationClaimantWitness',
      'crossExaminationRespondentWitness',
      'Arguments'
  ],
  'Section 17': [
      'filingofSection17',
      'section17OrderPassed'
  ]
};

let casesData = []; // Store all cases data globally

$(document).ready(function() {
  $('#party-name').multiselect({
      includeSelectAllOption: true,
      enableFiltering: true,
      maxHeight: 200
  });

  // Function to fetch and populate data (unchanged)
  function fetchAndPopulateData() {
      const fromDate = $('#from-date').val();
      const toDate = $('#to-date').val();
      const fromCaseID = $('#from-case-id').val().trim();
      const toCaseID = $('#to-case-id').val().trim();

      if (fromDate && toDate) {
          $.ajax({
              url: 'http://localhost:3000/api/get-parties-and-cases',
              method: 'GET',
              data: {
                  from: fromDate,
                  to: toDate,
                  fromCaseID: fromCaseID || null,
                  toCaseID: toCaseID || null
              },
              success: function(data) {
                  const parties = data.parties;
                  casesData = data.cases;

                  const partySelect = $('#party-name');
                  // partySelect.empty();
                  parties.forEach(party => {
                      const option = $('<option></option>').text(party).val(party);
                      partySelect.append(option);
                  });
                  partySelect.multiselect('rebuild');

                  populateLotIDDropdown(parties);

                  $('#apply-filter').off('click').on('click', function() {
                      const selectedParties = $('#party-name').val();
                      const selectedLotId = $('#lot-id').val();
                      const selectedCaseStatus = $('#case-status').val();

                      const filteredCases = casesData.filter(caseDetail => {
                          const caseIDInRange = (
                              (!fromCaseID || parseInt(caseDetail.caseId) >= parseInt(fromCaseID)) &&
                              (!toCaseID || parseInt(caseDetail.caseId) <= parseInt(toCaseID))
                          );

                          return caseDetail.parties.some(party => selectedParties.includes(party)) &&
                              filterByCaseStatus(caseDetail.caseStatus, selectedCaseStatus) &&
                              (selectedLotId.includes('None') || selectedLotId.includes(caseDetail.lotID)) &&
                              caseIDInRange;
                      });

                      updateDataTable(filteredCases);

                      if (selectedLotId.includes('None')) {
                          $('#status-pie-chart').hide();
                      } else {
                          updatePieChart(selectedLotId, filteredCases);
                        //   $('#status-pie-chart').show();
                      }
                  });

                  $('#apply-filter').click();
              },
              error: function(err) {
                  console.error('Error fetching data:', err);
              }
          });
      }
  }

  // Function to filter by case status (unchanged)
  function filterByCaseStatus(caseStatus, selectedCaseStatus) {
      switch (selectedCaseStatus) {
          case '':
          case 'All':
              return true;
          case 'Draft':
              return caseStatus === 'draft';
          case 'In Progress':
              return caseStatus === 'pending';
          case 'Completed':
              return caseStatus === 'completed';
          default:
              return false;
      }
  }

  // Function to populate Lot ID dropdown
  function populateLotIDDropdown(parties) {
      const lotSelect = $('#lot-id');
      lotSelect.empty();

      // Add "None" option as the first option
      lotSelect.append($('<option></option>').text('None').val('None'));

      const lotIds = new Set();
      casesData.forEach(caseDetail => {
          if (parties.some(party => caseDetail.parties.includes(party))) {
              lotIds.add(caseDetail.lotID);
          }
      });

      lotIds.forEach(lotID => {
          const option = $('<option></option>').text(lotID).val(lotID);
          lotSelect.append(option);
      });

      lotSelect.multiselect('rebuild');
  }

  // Function to update DataTable with filtered cases
  function updateDataTable(filteredCases) {
      const table = $('#cases-table').DataTable();
      table.clear().draw();

      filteredCases.forEach(caseDetail => {
          table.row.add([
              caseDetail.lotID,
              caseDetail.caseId,
              caseDetail.caseTitle,
              caseDetail.contractNumber,
              caseDetail.caseStatus,
              caseDetail.exactStatus
          ]).draw();
      });
      $('#filtered-cases-count').text(`Showing ${filteredCases.length} cases`);
  }

  // Function to update pie chart with filtered cases
  function updatePieChart(selectedLotIds, filteredCases) {
      const umbrellaCounts = {};
      Object.keys(umbrellaGroups).forEach(group => {
          umbrellaCounts[group] = 0;
      });

      filteredCases.forEach(caseDetail => {
          Object.keys(umbrellaGroups).forEach(group => {
              if (umbrellaGroups[group].includes(caseDetail.exactStatus) && selectedLotIds.includes(caseDetail.lotID)) {
                  umbrellaCounts[group]++;
              }
          });
      if ($('#chart-icon').hasClass('active')) {
        $('.chart-container').show();
        $('#status-pie-chart').show();
        const ctx = document.getElementById('status-pie-chart').getContext('2d');
      }
      });

      const groupLabels = Object.keys(umbrellaCounts);
      const groupData = Object.values(umbrellaCounts);

      const ctx = document.getElementById('status-pie-chart').getContext('2d');
      if (window.statusPieChart) {
          window.statusPieChart.destroy();
      }
      window.statusPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: groupLabels,
              datasets: [{
                  label: 'Status Distribution',
                  data: groupData,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                      'rgba(255, 159, 64, 0.8)',
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                  ],
                  borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false
          }
      });
  }

  // Event listeners for changes in filter inputs (unchanged)
  $('#from-date, #to-date, #from-case-id, #to-case-id').on('change', fetchAndPopulateData);
  $('#party-name').change(function() {
      fetchAndPopulateData();
  });

  // Initialize on page load
  fetchAndPopulateData();
});
const chartIcon = $('<button id="chart-icon" class="btn btn-secondary"><img src="https://cdn-icons-png.freepik.com/512/423/423786.png" width="20" height="20" alt="Pie Chart Icon"></button>');

$('#apply-filter').after(chartIcon);

$('#chart-icon').on('click', function() {
    $(this).toggleClass('active');
    $('#status-pie-chart').toggle();
});