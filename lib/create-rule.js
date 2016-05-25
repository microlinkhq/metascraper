
import isIso from 'is-isodate'
import toDate from 'date.js'

/**
 * Create a meta tag rule.
 *
 * @param {String} selector
 * @return {Function} rule
 */

export function meta(selector) {
  return async (window) => {
    const el = window.document.querySelector(selector)
    if (!el) return
    return el.getAttribute('content')
  }
}

/**
 * Create a time tag rule.
 *
 * @param {String} selector
 * @return {Function} rule
 */

export function time(selector) {
  return async (window) => {
    const el = window.document.querySelector(selector)
    if (!el) return
    return el.getAttribute('datetime')
  }
}

/**
 * Create a text rule.
 *
 * @param {String} selector
 * @return {Function} rule
 */

export function text(selector) {
  return async (window) => {
    const el = window.document.querySelector(selector)
    if (!el) return
    return el.textContent
  }
}
