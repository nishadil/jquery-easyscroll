const assert = require('assert');
const { JSDOM } = require('jsdom');

function createDom() {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="wrap"><ul id="list"><li>a</li><li>b</li><li>c</li></ul></div></body></html>',
    { pretendToBeVisual: true }
  );
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;

  let rafQueue = [];
  global.requestAnimationFrame = (cb) => {
    rafQueue.push(cb);
    return rafQueue.length;
  };
  global.cancelAnimationFrame = (id) => {
    const index = id - 1;
    if (index >= 0 && index < rafQueue.length) rafQueue[index] = null;
  };
  global.__runRaf = () => {
    const queue = rafQueue.slice();
    rafQueue = [];
    queue.forEach((cb) => {
      if (cb) cb(Date.now());
    });
  };

  const $ = require('jquery');
  global.$ = $;
  global.jQuery = $;

  // Patch measurement APIs for jsdom (no layout engine).
  $.fn.outerWidth = function () { return 100; };
  $.fn.outerHeight = function () { return 50; };
  $.fn.width = function () { return 200; };
  $.fn.height = function () { return 100; };

  return $;
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

const $ = createDom();
const EasyScrollModule = require('../dist/jquery.easyscroll.cjs');
const EasyScroll = EasyScrollModule && EasyScrollModule.default ? EasyScrollModule.default : EasyScrollModule;

test('registers jQuery plugin', () => {
  assert.strictEqual(typeof $.fn.easyScroll, 'function');
});

test('resetPos respects explicit 0', () => {
  document.body.innerHTML = '<div id="wrap"><ul id="list"><li>a</li><li>b</li></ul></div>';
  const instance = new EasyScroll(document.getElementById('list'), {
    auto: false,
    manualMode: 'end',
    startOnLoad: false,
    initialOffset: 10,
  });
  instance.resetPos(0);
  assert.strictEqual(instance.$clip[0].scrollLeft, 0);
});

test('loop mode resets when reaching end', () => {
  document.body.innerHTML = '<div id="wrap"><ul id="list"><li>a</li><li>b</li><li>c</li></ul></div>';
  const instance = new EasyScroll(document.getElementById('list'), {
    auto: true,
    autoMode: 'loop',
    direction: 'forwards',
    startOnLoad: false,
  });
  instance.$clip[0].scrollLeft = instance.posMax - instance.clipMax;
  instance.moveForward();
  global.__runRaf();
  assert.strictEqual(instance.$clip[0].scrollLeft, instance.resetPosition);
});

test('bounce mode flips direction at end', () => {
  document.body.innerHTML = '<div id="wrap"><ul id="list"><li>a</li><li>b</li><li>c</li></ul></div>';
  const instance = new EasyScroll(document.getElementById('list'), {
    auto: true,
    autoMode: 'bounce',
    direction: 'forwards',
    startOnLoad: false,
  });
  instance.$clip[0].scrollLeft = instance.posMax - instance.clipMax;
  instance.moveForward();
  global.__runRaf();
  assert.strictEqual(instance.movement, 'back');
});

test('zero-size items do not throw', () => {
  const $local = require('jquery');
  $local.fn.outerWidth = function () { return 0; };
  $local.fn.outerHeight = function () { return 0; };
  document.body.innerHTML = '<div id="wrap"><ul id="list"><li>a</li></ul></div>';
  assert.doesNotThrow(() => {
    new EasyScroll(document.getElementById('list'), {
      auto: false,
      startOnLoad: false,
    });
  });
});
