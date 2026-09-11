import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RenderBudget } from '../src/render-budget.ts';

test('240 Hz input cannot produce more than 61 frames per second', () => {
  const budget = new RenderBudget();
  let frames = 0;
  for (let ms = 0; ms < 1000; ms += 1000 / 240) if (budget.take(ms)) frames++;
  assert(frames >= 59 && frames <= 61, `rendered ${frames}`);
});
test('idle and covered scenes stop, input resumes, and opening remains animated', () => {
  const budget = new RenderBudget();
  budget.wake(100);
  assert(budget.active(200, false, false));
  assert(!budget.active(8100, false, false));
  assert(budget.active(9000, true, false));
  assert(!budget.active(200, true, true));
  budget.wake(10000);
  assert(budget.active(10001, false, false));
});
