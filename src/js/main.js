/* global codecopy */

window.$docsify = {
  repo: 'microlinkhq/metascraper',
  maxLevel: 4,
  executeScript: true,
  auto2top: true,
  noEmoji: true,
  plugins: [
    function (hook, vm) {
      hook.ready(function () {
        codecopy('pre')
      })
    }
  ]
}
