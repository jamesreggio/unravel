/* globals chrome */

const dom = require('./dom');
const RESULT_TYPES = ['success', 'error'];

/*
 * Manipulate the DOM to display a result.
 */
function showResult(type, payload) {
  dom.hide('.initial, .toggle');
  dom.setValue('#payload', payload);
  dom.show(`.toggle.${type}`);
  dom.select('#payload');
}

/*
 * Add an extension messaging listener to receive messages from the injected
 * content script and display the results.
 */
function addListener() {
  return new Promise((resolve) => {
    chrome.runtime.onMessage.addListener((message) => {
      if (!message) {
        return;
      }
      if (RESULT_TYPES.indexOf(message.type) === -1) {
        showResult(
          'error',
          `Unexpected extension message type: ${message.type}`
        );
        return;
      }
      showResult(message.type, message.payload);
    });
    resolve();
  });
}

/*
 * Return the active tab.
 */
function getTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, (tabs) => {
      if (tabs.length !== 1) {
        reject(`Unexpected active tab count: ${tabs.length}`);
      } else {
        resolve(tabs[0]);
      }
    });
  });
}

/*
 * Inject and execute the content script.
 */
function executeScript(tab) {
  return new Promise((resolve) => {
    chrome.tabs.executeScript(tab.tabId, {
      file: 'lib/inject.js',
    }, resolve);
  });
}

addListener()
  .then(getTab)
  .then(executeScript)
  .catch(showResult.bind(null, 'error'));
