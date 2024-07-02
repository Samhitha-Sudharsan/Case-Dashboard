$(document).ready(function() {
    $('#party-name').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        maxHeight: 200
    });

    function fetchAndPopulateData() {
        const fromDate = $('#from-date').val();
        const toDate = $('#to-date').val();
        const caseStatus = $('#case-status').val();

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
                    let cases = data.cases;

                    // Apply party name filter
                    const selectedParties = $('#party-name').val();
                    if (selectedParties && selectedParties.length > 0) {
                        cases = cases.filter(caseDetail => {
                            return caseDetail.parties.some(party => selectedParties.includes(party));
                        });
                    }

                    // Apply case status filter
                    if (caseStatus && caseStatus !== 'all') {
                        cases = cases.filter(caseDetail => caseDetail.caseStatus.toLowerCase() === caseStatus);
                    }

                    // Populate the DataTable with filtered cases
                    const table = $('#cases-table').DataTable();
                    table.clear().draw();
                    cases.forEach(caseDetail => {
                        table.row.add([
                            caseDetail.caseId,
                            caseDetail.caseTitle,
                            caseDetail.lotID,
                            caseDetail.parties.join(', '),
                            caseDetail.caseStatus
                            // Add more columns as needed
                        ]).draw(false);
                    });
                },
                error: function(err) {
                    console.error('Error fetching data:', err);
                }
            });
        }
    }

    // Fetch and populate data on initial page load
    fetchAndPopulateData();

    // Re-fetch and populate data on date range change
    $('#from-date, #to-date').on('change', fetchAndPopulateData);

    // Initialize DataTables
    $('#cases-table').DataTable();
});
