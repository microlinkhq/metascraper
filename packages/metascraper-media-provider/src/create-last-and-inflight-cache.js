'use strict'

module.exports = createFn => {
  const cacheByContext = new WeakMap()
  const defaultContext = {}

  const getCacheFor = context => {
    let cache = cacheByContext.get(context)
    if (!cache) {
      cache = new Map()
      cacheByContext.set(context, cache)
    }
    return cache
  }

  return (key, rawContext = defaultContext) => {
    const context =
      rawContext !== null &&
      (typeof rawContext === 'object' || typeof rawContext === 'function')
        ? rawContext
        : defaultContext

    const cache = getCacheFor(context)
    const cached = cache.get(key)
    if (cached) return cached

    const request = createFn(key).catch(error => {
      cache.delete(key)
      throw error
    })

    cache.set(key, request)
    return request
  }
}
