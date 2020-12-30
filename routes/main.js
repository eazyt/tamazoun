const router = require('express').Router();
const Product = require('../models/products')

Product.createMapping((err, mapping) => { 
  if (err) {
    console.log('error creating mapping')
    console.log(err)
  } else { 
    console.log('Mapping created')
    console.log(mapping)
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

router.get('/', (req, res) => {
  res.render('main/home')
})

router.get('/about', (req, res) => {
  res.render('main/about')
})

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
  Product.findById({ _id: req.params.id }, (err, product) => {
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});

module.exports = router;

