import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHeroSkipMode, HERO_EXPIRY_MS } from '../src/components/hero/skipState.js';

test('returns dev when skip query is present', () => {
  const mode = resolveHeroSkipMode({
    search: '?skip',
    storedTimestamp: null,
    now: 1000,
  });
  assert.equal(mode, 'dev');
});

test('returns returning when stored timestamp is within expiry', () => {
  const now = 10_000_000;
  const mode = resolveHeroSkipMode({
    search: '',
    storedTimestamp: String(now - (HERO_EXPIRY_MS - 1)),
    now,
  });
  assert.equal(mode, 'returning');
});

test('returns none when stored timestamp is expired', () => {
  const now = 10_000_000;
  const mode = resolveHeroSkipMode({
    search: '',
    storedTimestamp: String(now - HERO_EXPIRY_MS - 1),
    now,
  });
  assert.equal(mode, 'none');
});

test('returns none on invalid timestamp', () => {
  const mode = resolveHeroSkipMode({
    search: '',
    storedTimestamp: 'not-a-number',
    now: 1000,
  });
  assert.equal(mode, 'none');
});
