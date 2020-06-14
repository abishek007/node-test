const mysql = require("mysql")
const express = require("express")
const bodyParser = require("body-parser")

const API_KEY = "test_3d54cbb851102d3ae69edf48020"
const AUTH_KEY = "test_ef5d521e2b5897ba5e73850db9e"
const PORT = process.env.PORT || 3000

var Insta = require('instamojo-nodejs')
Insta.setKeys(API_KEY, AUTH_KEY)

var app = express()
app.use(bodyParser.json())

const db_config = {
  host: "us-cdbr-east-05.cleardb.net",
  user: "b219605072f835",
  password: "42574139",
  database: "heroku_8443213941cb76c",
  multipleStatements: true
}
//var mysqlConnection = mysql.createConnection(db_config)

//mysqlConnection.connect((err) => {
//  if (!err) {
//    console.log("Connected")
//  } else {
//    console.log("Connection Failed")
//  }
//})

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config) // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect()

app.get("/", (req, res) => {
  connection.query("SELECT * from testspices", (err, rows, fields) => {
    if (!err) {
      res.send(rows)
    } else {
      console.log("error>>>>", err)
    }
  })
})

app.post("/spices/add", (req, res) => {
  const { spices, amount, spicesimage } = req.body
  connection.query(`INSERT INTO testspices(spice,amount,spiceimage) VALUES(?,?,?)`, [spices, amount, spicesimage], (err) => {
    if (!err) {
      res.send("success")
    } else {
      console.log("err>>>", err)
      res.send(err)
    }
  })
})

app.post("/pay", (req, res) => {
  var data = new Insta.PaymentData();
  Insta.isSandboxMode(true)

  data.purpose =  req.body.purpose;
	data.amount = req.body.amount;
	data.buyer_name =  req.body.buyer_name;
	data.redirect_url =  req.body.redirect_url;
	data.email =  req.body.email;
	data.phone =  req.body.phone;
	data.send_email =  true;
	data.webhook= 'http://www.example.com/webhook/';
	data.send_sms= true;
	data.allow_repeated_payments =  true;
  
  Insta.createPayment(data, function(error, response) {
    if (error) {
      console.log("payment error>>>", error)
    } else {
      const responseData = JSON.parse(response)
			const redirectUrl = responseData.payment_request.longurl
			console.log(redirectUrl)

			res.status( 200 ).json( redirectUrl )
    }
  })

})

app.listen(PORT)