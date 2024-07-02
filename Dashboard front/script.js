$(document).ready(function() {
    $('#party-name').multiselect({
      includeSelectAllOption: true,
      enableFiltering: true,
      maxHeight: 200
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
            partySelect.empty(); // Clear existing options
            parties.forEach(party => {
              const option = $('<option></option>').text(party).val(party);
              partySelect.append(option);
            });
            partySelect.multiselect('rebuild');
  
            $('#apply-filter').off('click').on('click', function() {
              const selectedParties = $('#party-name').val();
              const filteredCases = cases.filter(caseDetail => {
                return caseDetail.parties.some(party => selectedParties.includes(party));
              });
  
              const tableBody = $('#cases-table-body');
              tableBody.empty(); // Clear existing rows
              filteredCases.forEach(caseDetail => {
                const row = $('<tr></tr>');
                row.append($('<td></td>').text(caseDetail.caseId));
                row.append($('<td></td>').text(caseDetail.caseTitle));
                row.append($('<td></td>').text(caseDetail.lotID));
                row.append($('<td></td>').text(caseDetail.parties.join(', ')));
                row.append($('<td></td>').text(caseDetail.caseStatus));
                tableBody.append(row);
              });
            });
          },
          error: function(err) {
            console.error('Error fetching data:', err);
          }
        });
      }
    }
  
    $('#from-date, #to-date').on('change', fetchAndPopulateData);
  
    // Initialize DataTables
    $('#cases-table').DataTable();
  });
  