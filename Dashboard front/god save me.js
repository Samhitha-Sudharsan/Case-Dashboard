$(document).ready(function() {
    $('#party-name').multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        maxHeight: 200
    });
  
    let casesData = []; // Store all cases data globally
  
    // Umbrella groups mapping
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
                    casesData = data.cases; // Store cases data globally
  
                    const partySelect = $('#party-name');
                    // partySelect.empty();
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
                            return caseDetail.parties.some(party => selectedParties.includes(party)) &&
                                filterByCaseStatus(caseDetail.caseStatus, selectedCaseStatus) &&
                                (selectedLotId === '' || selectedLotId === caseDetail.lotID);
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
  
    function populateLotIDDropdown(parties) {
        const lotSelect = $('#lot-id');
        lotSelect.empty();
  
        // Gather all lotIDs associated with selected parties
        const selectedParties = $('#party-name').val();
        const lotIds = new Set();
        casesData.forEach(caseDetail => {
            if (caseDetail.parties.some(party => selectedParties.includes(party))) {
                lotIds.add(caseDetail.lotID);
            }
        });
  
        // Add options to lotID dropdown
        lotIds.forEach(lotID => {
            const option = $('<option></option>').text(lotID).val(lotID);
            lotSelect.append(option);
        });
        lotSelect.multiselect('rebuild');
    }
  
    function updateDataTable(filteredCases) {
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
                caseDetail.exactStatus // Add exactStatus as Umbrella Status column
            ]).draw();
        });
    }
  
    function updatePieChart(filteredCases) {
        // Count occurrences of each umbrella group
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
  
        // Create or update pie chart
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
  
    $('#from-date, #to-date').on('change', fetchAndPopulateData);
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
  
  });
  