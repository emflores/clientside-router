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

  return this.pushState(path);
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
  return this.pushState(path);
};

Router.prototype.pushState = function(path) {
  win.history.pushState({}, '', path);
};

Router.prototype.addListeners = function() {
  var self = this;

  win.addEventListener('popstate', function() {
    var route = self.getRouteByPath(win.location.pathname);

    if (route) {
      route.cb();
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
      route.cb();
    }
  });
};

Router.prototype.startHistory = function() {
  if (this.historyStarted) {
    return;
  }

  var route = this.getRouteByPath(win.location.pathname);

  if (route) {
    route.cb();
  }

  this.addListeners();
  this.historyStarted = true;
};


module.exports = Router;
