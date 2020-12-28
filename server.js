require('dotenv').config()
const express = require("express")
const app = express()

const PORT = process.env.PORT 

app.get('/', (req, res) => { 
  res.send('Hello World')
})

app.listen(PORT, (err) => { 
  if (err) console.log('THERE WAS AN ERROR');
  console.log(`Listening on port ${PORT}`);
  
})