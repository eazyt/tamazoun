
const express = require("express");
const morgan = require('morgan');
const mogoose = require('mongoose');
const bodyParser = require('body-parser');
const engine = require('ejs-mate');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const Category = require('./models/category');

const cartLength = require('./middleware/middleware')

const config = require('./config/config');

const PORT = config.port;

const app = express()

mogoose.connect(config.database, {
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
  secret: config.secretKey,
  store: new MongoStore({
    url: config.database,
    autoReconnect: true
  })
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => { 
  res.locals.user = req.user;
  next()
})

app.use(cartLength)

app.use((req, res, next) => { 
  Category.find({}, (err, categories) => { 
    if (err) return next(err + 'MIDDLEWARE ERROR');
    res.locals.categories = categories;
    next();
  })
})

app.use((req, res, next) => { 
  next()
})


// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('view engine', 'ejs'); // so you can render('index')

app.set('views', __dirname + '/views');

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

app.use((request, response) => response.render('main/404'))


app.listen(PORT, (err) => { 
  if (err) console.log('THERE WAS AN ERROR');
  console.log(`Listening on port ${PORT}`);
})
