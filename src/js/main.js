/* global codecopy */

window.$docsify = {
  name: 'metascraper',
  repo: 'microlinkhq/metascraper',
  maxLevel: 3,
  executeScript: true,
  auto2top: true,
  ga: 'UA-108549225-3',
  noEmoji: true,
  plugins: [
    function (hook, vm) {
      hook.ready(function () {
        codecopy('pre')
      })
    }
  ]
}
