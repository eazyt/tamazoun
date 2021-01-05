const router = require('express').Router();
const async = require('async');
const faker = require('faker');
const Category = require('../models/category');
const Product = require('../models/products');


router.post('/search', (req, res, next) => {
  Product.search({
    query_string: { query: req.body.search_term }
  }, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

router.get('/:name', (req, res, next) => { 
  async.waterfall([
    function (callback) {
      Category.findOne({ name: req.params.name }, (err, category) => {
        if (err) return next(err);
        callback(null, category)
      })
    },
    function (category, callback) {
      const count = 30;
      for (let i = 0; i < count; i++) {
        let product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    }
  ]);
  // res.send('<h1>Success added 30 Products</h1>');
  // res.render('main/404');
  res.send(`<div class=container>
              <h1 class="text-center" style="text-align">
                Successfully added 30 Products
              </h1>
            </div>`);
})


module.exports = router