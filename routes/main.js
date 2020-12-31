const router = require('express').Router();
const Product = require('../models/products')

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

