//noinspection ThisExpressionReferencesGlobalObjectJS
(function(){
"use strict";

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var pi0 = require('./pinode0');
var pi1 = require('./pinode1');
var pi2 = require('./pinode2');
var pi3 = require('./pinode3');
var pi4 = require('./pinode4');
var pi5 = require('./pinode5');
var pi6 = require('./pinode6');
var pi7 = require('./pinode7');
var pi8 = require('./pinode8');
var pi9 = require('./pinode9');
//var pi10 = require('./pinode10');

var digits = 10000;
//console.log(pi1(digits));

// add tests
suite
// pi0 reaches max call stack for 10k
//    .add('Pi0#10kDigits Original Readable', function() {
//        pi0(digits);
//    })
    .add('Pi1#10kDigits Original Refactored', function() {
        pi1(digits);
    })
    .add('Pi2#10kDigits References', function() {
        pi2(digits);
    })
    .add('Pi3#10kDigits Matrix', function() {
        pi3(digits);
    })
    .add('Pi4#10kDigits Cleanup', function() {
        pi4(digits);
    })
    .add('Pi5#10kDigits First-class Functions', function() {
        pi5(digits);
    })
    .add('Pi6#10kDigits Custom Caching', function() {
        pi6(digits);
    })
    .add('Pi7#10kDigits Advanced Custom Caching', function() {
        pi7(digits);
    })
    .add('Pi8#10kDigits Global Advanced Custom Caching', function() {
        pi8(digits);
    })
    .add('Pi9#10kDigits Global Advanced Custom Caching to other functions + hit tracking', function() {
        pi9(digits);
    })
//    .add('Pi10#4Digits Global Advanced Custom Caching to other functions', function() {
//        pi10(4);
//    })
// add listeners
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })
// run async
    .run({ 'async': true });

}).call(this);