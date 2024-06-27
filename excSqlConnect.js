const express = require('express');
const mysql = require('mysql');
const Excel = require('exceljs');
const app = express();
const cors = require('cors');
app.use(cors());
app.get('/', (req, res) => {    
  res.send('Server is running');
});

app.get('/generate-excel', async (req, res) => {
//   console.log("sadhkjasdh")
const connection = mysql.createConnection({
  host: 'justact-staging-db.cdzlwxwbylqw.ap-south-1.rds.amazonaws.com',
  user: 'justact',
  password: 'justact123!',
  database: 'justact_staging'
});

//   console.log("after creating connection")

  connection.connect((err) => {
    if (err) {
        // console.log("Database connection fail" , err);
      return res.status(500).send('Database connection failed: ' + err.stack);
    }

    
    connection.query('SELECT * FROM mis_details', async (err, results) => {
      if (err) {
        connection.end();
        // console.log("Error in execution" , err);
        return res.status(500).send('Error in executing query: ' + err.stack);
      }
console.log("after fetching data")
      if (results.length === 0) {
        connection.end();
        
        return res.status(404).send('No data found');
      }

      try {
        
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('MIS Sheet');
        // console.log("after initializing excel")

        
        const columnNames = Object.keys(results[0]).map((columnName) => columnName.toUpperCase());
        worksheet.addRow(columnNames).font = { bold: true };

        // console.log("after =writing in excel")

        results.forEach((row) => {
            // console.log("row")
          const rowValues = Object.values(row).map((value) => (value === null ? '' : value));
          worksheet.addRow(rowValues);
        });

        
        const buffer = await workbook.xlsx.writeBuffer();

        
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', 'attachment; filename="case_data.xls"');
        res.send(buffer);
        // res.send(workbook);
      } catch (e) {
        // console.log("Not able to create excel file");
        res.status(500).send('Error in creating Excel file: ' + e.message);
      } finally {
        
        connection.end();
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
