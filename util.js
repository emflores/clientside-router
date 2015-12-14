var PATH_DELIM = '/';
var INTERPOLATION_PATTERN = /<(.+)>/;
var WILDCARD = '*';
var OPTIONAL = '?';


function parse(segment) {
  var matches = segment.match(INTERPOLATION_PATTERN);
  var isLiteral = !matches;
  var isOptional = isLiteral && segment.slice(-1) === OPTIONAL;
  var isWildcard = isLiteral && segment === WILDCARD;
  var value = null;

  if (isOptional) {
    value = segment.slice(0, -1);
  } else if (isLiteral) {
    value = segment;
  } else {
    value = matches[1];
  }

  return {
    isLiteral: isLiteral,
    value: value,
    isWildcard: isWildcard,
    isOptional: isOptional
  };
}

function tokenize(path) {
  var segments = path.split(PATH_DELIM);
  return segments.map(parse);
}

function makePath(tokens, opts) {
  var hasSpecialField = false;

  var segments = tokens.map(function(token) {
    if (token.isWildcard) {
      return;
    }

    if (token.isLiteral) {
      return token.value;
    }
    return opts[token.value];
  });

  return segments.join(PATH_DELIM);
}

function makePathArgs(path, tokens) {
  var segments = path.split(PATH_DELIM);

  return tokens.reduce(function(accum, token, index) {
    if (!token.isLiteral) {
      accum[token.value] = segments[index];
    }
    return accum;
  }, {});
}

function doesMatchPath(tokens, requestedPath) {
  var segments = requestedPath.split(PATH_DELIM);
  var lastTokenWasWildcard = false;
  var optionalOffset = 0;

  return segments.every(function(segment, index, arr) {
    var token = tokens[index + optionalOffset];

    if (token && token.value !== segment && token.isOptional) {
      ++optionalOffset;
      token = tokens[index + optionalOffset];
    }

    if (!token && lastTokenWasWildcard) {
      return true;
    }

    if (!token) {
      return false;
    }

    if (token.isWildcard) {
      lastTokenWasWildcard = true;
      return true;
    }

    if (!token.isLiteral) {
      return true;
    }

    return token.value === segment;
  });
}

function find(arr, iteratee) {
  for (var i = 0; i < arr.length; ++i) {
    if (iteratee(arr[i])) {
      return arr[i];
    }
  }
  return;
}


module.exports = {
  parse: parse,
  tokenize: tokenize,
  makePath: makePath,
  doesMatchPath: doesMatchPath,
  find: find,
  makePathArgs: makePathArgs
};
