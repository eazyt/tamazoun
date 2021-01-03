const router = require('express').Router();
const Cart = require('../models/cart');
const Product = require('../models/products');

const stripe = require('stripe')('sk_test_51I5WzSC61oZrgaYb3OGOLehbbgvwPoIpAMJ9QMKBDNPUjH0ZLYRoWxdjyBJoz5XE2qViTLmQOLavCc3pPCiEnC5U00c3hOWxsA')

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

stream.on('data', function(){ 
  count++;
})
stream.on('close', function(){ 
  console.log("Indexed" + count + " documents!")
})
stream.on('error', function(err) { 
  console.log(err)
})


router.get('/cart', (req, res, next) => { 
  // console.log(req.body.product_id + 'CODING!!!')
  // console.log("THIS IS THE CART ROUTE!!")
  if (req.user) {
    Cart.findOne({ owner: req.user._id })
      .populate('items.item')
      .exec((err, foundCart) => {
        // console.log(foundCart)
        if (err) return next(err);
        res.render('main/cart', {
          foundCart: foundCart,
          message: req.flash('remove')
        })
      })
  } else { 
      res.render('accounts/login', {
        message: req.flash('loginMessage')
      });
  }
})


router.post('/product/:product_id', (req, res, next) => {
// router.post('/product/:id', (req, res, next) => {
//   console.log(req.body)
    // console.log('THIS IS POST ROUTE')
//   res.send({ "msg": "Welcome to the POST product/product_id" })
  Cart.findOne({ owner: req.user._id }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity),
      // image: req.body.image     //this works with cart schema items.image links to carts.ejs img->name
    })
    // console.log(req.body.product_id + 'THIS THE ID OF THE PRODUCT SENT TO CART')
    // console.log(cart.items.item + 'THIS THE ID OF THE PRODUCT SENT TO CART')
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
    cart.save((err) => {
      if (err) return next(err);
      // console.log(cart + 'THIS THE SAVE ')
      return res.redirect('/cart')
    });
  });
});



router.post('/search', (req, res) => { 
  res.redirect('/search?q=' + req.body.q)
})

router.get('/search', (req, res, next) => { 
  // console.log(search_term)
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
router.get('/products/:id', async function(req, res, next) {
  // console.log(req.params.id)
  Product.find({ category: req.params.id })
  .populate('category')
  .exec((err, products) => { 
    if (err) return next(err + 'ERROR FROM THEN PRODUCT FIND BY ID')
    res.render('main/category', {
      products: products
    })
  })
});

router.get('/product/:id', (req, res, next) => {
  // console.log('THIS IS GET ROUTE')
  Product.findById({ _id: req.params.id }, (err, product) => {
    // console.log(req.body)
    // console.log(product)
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

router.post('/payment', (req, res, next) => { 
  const stripeToken = req.body.stripeToken;
  const currentCharges = Math.round(req.body.stripeMoney * 100);
  stripe.customers.create({
    source: stripeToken,
  }).then((customer) => { 
    return stripe.charges.create({
      maount: currentCharges,
      currency: 'usd',
      customer: customer.id
    })
  })
})

module.exports = router;

