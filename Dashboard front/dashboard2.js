// Initialize DataTables
$(document).ready(function() {
  $('#cases-table').DataTable({
    "ordering": true,
    "order": [[ 2, "desc" ]] // Sort by Lot Date in descending order by default
  });
});

// Populate party name dropdown
fetch('http://localhost:3000/api/get-parties')
  .then(response => response.json())
  .then(partyNames => {
    partyNames.forEach(partyName => {
      const option = document.createElement('option');
      option.value = partyName;
      option.textContent = partyName;
      document.getElementById('party-name').appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching party names:', error));

// Apply filter function
document.getElementById('apply-filter').addEventListener('click', applyFilter);

function applyFilter() {
  const fromDate = document.getElementById('from-date').value;
  const toDate = document.getElementById('to-date').value;
  const partyName = document.getElementById('party-name').value;

  fetch(`http://localhost:3000/api/filter-cases?fromDate=${fromDate}&toDate=${toDate}&partyName=${partyName}`)
    .then(response => response.json())
    .then(cases => {
      const tableBody = document.getElementById('cases-table-body');
      tableBody.innerHTML = ''; // Clear the table body

      cases.forEach(currentCase => {
        const row = tableBody.insertRow();
        row.innerHTML = `
          <td>${currentCase.caseId}</td>
          <td>${currentCase.caseName}</td>
          <td>${currentCase.lotDate}</td>
          <td>${currentCase.partyName}</td>
          <!-- Add more columns as needed -->
          `;
      });

      // Update DataTables
      var table = $('#cases-table').DataTable();
      table.clear();
      table.rows.add($(tableBody).find('tr'));
      table.draw();
    })
    .catch(error => console.error('Error fetching cases:', error));
}