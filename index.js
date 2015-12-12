"use strict";

var util = require('./util');
var win = require('./browser-shim');

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

Router.prototype.getRouteByPath = function(path) {
  return util.find(this.routes, function(route) {
    return util.doesMatchPath(route.tokens, path);
  });
};

Router.prototype.navigateByPath = function(path) {
  var route = this.getRouteByPath(path);

  if (!route) {
    return;
  }

  return this.pushState(path, route);
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
  return this.pushState(path, route);
};

Router.prototype.pushState = function(path, route) {
  win.history.pushState({}, '', path);
  route.cb(util.makePathArgs(path, route.tokens));
};

Router.prototype.addListeners = function() {
  var self = this;

  win.addEventListener('popstate', function() {
    var path = win.location.pathname;
    var route = self.getRouteByPath(path);

    if (route) {
      route.cb(util.makePathArgs(path, route.tokens));
    }
  });

  win.document.addEventListener('click', function(e) {
    if (!e.target ||
        e.target.tagName.toLowerCase() !== 'a' ||
        e.target.target ||
        e.target.dataset.external) {
      return;
    }

    var path = e.target.pathname;
    var route = self.getRouteByPath(path);

    if (route) {
      e.preventDefault();
      self.pushState(path, route);
    }
  });
};

Router.prototype.startHistory = function() {
  if (this.historyStarted) {
    return;
  }

  var path = win.location.pathname;
  var route = this.getRouteByPath(path);

  if (route) {
    route.cb(util.makePathArgs(path, route.tokens));
  }

  this.addListeners();
  this.historyStarted = true;
};


module.exports = Router;
