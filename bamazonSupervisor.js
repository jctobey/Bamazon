var mysql = require("mysql");
var inquirer = require("inquirer")
var consoleTable=require('console.table')
let doneQuestion = () => {
  inquirer
    .prompt([
      {
        name: "exit",
        type: "confirm",
        message: "Would you like to exit this task, and do something else?"
      }
    ])
    .then(function (answer) {
      if (answer.exit) {
        inquirerStart();
      }
    })
}
let inquirerStart = () => {
  inquirer
    .prompt([
      {
        name: "options",
        type: "rawlist",
        choices: ["View Product Sales by Department", "Create New Department"]
      }
    ])
    .then(function (answer) {
      if (answer.options === "View Product Sales by Department") {
        productList();
       
      }
      else if (answer.options === "Create New Department") {
        addItem();
        
      }
      })
}
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "12345",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log("Wow, Supervisor! You've climbed to the top of the ladder. What would you like to do?");
  inquirerStart();
});
function productList() {
  connection.query("SELECT department_id, departments.department_name, over_head_costs, SUM(product_sales) AS product_sales, (SUM(product_sales)-over_head_costs) AS total_profit FROM products JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_name", function (err, results) {
    productArray=[];
    for (var i = 0; i < results.length; i++) {
        productArray.push(`Department_ID: ${results[i].department_id} | Department_Name: ${results[i].department_name} | Over_Head_Costs: ${results[i].over_head_costs} | Product_Sales: ${results[i].product_sales}| Total_Profit: ${results[i].total_profit}`)
        
    
    }
    console.log(productArray);
  })
}
function addItem() {

  inquirer
    .prompt([
      {
        message: "What's the name of the department you'd like to add to the inventory?",
        name: "new_department_name",
        type: "input",
      },
      {
        message: "What is the overhead cost for this department?",
        name: "new_overhead_cost",
        type: "input",
      },
      

    ])
    .then(function (answer) {
      // get the information of the chosen item
      departmentName = answer.new_department_name;
      departmentOverhead = answer.new_overhead_price;

      connection.query("INSERT INTO departments SET ?",
        {
          department_name: departmentName,
          over_head_costs: departmentOverhead,
          
        },
        console.log(`Departments updated successfully!`),
        setTimeout(inquirerStart, 3000)

      )
    })
}


