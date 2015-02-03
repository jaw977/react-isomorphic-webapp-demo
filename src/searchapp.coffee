#console.log React

React = if @React then @React else require 'react'
_ = if @_ then @_ else require 'lodash'

ajax = (method, url, callback) ->
  request = new XMLHttpRequest()
  request.open method, url, true
  if method == 'GET'
    request.onreadystatechange = ->
      callback JSON.parse @responseText if @readyState == 4
  request.send()

components = {}

components.SearchApp = React.createClass
  getInitialState: ->
    _.assign { sellers: [], listings: [], currentPage: 1, lastPage: 1 }, @props

  queryListings: (opts, callback) ->
    url = "/api/listings?page=" + (opts.currentPage or 1)
    for field in ['seller','watched']
      value = opts[field]
      url += "&#{field}=#{value}" if value
    ajax 'GET', url, callback

  componentDidMount: ->
    if _.isEmpty @state.sellers
      ajax 'GET', '/api/sellers', (sellers) => @setState sellers: sellers
    if _.isEmpty @state.listings
      @queryListings {}, (results) => @setState results 

  onChangeSeller: (e) ->
    seller = e.target.value
    @queryListings { seller: seller, watched: @state.watched }, (results) => 
      @setState _.assign { seller: seller, currentPage: 1 }, results

  onClickPage: (page) ->
    @queryListings { currentPage: page, seller: @state.seller, watched: @state.watched }, (results) =>
      @setState _.assign { currentPage: page }, results

  onClickWatch: (listing) ->
    listing.watched = not listing.watched
    @setState listings: @state.listings
    ajax 'PUT', "/api/listing/#{listing.id}?watched=#{listing.watched}"

  onChangeWatch: (e) ->
    watched = e.target.checked
    @queryListings { seller: @state.seller, watched: watched }, (results) =>
      @setState _.assign { watched: watched, currentPage: 1 }, results

  render: ->
    s = @state
    h = React.DOM
    h.div {},
      factories.SearchFilters seller: s.seller, sellers: s.sellers, onChangeSeller: @onChangeSeller, onChangeWatch: @onChangeWatch
      factories.ListingTable listings: s.listings, onClickWatch: @onClickWatch
      factories.PaginateFooter currentPage: s.currentPage, lastPage: s.lastPage, onClickPage: @onClickPage

components.SearchFilters = React.createClass
  render: ->
    p = @props
    h = React.DOM
    
    h.p {},
      "Seller: "
      h.select value: p.seller, onChange: p.onChangeSeller,
        h.option { key: "allSellers" }, ""
        for seller in p.sellers
          h.option { key: seller, value: seller }, seller
      " \u00a0\u00a0\u00a0 Watched listings only: "
      h.input type: "checkbox", onChange: p.onChangeWatch

components.ListingTable = React.createClass
  render: ->
    p = @props
    h = React.DOM
    return h.p {}, "No results found" if _.isEmpty p.listings
    
    h.table {},
      h.thead {},
        h.tr {},
          for header in ["Watch","ID","Seller","Title"]
            h.th { key: header }, header
      h.tbody {},
        for listing in p.listings
          factories.ListingRow key: "listing#{listing.id}", listing: listing, onClickWatch: p.onClickWatch

components.ListingRow = React.createClass
  render: ->
    p = @props
    h = React.DOM
    listing = p.listing
    
    h.tr {},
      h.td onClick: (-> p.onClickWatch listing), className: (if listing.watched then "watched" else "notwatched"),
        if listing.watched then "★" else "☆"
      h.td {}, listing.id
      h.td {}, listing.seller
      h.td {}, listing.title

components.PaginateFooter = React.createClass
  render: ->
    p = @props
    h = React.DOM
    return h.p {} if p.lastPage == 0
    
    h.p {}, 
      if p.currentPage == 1
        "< Previous"
      else
        h.a href: '#', onClick: (-> p.onClickPage p.currentPage-1), "< Previous"
      " "
      _.map [1..p.lastPage], (page) ->
        key = "page" + page
        if page == p.currentPage
          h.span { key: key, style: fontWeight: 'bold' }, " #{page} "
        else
          h.span { key: key }, " ", h.a(href:'#', onClick: (-> p.onClickPage page), page), " "
      " "
      if p.currentPage == p.lastPage
        "Next >"
      else
        h.a href: '#', onClick: (-> p.onClickPage p.currentPage+1), "Next >"

factories = _.mapValues components, (component) -> React.createFactory component

if module?
  module.exports = factories.SearchApp
else
  @SearchApp = factories.SearchApp


