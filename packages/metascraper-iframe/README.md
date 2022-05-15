<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-iframe</strong>: Get iframe for embedding content for the supported providers.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-iframe --save
```

## Supported providers

The library will check for iframe presence using different techniques:

- **HTML markup**: Looking for oEmbed links presence via `application/json+oembed`/`text/xml+oembed` selectors.
- **oEmbed providers**: Consulting provider that implements [oembed.com](https://oembed.com/) via [oembed-spec](https://github.com/microlinkhq/oembed-spec).
- **Twitter iframe**: Checking for `twitter:player` presence, meaning the target URL impementes [Twitter Player Card spec](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/player-card#:~:text=%C2%A0-,Reference,-Card%20Property).

## API

### metascraper-iframe([options])

#### options

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

## License

**metascraper-iframe** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · Twitter [@microlinkhq](https://twitter.com/microlinkhq)
