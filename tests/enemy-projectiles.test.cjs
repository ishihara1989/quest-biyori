'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { visibleAt, viewport, stripsAt } = require('../development/labs/js/enemy-projectiles.js');
const model = require('../public/assets/enemies/alraune/motions/seed-burst/manifest.json');
const effect = require('../public/assets/effects/alraune-seed-volley/manifest.json');
const base = require('../public/assets/enemies/index.json').find(item => item.id === 'alraune').viewport;

test('the 0/200ms firing events repeat without duplicate spawns when pausing or seeking', () => {
  assert.equal(visibleAt(model, 199).length, 1);
  const second = visibleAt(model, 200);
  assert.equal(second.length, 2);
  assert.equal(second.find(entity => entity.eventId === 'seed-volley-b').ageMs, 0);
  const next = visibleAt(model, 400);
  assert.equal(next.length, 3);
  assert.equal(next.find(entity => entity.eventId === 'seed-volley-a' && entity.cycle === 1).ageMs, 0);
  assert.equal(visibleAt(model, 100)[0].x, -48);
  assert.deepEqual(visibleAt(model, 400), next, 'Repeated renders are deterministic');
  assert.ok(visibleAt(model, 1000000).length <= 8, 'Old batches expire');
  assert.ok(visibleAt(model, 1000000).every(entity => entity.ageMs < model.projectilePreview.lifetimeMs));
  assert.deepEqual(visibleAt({ ...model, projectilePreview: undefined }, 1000), []);
  const single = { ...model, loop: false };
  assert.equal(visibleAt(single, 1999).length, 0);
});

test('idle lead-ins never fire, exactly two bridged cycles fire, and existing seeds continue into the lead-out', () => {
  const before = model.transitions.idleLeadInMs;
  assert.deepEqual(visibleAt(model, before - 1, true), []);
  assert.equal(visibleAt(model, before, true).length, 1);
  assert.equal(visibleAt(model, before + 600, true).length, 4);
  assert.equal(visibleAt(model, before + 800, true).length, 4);
  assert.ok(visibleAt(model, before + 900, true).every(entity => entity.cycle < 2));
  assert.deepEqual(visibleAt(model, 3900, true), []);
  assert.deepEqual(visibleAt(model, 4000, true), []);
  assert.equal(visibleAt(model, 4000 + before, true).length, 1);
});

test('three image strips stay aligned to their flower mouths while moving horizontally ahead of the boss', () => {
  const view = viewport(base, model.projectilePreview);
  assert.deepEqual(view, { width: 880, height: 384, pivot: { x: 600, y: 367 } });
  assert.deepEqual(viewport(base), base);
  const spawn = stripsAt(visibleAt(model, 0)[0], model, effect, view);
  const later = stripsAt(visibleAt(model, 100)[0], model, effect, view);
  assert.deepEqual(spawn.map(s => s.source.y), [0, 50, 80]);
  assert.equal(spawn.reduce((sum, s) => sum + s.source.height, 0), effect.frameHeight);
  for (const [i, strip] of spawn.entries()) {
    const stream = model.projectilePreview.streams[i];
    assert.equal(strip.clip.width, 240 + stream.muzzle.x);
    assert.equal(strip.destination.x + effect.frames[0].bounds.left, strip.clip.width - 12);
    assert.equal(strip.destination.y + stream.sourceCenterY - stream.sourceY, stream.muzzle.y);
    assert.equal(later[i].destination.x, strip.destination.x - 48);
    assert.equal(later[i].destination.y, strip.destination.y);
    assert.equal(strip.source.width, effect.frameWidth, 'Use all columns of the grouped image');
  }
});
