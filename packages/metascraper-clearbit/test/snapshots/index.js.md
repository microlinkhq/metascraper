# Snapshot report for `test/index.js`

The actual snapshot is saved in `index.js.snap`.

Generated by [AVA](https://avajs.dev).

## provide `logoOpts`

> Snapshot 1

    {
      logo: 'https://logo.clearbit.com/microlink.io?format=jpg&greyscale=true',
      publisher: 'Microlink',
    }

## works fine with subdomains

> Snapshot 1

    {
      logo: 'https://logo.clearbit.com/youtube.com',
      publisher: 'YouTube',
    }

## returns logo url if it exists

> Snapshot 1

    {
      logo: 'https://logo.clearbit.com/microlink.io',
      publisher: 'Microlink',
    }

## returns null if no logo available

> Snapshot 1

    {
      logo: null,
      publisher: null,
    }