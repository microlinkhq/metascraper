'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { jsonld } = require('..')

test('empty object if JSON-LD is not preset into the html', t => {
  const $ = cheerio.load('')
  const data = jsonld($)
  t.deepEqual(data, [])
})

test('normalize @graph', t => {
  const content = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article'
      },
      {
        '@type': 'WebPage'
      }
    ]
  }

  const html = `
      <script type="application/ld+json"> { "@context": "http://schema.org", "@type": "Organization", "url": "https://bykvu.com/ru", "logo": "https://bykvu.com/wp-content/themes/bykvu/img/logo.svg" } </script>
      <script type="application/ld+json">${JSON.stringify(content)}</script>
      `

  const $ = cheerio.load(html)
  const data = jsonld($)
  t.snapshot(data)
})

test('parse JSON-LD from markup if it is present', t => {
  const $ = cheerio.load(
    '<script type="application/ld+json">{"@context":"http://schema.org","@type":"NewsArticle","mainEntityOfPage":"https://www.theverge.com/2017/11/16/16667366/tesla-semi-truck-announced-price-release-date-electric-self-driving","headline":"This is the Tesla Semi truck","description":"500 miles of range and more aerodynamic than a supercar","speakable":{"@type":"SpeakableSpecification","xpath":["/html/head/title","/html/head/meta[@name=\'description\']/@content"]},"datePublished":"2017-11-16T23:47:07-05:00","dateModified":"2017-11-16T23:47:07-05:00","author":{"@type":"Person","name":"Zac Estrada"},"publisher":{"@type":"Organization","name":"The Verge","logo":{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/uploads/chorus_asset/file/13668586/google_amp.0.png","width":600,"height":60}},"about":{"@type":"Event","name":"Tesla Semi Truck Event 2017","startDate":"2017-11-17T04:00:00+00:00","location":{"@type":"Place","name":"Tesla Motors factory","address":"Hawthorne, California, USA"}},"image":[{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/k8ssXKPAuRwxa1pKew982ZMgv0o=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1400},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/l6nkV8CkJIdUrJIzHFWUFc1zLRM=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1050},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/5Sqo6J73lBi1hwzEiKCQy6FLx3I=/1400x788/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":788}]}</script>'
  )
  const data = jsonld($)
  t.snapshot(data)
})

test('ensure to return first value', t => {
  const $ = cheerio.load(
    '<script type="application/ld+json">[{"@context":"http://schema.org","@type":"NewsArticle","mainEntityOfPage":"https://www.theverge.com/2017/11/16/16667366/tesla-semi-truck-announced-price-release-date-electric-self-driving","headline":"This is the Tesla Semi truck","description":"500 miles of range and more aerodynamic than a supercar","speakable":{"@type":"SpeakableSpecification","xpath":["/html/head/title","/html/head/meta[@name=\'description\']/@content"]},"datePublished":"2017-11-16T23:47:07-05:00","dateModified":"2017-11-16T23:47:07-05:00","author":{"@type":"Person","name":"Zac Estrada"},"publisher":{"@type":"Organization","name":"The Verge","logo":{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/uploads/chorus_asset/file/13668586/google_amp.0.png","width":600,"height":60}},"about":{"@type":"Event","name":"Tesla Semi Truck Event 2017","startDate":"2017-11-17T04:00:00+00:00","location":{"@type":"Place","name":"Tesla Motors factory","address":"Hawthorne, California, USA"}},"image":[{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/k8ssXKPAuRwxa1pKew982ZMgv0o=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1400},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/l6nkV8CkJIdUrJIzHFWUFc1zLRM=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1050},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/5Sqo6J73lBi1hwzEiKCQy6FLx3I=/1400x788/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":788}]}]</script>'
  )
  const data = jsonld($)
  t.true(Object.keys(data).length > 0)
})

