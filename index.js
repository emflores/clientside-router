"use strict";

var util = require('./util');

function Router(routes) {
  this.routes = [];
}

Router.prototype.addRoutes = function(routes) {
  routes.forEach(function(route) {
    this.addRoute(route);
  }, this);
};

Router.prototype.addRoute = function(opts) {
  this.routes.push({
    tokens: util.tokenize(opts.pattern),
    name: opts.name,
    cb: opts.cb
  });
};

Router.prototype.navigateByPath = function(path) {
  var route = util.find(this.routes, function(route) {
    return util.doesMatchPath(route.tokens, path);
  });

  if (!route) {
    return;
  }

  return this.pushState(path, route.cb);
};

Router.prototype.getRouteByName = function(name) {
  return util.find(this.routes, function(route) {
    return route.name === name;
  });
};

Router.prototype.getPath = function(name, opts) {
  opts = opts || {};

  var route = this.getRouteByName(name);

  if (!route) {
    return;
  }

  return util.makePath(route.tokens, opts);
};

Router.prototype.navigateByName = function(name, opts) {
  opts = opts || {};

  var route = this.getRouteByName(name);

  if (!route) {
    return;
  }

  var path = util.makePath(route.tokens, opts);
  return this.pushState(path, route.cb);
};

Router.prototype.pushState = function(path, cb) {
  // window.history.pushState(path);
  // cb()
};

// @TODO
// first route is determined after history start
// add popstate listener after first route
Router.prototype.startHistory = function() {
  if (this.historyStarted) {
    return;
  }

  this.historyStarted = true;
};


module.exports = Router;
