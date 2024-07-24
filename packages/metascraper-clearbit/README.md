<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-clearbit</strong>: Metascraper integration with Clearbit Logo API.</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-clearbit --save
```

## API

### metascraper-clearbit([options])

#### options

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

In addition, these options are set by default:

```json
{
  "responseType": "json"
}
```

##### keyvOpts

Type: `object`

Any option provided here will passed to [@keyvhq/memoize#options](https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions).

#### logoOpts

Any option provided here will passed to [Clearbit Logo API](https://clearbit.com/docs#logo-api).

## License

**metascraper-clearbit** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
