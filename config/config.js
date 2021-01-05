require('dotenv').config()

module.exports = {
  database: process.env.DB_URI,
  port: process.env.PORT,
  secretKey: process.env.SECRET
}