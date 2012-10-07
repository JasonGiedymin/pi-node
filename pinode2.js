
var bignum = require('bigint');
var _ = require('underscore');
var microtime = require('microtime');

/* Options */
var app_opt = {
    debug: false
};

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

/* constants */
var C = 640320;
var C3_OVER_24 = bignum(Math.floor(Math.pow(C, 3) / 24));
logDebug('C: %s', C);
logDebug('C3_OVER_24: %s', C3_OVER_24);

function piChudnovskyBS(digits) {
    "use strict";

    var bs = function(a, b) {
        logDebug(' bs ==> %s, %s', a, b);
        var Pab, Qab, Tab;
        var Pam, Qam, Tam;
        var Pmb, Qmb, Tmb;

        if ( (b - a) === 1) {
            if (a === 0) {
                Qab = bignum(1);
                Pab = Qab;
            }
            else {
                logDebug('else');

                var a1 = bignum(6).mul( bignum(a)).sub(5);
                var a2 = bignum(2).mul( bignum(a)).sub(1);
                var a3 = bignum(6).mul( bignum(a)).sub(1);

                logDebug('a[1-3] set');

                Pab = a1.mul(a2).mul(a3);
                Qab = bignum(a).pow(3).mul(C3_OVER_24);
            }

            logDebug('Pab:[%s]', Pab);
            logDebug('Qab:[%s]', Qab);

            Tab = Pab.mul( bignum(13591409).add( bignum(545140134).mul(a) ));
            logDebug('Tab:[%s]', Tab);

            logDebug('inverse??? %s', a);

            //noinspection JSHint
            //jshint bitwise:false
            if ( a & 1 ) {
                logDebug('Doing inverse');
                logDebug('Tab pre:[%s]:', Tab);
                Tab = Tab.mul(-1);
                logDebug('Tab inv:[%s]:', Tab);
            }
        }
        else {
            var tempMab = bignum(a).add(b);
            var m = tempMab.div(2);
            logDebug('m:[%s]', m);

            logDebug('----z1---- %s, %s', a, m);
            var z1 = bs(a, m);
            logDebug('z1(%s, %s) aka array1:[%s]', a, m, z1);
            Pam = z1[0];
            Qam = z1[1];
            Tam = z1[2];

            logDebug('----z2---- %s, %s', m, b);
            var z2 = bs(m, b);
            logDebug('z2(%s, %s) aka array1:[%s]', m, b, z2);
            Pmb = z2[0];
            Qmb = z2[1];
            Tmb = z2[2];

            //Pab = Pam * Pmb
            //Qab = Qam * Qmb
            //Tab = Qmb * Tam + Pam * Tmb
            Pab = Pam.mul(Pmb);
            Qab = Qam.mul(Qmb);
            var tempQT = Qmb.mul(Tam);
            var tempPT = Pam.mul(Tmb);
            //Tab = bignum(bignum(Qmb).mul(Tam)).add(  );
            logDebug('----- POSSIBLE -----');
            logDebug('Qmb * Tam = %s', tempQT);
            logDebug('Qmb was: %s', Qmb);
            logDebug('Tam was: %s', Tam);

            logDebug('Pam * Tmb = %s', tempPT);
            logDebug('Pam was: %s', Pam);
            logDebug('Tmb was: %s', Tmb);
            Tab = tempPT.add(tempQT);
        }

        logDebug('about to return array %s', [Pab, Qab, Tab]);
        return [Pab, Qab, Tab];
    };

    var DIGITS_PER_TERM = Math.log( ((C3_OVER_24/6)/2)/6) / Math.LN10;
    logDebug('DIGITS Per Term set %s', DIGITS_PER_TERM);

    var N = Math.floor(digits/DIGITS_PER_TERM) + 1;
    logDebug('N is set %s', N);

    var P, Q, T;
    var initialBS = bs(0, N);
    logDebug('Initial BS set');

    P = initialBS[0];
    logDebug('P=%s', P);

    Q = initialBS[1];
    logDebug('Q=%s', Q);

    T = initialBS[2];
    logDebug('T=%s', T);

    var MAGIC_10 = bignum(10);
    var MAGIC_10005 = bignum(10005);
    var MAGIC_426880 = 426880;
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
    logDebug(piVal);
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
            }
            else {
                logDebug("Last 5 digits %s wrong should be %s", last_five_digits, check_digits[_digits]);
            }
        }
    }

    if (i === range.length) {
        console.log('Self check completed with success');
        module.exports = piChudnovskyBS;
    }
}

//selfCheck(); // sanity check before require
module.exports = piChudnovskyBS;

// 20
// js: 314159265358979323846264338327950288419716939937510
// py: 314159265358979323846264338327950288419716939937510

// Perf: 17,006 / 18,388
