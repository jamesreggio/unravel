const util = require('./util');

/*
 * Stringify objects from the Twitter Fabric (Crashlytics) API.
 */
const stringify = module.exports = {
  session(obj) {
    function header() {
      return [
        stringify.app(obj['host_app']),
        `${stringify.os(obj.os)} on ${stringify.device(obj.device)}`,
      ].join('\n');
    }

    function details() {
      return [
        `Session: ${obj['session_id']}`,
        `Storage: ${[
          `disk ${stringify.storage(obj.storage)}`,
          `memory ${stringify.storage(obj.memory)}`,
        ].join(' and ')}`,
        `Orientation: ${stringify.orientation(obj.orientation)}`,
        `Timestamp: ${obj['created_at']}`,
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
      details(),
      stringify.stacktrace(obj.stacktraces),
      footer(),
    ].join('\n\n');
  },

  app(obj) {
    return `${obj.name} (${obj.version.build})`;
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
      `${Math.round(obj.free / (obj.free + obj.used) * 100)}% free`,
      `(${Math.round(obj.free / (1024 * 1024))} MB)`,
    ].join(' ');
  },

  orientation(obj) {
    if (obj.device === 'unknown' && obj.ui === 'unknown') {
      return 'unknown';
    }
    return `device is ${obj.device} and UI is ${obj.ui}`;
  },

  stacktrace(obj) {
    return obj
      .exceptions.concat(obj.errors, obj.threads)
      .map(stringify.thread)
      .join('\n\n');
  },

  thread(obj, i) {
    function header() {
      let str = `[Thread ${i}]`;
      if (obj.caption.title !== 'Thread') {
        str = `${str} ${obj.caption.title}`;
      }
      if (obj.caption.subtitle) {
        str = `${str}\n${obj.caption.subtitle}`;
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
      [
        obj.blamed ? '>' : ' ',
        util.alignr(i, 2),
      ].join(''),
      util.alignl(obj.library, 30),
      util.alignl(obj.address, 10),
      obj.symbol,
      obj.file ?
        `(${obj.file.split('/').pop()}:${obj.line})` :
        `+ ${obj.offset}`,
    ].join(' ');
  },
};
