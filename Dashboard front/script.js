$(document).ready(function() {
  // Initialize Multiselect plugin
  $('#party-name').multiselect({
    includeSelectAllOption: true,
    enableFiltering: true,
    maxHeight: 200,
    onChange: function(option, checked) {
      applyFilters();
    }
  });

  // Initialize DataTable with empty dataset and columns
  $('#cases-table').DataTable({
    columns: [
      { title: 'Case ID' },
      { title: 'Case Title' },
      { title: 'Lot ID' },
      { title: 'Parties' },
      { title: 'Case Status' }
    ]
  });

  // Function to fetch and populate data
  function fetchAndPopulateData() {
    const fromDate = $('#from-date').val();
    const toDate = $('#to-date').val();

    if (fromDate && toDate) {
      $.ajax({
        url: 'http://localhost:3000/api/get-parties-and-cases',
        method: 'GET',
        data: {
          from: fromDate,
          to: toDate
        },
        success: function(data) {
          const parties = data.parties;
          const cases = data.cases;

          // Clear and rebuild party name options
          const partySelect = $('#party-name');
          partySelect.empty();
          parties.forEach(party => {
            const option = $('<option></option>').text(party).val(party);
            partySelect.append(option);
          });
          partySelect.multiselect('rebuild');

          // Store cases data for filtering
          $('#cases-table').data('cases', cases);

          // Apply initial filters
          applyFilters();
        },
        error: function(err) {
          console.error('Error fetching data:', err);
        }
      });
    }
  }

  // Function to filter cases by status
  function filterByCaseStatus(caseStatus, selectedCaseStatus) {
    switch (selectedCaseStatus) {
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

  // Function to apply filters
  function applyFilters() {
    const selectedParties = $('#party-name').val() || [];
    const selectedCaseStatus = $('#case-status').val() || 'All';

    const cases = $('#cases-table').data('cases') || [];

    const filteredCases = cases.filter(caseDetail => {
      const partyMatch = selectedParties.length === 0 || caseDetail.parties.some(party => selectedParties.includes(party));
      const statusMatch = filterByCaseStatus(caseDetail.caseStatus, selectedCaseStatus);
      return partyMatch && statusMatch;
    });

    // Clear existing DataTable rows
    $('#cases-table').DataTable().clear().draw();

    // Populate DataTable with filtered cases
    filteredCases.forEach(caseDetail => {
      $('#cases-table').DataTable().row.add([
        caseDetail.caseId,
        caseDetail.caseTitle,
        caseDetail.lotID,
        caseDetail.parties.join(', '),
        caseDetail.caseStatus
      ]).draw();
    });
  }

  // Bind date change event to fetch data
  $('#from-date, #to-date').on('change', fetchAndPopulateData);

  // Bind case status change event to apply filters
  $('#case-status').on('change', applyFilters);

  // Initial data fetch
  fetchAndPopulateData();
});
