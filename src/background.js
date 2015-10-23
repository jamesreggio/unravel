/* globals chrome */

const util = require('./util');

/*
 * The `declarativeContent` APIs do not reevaluate their conditions upon use of
 * `window.history.pushState`, making them useless for Twitter Fabric, which
 * makes heavy use of `pushState`.
 *
 * As such, we use the more powerful, albeit easily abused, `tabs` APIs for
 * lighting up this browser extension.
 */
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  const parsed = util.parseUrl(tab.url);
  if (parsed.validHost) {
    if (parsed.validPath) {
      chrome.pageAction.setIcon({
        tabId,
        path: {
          19: 'img/icon-19.png',
          38: 'img/icon-38.png',
        },
      });
      chrome.pageAction.setTitle({
        tabId,
        title: 'Click to extract crash',
      });
      chrome.pageAction.setPopup({
        tabId,
        popup: 'popup.html',
      });
    } else {
      chrome.pageAction.setIcon({
        tabId,
        path: {
          19: 'img/icon-disabled-19.png',
          38: 'img/icon-disabled-38.png',
        },
      });
      chrome.pageAction.setTitle({
        tabId,
        title: 'Browse to an individual crash to use this extension',
      });
      chrome.pageAction.setPopup({
        tabId,
        popup: '',
      });
    }
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.hide(tabId);
  }
});
