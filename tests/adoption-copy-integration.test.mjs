import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { observeCodeCopies } from '../src/lib/adoptionAnalytics.js';

// Resolve the site's installed copy-button implementation through its public plugin API.
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro-expressive-code'));
const expressiveRequire = createRequire(astroRequire.resolve('expressive-code'));
const { pluginFrames } = await import(pathToFileURL(expressiveRequire.resolve('@expressive-code/plugin-frames')));

function setup(t, { pathname, code, clipboardFails = false }) {
  const { window, document } = parseHTML('<html><body><div class="expressive-code"><figure><div class="copy"><button data-copied="Copied!"></button></div></figure></div></body></html>');
  const button = document.querySelector('button');
  button.setAttribute('data-code', code);
  const events = [];
  const copied = [];
  t.after(observeCodeCopies(document, () => pathname, (name, params) => events.push({ name, params })));
  for (const script of pluginFrames().jsModules) {
    runInNewContext(script, {
      document, MutationObserver: window.MutationObserver,
      navigator: { clipboard: { async writeText(text) {
        if (clipboardFails) throw new Error('Clipboard denied');
        copied.push(text);
      } } },
      getSelection: () => null,
      requestAnimationFrame: callback => callback(),
      setTimeout: () => 0,
      console,
    });
  }
  return { button, document, events, copied };
}

test('real copy-button script records a successful install copy without sending its contents', async t => {
  const { button, events, copied } = setup(t, {
    pathname: '/docs/get-started/installation/', code: 'pnpm add -D @suites/unit @suites/di.nestjs',
  });
  button.click();
  await setImmediate();
  assert.equal(copied.length, 1);
  assert.deepEqual(events, [{ name: 'installation_copy', params: { page_path: '/docs/get-started/installation/' } }]);
});

test('real framework example copy emits once for each successful feedback cycle', async t => {
  const { button, document, events } = setup(t, {
    pathname: '/docs/guides/nestjs/', code: 'await TestBed.solitary(UserService).compile();',
  });
  button.click();
  await setImmediate();
  assert.deepEqual(events, [{ name: 'test_example_copy', params: { page_path: '/docs/guides/nestjs/', framework: 'nestjs' } }]);
  document.querySelector('.feedback').remove();
  button.click();
  await setImmediate();
  assert.equal(events.length, 2);
});

test('failed clipboard and fallback do not produce adoption events', async t => {
  const { button, document, events } = setup(t, {
    pathname: '/docs/get-started/installation/', code: 'pnpm add -D @suites/unit', clipboardFails: true,
  });
  button.click();
  await setImmediate();
  assert.equal(document.querySelector('.feedback'), null);
  assert.deepEqual(events, []);
});

test('successful unrelated code copies and unrelated feedback do not count as adoption', async t => {
  const { button, document, events } = setup(t, {
    pathname: '/docs/guides/nestjs/', code: 'pnpm exec jest',
  });
  button.click();
  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  document.body.append(feedback);
  await setImmediate();
  assert.ok(document.querySelector('.expressive-code .feedback'));
  assert.deepEqual(events, []);
});
