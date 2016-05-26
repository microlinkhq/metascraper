
module.exports = {
  title: wrap($ => $('title').text()),
}

function wrap(rule) {
  return ($) => {
    const value = rule($)
    return value
  }
}
