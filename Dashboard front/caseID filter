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
              fromCaseID: fromCaseID || null, // Send null if empty
              toCaseID: toCaseID || null // Send null if empty
          },
          success: function(data) {
              const parties = data.parties;
              casesData = data.cases; // Store cases data globally

              const partySelect = $('#party-name');
              parties.forEach(party => {
                  const option = $('<option></option>').text(party).val(party);
                  partySelect.append(option);
              });
              partySelect.multiselect('rebuild');

              // Populate lotID dropdown based on selected parties
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
                          (selectedLotId === '' || selectedLotId === caseDetail.lotID) &&
                          caseIDInRange;
                  });

                  // Update DataTable with filtered cases
                  updateDataTable(filteredCases);

                  // Update pie chart
                  updatePieChart(filteredCases);
              });

              // Auto-apply filter when data is fetched
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

// Function to populate lotID dropdown based on selected parties (unchanged)
function populateLotIDDropdown(parties) {
  const lotSelect = $('#lot-id');
  lotSelect.empty();

  const selectedParties = $('#party-name').val();
  const lotIds = new Set();
  casesData.forEach(caseDetail => {
      if (caseDetail.parties.some(party => selectedParties.includes(party))) {
          lotIds.add(caseDetail.lotID);
      }
  });

  lotIds.forEach(lotID => {
      const option = $('<option></option>').text(lotID).val(lotID);
      lotSelect.append(option);
  });
  lotSelect.multiselect('rebuild');
}

// Function to update DataTable with filtered cases (unchanged)
function updateDataTable(filteredCases) {
  $('#cases-table').DataTable().clear().draw();

  filteredCases.forEach(caseDetail => {
      $('#cases-table').DataTable().row.add([
          caseDetail.lotID,
          caseDetail.caseId,
          caseDetail.caseTitle,
          caseDetail.contractNumber,
          caseDetail.caseStatus,
          caseDetail.exactStatus // Add exactStatus as Umbrella Status column
      ]).draw();
  });
}

// Function to update pie chart with filtered cases (unchanged)
function updatePieChart(filteredCases) {
  const umbrellaCounts = {};
  Object.keys(umbrellaGroups).forEach(group => {
      umbrellaCounts[group] = 0;
  });

  filteredCases.forEach(caseDetail => {
      Object.keys(umbrellaGroups).forEach(group => {
          if (umbrellaGroups[group].includes(caseDetail.exactStatus)) {
              umbrellaCounts[group]++;
          }
      });
  });

  const groupLabels = Object.keys(umbrellaCounts);
  const groupData = Object.values(umbrellaCounts);

  const ctx = document.getElementById('status-pie-chart').getContext('2d');
  if (window.statusPieChart) {
      window.statusPieChart.destroy(); // Destroy existing chart if it exists
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

$('#from-date, #to-date, #from-case-id, #to-case-id').on('change', fetchAndPopulateData);
$('#party-name').change(function() {
  fetchAndPopulateData();
  populateLotIDDropdown($('#party-name').val());
});

// Initialize DataTable with empty dataset and columns
$('#cases-table').DataTable({
  columns: [
      { title: 'Lot ID' },
      { title: 'Case ID' },
      { title: 'Case Name' },
      { title: 'Contract Number' },
      { title: 'Case Status' },
      { title: 'Umbrella Status' } // Add Umbrella Status column
  ]
});
