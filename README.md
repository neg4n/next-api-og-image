# Next.js API OG Image &middot; [![version](https://badgen.net/npm/v/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![types](https://badgen.net/npm/types/next-api-og-image)](https://www.npmjs.com/package/next-api-og-image) [![license](https://badgen.net/npm/license/next-api-og-image)](https://github.com/neg4n/next-api-og-image/blob/main/LICENSE)

Simple library with purpose of providing easy way to dynamically  
generate open-graph images using [Next.js API routes][next-api-routes].

If you're not familiar with dynamic open-graph images concept - please see [vercel/og-image repository's README][vercel-og-image] for very detailed explaination.

_you can treat this project as simpler and configurable version of mentioned earlier [vercel][vercel] repository_

## Features

- [x] 🐄 Super easy usage
- [x] 🌐 Suitable for [serverless][vercel-serverless] environment
- [x] :bowtie: Elegant way for defining templates both in [React][react] and [HTML][html]
- [x] 📬 Multiple strategies - pass values by GET and query params or POST and JSON body
- [x] 🥷 TypeScript compatible

## Installing

```sh
npm i next-api-og-image -S
# or
yarn add next-api-og-image
```

## Examples

You can find more examples here:

- JavaScript
  - [Basic usage with JavaScript][basic]
  - [Basic usage with Styled Components][basic-styled]
  - [Basic usage with TailwindCSS][basic-tailwind]
  - [Basic usage with React template provided][basic-react]
  - [Basic usage with loading custom local fonts][basic-fonts-local]
- TypeScript
  - [Basic usage with TypeScript][basic-typescript]
  - [Basic usage with TypeScript and React using query strategy][basic-typescript-react-query]
  - [Basic usage with TypeScript and React using body strategy][basic-typescript-react-json] (JSON)
  - [Advanced usage with TypeScript, React template and custom local fonts][advanced-typescript-react]

_the `example/` directory contains simple [Next.js][next-homepage] application implementing `next-api-og-image` . To fully explore examples implemented in it by yourself - simply do `npm link && cd example && npm i && npm run dev` then navigate to http://localhost:3000/_

## Basic usage and explaination

##### HTML template

```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ template: { html: ({ myQueryParam }) => `<h1>${myQueryParam}</h1>` } })
```

##### React template

```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ template: { react: ({ myQueryParam }) => <h1>{myQueryParam}</h1> } })
```

## Creating template

You've may noticed the `html` and `react` properties in configuration. Their responsibility is to provide HTML document to image creator _(browser screenshot)_, filled with your values.

> **⚠️ NOTE**  
> Template **cannot be ambigious**. You must either  
> define `react` or `html`. Never both at once

### Specification

The `html` and `react` properties are template providers functions. Each function's first (and only) parameter is nothing else but [HTTP request's query params][query-params] converted to object notation.

This allows you to create fully customized HTML templates by simply accessing these parameters. The preferred way to do that is [object destructuring][object-destructuring].

> **⚠️ NOTE**  
> `html` and `react` template provider functions  
> **can be defined as asynchronous**

#### Examples

##### HTML template

```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ template: { html: ({ myQueryParam }) => `<h1>${myQueryParam}</h1>` } })
```

##### React template

```js
import { withOGImage } from 'next-api-og-image'

export default withOGImage({ template: { react: ({ myQueryParam }) => <h1>{myQueryParam}</h1> } })
```

_if you send GET HTTP request to [api route][next-api-routes] with code presented above e.g. `localhost:3000/api/foo?myQueryParam=hello` - it will render heading with content equal to 'hello'_

### Strategies

`next-api-og-image` allows you to choose strategy for providing values to the template. The available strategies are:

1. `query` _(default)_ - values are passed by query params and GET HTTP request.  
   **These values ⛔️ cannot be nested nor accessed by nested destructuring in template provider function**.

2. `body` - values are passed by POST HTTP request and JSON body.  
   These values ✅ can be nested and accessed by nested destructuring in template provider function.

The strategies are determined by `strategy` prop in the configuration. Default strategy is `query`.

