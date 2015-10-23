const util = require('./util');

/*
 * Stringify objects from the Twitter Fabric (Crashlytics) API.
 */
const stringify = module.exports = {
  session(obj) {
    function header() {
      return [
        `${stringify.os(obj.os)} on ${stringify.device(obj.device)}`,
        `Storage: ${[
          `disk ${stringify.storage(obj.storage)}`,
          `memory ${stringify.storage(obj.memory)}`,
        ].join(' and ')}`,
        `Orientation: ${stringify.orientation(obj.orientation)}`,
      ].join('\n');
    }

    function footer() {
      return [
        'Exported from Twitter Fabric in plaintext',
        'by Unravel (https://github.com/jamesreggio/unravel)',
      ].join(' ');
    }

    return [
      header(),
      stringify.stacktrace(obj.stacktraces),
      footer(),
    ].join('\n\n');
  },

  os(obj) {
    return [
      (obj.name === 'ios') ? 'iOS' : obj.name,
      obj.display,
      `(${obj.build})`,
    ].join(' ');
  },

  device(obj) {
    return [
      obj.manufacturer,
      obj.name,
      `(${obj.architecture})`,
    ].join(' ');
  },

  storage(obj) {
    return [
      `${Math.ceil(obj.free / obj.used * 100)}% free`,
      `(${Math.ceil(obj.free / (1024 * 1024))} MB)`,
    ].join(' ');
  },

  orientation(obj) {
    return `device in ${obj.device} and UI in ${obj.ui}`;
  },

  stacktrace(obj) {
    return obj.threads
      .map(stringify.thread)
      .join('\n\n');
  },

  thread(obj) {
    function header() {
      let str = 'Thread';
      if (str !== obj.state) {
        str = `${obj.state} ${str}`;
      }
      str = `${str}: ${obj.name.thread}`;
      if (obj.name.caption) {
        str = `${str} (${obj.name.caption})`;
      }
      return str;
    }

    return [
      header(),
      obj.frames
        .map(stringify.frame)
        .join('\n') || 'No frames recorded.',
    ].join('\n');
  },

  frame(obj, i) {
    return [
      util.alignr(i, 3),
      util.alignl(obj.library, 30),
      util.alignl(obj.address, 10),
      obj.symbol,
      obj.file ?
        `(${obj.file.split('/').pop()}:${obj.line})` :
        `+ ${obj.offset}`,
    ].join(' ');
  },
};
