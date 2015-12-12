"use strict";

const util = require('./util');

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
  const route = util.find(this.routes, function(route) {
    return util.doesMatchPath(route.tokens, path);
  });

  if (!route) {
    return;
  }

  return this.pushState(path, route.cb);
};

Router.prototype.navigateByName = function(name, opts) {
  opts = opts || {};

  const route = util.find(this.routes, function(route) {
    return route.name === name;
  });

  if (!route) {
    return;
  }

  const path = util.makePath(route.tokens, opts);
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