test('reads multiple JSON-LD blocks', t => {
  const $ = cheerio.load(`<script type="application/ld+json"> { "@context": "http://schema.org", "@type": "Organization", "url": "https://bykvu.com/ru", "logo": "https://bykvu.com/wp-content/themes/bykvu/img/logo.svg" } </script>
        <script type="application/ld+json"> { "@context": "http://schema.org", "@type": "NewsArticle", "mainEntityOfPage": { "@type": "WebPage", "@id": "https://bykvu.com/ru/bukvy/uchenye-nazvali-depressiju-prichinoj-22-opasnyh-zabolevanij/" }, "headline": "Ученые назвали депрессию причиной 22 опасных заболеваний", "image": [ "https://bykvu.com/wp-content/themes/bykvu/includes/images/noimage_large.jpg" ], "datePublished": "2019-09-09T00:29:09+02:00", "dateModified": "2019-09-09T00:29:09+02:00", "author": { "@type": "Person", "name": "Буквы" }, "publisher": { "@type": "Organization", "name": "Буквы", "logo": { "@type": "ImageObject", "url": "https://bykvu.com/wp-content/themes/bykvu/img/apple-icon-180x180.png" } }, "description": "Ученые австралийского центра точного здравоохранения при Университете Южной Австралии выяснили, что депрессия является причиной 22 различных заболеваний." } </script>
        <script type="application/ld+json"> { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "item": { "@id": "https://bykvu.com/ru", "name": "Буквы" } }, { "@type": "ListItem", "position": 2, "item": { "@id": "https://bykvu.com/ru/category/bukvy/", "name": "Новости" } }, { "@type": "ListItem", "position": 3, "item": { "@id": "https://bykvu.com/ru/bukvy/uchenye-nazvali-depressiju-prichinoj-22-opasnyh-zabolevanij/", "name": "Ученые назвали депрессию причиной 22 опасных заболеваний" } } ] } </script>`)

  const data = jsonld($)
  t.is(Object.keys(data).length, 3)
})

test('only caches the last invocation', t => {
  const html =
    '<script type="application/ld+json">[{"@context":"http://schema.org","@type":"NewsArticle","mainEntityOfPage":"https://www.theverge.com/2017/11/16/16667366/tesla-semi-truck-announced-price-release-date-electric-self-driving","headline":"This is the Tesla Semi truck","description":"500 miles of range and more aerodynamic than a supercar","speakable":{"@type":"SpeakableSpecification","xpath":["/html/head/title","/html/head/meta[@name=\'description\']/@content"]},"datePublished":"2017-11-16T23:47:07-05:00","dateModified":"2017-11-16T23:47:07-05:00","author":{"@type":"Person","name":"Zac Estrada"},"publisher":{"@type":"Organization","name":"The Verge","logo":{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/uploads/chorus_asset/file/13668586/google_amp.0.png","width":600,"height":60}},"about":{"@type":"Event","name":"Tesla Semi Truck Event 2017","startDate":"2017-11-17T04:00:00+00:00","location":{"@type":"Place","name":"Tesla Motors factory","address":"Hawthorne, California, USA"}},"image":[{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/k8ssXKPAuRwxa1pKew982ZMgv0o=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1400},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/l6nkV8CkJIdUrJIzHFWUFc1zLRM=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":1050},{"@type":"ImageObject","url":"https://cdn.vox-cdn.com/thumbor/5Sqo6J73lBi1hwzEiKCQy6FLx3I=/1400x788/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/9699573/Semi_Front_Profile.jpg","width":1400,"height":788}]}]</script>'

  // Load it and process it with jsonld.
  const $ = cheerio.load(html)
  const $mutate = cheerio.load($.html())
  const json = jsonld($)

  // Remove the script from the document. This never happens in the
  // codebase, but it's done to show that the last invocation is cached
  // because the value of $ does not change when we do this.
  $mutate('script[type="application/ld+json"]').remove()

  // Load the HTML again and use it to process with jsonld. We will expect
  // that the mutate created does not equal to original, even though it has the
  // same arguments.
  t.notDeepEqual(json, jsonld($mutate))

  // Load it and process it with the same instance of cheerio. Because this
  // is the same arguments used in json1, json2 should be equal to one
  // another.
  t.deepEqual(json, jsonld(cheerio.load($.html())))
})
