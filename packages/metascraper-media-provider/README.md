<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://metascraper.js.org/static/logo-banner.png" alt="metascraper">
  <br>
  <br>
  <p align="center"><strong>metascraper-media-provider</strong>: Get specific video provider url (Facebook/Twitter/Vimeo/etc).</p>
  <p align="center">See our <a href="https://metascraper.js.org" target='_blank' rel='noopener noreferrer'>website</a> for more information.</p>
  <br>
</div>

## Install

```bash
$ npm install metascraper-media-provider --save
```

## API

### metascraper-media-provider([options])

#### options

##### cacheDir

Type: `string`

It specifies cache based on file system to be used by [youtube-dl](youtube-dl).

##### getProxy

Type: `function`

It will be called to determinate if a proxy should be used for resolving the next request URL.

```js
const getProxy = ({ url, retryCount }) => {
  if (retryCount === 0) return false
  return 'http://user:pwd@proxy:8001'
}
```

##### getAgent

Type: `function`

It receives as input the output from `.getProxy`. The output will be passed to `.gotOpts`.

##### gotOpts

Type: `object`

Any option provided here will passed to [got#options](https://github.com/sindresorhus/got#options).

##### retry

Type: `number`<br>
Default: `5`

The maximum number of retries allowed to perform.

##### timeout

Type: `number`<br>
Default: `30000`

The maximum time allowed to wait until considering the request as timed out.

## License

**metascraper-media-provider** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/metascraper/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Microlink](https://microlink.io) with help from [contributors](https://github.com/microlinkhq/metascraper/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
