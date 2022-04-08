"use strict";

function create() {
    return new MT(0x1badf00d);
}

function MT() {
    const N = 624;
    const M = 397;
    const MAG01 = [0x0, 0x9908b0df];
    
    this.mt = new Array(N);
    this.mti = N + 1;

    this.setSeed = function() {
       let a = arguments;
       switch (a.length) {
           case 1: if (a[0].constructor === Number) {
                       this.mt[0]= a[0];
                       for (let i = 1; i < N; ++i) {
                            let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
                            this.mt[i] = ((1812433253 * ((s & 0xffff0000) >>> 16))
                                                << 16)
                                                + 1812433253 * (s & 0x0000ffff)
                                                + i;
                       }
                       this.mti = N;
                       return;
                   }

                   this.setSeed(19650218);

                   let l = a[0].length;
                   let i = 1;
                   let j = 0;

                   for (let k = N > l ? N : l; k != 0; --k) {
                        let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
                                this.mt[i] = (this.mt[i]
                                               ^ (((1664525 * ((s & 0xffff0000) >>> 16)) << 16)
                                               + 1664525 * (s & 0x0000ffff)))
                                               + a[0][j]
                                               + j;
                                if (++i >= N) {
                                    this.mt[0] = this.mt[N - 1];
                                    i = 1;
                                }
                                if (++j >= l) {
                                    j = 0;
                                }
                   }

                   for (let k = N - 1; k != 0; --k) {
                        let s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
                                this.mt[i] = (this.mt[i]
                                               ^ (((1566083941 * ((s & 0xffff0000) >>> 16)) << 16)
                                               + 1566083941 * (s & 0x0000ffff)))
                                               - i;
                                if (++i >= N) {
                                    this.mt[0] = this.mt[N-1];
                                    i = 1;
                                }
                   }

                   this.mt[0] = 0x80000000;
                   return;
           default:
                   let seeds = new Array();
                   for (let i = 0; i < a.length; ++i) {
                        seeds.push(a[i]);
                   }
                   this.setSeed(seeds);
                   return;
       }
    }

    this.setSeed(0x1BADF00D);

    this.next = function (bits)	{
       if (this.mti >= N) {
           let x = 0;

           for (let k = 0; k < N - M; ++k) {
                x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
                this.mt[k] = this.mt[k + M] ^ (x >>> 1) ^ MAG01[x & 0x1];
           }
           for (let k = N - M; k < N - 1; ++k) {
                x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
                this.mt[k] = this.mt[k + (M - N)] ^ (x >>> 1) ^ MAG01[x & 0x1];
           }
           x = (this.mt[N - 1] & 0x80000000) | (this.mt[0] & 0x7fffffff);
           this.mt[N - 1] = this.mt[M - 1] ^ (x >>> 1) ^ MAG01[x & 0x1];

           this.mti = 0;
       }

       let y = this.mt[this.mti++];
       y ^= y >>> 11;
       y ^= (y << 7) & 0x9d2c5680;
       y ^= (y << 15) & 0xefc60000;
       y ^= y >>> 18;
       return (y >>> (32 - bits)) & 0xFFFFFFFF;
   }
}

module.exports.create = create;