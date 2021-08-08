const { resolve } = require('path');
const { interpolate, PRPLCachePartitionKey } = require('@prpl/core');
const { createCachePartition } = require('@prpl/plugin-cache');
const { resolveHTMLImports } = require('@prpl/plugin-html-imports');
const { resolveCSSImports } = require('@prpl/plugin-css-imports');
const { generateRSSFeed } = require('@prpl/plugin-rss');

// Default options
const options = {
  noClientJS: false,
  templateRegex: (key) => new RegExp(`\\[${key}\\]`, 'g'),
  markedOptions: {}
};

async function build() {
  await interpolate({ options });

  // Pre-define dist partition and use for subsequent plugins
  await createCachePartition({
    entityPath: resolve('dist'),
    partitionKey: PRPLCachePartitionKey.dist,
    readFileRegExp: new RegExp(`.html|.css`)
  });

  await resolveHTMLImports({
    cachePartitionKey: PRPLCachePartitionKey.dist
  });

  await resolveCSSImports({
    cachePartitionKey: PRPLCachePartitionKey.dist
  });

  await generateRSSFeed({
    dir: 'content/notes',
    feedTitle: 'Test feed',
    author: 'Ty Hopp',
    origin: 'http://localhost:8000'
  });
}

build();