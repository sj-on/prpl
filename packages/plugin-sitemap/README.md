# @prpl/plugin-sitemap

A plugin for [PRPL](https://github.com/tyhopp/prpl) that generates a sitemap.

### Dependencies

`@prpl/plugin-sitemap` has zero dependencies.

### Functions

[`generateSitemap`](src/index.ts) is the only export. See [the source code](src/index.ts) for its signature.

### Usage

```javascript
import { interpolate, PRPLCachePartitionKey } from '@prpl/core';
import { generateSitemap } from '@prpl/plugin-sitemap';

await interpolate();
await generateSitemap({
  origin: 'https://tyhopp.com',
  ignoreDirRegex: new RegExp('dist/fragments'),
});
```