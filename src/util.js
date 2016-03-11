/*
 * Return an object indicating whether the host and path are valid for this
 * browser extension, and if so, the resource paths from the URL.
 */
function parseUrl(url) {
  const REQUIRED_PREFIX = /https:\/\/(www\.)?fabric.io\//;
  const RESOURCE_PARAMS = {
    issue: [['apps', 'projects'], 'issues'],
    session: [['apps', 'projects'], 'issues', 'sessions'],
  };

  // Validate the scheme and host.
  if (!REQUIRED_PREFIX.test(url)) {
    return {
      validHost: false,
      validPath: false,
      resourcePath: null,
    };
  }

  // Generate the resource paths.
  const parts = url.split('/');
  const paths = Object.keys(RESOURCE_PARAMS).reduce((paths, resource) => {
    if (paths === null) {
      return paths;
    }

    const path = RESOURCE_PARAMS[resource].reduce((path, param) => {
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

    if (path === null) {
      paths = null;
    } else {
      paths[resource] = path;
    }

    return paths;
  }, {});

  return {
    validHost: true,
    validPath: !!paths,
    resourcePaths: paths,
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
