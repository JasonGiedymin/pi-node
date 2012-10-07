var bignum = require('bigint');
var _ = require('underscore');
var microtime = require('microtime');

/* Options */
var app_opt = {
    debug: true,
    track_hits: false
};

var global_cache = {};
var cache_hits = {};

/* Logging */
function logDebug(/*slurp*/) {
    if (app_opt.debug) {
        var new_args = arguments;
        new_args[0] = "[DEBUG] - ".concat(arguments[0]);
        console.log.apply(this, new_args);
    }
}

function logError(/*slurp*/) {
    "use strict";
    if (app_opt.debug) {
        console.log.apply(["[ERROR] - ".concat(arguments[0])]);
    }
}

/* Caching */
Function.prototype.cached = function(){
    "use strict";
    var self = this, cache = {}, cache_hits = 0;
    function cacheIt() {
        var len = arguments.length;
        var arg = '';
        while (len) {
            arg+=(arguments[--len]);
            arg+=('-');
        }
        if(cache[arg] !== undefined) {
            //console.log('Cache hit for name:[' + name + '], arg:[' + arg + '].');
            cache_hits++;
            return cache[arg];
        } else {
            return cache[arg] = self.apply(self, arguments);
        }
    }

    return cacheIt;
};

Function.prototype.cachedGlobal = function(name){
    "use strict";
    var self = this;

    function cacheIt(){
        var len = arguments.length;
        var arg = '';
        while (len) {
            arg+=(arguments[--len]);
            arg+=('-');
        }
        if(global_cache[name][arg] !== undefined) {
            //console.log('Cache hit for name:[' + name + '], arg:[' + arg + '].');
            if (app_opt.track_hits) { cache_hits[name] += 1; }
            return global_cache[name][arg];
        } else {
            return global_cache[name][arg] = self.apply(self, arguments);
        }
    }

    if(global_cache[name] !== undefined) {
        return cacheIt;
    }

    global_cache[name] = {};
    if (app_opt.track_hits) { cache_hits[name] = 0; }
    return cacheIt;
};


/* constants */
var C = 640320;
var C3_OVER_24 = bignum(Math.floor(Math.pow(C, 3) / 24));
var MAGIC_5 = 5;
var MAGIC_6 = bignum(6);
var MAGIC_2 = bignum(2);

var MAGIC_10 = bignum(10);
var MAGIC_10005 = bignum(10005);
var MAGIC_426880 = 426880;
var MAGIC_13591409 = bignum(13591409);
var MAGIC_545140134 = bignum(545140134);

var ba1Cached = ba1.cachedGlobal('ba1'); // ba1=794
var e1Cached = e1.cachedGlobal('e1'); // ba1=256, e1=76
//var ba1Cached = ba1.cached();
//var e1Cached = e1.cached();
var bsCached = bs; // bs.cachedGlobal('bs'); // not as many cache hits with bs

function ba1(a) {
    "use strict";

    var Pab, Qab, Tab;
    var aM = MAGIC_545140134.mul(a);
    var maM = MAGIC_13591409.add(aM);

    if (a === 0) {
        Qab = bignum(1);
        Pab = Qab;
    }
    else {
        var _a1 = MAGIC_6.mul(a);
        var a1 = _a1.sub(MAGIC_5);

        var _a2 = MAGIC_2.mul(a);
        var a2 = _a2.sub(1);

        var _a3 = MAGIC_6.mul(a);
        var a3 = _a3.sub(1);

        Pab = a1.mul(a2).mul(a3);
        Qab = bignum(a).pow(3).mul(C3_OVER_24);

        _a1 = null;
        a1 = null;
        _a2 = null;
        a2 = null;
        _a3 = null;
        a3 = null;
    }

    Tab = Pab.mul(maM);

    //noinspection JSHint
    //jshint bitwise:false
    if ( a & 1 ) {
        Tab = Tab.mul(-1);
    }

    aM = null;
    maM = null;

    return [Pab, Qab, Tab];
}

