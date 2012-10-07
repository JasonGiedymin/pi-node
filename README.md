# Performant Chudnovsky Pi on NodeJS

This project provides an accurate and performant means of generating Pi via the [Chudnovsky algorithm](http://en.wikipedia.org/wiki/Chudnovsky_algorithm) using NodeJS.

This project is constantly being improved upon.

All significant variations are benchmarked.

A self check occurs on the first require to ensure system stability.

    Jason Giedymin <jasong _:-a-t:-_ apache _dot_ org>


## Other Improvements

This project helped find a very [fast means of memoization in NodeJS/V8](http://jsperf.com/comparison-of-memoization-implementations/19)


## Make sure you have GMP installed on your system

You'll need GMP installed.


## NPM Install

    npm install underscore bigint microtime


## Performance

Variation of pinode exist as pinode#.js where '#' is the variation number.

    Pi1#10kDigits Original x 12.92 ops/sec ±6.36% (36 runs sampled)
    Pi2#10kDigits References x 14.76 ops/sec ±6.09% (41 runs sampled)
    Pi3#10kDigits Matrix x 14.67 ops/sec ±6.22% (40 runs sampled)
    Pi4#10kDigits Cleanup x 23.89 ops/sec ±7.94% (44 runs sampled)
    Pi5#10kDigits First-class Functions x 24.11 ops/sec ±8.11% (44 runs sampled)
    Pi6#10kDigits Custom Caching x 56.54 ops/sec ±6.73% (60 runs sampled)
    Pi7#10kDigits Advanced Custom Caching x 56.71 ops/sec ±6.56% (60 runs sampled)
    Pi8#10kDigits Global Advanced Custom Caching x 56.54 ops/sec ±6.57% (60 runs sampled)
    Pi9#10kDigits Global Advanced Custom Caching to other functions + hit tracking x 1,729 ops/sec ±3.09% (91 runs sampled)

    Fastest is Pi9#10kDigits Global Advanced Custom Caching to other functions + hit tracking

In summary, performance went from ~13 ops/sec (of Pi @ 10k digits) to 1750 ops/sec.

