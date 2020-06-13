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

var mysqlConnection = mysql.createConnection({
  host: "us-cdbr-east-05.cleardb.net",
  user: "b219605072f835",
  password: "42574139",
  database: "heroku_8443213941cb76c",
  multipleStatements: true
})

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("Connected")
  } else {
    console.log("Connection Failed")
  }
})

app.get("/", (req, res) => {
  mysqlConnection.query("SELECT * from testspices", (err, rows, fields) => {
    if (!err) {
      res.send(rows)
    } else {
      console.log("error>>>>", err)
    }
  })
})

app.post("/spices/add", (req, res) => {
  const { spices, amount, spicesimage } = req.body
  mysqlConnection.query(`INSERT INTO testspices(spice,amount,spiceimage) VALUES(?,?,?)`, [spices, amount, spicesimage], (err) => {
    if (!err) {
      res.send("success")
    } else {
      console.log("err>>>", err)
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