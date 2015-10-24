# ![Icon](/chrome/img/icon-24.png) Unravel

[Chrome extension](https://chrome.google.com/webstore/detail/unravel/opccdmdchkjidmnneegkgglhgigpkopa)
that extracts a plaintext crash from Twitter Fabric (formerly known as
Crashlytics).

## How to use

1. Install the extension from the
   [Chrome Web Store](https://chrome.google.com/webstore/detail/unravel/opccdmdchkjidmnneegkgglhgigpkopa).
2. Navigate to a specific crash within Crashlytics on
   [Twitter Fabric](https://fabric.io).  
   _You may have to click **More details...* next to **Viewing latest crash**
   to reach a specific crash instance._
3. Click the blue Crashlytics logo in your address bar.
4. Copy the plaintext crash to your clipboard.

If you experience any issues, fret not: the Crashlytics website has probably
changed in a minor way that has broken this extension. Please
[file an issue](https://github.com/jamesreggio/unravel/issues/new) and I'll
take care of it.

## How to develop locally

Ensure `./node_modules/.bin` is in your path, then run:

```sh
npm install
make watch
```

Follow [these instructions](https://developer.chrome.com/extensions/getstarted#unpacked)
to install an 'unpacked extension' into Chrome. You'll need to point it at the
`chrome` subdirectory within the repository.

## How to publish

Bump the version in `package.json` and `manifest.json`, then run:

```sh
npm run prepublish
```

Upload `chrome.zip` to the
[Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
