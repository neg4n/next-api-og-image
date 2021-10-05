# Next.js API OG Image &middot; [![version](https://badgen.net/npm/v/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![types](https://badgen.net/npm/types/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![license](https://badgen.net/npm/license/next-api-og-image)](https://github.com/neg4n/next-api-og-image/blob/main/LICENSE)

Simple library with purpose of providing easy way to dynamically  
generate open-graph images using [Next.js API routes][next-api-routes].

If you're not familiar with dynamic open-graph images concept - please see [vercel/og-image repository's README][vercel-og-image] for very detailed explaination.

*you can treat this project as simpler and configurable version of mentioned earlier [vercel][vercel] repository*

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

## Creating template

You've may noticed the `html` property in configuration. Its responsibility is to provide HTML document to image creator *(browser screenshot)*, filled with your values.

### Specification

The `html` property is a function *(**it can be asynchronous**)* which first (and only) parameter is nothing else but [HTTP request's query params][query-params] converted to object notation.

This allows you to create fully customized HTML templates by simply accessing these parameters. The preferred way to do that is [object destructuring][object-destructuring].

#### Example
```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ html: ({ myQueryParam }) => `<h1>${myQueryParam}</h1>` })
```

_if you send GET HTTP request to [api route][next-api-routes] with code presented above e.g. `localhost:3000/api/foo?myQueryParam=hello` - it will render heading with content equal to 'hello'_

### Splitting files

Keeping all the templates inline within [Next.js API route][next-api-routes] should not be problematic, but if you prefer keeping things in separate files you can follow the common pattern of creating files like `my-template.html.js` with code e.g. 
```js
export default function myTemplate({ myQueryParam }) {
  return `<h1>${myQueryParam}</h1>`
}
```
then importing it and embedding in the `withOGImage`.



## Configuration

Apart from `html` configuration property _(which is required)_, you can specify additional info about how `next-api-og-image` should behave.

Example configuration with **default values** _(apart from required html prop)_:

```js
const nextApiOgImageConfig = {
  // 'Content-Type' HTTP header
  contentType: 'image/png',
  // 'Cache-Control' HTTP header
  cacheControl: 'max-age 3600, must-revalidate',
  // NOTE: Options within 'dev' object works only when process.env.NODE_ENV === 'development'
  dev: {
    // Whether to replace binary data (image/screenshot) with HTML
    // that can be debugged in Developer Tools
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
[object-destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring
[query-params]: https://en.wikipedia.org/wiki/Query_string
[vercel-serverless]: https://vercel.com/docs/concepts/functions/introduction
[vercel]: https://vercel.com/
[vercel-og-image]: https://github.com/vercel/og-image#readme
[next-api-routes]: https://nextjs.org/docs/api-routes/introduction
[content-type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[cache-control]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[basic-typescript]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-typescript.ts
[basic]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic.js
[basic-fonts-local]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-custom-fonts-local.js

