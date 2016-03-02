# ![Icon](/chrome/img/icon-24.png) Unravel

[Chrome extension](https://chrome.google.com/webstore/detail/unravel/opccdmdchkjidmnneegkgglhgigpkopa)
that extracts a plaintext crash from the Crashlytics tab in Twitter Fabric.

## How to use

1. Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/unravel/opccdmdchkjidmnneegkgglhgigpkopa).
1. Navigate to a specific crash within Crashlytics on [Twitter Fabric](https://fabric.io).  
   _Click **More details...** next to **Viewing latest crash** to reach a
   specific crash instance._
1. Click the blue Crashlytics icon in your address bar.
1. Copy the plaintext crash to your clipboard.

If you experience any issues, fret not: the Crashlytics website has probably
changed in a minor way and has broken this extension. Please [file an issue](https://github.com/jamesreggio/unravel/issues/new)
and I'll take care of it.

## How to develop locally

Ensure `./node_modules/.bin` is in your path, then run:

```bash
npm install
make watch
```

Follow [these instructions](https://developer.chrome.com/extensions/getstarted#unpacked)
to install an 'unpacked extension' in Chrome. You'll need to point it at the
`chrome` subdirectory within the repository.

## How to publish

Bump the version in `package.json` and `manifest.json`, then run:

```bash
npm run prepublish
```

Upload `chrome.zip` to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

## How it works

The Chrome Extension development model is a bit wonky, so this was my best
attempt to abide by the [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)
and minimize the number of moving parts.

The extension is implemented as a [page action](https://developer.chrome.com/extensions/pageAction),
which is designed to appear inside the address bar as a contextual aid. (The
alternative is a [browser action](https://developer.chrome.com/extensions/browserAction),
which appears to the right of the address bar and is typically agnostic to the
current page.)

The extension performs messaging between the following modules:

1. When Chrome starts up, it loads the extension and runs [`background.js`](/src/background.js),
   which executes in a headless window and observes navigation across all tabs.
1. When a tab navigates to an eligible URL, [`background.js`](/src/background.js)
   enables the page action icon.
1. When the user clicks the page action icon, Chrome loads [`popup.html`](/chrome/popup.html)
   and [`popup.js`](/src/popup.js). The latter immediately executes [`inject.js`](/src/inject.js)
   in the active tab as a content script.
1. Content scripts do not have direct access to the tab's `window` object but
   they do have access to the tab's DOM, so [`inject.js`](/src/inject.js)
   immediately crafts a simple, stringified script block which it injects into
   the Crashlytics DOM via a `script` element.
1. The literal script executes, performs an AJAX request using the current
   user's session, and then sends a `unravel:success` or `unravel:error`
   payload to [`inject.js`](/src/inject.js) via `window.postMessage`.
1. [`inject.js`](/src/inject.js) uses [`stringify.js`](/src/stringify.js) to
   create a plaintext representation of the AJAX payload, which it sends to [`popup.js`](/src/popup.js)
   via Chrome Extension messaging.
1. [`popup.js`](/src/popup.js) manipulates the contents of [`popup.html`](/chrome/popup.html)
   to display the plaintext payload.

_N.B.:_ I made an attempt to build a headless extension which copied the
payload directly to the system clipboard; however, there appears to be an
arbitrary limit on the amount of text which can be programmatically copied.
Most crashes exceed this limit, resulting in a silent failure and no text
copied.
