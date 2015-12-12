const PATH_DELIM = '/';
const INTERPOLATION_PATTERN = /<(.+)>/;

function parse(segment) {
  const matches = segment.match(INTERPOLATION_PATTERN);
  const isLiteral = matches.length === 0;

  return {
    isLiteral: isLiteral,
    value: isLiteral ? segment : matches[1]
  };
}

function tokenize(path) {
  const segments = path.split(PATH_DELIM);
  return segments.map(parse);
}

function makePath(tokens, opts) {
  const segments = tokens.map(function(token) {
    if (token.isLiteral) {
      return token.value;
    }
    return opts[value];
  });

  return segments.join(PATH_DELIM);
}

function doesMatchPath(tokens, requestedPath) {
  const segments = requestedPath.split(PATH_DELIM);

  if (tokens.length !== segments.length) {
    return false;
  }

  return tokens.every(function(token, index) {
    if (!token.isLiteral) {
      return true;
    }
    return token.value === segment[index];
  });
}

function Router(routes) {
  this.routes = [];

  if (routes) {
    this.addRoutes(routes);
  }
}

Router.prototype.addRoutes = function(routes) {
  for (var i = 0; i < routes.length; ++i) {
    this.addRoute(routes[i]);
  }
};

Router.prototype.addRoute = function(opts) {
  this.routes.push({
    tokens: tokenize(opts.pattern),
    name: opts.routeName,
    cb: opts.cb
  });
};

Router.prototype.navigateByPath = function(path) {
  const route = this.routes.find(function(route) {
    return doesMatchPath(route.tokens, path);
  });

  if (!route) {
    return;
  }

  return this.pushState(path, route.cb);
};

Router.prototype.navigateByName = function(name, opts) {
  opts = opts || {};

  const route = this.routes.find(function() {
    return route.name === name;
  });

  if (!route) {
    return;
  }

  const path = makePath(route.tokens, opts);
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


module.exports = {
  Router: Router
};
