var mysql = require("mysql");
var inquirer = require("inquirer")
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
    console.log("Welcome to bamazon!");
    bidAuction();
    

});
function bidAuction() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to bid on
      inquirer
        .prompt([
          {
            name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].item_id+" | "+results[i].product_name+" | "+results[i].price+" | "+results[i].stock_quantity);
              }
              return choiceArray;
            },
            message: "What product would you like to place a bid in?"
          },
          {
            name: "quantity",
            type: "input",
            message: "How many units of the product would you like to buy?"
          }
        ])
        .then(function(answer) {
          // get the information of the chosen item
          console.log(answer)
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.choice) {
              chosenItem = results[i];
            }
          }
  
          // determine if bid was high enough
          if (chosenItem.stock_quantity> parseInt(answer.quantity)) {
            newQuantity=chosenItem.stock_quantity-parseInt(answer.quantity)
            console.log(newQuantity)
            // bid was high enough, so update db, let the user know, and start over
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
              function(error) {
                if (error) throw err;
               
              }
            );
            console.log(chosenItem)
            console.log("Order placed successfully!")
                
                console.log("There are now "+ newQuantity+" units left.")
                inquirer.prompt([
                    {name: "new_order",
                     type:  "confirm",
                    message: "Would you like to place another order?"}
                  ])
                  .then(function(answer){
                      if(answer.new_order){
                        bidAuction();
                      }
                      else {console.log("Ok, thanks for visiting bamazon!")
                       connection.end();}
                  })
                
          }
          else {
            // bid wasn't high enough, so apologize and start over
            console.log(`We don't have enough of that item in stock to fulfill your order! We only have ${chosenItem.stock_quantity} units available at this time.`);
            bidAuction();
          }
        });
    });
  }

  function lowInventory() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products WHERE stock_quantity<5", function(err, results) {
      if (err) throw err;
      console.log(results)
      // once you have the items, prompt the user for which they'd like to bid on
      inquirer
        .prompt([
          {
            name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].item_id);
              }
              return choiceArray;
            },
            message: "What product would you like to place a bid in?"
          },
          {
            name: "quantity",
            type: "input",
            message: "How many units of the product would you like to buy?"
          }
        ])
        .then(function(answer) {
          // get the information of the chosen item
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.choice) {
              chosenItem = results[i];
            }
          }
  
          // determine if bid was high enough
          if (chosenItem.stock_quantity> parseInt(answer.quantity)) {
            newQuantity=chosenItem.stock_quantity-parseInt(answer.quantity)
            console.log(newQuantity)
            // bid was high enough, so update db, let the user know, and start over
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
              function(error) {
                if (error) throw err;
               
              }
            );
            console.log(chosenItem)
            console.log("Order placed successfully!")
                
                console.log("There are now "+ newQuantity+" units left.")
                inquirer.prompt([
                    {name: "new_order",
                     type:  "confirm",
                    message: "Would you like to place another order?"}
                  ])
                  .then(function(answer){
                      if(answer.new_order){
                        bidAuction();
                      }
                      else {console.log("Ok, thanks for visiting bamazon!")
                       connection.end();}
                  })
                
          }
          else {
            // bid wasn't high enough, so apologize and start over
            console.log(`We don't have enough of that item in stock to fulfill your order! We only have ${chosenItem.stock_quantity} units available at this time.`);
            bidAuction();
          }
        });
    });
  }