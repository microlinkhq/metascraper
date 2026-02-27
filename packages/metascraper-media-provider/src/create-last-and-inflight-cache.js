'use strict'

module.exports = createFn => {
  const inFlightByKey = new Map()
  let lastResult

  return key => {
    if (lastResult?.key === key) {
      return Promise.resolve(lastResult.value)
    }

    const inFlight = inFlightByKey.get(key)
    if (inFlight) return inFlight

    const request = Promise.resolve()
      .then(() => createFn(key))
      .then(value => {
        lastResult = { key, value }
        return value
      })
      .finally(() => {
        inFlightByKey.delete(key)
      })

    inFlightByKey.set(key, request)
    return request
  }
}
