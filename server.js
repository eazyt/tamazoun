require('dotenv').config()
const express = require("express")
const morgan = require('morgan')
const mogoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models/user')
const ejs = require('ejs')
const engine = require('ejs-mate')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')

const MONGODB_URL = process.env.DB_URI
const PORT = process.env.PORT 

const app = express()

mogoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
})
  .then(() => { 
    console.log(`succefully connected to the Database`)
  })
  .catch((e) => { 
    console.log(`could not connect to database`, e)
  })

// Morgan Middleware
app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'secret'
}))
app.use(flash())


// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); // so you can render('index')

const mainRoutes = require('./routes/main')
const userRoutes = require('./routes/user')

app.use(mainRoutes);
app.use(userRoutes);


app.listen(PORT, (err) => { 
  if (err) console.log('THERE WAS AN ERROR');
  console.log(`Listening on port ${PORT}`);
})