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
      sendResult(
        'success',
        stringify.session(e.data.payload['crash_session'])
      );
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
function requestSession(url) {
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
  const parsed = util.parseUrl(url);
  if (!parsed.validHost || !parsed.validPath) {
    throw new Error(
      `Extension script was injected for an invalid URL: ${url}`
    );
  }

  // Build the resource URL.
  const resourceUrl = [API_PREFIX, parsed.resourcePath].join('');

  // Inject a `script` element to fetch the resource and `postMessage` back.
  // Yes, this is janky as hell.
  function fetch() {
    window.$.get('%resourceUrl%')
      .done((data) => {
        window.postMessage({
          type: 'unravel:success',
          payload: data,
        }, '*');
      })
      .fail((xhr, status, error) => {
        window.postMessage({
          type: 'unravel:error',
          payload: {status, error},
        }, '*');
      });
  }

  const scriptText =
    `(${fetch.toString()})()`
    .replace('%resourceUrl%', resourceUrl);
  const scriptEl = document.createElement('script');
  scriptEl.innerHTML = scriptText;
  document.body.appendChild(scriptEl);
}

// Immediately attempt to request the current session.
window.unravel = window.unravel || {};
protect(requestSession)(window.location.href);
