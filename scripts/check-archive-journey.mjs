import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ArchiveJourney } from '../src/archive-journey.ts';
const waiting = { closed: false, aligned: false, opened: false };

test('close, move, and open must finish in that order', () => {
  const journey = new ArchiveJourney();
  assert(journey.begin(0, 1, 5, 0));
  assert.equal(journey.target, 1);
  assert.equal(journey.advance({ ...waiting, aligned: true, opened: true }, 50), undefined);
  assert.equal(journey.phase, 'closing');
  assert.equal(journey.advance({ ...waiting, closed: true }, 100), 'move');
  assert.equal(journey.advance({ ...waiting, opened: true }, 200), undefined);
  assert.equal(journey.advance({ ...waiting, aligned: true }, 300), 'open');
  assert.equal(journey.advance(waiting, 400), undefined);
  assert.equal(journey.advance({ ...waiting, opened: true }, 500), 'done');
  assert.equal(journey.active, false);
});
test('wheel bursts cannot skip records; reverse wraps and Escape can cancel', () => {
  const journey = new ArchiveJourney();
  assert(journey.begin(0, -1, 5, 0));
  assert.equal(journey.target, 4);
  for (let time = 1; time < 100; time++) assert.equal(journey.begin(0, 1, 5, time), false);
  assert.equal(journey.target, 4);
  journey.cancel(100);
  assert.equal(journey.advance({ closed: true, aligned: true, opened: true }, 200), undefined);
  assert.equal(journey.begin(4, 1, 5, 299), false);
  assert(journey.begin(4, 1, 5, 301));
  assert.equal(journey.target, 0);
});
