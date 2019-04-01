const inquirer = require('inquirer');
const mySQL =  require('mysql');
const chalk = require('chalk');
const {table} = require('table');
const DB = 'bamazon';

const ENOUGH_STRING = "'YES'";
const NOT_ENOUGH_STRING = "'NO'";
const IS_ENOUGH_STRING = "'is_Enough'"

const ENOUGH = 'YES';
const NOT_ENOUGH = 'NO';

var tableRows = [];
var columns = {};
var config = {};


var connection = mySQL.createConnection({
    host: "localhost",
  
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: DB
  });

  start();

  function start(){
    connection.query("SELECT * FROM products;", function(err, res){
        if(err) throw err;
       buildTable(res,"ID PRODUCT DEPARTMENT PRICE QUANTITY");
       whatToBuy();
       //connection.end();
      });
}



function buildTable(dbResult,headerStringWithSpaces){
    var tempHeaderArray = headerStringWithSpaces.split(" ");
    for(var i = 0;i< tempHeaderArray.length;i++){
        columns[i]={alignment:'center'};
    }
    tableRows.push(tempHeaderArray); //makes header into array
    dbResult.forEach(element => {
        var tempArray = [element.item_id,element.product_name,element.department_name,element.price,element.stock_quantity];
        tableRows.push(tempArray);
          
    });

    //Display Table
    config[columns] = columns;
    var output = table(tableRows, config);
    console.log(chalk.green("PRODUCTS FOR SALE"));
    console.log(output);

    //Clear Global Table Vars
    tableRows = [];
    columns = {};
    config = {};
}

function whatToBuy(){
    var idOptions =[];
    connection.query("SELECT item_id FROM products;", function(err, res){
        if(err) throw err;

        res.forEach(element =>{
            idOptions.push(element.item_id.toString());
        });

        //connection.end();
        buyPrompts(idOptions);
        
      });
}

function buyPrompts(optionArray){
    
    inquirer.prompt([
        {
            type:'list',
            message:"What id would you like to buy?",
            choices:optionArray,
            name:"idSelection"
        },
        {
            type:'input',
            message:'How many would you like to buy?',
            name:'howMany'

        }
    ]).then(answers =>{
        var amount = Number.parseInt(answers.howMany);
        var id = Number.parseInt(answers.idSelection);
        checkStock(id,amount);
       

    });
}

function checkStock(itemId,amountInt){
    //console.log("SELECT IF(stock_quantity>"+amountInt+","+ENOUGH+","+NOT_ENOUGH+")FROM products WHERE item_id="+itemId+";");
    connection.query("SELECT IF(stock_quantity>="+amountInt+","+ENOUGH_STRING+","+NOT_ENOUGH_STRING+") AS "+IS_ENOUGH_STRING+" FROM products WHERE item_id="+itemId+";", function(err, res){
        //console.log(connection.query);
        if(err) throw err;

        if(res[0].is_Enough == ENOUGH){
            updateStockandConfirm(itemId,amountInt);

        }else{
            console.log(chalk.red("Insufficient quantity!"));
            connection.end();
            
        }
      });
}

function updateStockandConfirm(itemId,amountInt){

    connection.query("UPDATE products SET stock_quantity = stock_quantity - "+amountInt+" WHERE item_id ="+itemId+";", function(err, res){
        if(err) throw err;
        purchaseAmount(itemId,amountInt);

      });

}

function purchaseAmount(itemId,amountInt){
    connection.query("SELECT price FROM products WHERE item_id = "+itemId+";", function(err, res){
        if(err) throw err;
        var purchaseTotal = res[0].price * amountInt;
        console.log(chalk.green("Your total amount is $"+purchaseTotal));
        connection.end();
      });
}



// The app should then prompt users with two messages.

// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.



// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.



// However, if your store does have enough of the product, you should fulfill the customer's order.

// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.




//function displayDBResult(dbResult){
    //     console.log(chalk.red("+-------------------------------------------------------------+"))
    //     console.log("|\tID\t|\tPRODUCT NAME\t|\tDEPATMENT NAME\t|\tPRICE\t|\tQUANTITY\t|");
    //     dbResult.forEach(element => {
    //         console.log(chalk.red("+-------------------------------------------------------------+"))
    //         console.log(chalk.green("\t"+element.item_id + "\t\t"+element.product_name+ "\t\t\t"+ element.department_name+"\t\t"+element.price+"\t\t"+element.stock_quantity));
            
    //     });
       
    // }
