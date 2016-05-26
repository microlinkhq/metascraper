
module.exports = {
  title: ($) => {
    return new Promise((resolve, reject) => {
      const title = $('title').text()
      setTimeout(() => {
        resolve(title)
      }, 100)
    })
  }
}