function e1(a, b) {
    "use strict";

    var Pab, Qab, Tab;
    var Pam, Qam, Tam;
    var Pmb, Qmb, Tmb;

    var tempMab = bignum(a).add(b);
    var m = tempMab.div(2);
    var z1 = bsCached(a, m);
    Pam = z1[0];
    Qam = z1[1];
    Tam = z1[2];

    var z2 = bsCached(m, b);
    Pmb = z2[0];
    Qmb = z2[1];
    Tmb = z2[2];

    Pab = Pam.mul(Pmb);
    Qab = Qam.mul(Qmb);
    var tempQT = Qmb.mul(Tam);
    var tempPT = Pam.mul(Tmb);
    Tab = tempPT.add(tempQT);

    Pam = null;
    Qam = null;
    Tam = null;
    Pmb = null;
    Qmb = null;
    Tmb = null;
    tempMab = null;
    m = null;
    z1 = null;
    z2 = null;
    tempQT = null;
    tempPT = null;

    return [Pab, Qab, Tab];
}

function bs(a, b) {
    "use strict";

    var ba = b-a;
    if (ba === 1) {
        ba = null;
        return ba1Cached(a);
    }
    else {
        ba = null;
        return e1Cached(a, b);
    }
}

function piChudnovskyBS(digits) {
    "use strict";

    var DIGITS_PER_TERM = Math.log( ((C3_OVER_24/6)/2)/6) / Math.LN10;
    var N = Math.floor(digits/DIGITS_PER_TERM) + 1;

    //var P, Q, T;
    var Q, T;
    var initialBS = bsCached(0, N);
    //P = initialBS[0];
    Q = initialBS[1];
    T = initialBS[2];

    var k_digits = 2*digits;
    var one_squared = MAGIC_10.pow(k_digits);
    var MAGIC_10005_PROD = MAGIC_10005.mul(one_squared);
    var sqrtC = MAGIC_10005_PROD.sqrt();
    var new_q = Q.mul(MAGIC_426880);
    var new_c = new_q.mul(sqrtC);
    var new_c2 = new_c.mod(1);
    var new_c3 = new_c.sub(new_c2);
    var retVal = new_c3.div(T);

    return retVal;
}

var check_digits = {
    100 : 70679,
    1000 :  1989,
    10000 : 75678,
    100000 : 24646,
    1000000 : 58151,
    10000000 : 55897
};

function selfCheck() {
    console.log("Performing Self check...(note that this is done once per 'require')");
    var expectedValue = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
    var min, max;
    var time_start, time_end;
    var digits, piVal;

    digits = 100;
    piVal = piChudnovskyBS(digits);
    if(!bignum(expectedValue).eq(piVal)) {
        throw new Error('Formula Error! Expected:[' + expectedValue + '], but got:[' + piVal + '].');
    }

    min = 1;
    max = 6;//10;

    var range = _.range(min, max);
    var i = 0;
    for (i=0; i< range.length; i++ ) {
        var log10_digits = range[i];
        logDebug('Run %s of %s', log10_digits, max);

        var _digits = Math.pow(10, log10_digits);

        time_start = microtime.now();
        var _pi = piChudnovskyBS(_digits);
        time_end = microtime.now();

        logDebug("chudnovsky_gmpy_mpz_bs: digits %s, time: [%s] seconds", _digits, (time_end - time_start)/1000000);

        if(_.has(check_digits, _digits)) {
            var last_five_digits = _pi.mod(100000);

            if (last_five_digits.eq(check_digits[_digits])) {
                logDebug("Last 5 digits %s OK", last_five_digits);
                if (app_opt.track_hits) {logDebug('Cache Hits:[' + JSON.stringify(cache_hits) + '].');}
            }
            else {
                var errMsg = 'Last 5 digits [' + last_five_digits + '] were wrong should be [' + check_digits[_digits] + '].';
                logError(errMsg);
                throw new Error(errMsg);
            }
        }
    }

    if (i === range.length) {
        console.log('Self check completed with success');
        if (app_opt.track_hits) {console.log('Cache Hits:[' + JSON.stringify(cache_hits) + '].');}
        module.exports = piChudnovskyBS;
    }
}

//selfCheck(); // sanity check before require
module.exports = piChudnovskyBS;