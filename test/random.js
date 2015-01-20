// Run simple tests first.
// require('./api');
// require('./shape');

var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

var n = 1e5;
var splicen = 1e4;
var x;

function time(text, fn) {
  var start = +(new Date);
  fn()
  var end = +(new Date);
  console.log(text, (end - start) / 1000 + 'sec');
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

function array(a) {
  if (a instanceof Array) return a;
  if (!a) return [];
  return a.slice();
}

describe('Random operation tests', function() {

it(n + ' unshifts and nths on plain tree', function() {
  this.slow(1000);
  x = new SplayList();
  for (var j = 0; j < n; ++j) {
    x.unshift('node' + j);
    var k = Math.floor(Math.random() * x.length);
    loc = x.nth(k);
    assert.equal(loc.val(), 'node' + (j - k));
  }
});

it('start-to-end traversal on a ' + n + ' plain tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = loc.next();
  }
});

it(n + ' unshifts and finds on total-length tree', function() {
  this.slow(1000);
  x = new (SplayList.extend({orderstats: function(V, X, L, R) {
    var n = 1, len = V.length;
    if (L !== null) { n += L.n; len += L.length; }
    if (R !== null) { n += R.n; len += R.length; }
    X.n = n; X.length = len;
  }}));
  var total = 0;
  for (var j = 0; j < n; ++j) {
    var s = 'node' + j;
    total += s.length;
    x.unshift(s);
    var k = Math.floor(Math.random() * total);
    loc = x.find('length', k);
  }
  assert.equal(888890, x.stat('length'));
});

it('start-to-end traversal on a ' + n + ' total-length tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = loc.next();
  }
});

var objs = [];
for (var j = 0; j < n; ++j) {
  objs.push({ k: j % 97, s: "node" + j });
}

it(n + ' unshifts and finds on an object tree', function() {
  this.slow(1000);
  x = new (SplayList.extend({orderstats: function(V, X, L, R) {
    var n = 1, k = V.k, m = V.s.length;
    if (L !== null) { n += L.n; k += L.k; m += L.m; }
    if (R !== null) { n += R.n; k += R.k; m += R.m; }
    X.n = n; X.k = k; X.m = m;
  }}));
  var total = 0;
  for (var j = 0; j < n; ++j) {
    total += objs[j].k;
    x.unshift(objs[j]);
    var k = Math.floor(Math.random() * total);
    loc = x.find('k', k);
    assert(x.stat('k', loc) <= k);
    assert(x.stat('k', loc) > k - 97 + 1);
  }
  assert.equal(total, x.stat('k'));
});

it(splicen + ' random splices on a plain tree', function() {
  this.slow(2000);
  var lists = [], arrays = [], index;
  for (var j = 0; j < splicen; ++j) {
    if (!arrays.length) {
      arrays.push([]);
      lists.push(new SplayList);
    }
    var cura = arrays[arrays.length - 1],
        curl = lists[lists.length - 1],
        choice = rand(4);
    if (choice == 2 || (choice == 3 && cura.length == 0)) {
      var args = [];
      if (rand(2)) args.push('node' + j + '-A');
      if (rand(2)) args.push('node' + j + '-B');
      if (rand(2)) args.push('node' + j + '-C');
      if (rand(2)) {
        cura.push.apply(cura, args);
        curl.push.apply(curl, args);
      } else {
        cura.unshift.apply(cura, args);
        curl.unshift.apply(curl, args);
      }
    } else if (choice == 3) {
      var str = 'node' + j,
          k = rand(cura.length),
          mode = rand(3);
      for (var m = k, loc = curl.first(); m > 0; --m) {
        loc = loc.next();
      }
      if (mode == 0) {
        cura.splice(k, 1);
        curl.removeAt(loc);
      } else if (mode == 1) {
        cura.splice(k, 0, str);
        curl.insertBefore(loc, str);
      } else {
        cura.splice(k + 1, 0, str);
        curl.insertAfter(loc, str);
      }
    } else {
      arrays.pop();
      lists.pop();
      var start = rand(cura.length),
          len = rand(cura.length - start),
          insa = arrays.pop() || [],
          insl = lists.pop() || null,
          rl, ra, args = [start, len];
      args.push.apply(args, insa);
      ra = cura.splice.apply(cura, args);
      if (choice) {
        rl = curl.spliceList(start, len, insl);
      } else {
        rl = new SplayList;
        (rand(2) ? rl.push : rl.unshift).apply(
          rl, curl.spliceArray(start, len, insa));
      }
      assert.deepEqual(ra, array(rl));
      assert.equal(ra.length, rl.length);
      index = rand(ra.length);
      assert.equal(ra[index], rl.get(index));
      arrays.push(cura);
      lists.push(curl);
      if (rl instanceof SplayList) {
        arrays.push(ra);
        lists.push(rl);
      }
    }
    // assert.deepEqual(cura, array(curl));
    assert.equal(cura.length, curl.length);
    index = rand(cura.length);
    assert.equal(cura[index], curl.get(index));
  }
});

});