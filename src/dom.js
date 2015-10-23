/*
 * Execute a function for each node matching a selector.
 */
function eachNode(fn, sel) {
  Array.prototype.slice.apply(document.querySelectorAll(sel)).forEach(fn);
}

/*
 * Set the `display` style for each node matching a selector.
 */
function setDisplay(value, sel) {
  eachNode((node) => node.style.display = value, sel);
}

/*
 * Set the value for each node matching a selector.
 */
function setValue(sel, value) {
  eachNode((node) => node.value = value, sel);
}

/*
 * Select the contents of the first node matching a selector.
 */
function select(sel) {
  const el = document.querySelector(sel);
  if (el) {
    el.focus();
    el.select();
  }
}

module.exports = {
  setValue,
  select,
  show: setDisplay.bind(null, 'block'),
  hide: setDisplay.bind(null, 'none'),
};
