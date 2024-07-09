![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/4c41cb44-747a-436b-8ed1-a5c08fca155a)# CaseTracking Dashboard
The Case Tracking Dashboard is a comprehensive web application designed to track case progress and provide insightful analytics through interactive visualizations. It allows users to monitor cases efficiently with various filtering options and detailed reporting capabilities.
# Features
Dynamic Filters: Filter cases based on date range, case IDs, parties involved, and case status.
Visual Analytics: Visualize case distribution and progress using pie charts.
Detailed Case View: Display detailed case information including case ID, title, lot ID, contract number, status, and umbrella status.
Multi-Select Dropdowns: Select multiple parties and lot IDs to filter cases effectively.
Responsive DataTable: Display filtered cases in a responsive DataTable for easy viewing.
User-Friendly Interface: Intuitive design for seamless navigation and usage
# Technologies Used
Frontend: HTML, CSS, JavaScript (jQuery, Bootstrap)
Backend: Node.js, Express.js
Database: MySQL
Data Visualization: Chart.js
# Usage

Navigate to the dashboard and use the date pickers, case ID range inputs, party name dropdown, and lot ID dropdown to filter cases.
Click on "Apply Filter" to update the DataTable and view filtered cases.
Optionally, select "None" in the lot ID dropdown to view cases for all lot IDs associated with selected parties without generating a pie chart.

# Platform

![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/c7b08904-606a-4af4-979a-c00501a61ad9)


![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/94d08c4c-47f5-4cd9-9630-246430bf6f36)


![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/7ee43c6b-c2d8-4fd4-895c-e47f662ff982)

![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/1ad8509b-7fe4-4cc9-a360-0e24c2ead1cc)

![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/d01a7527-1265-48e1-a988-d3102f575a85)


When from date and to date are chosen , an API is called and it fetches all the required data from the database with respect to the user-email that logged in. 
Once the details are fetched , the corresponding party names are displayed under the party name dropdown. The party name dropdown is a multi select dropdown.
Once the party name is selected , the cases under that party name are chosen and displayed with case status being all as default . 
The case status has four filters : All, Draft, In progress and Completed . Once the filter is set , the cases under that filter are displayed. The apply filter button needs to be clicked in order to set the filters
There is a case range entering where you can enter the from case ID and the to case ID
![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/86e858b6-48ef-426f-a19a-f2f7cb5981b9)

This filters and shows only the case details belonging to the cases between these IDs
The Lot ID filter allows you to filter the table by lot and when a particular lot is selected , it also displays a pie chart with the case stage vs number of cases criteria. When lot ID is None , all lot ID’s details are displayed in the table but there will be no pie chart


![image](https://github.com/Samhitha-Sudharsan/CaseTracking-Dashboard/assets/130522447/297285da-482d-47a1-ba94-888f9e97b523)

For the pie chart, the detailed status values are put under umbrella groups and only the group/super stage is used 














