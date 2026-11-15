import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copiedCodeEvent } from '../src/lib/adoptionAnalytics.js';

test('recognizes install commands for all documented package managers', () => {
  for (const command of ['pnpm add -D', 'npm install --save-dev', 'npm i -D', 'yarn add --dev']) {
    assert.deepEqual(copiedCodeEvent('/docs/get-started/installation/', `${command} @suites/unit @suites/di.nestjs`), {
      name: 'installation_copy', params: { page_path: '/docs/get-started/installation/' },
    });
  }
});

test('does not mistake imports, runner installation, or prose for Suites installation', () => {
  for (const code of ["import { TestBed } from '@suites/unit';", 'pnpm add -D vitest', 'Use pnpm add -D @suites/unit', 'pnpm add -D @suites/unit-other']) {
    assert.equal(copiedCodeEvent('/docs/get-started/installation/', code), undefined);
  }
});

test('handles rendered code blocks whose line breaks are encoded by Expressive Code', () => {
  assert.equal(copiedCodeEvent('/docs/get-started/installation/', '# Install Suites\x7fpnpm add -D @suites/unit')?.name, 'installation_copy');
  assert.equal(copiedCodeEvent('/docs/guides/nestjs/', 'await TestBed\x7f.solitary(UserService).compile();')?.name, 'test_example_copy');
});

test('recognizes full framework test examples and sends no copied content', () => {
  for (const framework of ['nestjs', 'inversify', 'injectionjs']) {
    const pathname = `/docs/guides/${framework}/`;
    assert.deepEqual(copiedCodeEvent(pathname, 'const { unit } = await TestBed\n .solitary(UserService).compile();'), {
      name: 'test_example_copy', params: { page_path: pathname, framework },
    });
    assert.equal(copiedCodeEvent(pathname, 'class UserService {}'), undefined);
  }
});

test('supports sociable examples and versioned docs without tracking homepage copies', () => {
  const code = 'await TestBed.sociable(UserService).expose(Formatter).compile();';
  assert.equal(copiedCodeEvent('/docs/v4/guides/nestjs/', code)?.name, 'test_example_copy');
  assert.equal(copiedCodeEvent('/', code), undefined);
  assert.equal(copiedCodeEvent('/docs/api-reference/testbed-sociable/', code), undefined);
});

test('ignores framework setup and unrelated copies', () => {
  assert.equal(copiedCodeEvent('/docs/guides/nestjs/', 'pnpm exec jest'), undefined);
  assert.equal(copiedCodeEvent('/docs/get-started/installation/', '{ "experimentalDecorators": true }'), undefined);
});
