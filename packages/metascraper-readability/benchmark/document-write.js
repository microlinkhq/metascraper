'use strict'

const { Window } = require('happy-dom')
const { readFileSync } = require('fs')

const url = 'https://arxiv.org/pdf/2412.06592'
const html = readFileSync('./fixture.html', 'utf8')

const isEqual = (value1, value2) =>
  JSON.stringify(value1) === JSON.stringify(value2)

const cases = {
  'document.documentElement.innerHTML': () => {
    const window = new Window({ url })
    const document = window.document
    document.documentElement.innerHTML = html
    return document
  },
  'document.write': async () => {
    const window = new Window({ url })
    const document = window.document
    document.write(html)
    await window.happyDOM.waitUntilComplete()
    return document
  }
}

const measure = async fn => {
  const now = Date.now()
  const result = await fn()
  return { result, duration: Date.now() - now }
}

const iterations = 10

;(async () => {
  const results = await Promise.all(
    Object.entries(cases).map(async ([name, fn]) => {
      let totalDuration = 0
      let result
      for (let i = 0; i < iterations; i++) {
        const { result: output, duration } = await measure(fn)
        totalDuration += duration
        if (i === iterations - 1) result = output
      }
      const averageDuration = totalDuration / iterations
      return { name, duration: averageDuration, result }
    })
  )

  const [firstResult, ...otherResults] = results.map(({ result }) => result)

  for (const result of otherResults) {
    if (!isEqual(firstResult, result)) {
      throw new Error('Results are different')
    }
  }

  results.forEach(({ name, duration }) => {
    console.log(`${name}: ${duration}ms`)
  })
})()
