const router = require('express').Router();
const Cart = require('../models/cart');
const Product = require('../models/products');
const stripeSecrets = require('../config/stripe-secrets')
const async = require('async');
const User = require('../models/user');

// secret-key
const Publishable_Key = stripeSecrets.stripePublishableKey
const Secret_Key = stripeSecrets.stripeSecretKey

const stripe = require('stripe')(Secret_Key)

function paginate(req, res, next) {
  const perPage = 9;
  const page = req.params.page;

  Product.find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec((err, products) => {
      if (err) return next(err);
      Product.count().exec((err, count) => {
        if (err) return next(err);
        res.render('main/product-main', {
          products: products,
          pages: count / perPage
        })
      })
    })
}

Product.createMapping((err, mapping) => {
  if (err) {
    // console.log('error creating mapping')
    // console.log(err)
  } else {
    // console.log('Mapping created')
    // console.log(mapping)
  }
})

const stream = Product.synchronize();
let count = 0;

stream.on('data', function () {
  count++;
})
stream.on('close', function () {
  console.log("Indexed" + count + " documents!")
})
stream.on('error', function (err) {
  console.log(err)
})

router.post('/product/:product_id', (req, res, next) => {
  Cart.findOne({
    owner: req.user._id
  }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity),
    })
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
    cart.save((err) => {
      if (err) return next(err);
      return res.redirect('/cart')
    });
  });
});

router.post('/search', (req, res) => {
  res.redirect('/search?q=' + req.body.q)
})

router.get('/search', (req, res, next) => {
  if (req.query.q) {
    Product.search({
      query_string: {
        query: req.query.q
      }
    }, function (err, results) {
      results;
      if (err) return next(err);
      const data = results.hits.hits.map((hit) => {
        return hit;
      })
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      })
    })
  }
})

router.get('/', (req, res, next) => {
  if (req.user) {
    paginate(req, res, next)
  } else {
    res.render('main/home');
  }
});

router.get('/about', (req, res) => {
  res.render('main/about');
});

router.get('/page/:page', (req, res, next) => {
  paginate(req, res, next);
});

// finding ITEMS that belong to a category
router.get('/products/:id', async function (req, res, next) {
  Product.find({
      category: req.params.id
    })
    .populate('category')
    .exec((err, products) => {
      if (err) return next(err + 'ERROR FROM THEN PRODUCT FIND BY ID')
      res.render('main/category', {
        products: products
      })
    })
});

router.get('/product/:id', (req, res, next) => {
  Product.findById({
    _id: req.params.id
  }, (err, product) => {
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});

router.post('/remove', (req, res, next) => {
  Cart.findOne({
    owner: req.user._id
  }, (err, foundCart) => {
    foundCart.items.pull(String(req.body.item))

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save((err, found) => {
      if (err) return next(err);
      req.flash('remove', 'Successfully removed item')
      res.redirect('/cart')
    })
  })
})

router.get('/cart', (req, res, next) => {
  if (req.user) {
    Cart.findOne({
        owner: req.user._id
      })
      .populate('items.item')
      .exec((err, foundCart) => {
        if (err) return next(err);
        res.render('main/cart', {
          foundCart: foundCart,
          amountToDec: Math.floor(foundCart.total).toFixed(2),
          key: Publishable_Key,
          message: req.flash('remove')
        })
      })
  } else {
    res.render('accounts/login', {
      message: req.flash('loginMessage')
    });
  }
})

router.post('/payment', function (req, res) {

  // Moreover you can take more details from user 
  // like Address, Name, etc from form 
  stripe.customers.create({
    source: req.body.stripeToken,
      name: 'Eazy T',
      address: {
        line1: '123 Main st',
        postal_code: '2000',
        city: 'Pretoria',
        state: 'Gauteng',
        country: 'South Africa',
      }
  })
    .then((customer) => {

      return stripe.charges.create({
        amount: req.body.amount * 100, 
        currency: 'USD',
        customer: customer.id
      });
    })
    .then((charge) => {
      async.waterfall([
        function(callback) { 
          Cart.findOne({ owner: req.user._id }, (err, cart) => { 
            callback(err, cart)
          })
        },
        function (cart,callback) { 
          User.findOne({ _id: req.user._id }, (err, user) => {
            if (user) {
              for (let i = 0; i < cart.items.length; i++) {
                user.history.push({
                  item: cart.items[i].item,
                  paid: cart.items[i].price
                });
              }

              user.save((err, user) => {
                if (err) return next(err);
                callback(err, user)
              });
            }
          });
        },
        function (user) { 
          Cart.update({ owner: user._id }, { $set: { items: [], total: 0 } }, (err, updated) => { 
            if (updated) { 
              res.redirect('/profile')
            }
          })
        },
      ])

    })
    .catch((err) => {
      res.send(err)  
    });
})

module.exports = router;