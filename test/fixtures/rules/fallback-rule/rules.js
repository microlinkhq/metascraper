
module.exports = {
  title: [
    $ => $('title').text(),
    $ => $('h1').first().text(),
  ]
}
