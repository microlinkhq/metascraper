'use strict'

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const TOP_MARGIN = 72
const LEFT_MARGIN = 72

const escapeText = text => text.replace(/([\\()])/g, '\\$1')

const toStream = lines => {
  let cursor = PAGE_HEIGHT - TOP_MARGIN
  const operations = []

  for (const { text, size = 10, gap = 6 } of lines) {
    cursor -= size + gap
    operations.push(
      `BT /F1 ${size} Tf ${LEFT_MARGIN} ${cursor.toFixed(2)} Td (${escapeText(
        text
      )}) Tj ET`
    )
  }

  return operations.join('\n')
}

/**
 * Builds a one page PDF out of `{ text, size }` lines, so tests exercise the
 * real parser without committing binaries to the repository.
 */
const createPdf = (lines, { info = {} } = {}) => {
  const stream = toStream(lines)
  const infoEntries = Object.entries(info)
    .map(([key, value]) => `/${key} (${escapeText(String(value))})`)
    .join(' ')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< ${infoEntries} >>`
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = []

  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const startxref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R /Info 6 0 R >>\nstartxref\n${startxref}\n%%EOF\n`

  return Buffer.from(pdf, 'latin1')
}

const { default: listen } = require('async-listen')
const { createServer } = require('http')

const closeServer = server =>
  require('util').promisify(server.close.bind(server))()

const runServer = async (t, handler) => {
  const server = createServer(async (req, res) => {
    try {
      await handler({ req, res })
    } catch (error) {
      console.error(error)
      res.statusCode = 500
      res.end()
    }
  })
  const url = await listen(server, { port: 0, host: '127.0.0.1' })
  t.teardown(() => closeServer(server))
  return url.toString()
}

module.exports = { createPdf, runServer }
