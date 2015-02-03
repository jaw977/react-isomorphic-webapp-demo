# react-isomorphic-webapp-demo

Single page web application written using React, Coffeescript, and lodash, with a node.js / express web server.  A GET request of the root, /, will serve the webapp with the initial page of results pre-rendered in the HTML response.  GET /index.html will serve the webapp in non isomorphic mode without the pre-rendered results.  The web application source is `src/searchapp.coffee`, and the server source is `src/server.coffee`.

Instructions to run:

```
$ npm install
$ cd out
$ node server.js
```

Running `gulp` will cause the source files at `src/*.coffee` to be watched and compiled to `out/*.js` when they change.

