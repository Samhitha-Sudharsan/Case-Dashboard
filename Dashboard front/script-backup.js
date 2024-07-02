$(document).ready(function() {
  
  $('#party-name').multiselect({
    includeSelectAllOption: true,
    enableFiltering: true,
    maxHeight: 200,
    onChange: function(option, checked) {
      fetchAndPopulateData();
    }
  });

  
  $('#cases-table').DataTable({
    columns: [
      { title: 'Case ID' },
      { title: 'Case Title' },
      { title: 'Lot ID' },
      { title: 'Parties' },
      { title: 'Case Status' }
    ]
  });

  
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

          
          const partySelect = $('#party-name');
          // partySelect.empty();
          parties.forEach(party => {
            const option = $('<option></option>').text(party).val(party);
            partySelect.append(option);
          });
          partySelect.multiselect('rebuild');

          
          $('#apply-filter').off('click').on('click', function() {
            const selectedParties = $('#party-name').val();
            const selectedCaseStatus = $('#case-status').val();

            const filteredCases = cases.filter(caseDetail => {
              return caseDetail.parties.some(party => selectedParties.includes(party)) &&
                filterByCaseStatus(caseDetail.caseStatus, selectedCaseStatus);
            });

            
            $('#cases-table').DataTable().clear().draw();

            
            filteredCases.forEach(caseDetail => {
              $('#cases-table').DataTable().row.add([
                caseDetail.caseId,
                caseDetail.caseTitle,
                caseDetail.lotID,
                caseDetail.parties.join(', '),
                caseDetail.caseStatus
              ]).draw();
            });
          });

          
          $('#apply-filter').click();
        },
        error: function(err) {
          console.error('Error fetching data:', err);
        }
      });
    }
  }

  
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

  
  $('#from-date, #to-date').on('change', fetchAndPopulateData);
});
