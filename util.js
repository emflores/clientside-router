const PATH_DELIM = '/';
const INTERPOLATION_PATTERN = /<(.+)>/;


function parse(segment) {
  const matches = segment.match(INTERPOLATION_PATTERN);
  const isLiteral = !matches;

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


module.exports = {
  parse: parse,
  tokenize: tokenize,
  makePath: makePath,
  doesMatchPath: doesMatchPath
};
