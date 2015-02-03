(function() {
  var React, SearchApp, allListings, allListingsObj, app, express, fs, htmlContent, listing, queryListings, server, uniqueSellers, _, _i, _len;

  _ = require('lodash');

  React = require('react');

  SearchApp = require('./searchapp.js');

  express = require('express');

  fs = require('fs');

  allListings = require('./listings.js');

  allListingsObj = {};

  for (_i = 0, _len = allListings.length; _i < _len; _i++) {
    listing = allListings[_i];
    allListingsObj[listing.id] = listing;
  }

  uniqueSellers = _.sortBy(_.uniq(_.map(allListings, "seller")));

  queryListings = function(opts) {
    var filters, lastPage, listings, page, perPage;
    perPage = 10;
    filters = {};
    if (opts.seller) {
      filters.seller = opts.seller;
    }
    if (opts.watched) {
      filters.watched = true;
    }
    page = opts.page || 1;
    listings = _.isEmpty(filters) ? allListings : _.filter(allListings, filters);
    lastPage = Math.floor((listings.length - 1) / perPage) + 1;
    listings = _.take(_.drop(listings, (page - 1) * perPage), perPage);
    return {
      listings: listings,
      lastPage: lastPage
    };
  };

  htmlContent = fs.readFileSync('index.html', {
    encoding: 'utf-8'
  });

  app = express();

  app.get('/', function(req, res) {
    var html, props;
    props = _.assign({
      sellers: uniqueSellers
    }, queryListings({}));
    html = htmlContent.replace("{}", JSON.stringify(props)).replace("<!--ServerRender-->", React.renderToString(SearchApp(props)));
    return res.send(html);
  });

  app.get('/api/sellers', function(req, res) {
    return res.json(uniqueSellers);
  });

  app.get('/api/listings', function(req, res) {
    return res.json(queryListings(req.query));
  });

  app.put('/api/listing/:id', function(req, res) {
    listing = allListingsObj[req.params.id];
    if (listing) {
      if (req.query.watched) {
        listing.watched = req.query.watched === 'true';
      }
      return res.send("OK");
    } else {
      return res.send(404, 'Listing not found');
    }
  });

  app.use(express["static"]('.'));

  server = app.listen(3000, function() {
    var a;
    a = server.address();
    return console.log("Server listening at http://" + a.address + ":" + a.port);
  });

}).call(this);
