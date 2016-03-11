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
  if (parsed.validPath) {
    chrome.pageAction.setTitle({
      tabId,
      title: 'Click to extract crash',
    });
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.setTitle({
      tabId,
      title: 'Browse to an individual crash to use this extension',
    });
    chrome.pageAction.hide(tabId);
  }
});
