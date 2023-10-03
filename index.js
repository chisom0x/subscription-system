const express = require ("express")
const bodyParser = require('body-parser');
const cron = require ("node-cron")
const mongoose = require("mongoose")
const User = require("./model")
const axios = require('axios')
const paystackSecretKey = 'sk_test_94fa51e2be072279283d5a78abb39458fb6ede11';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))



// const job = cron.schedule('*/3 * * * * *', () => {
//     console.log('Hello, world!');
//   }, {
//     scheduled: false, // Start the job manually 
//   });
  
//  // Start the cron job
//   job.start();
  
//  // Stop the cron job after 30 seconds
//   setTimeout(() => {
//     job.stop();
//     console.log('Cron job stopped after 30 seconds.');
//   }, 3000); // 30,000 milliseconds = 30 seconds




// payment without cron job
app.post('/initiate-payments', async (req, res) => {
  try {
    const { email, amount, reference } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, 
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error initiating payment:', error.response.data);
    res.status(500).json({ error: 'An error occurred while initiating payment.' });
  }
});




// payment with cron job

let paymentCount = 0;


app.post('/pay', async(req, res)=>{
  
// Cron job to initiate payments every 2 minutes
const paymentJob = cron.schedule('*/2 * * * *', async () => {
  try {
    const email = 'onyenankiekelvin@gmail.com'; 
    const amount = req.body 
    const reference = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, 
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;
    res.json(data)
    console.log('Payment initiated:', data);

   
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message);
  }
}, {scheduled: false});
     
 paymentJob.start();
 paymentCount++; 

 // If the job has run 3 times, stop it
 if (paymentCount >= 3) {
   paymentJob.stop();
   console.log('Payment job stopped after 3 runs.');
 }

})












  mongoose.connect("mongodb://0.0.0.0:27017/sub", {
    useNewUrlParser: true,
}).then(()=>console.log('DB connected'))










app.listen(3000, ()=>{
    console.log('app running')
})