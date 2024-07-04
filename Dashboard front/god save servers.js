$(document).ready(function() {
    $('#party-name').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        maxHeight: 200
    });

    function fetchAndPopulateData() {
        const fromDate = $('#from-date').val();
        const toDate = $('#to-date').val();
        const fromCaseID = $('#from-case-id').val(); // Get from-case-id value
        const toCaseID = $('#to-case-id').val(); // Get to-case-id value

        if (fromDate && toDate) {
            $.ajax({
                url: 'http://localhost:3000/api/get-parties-and-cases',
                method: 'GET',
                data: {
                    from: fromDate,
                    to: toDate,
                    fromCaseID: fromCaseID, // Pass from-case-id to the backend
                    toCaseID: toCaseID // Pass to-case-id to the backend
                },
                success: function(data) {
                    const parties = data.parties;
                    const cases = data.cases;

                    const partySelect = $('#party-name');
                    partySelect.empty();
                    parties.forEach(party => {
                        const option = $('<option></option>').text(party).val(party);
                        partySelect.append(option);
                    });
                    partySelect.multiselect('rebuild');

                    $('#apply-filter').off('click').on('click', function() {
                        const selectedParties = $('#party-name').val();
                        const selectedCaseStatus = $('#case-status').val();

                        const filteredCases = cases.filter(caseDetail => {
                            const caseId = parseInt(caseDetail.caseId);
                            return caseDetail.parties.some(party => selectedParties.includes(party)) &&
                                filterByCaseStatus(caseDetail.caseStatus, selectedCaseStatus) &&
                                (isNaN(fromCaseID) || caseId >= parseInt(fromCaseID)) &&
                                (isNaN(toCaseID) || caseId <= parseInt(toCaseID));
                        });

                        // Clear existing DataTable rows
                        $('#cases-table').DataTable().clear().draw();

                        // Populate DataTable with filtered cases
                        filteredCases.forEach(caseDetail => {
                            $('#cases-table').DataTable().row.add([
                                caseDetail.lotID,
                                caseDetail.caseId,
                                caseDetail.caseTitle,
                                caseDetail.contractNumber,
                                caseDetail.caseStatus,
                                caseDetail.exactStatus // Ensure umbrella status is included
                            ]).draw();
                        });
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

    $('#from-date, #to-date, #from-case-id, #to-case-id').on('change', fetchAndPopulateData);
    $('#party-name').change(fetchAndPopulateData);

    // Initialize DataTable with empty dataset and columns
    $('#cases-table').DataTable({
        columns: [
            { title: 'Lot ID' },
            { title: 'Case ID' },
            { title: 'Case Name' },
            { title: 'Contract Number' },
            { title: 'Case Status' },
            { title: 'Umbrella Status' } // Ensure umbrella status column is defined
        ]
    });
});
