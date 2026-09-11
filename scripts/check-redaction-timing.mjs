import assert from 'node:assert/strict';
import { test } from 'node:test';
import { redactionProgress, REDACTION_WAIT_SECONDS, REDACTION_REVEAL_SECONDS } from '../src/redaction-timing.ts';

test('short hold is separate from the unchanged 0.95-second reveal', () => {
  assert.equal(REDACTION_WAIT_SECONDS, .25);
  assert.equal(REDACTION_REVEAL_SECONDS, .95);
  assert.equal(redactionProgress(.24), 0);
  assert.equal(redactionProgress(.25), 0);
  assert(redactionProgress(.26) > 0);
  assert(Math.abs(redactionProgress(.25 + .95 / 2) - .5) < 1e-10);
  assert.equal(redactionProgress(.25 + .95), 1);
});
