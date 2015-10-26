const util = require('./util');

/*
 * Stringify objects from the Twitter Fabric (Crashlytics) API.
 */
const stringify = module.exports = {
  session(obj) {
    const {issue, session} = obj;

    function header() {
      return [
        stringify.app(obj),
        stringify.issue(issue),
      ].join('\n');
    }

    function details() {
      return [
        `System: ${[
          stringify.os(session.os),
          stringify.device(session.device),
        ].join(' on ')}`,
        `Storage: ${[
          `disk ${stringify.storage(session.storage)}`,
          `memory ${stringify.storage(session.memory)}`,
        ].join(' and ')}`,
        `Orientation: ${stringify.orientation(session.orientation)}`,
        `Session: ${session.session_id}`,
        `Timestamp: ${session.created_at}`,
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
      stringify.stacktrace(session.stacktraces),
      footer(),
    ].join('\n\n');
  },

  app(obj) {
    return [
      obj.app.name,
      obj.session.host_app.version.build,
      `(${obj.app.bundle_identifier})`,
    ].join(' ');
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

  issue(obj) {
    return `Issue #${obj.display_id} (Level ${obj.impact_level})`;
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
      .exceptions.concat(obj.errors)
      .filter((obj) => obj.frames && obj.frames.length)
      .concat(obj.threads)
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
