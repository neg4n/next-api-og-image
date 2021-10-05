# Next.js API OG Image &middot; [![version](https://badgen.net/npm/v/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![types](https://badgen.net/npm/types/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![license](https://badgen.net/npm/license/next-api-og-image)](https://github.com/neg4n/next-api-og-image/blob/main/LICENSE)

Simple library with purpose of providing easy way to dynamically  
generate open-graph images using [Next.js API routes][next-api-routes].

## Features

- [x] 🐄 Super easy usage
- [x] 🌐 Suitable for [serverless][vercel-serverless] environment
- [x] 🥷 TypeScript compatible

## Installing

```sh
npm i next-api-og-image -S
# or
yarn add next-api-og-image
```

## Basic usage and explaination

```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ html: ({ myQueryParam }) => `<h1>${myQueryParam}</h1>` })
```

The [Next.js API route][next-api-routes] where this code exists will open headless browser
on each request sent, put HTML content in the web page, screenshot it and return as binary data. The parameter of the function bound to `html` in the configuration object is nothing else but request query parameters. This allows you to create HTML templates.

_if you send GET HTTP request to [api route][next-api-routes] with code presented above e.g. `localhost:3000/api/foo?myQueryParam=hello` - it will render heading with content equal to 'hello'_

## Configuration

Apart from `html` configuration property _(which is required)_, you can specify [Content-Type][content-type] and [Cache-Control][cache-control] headers and much more.

Example configuration with **default values** _(apart from required html prop)_:

```js
const nextApiOgImageConfig = {
  /* Remember to specify `html` manually !!! */
  // ------------------------------------------
  // 'Content-Type' HTTP header
  contentType: 'image/png',
  // 'Cache-Control' HTTP header
  cacheControl: 'max-age 3600, must-revalidate',
  // NOTE: These options works only when process.env.NODE_ENV === 'development'
  dev: {
    // Whether to display HTML in place of binary data (image/screenshot)
    inspectHtml: true,
  },
}
```

## Loading custom local fonts

In order to load custom fonts from the project source, you need to create source file with your font in **base64** format or simply bind the font file content to the variable in your [Next.js API route][next-api-routes]

## Examples

You can find more examples here:

- JavaScript
  - [Basic usage with JavaScript][basic]
  - [Basic usage with loading custom local fonts][basic-fonts-local]
- TypeScript
  - [Basic usage with TypeScript][basic-typescript]

_the `example/` directory contains simple [Next.js][next-homepage] application implementing `next-api-og-image` . To fully explore examples implemented in it by yourself - simply do `npm link && cd examples && npm i && npm run dev` then navigate to http://localhost:3000/_

## License

This project is licensed under the MIT license.  
All contributions are welcome.

[next-homepage]: https://nextjs.org/
[vercel-serverless]: https://vercel.com/docs/concepts/functions/introduction
[next-api-routes]: https://nextjs.org/docs/api-routes/introduction
[content-type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[cache-control]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[basic-typescript]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-typescript.ts
[basic]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic.js
[basic-fonts-local]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-custom-fonts-local.js
