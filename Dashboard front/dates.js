const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
app.use(cors());

const connection = mysql.createConnection({
  host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
  user: 'justact',
  password: 'justact123!',
  database: 'justact_staging'
});


app.get('/api/lot-dates', (req, res) => {
  connection.query('SELECT DISTINCT DATE_FORMAT(case_created_at, "%Y-%m-%d") as case_created_at FROM mis_cases_parties', (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error fetching lot dates' });
    } else {
      console.log(results)
      const dates = results.map(row => row.case_created_at);
      console.log("Dates fetched and returned")
      res.json(dates);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});


















  // <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  // <script>
  //   $(document).ready(function() {
  //     $.ajax({
  //       type: 'GET',
  //       url: 'http://localhost:3000/api/lot-dates',
  //       dataType: 'json',
  //       success: function(data) {
  //         $.each(data, function(index, date) {
  //           $('#lot-dates').append('<li>' + date + '</li>');
  //         });
  //       },
  //       error: function(xhr, status, error) {
  //         console.log('Error:', error);
  //       }
  //     });
  //   });
  // </script>
