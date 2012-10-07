var bignum = require('bigint');

var C = bignum(640320);
var C3_OVER_24 = bignum(C*C*C).div(24);

//console.log('C3 Over 24', C3_OVER_24);

function pi(digits) {
    "use strict";

    var binarySplit = function(a, b) {
        //console.log('a:%s, b:%s', a, b);
        var Pab, Qab, Tab;

        if(b - a === 1) {
            //console.log('main if');

            if (a === 0) {
                Qab = bignum(1);
                Pab = bignum(Qab);
                //console.log('bignum a: %s', Pab);
            }
            else {
                //console.log('in else');
                Pab = bignum( (6 * a - 5) * (2 * a - 1) * (6 * a - 1) );
                Qab = bignum(a * a * a * C3_OVER_24);
            }

            Tab = Pab.mul( bignum(a).add(13591409).add(545140134) );
            //console.log('Tab: %s', Tab);

            if (a === 1) {
                Tab = -Tab;
            }
        }
        else {
            //console.log('main else');
            var m = bignum(a + b).div(2);
            //console.log('m: %s', m);

            var b1 = binarySplit(a, m);
            var b2 = binarySplit(m, b);

            Pab = bignum(b1[0]).mul( bignum(b2[0]) );
            Qab = bignum(b1[1]).mul( bignum(b2[1]) );
            Tab = bignum(b2[1]).mul( bignum(b1[2]).add( bignum(b1[0]).mul( bignum(b2[2]) ) ) );
        }

        return [bignum(Pab), bignum(Qab), bignum(Tab)];
    };

    var DIGITS_PER_TERM = Math.log(C3_OVER_24/6/2/6)/Math.LN10;
    //console.log('digits per term: %s', DIGITS_PER_TERM);

    var N = bignum(digits).div(DIGITS_PER_TERM).add(1);
    //console.log('data N: %s', N);

    var piRet = binarySplit(0, N);
    console.log('bs: %s', piRet);
    console.log('digits: %s', digits);

    var one_squared = bignum(10).pow(2*digits);
    //console.log('one_squred: %s', one_squared);

    var sqrtC = bignum(10005).mul(one_squared).sqrt();
    //console.log('sqrtC: %s', sqrtC);

    return bignum(piRet[1]).mul(426880).mul(sqrtC).div( bignum(piRet[2]) );
}

module.exports = pi;