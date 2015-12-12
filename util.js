var PATH_DELIM = '/';
var INTERPOLATION_PATTERN = /<(.+)>/;


function parse(segment) {
  var matches = segment.match(INTERPOLATION_PATTERN);
  var isLiteral = !matches;

  return {
    isLiteral: isLiteral,
    value: isLiteral ? segment : matches[1]
  };
}

function tokenize(path) {
  var segments = path.split(PATH_DELIM);
  return segments.map(parse);
}

function makePath(tokens, opts) {
  var segments = tokens.map(function(token) {
    if (token.isLiteral) {
      return token.value;
    }
    return opts[token.value];
  });

  return segments.join(PATH_DELIM);
}

function doesMatchPath(tokens, requestedPath) {
  var segments = requestedPath.split(PATH_DELIM);

  if (tokens.length !== segments.length) {
    return false;
  }

  return tokens.every(function(token, index) {
    if (!token.isLiteral) {
      return true;
    }
    return token.value === segments[index];
  });
}

function find(arr, iteratee) {
  for (var i = 0; i < arr.length; ++i) {
    if (iteratee(arr[i])) {
      return arr[i];
    }
  }
  return undefined;
}


module.exports = {
  parse: parse,
  tokenize: tokenize,
  makePath: makePath,
  doesMatchPath: doesMatchPath,
  find: find
};
