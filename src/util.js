/*
 * Return an object indicating whether the host and path are valid for this
 * browser extension, and if so, the resource path from the URL.
 */
function parseUrl(url) {
  const REQUIRED_PREFIX = 'https://fabric.io/';
  const REQUIRED_PARAMS = [['apps', 'projects'], 'issues', 'sessions'];

  if (url.indexOf(REQUIRED_PREFIX) !== 0) {
    return {
      validHost: false,
      validPath: false,
      resourcePath: null,
    };
  }

  const parts = url.split('/');
  const path = REQUIRED_PARAMS.reduce((path, param) => {
    if (path === null) {
      return path;
    }

    const [find, use] = Array.isArray(param) ? param : [param, param];
    const i = parts.indexOf(find);
    if (i === -1 || i === parts.length) {
      return null;
    }

    return `${path}/${use}/${parts[i + 1]}`;
  }, '');

  return {
    validHost: true,
    validPath: !!path,
    resourcePath: path,
  };
}

/*
 * Align a string within a fixed-width column.
 */
function align(right, str, width) {
  str = String(str);
  const n = Math.max(0, width - str.length);
  for (let i = 0; i < n; i++) {
    str = right ? (' ' + str) : (str + ' ');
  }
  return str;
}

module.exports = {
  parseUrl,
  alignl: align.bind(null, false),
  alignr: align.bind(null, true),
};
