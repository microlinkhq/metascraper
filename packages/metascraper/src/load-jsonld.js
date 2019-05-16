'use strict'

module.exports = $ => {
  try {
    const json = $('script[type="application/ld+json"]')
      .first()
      .contents()
      .text()
    return JSON.parse(json)
  } catch (e) {
    return {}
  }
}
