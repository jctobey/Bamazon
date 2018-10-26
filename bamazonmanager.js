var mysql = require("mysql");
var inquirer = require("inquirer")
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
        choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
      }
    ])
    .then(function (answer) {
      if (answer.options === "View Products For Sale") {
        productList();
        setTimeout(doneQuestion, 10000)
      }
      else if (answer.options === "View Low Inventory") {
        lowInventoryList();
        setTimeout(doneQuestion, 5000)
      }
      else if (answer.options === "Add to Inventory") {
        updateInventory();

      }
      else if (answer.options === "Add New Product") {
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
  console.log("Welcome to bamazon, you important manager you! What would you like to do?");
  inquirerStart();
});
function productList() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    var choiceArray = [];
    for (var i = 0; i < results.length; i++) {
      choiceArray.push(`Item_ID: ${results[i].item_id} | Product_Name: ${results[i].product_name} | Product_Price: ${results[i].price} | Product_Quantity: ${results[i].stock_quantity}`)
    }
    console.log(choiceArray)
    return choiceArray;

  })
}
function lowInventoryList() {
  connection.query("SELECT * FROM products WHERE stock_quantity<5", function (err, results) {
    if (err) throw err;
    var lowChoiceArray = [];
    for (var i = 0; i < results.length; i++) {
      lowChoiceArray.push(`Item_ID: ${results[i].item_id} | Product_Name: ${results[i].product_name} | Product_Price: ${results[i].price} | Product_Quantity: ${results[i].stock_quantity}`)
    }
    console.log(lowChoiceArray)
    return lowChoiceArray;

  })
}
function updateInventory() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          message: "What product would you like to update the inventory for?",
          name: "choice",
          type: "rawlist",
          choices: function () {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          }
        },
        {
          message: "How many units of inventory would you like to add?",
          name: "units",
          type: "input"
        }
      ])
      .then(function (answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }
        newQuantity = chosenItem.stock_quantity + parseInt(answer.units)
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newQuantity
            },
            {
              item_id: chosenItem.item_id
            }
          ],
          function (error) {
            if (error) throw err;

          }
        );
        console.log(`Inventory updated successfully! There are now ${newQuantity} units of ${chosenItem.product_name} available for purchase. `)
      })
  })
}
function addItem() {
  connection.query("SELECT department_name FROM departments", function(err, results) {
    if (err) throw err;
  inquirer
    .prompt([
      {
        message: "What's the name of the product you'd like to add to the inventory?",
        name: "new_product_name",
        type: "input",
      },
      {name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].department_name);
              }
              return choiceArray;
            },
            message: "What department does this product belong under?",
          name:"new_product_department_name"},
      {
        message: "What is the price for one unit of this item?",
        name: "new_product_price",
        type: "input",
      },
      {
        message: "How many units would you like to add to the inventory?",
        name: "new_product_stock_quantity",
        type: "input",
      }

    ])
    .then(function (answer) {
      // get the information of the chosen item
      productName = answer.new_product_name;
      productType = answer.new_product_department_name;
      productPrice = answer.new_product_price;
      productQuantity = answer.new_product_stock_quantity;

      connection.query("INSERT INTO products SET ?",
        {
          product_name: productName,
          department_name: productType,
          price: productPrice,
          stock_quantity: productQuantity
        },
        console.log(`Inventory updated successfully! There are now ${productQuantity} units of ${productName} available for purchase. `),
        setTimeout(inquirerStart, 3000)

      )
    })})
}
