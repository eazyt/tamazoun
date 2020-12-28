require('dotenv').config()

module.exports = {
  // database: 'mongodb+srv://eazyt:c5LCnaMBC755vT92@cluster0.3t4zu.mongodb.net/tamazoun?retryWrites=true&w=majority',
  // port: 3000,
  // secretKey: "peaches"
  database: process.env.DB_URI,
  port: process.env.PORT,
  secretKey: process.env.SECRET
}