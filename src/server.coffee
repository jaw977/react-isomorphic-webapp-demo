_ = require 'lodash'
React = require 'react'
SearchApp = require './searchapp.js'
express = require 'express'
fs = require 'fs'

allListings = require './listings.js'
allListingsObj = {}
for listing in allListings
  allListingsObj[listing.id] = listing

uniqueSellers = _.sortBy _.uniq _.map allListings, "seller"

queryListings = (opts) ->
  perPage = 10
  filters = {}
  filters.seller = opts.seller if opts.seller
  filters.watched = true if opts.watched
  page = opts.page or 1
  listings = if _.isEmpty filters then allListings else _.filter allListings, filters
  lastPage = Math.floor((listings.length - 1) / perPage) + 1
  listings = _.take _.drop(listings, (page - 1) * perPage), perPage
  listings: listings, lastPage: lastPage

htmlContent = fs.readFileSync 'index.html', encoding: 'utf-8'

app = express()

app.get '/', (req, res) ->
  props = _.assign { sellers: uniqueSellers }, queryListings {}
  html = htmlContent
    .replace "{}", JSON.stringify props
    .replace "<!--ServerRender-->", React.renderToString SearchApp props
  res.send html

app.get '/api/sellers', (req, res) -> res.json uniqueSellers

app.get '/api/listings', (req, res) -> res.json queryListings req.query

app.put '/api/listing/:id', (req, res) ->
  listing = allListingsObj[req.params.id]
  if listing
    listing.watched = req.query.watched == 'true' if req.query.watched
    res.send "OK"
  else
    res.send 404, 'Listing not found'

app.use express.static '.'

server = app.listen 3000, ->
  a = server.address()
  console.log "Server listening at http://#{a.address}:#{a.port}"
