import { MeiliSearch } from 'meilisearch'

declare global {
  var meilisearch: MeiliSearch | undefined;
}

const meilisearch = global.meilisearch || new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || '',
});

if (process.env.NODE_ENV === 'development') global.meilisearch = meilisearch;

export const search = meilisearch;
