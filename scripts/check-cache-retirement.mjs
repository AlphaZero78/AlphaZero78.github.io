import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('old worker retires only its own cache and reloads its own pages', async () => {
  const handlers = {}, deleted = [], navigated = [];
  let unregistered = false;
  const source = (await readFile(new URL('./pwa-worker.js', import.meta.url), 'utf8')).replace('__CACHE_VERSION__', '"new-version"');
  vm.runInNewContext(source, {
    URL, Promise,
    caches: { keys: async () => ['alphazero-archive:/site/:old', 'unrelated-cache'], delete: async key => deleted.push(key) },
    self: {
      addEventListener: (name, handler) => handlers[name] = handler,
      skipWaiting: async () => {},
      registration: { scope: 'https://example.com/site/', unregister: async () => unregistered = true },
      clients: { matchAll: async () => [
        { url: 'https://example.com/site/?file=X-002', navigate: async url => navigated.push(url) },
        { url: 'https://example.com/other/', navigate: async url => navigated.push(url) },
      ] },
    },
  });
  assert.equal(handlers.fetch, undefined);
  let activation;
  handlers.activate({ waitUntil: promise => activation = promise });
  await activation;
  assert(unregistered);
  assert.deepEqual(deleted, ['alphazero-archive:/site/:old']);
  assert.equal(navigated.length, 1);
  const url = new URL(navigated[0]);
  assert.equal(url.searchParams.get('file'), 'X-002');
  assert.equal(url.searchParams.get('release'), 'new-version');
});
