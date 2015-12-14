"use strict";

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

function allOptional(tokens) {
  return tokens.every(function(token) {
    return token.isOptional;
  });
}

function doesMatchPath(tokens, requestedPath) {
  var segments = requestedPath.split(PATH_DELIM);
  var loopCount = Math.max(tokens.length, segments.length) - 1;
  var lastTokenWasWildcard = false;
  var indexWithOffset = 0;
  var optionalOffset = 0;

  return everyForN(loopCount, function(index) {
    indexWithOffset = index + optionalOffset;
    var segment = segments[index];
    var token = tokens[indexWithOffset];

    if (token && token.value !== segment && token.isOptional) {
      ++optionalOffset;
      indexWithOffset = index + optionalOffset;
      token = tokens[indexWithOffset];
    }

    var atLastToken = indexWithOffset + 1 === tokens.length;
    var atLastSegment = index + 1 == segments.length;

    if (atLastToken && !atLastSegment && !token.isWildcard) {
      return false;
    }

    if (atLastSegment && !atLastToken && !allOptional(tokens.slice(indexWithOffset + 1))) {
      return false;
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

function everyForN(times, iteratee) {
  for (var i = 0; i < times; ++i) {
    if (!iteratee(i)) {
      return false;
    }
  }
  return true;
}


module.exports = {
  parse: parse,
  tokenize: tokenize,
  makePath: makePath,
  doesMatchPath: doesMatchPath,
  find: find,
  makePathArgs: makePathArgs
};
