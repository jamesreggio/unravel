/* globals chrome */

const util = require('./util');
const stringify = require('./stringify');

/*
 * Send the result to the `popup` module via extension messaging.
 */
function sendResult(type, payload) {
  chrome.runtime.sendMessage({type, payload});
}

/*
 * Wrap a function in an exception handler that sends an error message.
 */
function protect(fn) {
  return function() {
    try {
      fn.apply(this, arguments);
    } catch (e) {
      sendResult('error', e.stack || e.toString());
      window.unravel.requesting = false;
    }
  };
}

/*
 * Receive a `postMessage` from the Twitter Fabric page and forward along the
 * payload in a success message.
 */
function receiveMessage(e) {
  // Verify message is ours to receive.
  if (e.source !== window) {
    return;
  }
  if (!e.data || !e.data.type) {
    return;
  }

  // Process message.
  window.unravel.requesting = false;
  switch (e.data.type) {
    case 'unravel:success':
      sendResult('success', stringify.session(e.data.payload));
      break;
    case 'unravel:error':
      throw new Error(
        `API returned an error: ${JSON.stringify(e.data.payload)}`
      );
    default:
      throw new Error(
        `Unexpected window message type: ${e.data.type}`
      );
  }
}

/*
 * Inject code into the Twitter Fabric page to request a crash session and
 * message the results back via `postMessage`.
 */
function requestSession() {
  const API_PREFIX = 'https://fabric.io/api/v3';

  // Check for a request in progress.
  if (window.unravel.requesting) {
    return;
  }
  window.unravel.requesting = true;

  // Install a `postMessage` handler.
  if (!window.unravel.installed) {
    window.addEventListener('message', protect(receiveMessage));
    window.unravel.installed = true;
  }

  // Parse and confirm that the URL is valid for this browser extension.
  const url = window.location.href;
  const parsed = util.parseUrl(url);
  if (!parsed.validHost || !parsed.validPath) {
    throw new Error(
      `Extension script was injected for an invalid URL: ${url}`
    );
  }

  // Build the resource URLs.
  const resourceUrls = Object.keys(parsed.resourcePaths)
    .reduce((urls, key) => {
      urls[key] = [API_PREFIX, parsed.resourcePaths[key]].join('');
      return urls;
    }, {
      config: 'https://fabric.io/api/v2/client_boot/config_data',
    });

  // Inject a `script` element to fetch the resource and `postMessage` back.
  // Yes, this is janky as hell.
  function fetch() {
    const resourceUrls = '%resourceUrls%';
    const configUrl = resourceUrls.config;
    delete resourceUrls.config;

    function fail(xhr, status, error) {
      window.postMessage({
        type: 'unravel:error',
        payload: {status, error},
      }, '*');
    }

    window.$.get(configUrl)
      .done((data) => {
        const app = data.current_application || {};
        const keys = Object.keys(resourceUrls);
        const urls = keys.map((key) => {
          return resourceUrls[key].replace(
            `/${app.bundle_identifier.toLowerCase()}/`,
            `/${app.id}/`
          );
        });

        window.$.when.apply(
          window.$,
          urls.map((url) => window.$.get(url))
        ).done((...arr) => {
          const payload = keys.reduce((obj, key, i) => {
            const data = arr[i];
            if (data) {
              obj[key] = data[0];
            }
            return obj;
          }, {app});
          window.postMessage({
            type: 'unravel:success',
            payload,
          }, '*');
        })
        .fail(fail);
      })
      .fail(fail);
  }

  const scriptText =
    `(${fetch.toString()})()`
    .replace('"%resourceUrls%"', JSON.stringify(resourceUrls));

  const scriptEl = document.createElement('script');
  scriptEl.innerHTML = scriptText;
  document.body.appendChild(scriptEl);
}

// Immediately attempt to request the current session.
window.unravel = window.unravel || {};
protect(requestSession)();