> **⚠️ NOTE**  
> Regardless of the strategy - all properties (every single one)  
> **are implicitly casted to string, even very long JSON's nested values**

#### Types in template provider function

If you're using TypeScript, you probably want to have these things
typed. Well... its actually super easy! Simply add generic types to `withOGImage` function.

1. typed `query` strategy with query params `?foo=hello&bar=friend` will look like this:
   ```js
   export default withOGImage<'query', 'foo' | 'bar'>(/* ... */)
   ```
2. typed `body` strategy with JSON payload `{ "foo": "hello", "imNested": { "bar": "friend" }}` will look like this:
   ```js
   export default withOGImage<'body', { foo: string, imNested: { bar: string } }>({ strategy: 'body', /* ... */ })
   ```

#### Errors

When strategy is set to `query` and you're sending POST HTTP request with JSON body or when strategy is set to `body` and you're sending GET HTTP request with query params - `next-api-og-image` will:

1. Will throw an runtime error
2. Set appropiate response message to the client
   You can disable this behaviour by setting `dev: { errorsInResponse: false }` in the configuration

### Splitting files

Keeping all the templates inline within [Next.js API route][next-api-routes] should not be problematic, but if you prefer keeping things in separate files you can follow the common pattern of creating files like `my-template.html.js` or `my-template.js` when you define template as react _(naming convention is fully up to you)_ with code e.g.

```js
export default function myTemplate({ myQueryParam }) {
  return `<h1>${myQueryParam}</h1>`
}
```

...or in TypeScript

```ts
import type { NextApiOgImageQuery } from 'next-api-og-image'

type QueryParams = 'myQueryParam'
export default function myTemplate({ myQueryParam }: Record<QueryParams, string>) {
  return `<h1>${myQueryParam}</h1>`
}
```

then importing it and embedding in the `withOGImage`.

### Loading custom local fonts

In order to load custom fonts from the project source, you need to create source file with your font in **base64** format or simply bind the font file content to the variable in your [Next.js API route][next-api-routes]

## Configuration

Apart from `html` and `react` configuration property (in `template`) _(whose are required)_, you can specify additional info about how `next-api-og-image` should behave.

Example configuration with **default values** _(apart from template.html or template.react prop)_:

```js
const nextApiOgImageConfig = {
  // Values passing strategy
  strategy: 'query',
  // 'Content-Type' HTTP header
  contentType: 'image/png',
  // Width of the image in pixels (default 1200)
  width: 2048,
  // Height of the image in pixels (default 630)
  height: 1170,
  // 'Cache-Control' HTTP header
  cacheControl: 'max-age 3600, must-revalidate',
  // NOTE: Options within 'dev' object works only when process.env.NODE_ENV === 'development'
  dev: {
    // Whether to replace binary data (image/screenshot) with HTML
    // that can be debugged in Developer Tools
    inspectHtml: true,
    // Whether to set error message in response
    // if there are strategy related errors
    errorsInResponse: true,
  },
}
```

## License

This project is licensed under the MIT license.  
All contributions are welcome.

[next-homepage]: https://nextjs.org/
[react]: https://reactjs.org
[html]: https://en.wikipedia.org/wiki/HTML
[object-destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring
[query-params]: https://en.wikipedia.org/wiki/Query_string
[vercel-serverless]: https://vercel.com/docs/concepts/functions/introduction
[vercel]: https://vercel.com/
[vercel-og-image]: https://github.com/vercel/og-image#readme
[next-api-routes]: https://nextjs.org/docs/api-routes/introduction
[content-type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[cache-control]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[basic-typescript]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-typescript.ts
[basic-tailwind]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-tailwind.js
[basic-styled]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-styled-components.js
[basic-react]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-react.js
[basic]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic.js
[basic-fonts-local]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-custom-fonts-local.js
[advanced-typescript-react]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/advanced-typescript-react.tsx
[basic-typescript-react-query]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-typescript-react-query.tsx
[basic-typescript-react-json]: https://github.com/neg4n/next-api-og-image/tree/main/example/pages/api/basic-typescript-react-json.tsx
