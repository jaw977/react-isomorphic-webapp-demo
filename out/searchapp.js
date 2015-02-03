(function() {
  var React, ajax, components, factories, _;

  React = this.React || require('react');

  _ = this._ || require('lodash');

  ajax = function(method, url, callback) {
    var request;
    request = new XMLHttpRequest();
    request.open(method, url, true);
    if (method === 'GET') {
      request.onreadystatechange = function() {
        if (this.readyState === 4) {
          return callback(JSON.parse(this.responseText));
        }
      };
    }
    return request.send();
  };

  components = {};

  components.SearchApp = React.createClass({
    getInitialState: function() {
      return _.assign({
        sellers: [],
        listings: [],
        currentPage: 1,
        lastPage: 1
      }, this.props);
    },
    queryListings: function(opts, callback) {
      var field, url, value, _i, _len, _ref;
      url = "/api/listings?page=" + (opts.currentPage || 1);
      _ref = ['seller', 'watched'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        value = opts[field];
        if (value) {
          url += "&" + field + "=" + value;
        }
      }
      return ajax('GET', url, callback);
    },
    componentDidMount: function() {
      if (_.isEmpty(this.state.sellers)) {
        ajax('GET', '/api/sellers', (function(_this) {
          return function(sellers) {
            return _this.setState({
              sellers: sellers
            });
          };
        })(this));
      }
      if (_.isEmpty(this.state.listings)) {
        return this.queryListings({}, (function(_this) {
          return function(results) {
            return _this.setState(results);
          };
        })(this));
      }
    },
    onChangeSeller: function(e) {
      var seller;
      seller = e.target.value;
      return this.queryListings({
        seller: seller,
        watched: this.state.watched
      }, (function(_this) {
        return function(results) {
          return _this.setState(_.assign({
            seller: seller,
            currentPage: 1
          }, results));
        };
      })(this));
    },
    onClickPage: function(page) {
      return this.queryListings({
        currentPage: page,
        seller: this.state.seller,
        watched: this.state.watched
      }, (function(_this) {
        return function(results) {
          return _this.setState(_.assign({
            currentPage: page
          }, results));
        };
      })(this));
    },
    onClickWatch: function(listing) {
      listing.watched = !listing.watched;
      this.setState({
        listings: this.state.listings
      });
      return ajax('PUT', "/api/listing/" + listing.id + "?watched=" + listing.watched);
    },
    onChangeWatch: function(e) {
      var watched;
      watched = e.target.checked;
      return this.queryListings({
        seller: this.state.seller,
        watched: watched
      }, (function(_this) {
        return function(results) {
          return _this.setState(_.assign({
            watched: watched,
            currentPage: 1
          }, results));
        };
      })(this));
    },
    render: function() {
      var h, s;
      s = this.state;
      h = React.DOM;
      return h.div({}, factories.SearchFilters({
        seller: s.seller,
        sellers: s.sellers,
        onChangeSeller: this.onChangeSeller,
        onChangeWatch: this.onChangeWatch
      }), factories.ListingTable({
        listings: s.listings,
        onClickWatch: this.onClickWatch
      }), factories.PaginateFooter({
        currentPage: s.currentPage,
        lastPage: s.lastPage,
        onClickPage: this.onClickPage
      }));
    }
  });

  components.SearchFilters = React.createClass({
    render: function() {
      var h, p, seller;
      p = this.props;
      h = React.DOM;
      return h.p({}, "Seller: ", h.select({
        value: p.seller,
        onChange: p.onChangeSeller
      }, h.option({
        key: "allSellers"
      }, ""), (function() {
        var _i, _len, _ref, _results;
        _ref = p.sellers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          seller = _ref[_i];
          _results.push(h.option({
            key: seller,
            value: seller
          }, seller));
        }
        return _results;
      })()), " \u00a0\u00a0\u00a0 Watched listings only: ", h.input({
        type: "checkbox",
        onChange: p.onChangeWatch
      }));
    }
  });

  components.ListingTable = React.createClass({
    render: function() {
      var h, header, listing, p;
      p = this.props;
      h = React.DOM;
      if (_.isEmpty(p.listings)) {
        return h.p({}, "No results found");
      }
      return h.table({}, h.thead({}, h.tr({}, (function() {
        var _i, _len, _ref, _results;
        _ref = ["Watch", "ID", "Seller", "Title"];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          header = _ref[_i];
          _results.push(h.th({
            key: header
          }, header));
        }
        return _results;
      })())), h.tbody({}, (function() {
        var _i, _len, _ref, _results;
        _ref = p.listings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          listing = _ref[_i];
          _results.push(factories.ListingRow({
            key: "listing" + listing.id,
            listing: listing,
            onClickWatch: p.onClickWatch
          }));
        }
        return _results;
      })()));
    }
  });

  components.ListingRow = React.createClass({
    render: function() {
      var h, listing, p;
      p = this.props;
      h = React.DOM;
      listing = p.listing;
      return h.tr({}, h.td({
        onClick: (function() {
          return p.onClickWatch(listing);
        }),
        className: (listing.watched ? "watched" : "notwatched")
      }, listing.watched ? "★" : "☆"), h.td({}, listing.id), h.td({}, listing.seller), h.td({}, listing.title));
    }
  });

  components.PaginateFooter = React.createClass({
    render: function() {
      var h, p, _i, _ref, _results;
      p = this.props;
      h = React.DOM;
      if (p.lastPage === 0) {
        return h.p({});
      }
      return h.p({}, p.currentPage === 1 ? "< Previous" : h.a({
        href: '#',
        onClick: (function() {
          return p.onClickPage(p.currentPage - 1);
        })
      }, "< Previous"), " ", _.map((function() {
        _results = [];
        for (var _i = 1, _ref = p.lastPage; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), function(page) {
        var key;
        key = "page" + page;
        if (page === p.currentPage) {
          return h.span({
            key: key,
            style: {
              fontWeight: 'bold'
            }
          }, " " + page + " ");
        } else {
          return h.span({
            key: key
          }, " ", h.a({
            href: '#',
            onClick: (function() {
              return p.onClickPage(page);
            })
          }, page), " ");
        }
      }), " ", p.currentPage === p.lastPage ? "Next >" : h.a({
        href: '#',
        onClick: (function() {
          return p.onClickPage(p.currentPage + 1);
        })
      }, "Next >"));
    }
  });

  factories = _.mapValues(components, React.createFactory);

  if (typeof module !== "undefined" && module !== null) {
    module.exports = factories.SearchApp;
  } else {
    this.SearchApp = factories.SearchApp;
  }

}).call(this);
