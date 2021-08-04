//Server.js acts as, well, the server for this application. It connects our front end (React Native / JavaScript)
//and also with the database (MongoDB via Atlas).
//Recieves calls from the front end via fetch calls to specific routes which respond with calls to the database
//to either insert into it or to recieve back data
//Another important thing is the server utilizes "bcrypt" which encrypts user passwords into the database

const express = require('express');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const someModel = require('./model');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const saltRounds = 10;

const app = express();

//allow cross-origin requests
app.use(cors());

app.use(bodyParser.json());

// const uri = "mongodb+srv://FTAdmin01:7g7A7!7k@financetrackerdb.fb2la.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   //const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   //client.close();
//   console.log("Connected to database");
// });

async function main(){

  const uri = "mongodb+srv://FTAdmin01:7g7A7!7k@financetrackerdb.fb2la.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try{
    await client.connect();
    console.log("connected to DB");

    const port = 3000;
    app.listen(port, () => {
      console.log("Server running on port ", port);
    });

    app.get('/', (req, res) => {
      res.send({message: "hello"});
    })

    // app.post('/findAllPaymentsByDate', (req,res) =>{
    //   //const datePressed = req.body.dateString;
    //   const database = client.db('financeTrackerDB');
    //   const paymentInfo = database.collection('paymentInfo');
      
    //   const query = {$and: [ {username: req.body.username}, {date: req.body.date}]};
    //   paymentInfo.find(query).toArray()
    //   .then(result => {
    //     console.log(result);
    //     res.send(result);
    //   });
    // })

    //Called in calendarMain.js to retrieve all payments by a specific user
    //Hypothetically if the user has so much information this could take a long time to retrieve info
    //and hinder the experience of the front end since they'd have to wait longer for it to load
    //However, I think given the scope of the project, that shouldn't be a concern, just something to consider if ever scaling 
    app.post('/getAllUserPaymentsForCalendar', (req,res) =>{

      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      
      const query = {$and: [ {username: req.body.username}]};
      paymentInfo.find(query).toArray()
      .then(result => {
        console.log("successful retrieval of data from /getAllUserPaymentsForCalendar");
        res.send(result);
      });
    })

    app.post('/TESTINGFINDDATES', (req,res) =>{

      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      const query = {$and: [ {date: {$gte: req.body.firstDate, $lt: req.body.secondDate}}, 
        {username: req.body.username}, {title: req.body.search} ]}
        console.log(query)
      paymentInfo.find(query).toArray()
      .then(result => {
        console.log("testingFindDates complete");
        res.send(result);
      });
    })

    //Called in calendarMain.js under the above call to check if the user has any recurring payments (e.g. Streaming service, gym, rent, etc.)
    app.post('/checkRecurringPayments', (req,res) =>{

      const database = client.db('financeTrackerDB');
      const recurringPayments = database.collection('recurringPayments');
      
      const query = {$and: [ {username: req.body.username}]};
      recurringPayments.find(query).toArray()
      .then(result => {
        console.log("successful retrieval of data from /checkRecurringPayments");
        res.send(result);
      });
    })

    //Called in yourProfile.js to collect all payment info for current month to display for user
    app.post('/paymentsByCurrentMonth', (req,res) =>{

      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      const query = {$and: [ {username: req.body.username}, {month: req.body.month}, {year: req.body.year}]};
      paymentInfo.find(query).toArray()
      .then(result => {
        //console.log(result);
        res.send(result);
      });
    })

    //Called in various files; used to insert something into the database
    app.post('/postTest', (req,res) =>{
      //console.log(req.body);
      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');

      paymentInfo.insertOne(req.body)
      .then(result => {
        console.log("successful insertion to DB from client");
        res.send(result);
      });
    })

    //Called in submitPayment.js in order to edit/update an existing payment (e.g. change a payment, change a title, add notes, etc.)
    app.post('/updatePaymentInfo', (req,res) =>{
      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      
      // let id = req.body.existingPaymentID;
      // let o_id = new ObjectID(id);
      //console.log(req.body);
      //var id = require('mongodb').ObjectID(req.body.existingPaymentID);
      //var o_id = new mongo.ObjectID(req.body.existingPaymentID);
      //var objectID = mongoose.Types.ObjectID(req.body.existingPaymentID)
      var query = {};
      var newValues = { $set: req.body.userSubmittedInfo}; 
      if(req.body.hasOwnProperty("existingPaymentID")){
        var ObjectId = require('mongodb').ObjectId;
        var id = new ObjectId(req.body.existingPaymentID)
        query = { _id: id };
      }
      else{
        query = {$and: [{username: req.body.userSubmittedInfo.username},{title: req.body.userSubmittedInfo.title}, 
          {paymentAmount: req.body.userSubmittedInfo.paymentAmount}, {date: req.body.userSubmittedInfo.date}] };
      }
      paymentInfo.updateOne(query, newValues)
      .then(result => {
        console.log("Successful update to certain payment info.");
        res.send(result);
      });
    })

    app.post('/deleteFromPaymentInfo', (req,res) =>{
      //console.log(req.body);
      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');

      var query = {}; 
      if(req.body.hasOwnProperty("id")){
        var ObjectId = require('mongodb').ObjectId;
        var id = new ObjectId(req.body.id)
        query = { _id: id };
      }
      else{
        query = {$and: [{username: req.body.username},{title: req.body.title}, {paymentAmount: req.body.paymentAmount}, {date: req.body.date}] };
      }

      paymentInfo.deleteOne(query)
      .then(result => {
        console.log("Successful deletion of payment to DB inside /deleteFromPaymentInfo");
        res.send(result);
      });
    })

    //Called in yourProfile.js in order to create a new recurring payment for the user (e.g. Streaming service, gym, rent, etc.)
    app.post('/createRecurringPayment', (req,res) =>{
      //console.log(req.body);
      const database = client.db('financeTrackerDB');
      const recurringPayment = database.collection('recurringPayments');

      recurringPayment.insertOne(req.body)
      .then(result => {
        console.log("successful insertion to DB from client from /createRecurringPayment");
        res.send(result);
      });
    })

    //Called in yourProfile.js to update a recurring payment in recurringPayments collection/table
    app.post('/updateRecurringPayment', (req,res) =>{
      const database = client.db('financeTrackerDB');
      const recurringPayments = database.collection('recurringPayments');
      
      console.log(req.body)

      // const query = { $and: [ {username: req.body.username}, {isRecurringPayment: req.body.isRecurringPayment},
      //   {title: req.body.title}] };
      var query = {};
      if(req.body.hasOwnProperty('tempID')){
        var ObjectId = require('mongodb').ObjectId;
        var id = new ObjectId(req.body.tempID)
        query = { _id: id };
      }
      else{
        var ObjectId = require('mongodb').ObjectId;
        var id = new ObjectId(req.body._id)
        query = { _id: id };
      }
      //console.log(query)
      var newValues = { $set: req.body};
      recurringPayments.updateOne(query, newValues)
      .then(result => {
        console.log("Successful update to certain recurring payment info.");
        res.send(result);
      });
    })

    app.post('/reflectUpdatedRecurringPayment', (req,res) =>{
      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      
      var date = new Date();
      var currMonth = date.getMonth() + 1;
      var currYear = date.getFullYear();

      // var ObjectId = require('mongodb').ObjectId;
      // var id = new ObjectId(req.body.tempID)
      console.log(req.body)
      const query = { $and: [ {parentRecurringPaymentID: req.body.tempID }, {username: req.body.username}, {month: currMonth}, {year: currYear}] };
      // var newValues = { $set: {title: req.body.title, cardUsed: req.body.cardUsed, paymentAmount: req.body.paymentAmount,
      // dayOfMonthToBill: req.body.dayOfMonthToBill, date: req.body.date}};
      var newValues = { $set: req.body}
      paymentInfo.updateOne(query, newValues)
      .then(result => {
        console.log("Payment info of a recurring payment changed for the current month to reflect the new recurring payment update.");
        res.send(result);
      });
    })

    app.post('/deleteFromRecurringPayment', (req,res) =>{
      console.log(req.body.username);
      const database = client.db('financeTrackerDB');
      const recurringPayments = database.collection('recurringPayments');

      // var query = {}; 
      // if(req.body.hasOwnProperty("_id")){
      //   var ObjectId = require('mongodb').ObjectId;
      //   var id = new ObjectId(req.body.id)
      //   query = { _id: id };
      // }
      // else{

      const query = {$and: [{username: req.body.username},{title: req.body.title}, {paymentAmount: req.body.paymentAmount}, {isRecurringPayment: req.body.isRecurringPayment}] };
      

      recurringPayments.deleteOne(query)
      .then(result => {
        console.log("Successful deletion of payment to DB inside /deleteFromRecurringPayment");
        res.send(result);
      });
    })

    app.post('/reflectDeletedRecurringPayment', (req,res) =>{
      const database = client.db('financeTrackerDB');
      const paymentInfo = database.collection('paymentInfo');
      
      //console.log(req.body)

      const query = { $and: [ {username: req.body.username}, {isRecurringPayment: req.body.isRecurringPayment},
        {title: req.body.title},{month: req.body.month}] };
      paymentInfo.deleteOne(query)
      .then(result => {
        console.log("Deleted a payment in paymentInfo to reflect upon a deleted recurring payment");
        res.send(result);
      });
    })


    //Called in createAccount.js to insert user username & password into database. However, password is encrypted prior to insertion
    app.post('/insertUserInfo', (req,res) => {

      const database = client.db('financeTrackerDB');
      const userInfo = database.collection('userInfo');

      console.log(req.body.password);

      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            // Store hash in your password DB.
            console.log(hash);
            userInfo.insertOne({username: req.body.username, password: hash})
            .then(result => {
              console.log("successful insertion of user info (hashed)");
              res.send(result);
            });
        });
      });
    })

    //Called in login.js to validate user login info
    app.post('/validateUserLogin', (req,res) =>{

      const database = client.db('financeTrackerDB');
      const userInfo = database.collection('userInfo');

      const query = { username: req.body.username };

      console.log(req.body.password);
      userInfo.findOne(query)
      .then(result => {

        bcrypt.compare(req.body.password, result.password, function(err, resultHash) {
          //console.log(result);
          console.log(resultHash);
          res.send(resultHash);
        });
        
        //res.send(result);
      });
      
    })
  
      
    
    

  } catch (e) {
    console.error(e);
  }
  // } finally {
  //   await client.close();
  // }

}

main().catch(console.error);