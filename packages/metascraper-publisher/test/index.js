'use strict'

const should = require('should')
const metascraper = require('metascraper')([require('..')()])

const getHtml = title => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${title}</title>
</head>
<body>
</body>
</html>
`

describe('metascraper-publisher', () => {
  describe('from title', async () => {
    ;[
      'Murcia | Wikipedia',
      'Murcia - Wikipedia',
      '| Wikipedia',
      'San Antonio Spurs guard Manu Ginobili... - San Antonio Spurs | Wikipedia',
      'San Antonio Spurs guard Manu Ginobili... | San Antonio Spurs - Wikipedia'
    ].forEach(title =>
      it(`${title} → Wikipedia`, async () => {
        const url = 'https://en.wikipedia.org/wiki/Murcia'
        const { publisher } = await metascraper({ html: getHtml(title), url })
        should(publisher).be.equal('Wikipedia')
      })
    )
  })
})
