import { P as e, Sn as t, T as n, Vt as r, it as i, tt as a, vn as o, w as s, z as c } from "./three.core-B2nxnlw-.js";
// node_modules/three/examples/jsm/libs/fflate.module.js
var l = Uint8Array, u = Uint16Array, d = Int32Array, f = new l([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), p = new l([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), m = new l([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), h = function(e, t) {
	for (var n = new u(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new d(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, g = h(f, 2), _ = g.b, v = g.r;
_[28] = 258, v[258] = 28;
var y = h(p, 0), b = y.b;
y.r;
for (var x = new u(32768), S = 0; S < 32768; ++S) {
	var C = (S & 43690) >> 1 | (S & 21845) << 1;
	C = (C & 52428) >> 2 | (C & 13107) << 2, C = (C & 61680) >> 4 | (C & 3855) << 4, x[S] = ((C & 65280) >> 8 | (C & 255) << 8) >> 1;
}
for (var w = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new u(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new u(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new u(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], d = t - e[i], f = o[e[i] - 1]++ << d, p = f | (1 << d) - 1; f <= p; ++f) s[x[f] >> c] = l;
	} else for (s = new u(r), i = 0; i < r; ++i) e[i] && (s[i] = x[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), T = new l(288), S = 0; S < 144; ++S) T[S] = 8;
for (var S = 144; S < 256; ++S) T[S] = 9;
for (var S = 256; S < 280; ++S) T[S] = 7;
for (var S = 280; S < 288; ++S) T[S] = 8;
for (var E = new l(32), S = 0; S < 32; ++S) E[S] = 5;
var ee = /*#__PURE__*/ w(T, 9, 1), D = /*#__PURE__*/ w(E, 5, 1), O = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, k = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, A = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, te = function(e) {
	return (e + 7) / 8 | 0;
}, ne = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new l(e.subarray(t, n));
}, j = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], M = function(e, t, n) {
	var r = Error(t || j[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, M), !n) throw r;
	return r;
}, N = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new l(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new l(i * 3));
	var u = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new l(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, d = t.f || 0, h = t.p || 0, g = t.b || 0, v = t.l, y = t.d, x = t.m, S = t.n, C = i * 8;
	do {
		if (!v) {
			d = k(e, h, 1);
			var T = k(e, h + 1, 3);
			if (h += 3, !T) {
				var E = te(h) + 4, j = e[E - 4] | e[E - 3] << 8, N = E + j;
				if (N > i) {
					c && M(0);
					break;
				}
				s && u(g + j), n.set(e.subarray(E, N), g), t.b = g += j, t.p = h = N * 8, t.f = d;
				continue;
			}
			if (T == 1) v = ee, y = D, x = 9, S = 5;
			else if (T == 2) {
				var P = k(e, h, 31) + 257, re = k(e, h + 10, 15) + 4, F = P + k(e, h + 5, 31) + 1;
				h += 14;
				for (var I = new l(F), ie = new l(19), L = 0; L < re; ++L) ie[m[L]] = k(e, h + L * 3, 7);
				h += re * 3;
				for (var R = O(ie), ae = (1 << R) - 1, oe = w(ie, R, 1), L = 0; L < F;) {
					var se = oe[k(e, h, ae)];
					h += se & 15;
					var E = se >> 4;
					if (E < 16) I[L++] = E;
					else {
						var z = 0, B = 0;
						for (E == 16 ? (B = 3 + k(e, h, 3), h += 2, z = I[L - 1]) : E == 17 ? (B = 3 + k(e, h, 7), h += 3) : E == 18 && (B = 11 + k(e, h, 127), h += 7); B--;) I[L++] = z;
					}
				}
				var ce = I.subarray(0, P), V = I.subarray(P);
				x = O(ce), S = O(V), v = w(ce, x, 1), y = w(V, S, 1);
			} else M(1);
			if (h > C) {
				c && M(0);
				break;
			}
		}
		s && u(g + 131072);
		for (var le = (1 << x) - 1, ue = (1 << S) - 1, H = h;; H = h) {
			var z = v[A(e, h) & le], U = z >> 4;
			if (h += z & 15, h > C) {
				c && M(0);
				break;
			}
			if (z || M(2), U < 256) n[g++] = U;
			else if (U == 256) {
				H = h, v = null;
				break;
			} else {
				var W = U - 254;
				if (U > 264) {
					var L = U - 257, G = f[L];
					W = k(e, h, (1 << G) - 1) + _[L], h += G;
				}
				var K = y[A(e, h) & ue], de = K >> 4;
				K || M(3), h += K & 15;
				var V = b[de];
				if (de > 3) {
					var G = p[de];
					V += A(e, h) & (1 << G) - 1, h += G;
				}
				if (h > C) {
					c && M(0);
					break;
				}
				s && u(g + 131072);
				var fe = g + W;
				if (g < V) {
					var pe = a - V, me = Math.min(V, fe);
					for (pe + g < 0 && M(3); g < me; ++g) n[g] = r[pe + g];
				}
				for (; g < fe; ++g) n[g] = n[g - V];
			}
		}
		t.l = v, t.p = H, t.b = g, t.f = d, v && (d = 1, t.m = x, t.d = y, t.n = S);
	} while (!d);
	return g != n.length && o ? ne(n, 0, g) : n.subarray(0, g);
}, P = /*#__PURE__*/ new l(0), re = function(e, t) {
	return ((e[0] & 15) != 8 || e[0] >> 4 > 7 || (e[0] << 8 | e[1]) % 31) && M(6, "invalid zlib data"), (e[1] >> 5 & 1) == +!t && M(6, "invalid zlib data: " + (e[1] & 32 ? "need" : "unexpected") + " dictionary"), (e[1] >> 3 & 4) + 2;
};
function F(e, t) {
	return N(e.subarray(re(e, t && t.dictionary), -4), { i: 2 }, t && t.out, t && t.dictionary);
}
var I = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	I.decode(P, { stream: !0 });
} catch {}
// node_modules/three/examples/jsm/loaders/EXRLoader.js
var ie = class extends s {
	constructor(e) {
		super(e), this.type = c, this.outputFormat = r, this.part = 0;
	}
	parse(s) {
		let l = 65536, u = 8192, d = 65537, f = 16384, p = 16383, m = 65535, h = 2.7182818 ** 2.2, g = null, _ = null;
		function v(e, t) {
			let n = 0;
			for (let r = 0; r < l; ++r) (r == 0 || e[r >> 3] & 1 << (r & 7)) && (t[n++] = r);
			let r = n - 1;
			for (; n < l;) t[n++] = 0;
			return r;
		}
		function y(e) {
			for (let t = 0; t < f; t++) e[t] = {}, e[t].len = 0, e[t].lit = 0, e[t].p = null;
		}
		let b = {
			l: 0,
			c: 0,
			lc: 0
		};
		function x(e, t, n, r, i) {
			for (; n < e;) t = t << 8 | ye(r, i), n += 8;
			n -= e, b.l = t >> n & (1 << e) - 1, b.c = t, b.lc = n;
		}
		let S = Array(59);
		function C(e) {
			for (let e = 0; e <= 58; ++e) S[e] = 0;
			for (let t = 0; t < d; ++t) S[e[t]] += 1;
			let t = 0;
			for (let e = 58; e > 0; --e) {
				let n = t + S[e] >> 1;
				S[e] = t, t = n;
			}
			for (let t = 0; t < d; ++t) {
				let n = e[t];
				n > 0 && (e[t] = n | S[n]++ << 6);
			}
		}
		function w(e, t, n, r, i, a) {
			let o = t, s = 0, c = 0;
			for (; r <= i; r++) {
				if (o.value - t.value > n) return !1;
				x(6, s, c, e, o);
				let l = b.l;
				if (s = b.c, c = b.lc, a[r] = l, l == 63) {
					if (o.value - t.value > n) throw Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");
					x(8, s, c, e, o);
					let l = b.l + 6;
					if (s = b.c, c = b.lc, r + l > i + 1) throw Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");
					for (; l--;) a[r++] = 0;
					r--;
				} else if (l >= 59) {
					let e = l - 59 + 2;
					if (r + e > i + 1) throw Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");
					for (; e--;) a[r++] = 0;
					r--;
				}
			}
			C(a);
		}
		function T(e) {
			return e & 63;
		}
		function E(e) {
			return e >> 6;
		}
		function ee(e, t, n, r) {
			for (; t <= n; t++) {
				let n = E(e[t]), i = T(e[t]);
				if (n >> i) throw Error("THREE.EXRLoader: Invalid table entry");
				if (i > 14) {
					let e = r[n >> i - 14];
					if (e.len) throw Error("THREE.EXRLoader: Invalid table entry");
					if (e.lit++, e.p) {
						let t = e.p;
						e.p = Array(e.lit);
						for (let n = 0; n < e.lit - 1; ++n) e.p[n] = t[n];
					} else e.p = [,];
					e.p[e.lit - 1] = t;
				} else if (i) {
					let e = 0;
					for (let a = 1 << 14 - i; a > 0; a--) {
						let a = r[(n << 14 - i) + e];
						if (a.len || a.p) throw Error("THREE.EXRLoader: Invalid table entry");
						a.len = i, a.lit = t, e++;
					}
				}
			}
			return !0;
		}
		let D = {
			c: 0,
			lc: 0
		};
		function O(e, t, n, r) {
			e = e << 8 | ye(n, r), t += 8, D.c = e, D.lc = t;
		}
		let k = {
			c: 0,
			lc: 0
		};
		function A(e, t, n, r, i, a, o, s, c) {
			if (e == t) {
				r < 8 && (O(n, r, i, a), n = D.c, r = D.lc), r -= 8;
				let e = n >> r;
				if (e = new Uint8Array([e])[0], s.value + e > c) return !1;
				let t = o[s.value - 1];
				for (; e-- > 0;) o[s.value++] = t;
			} else if (s.value < c) o[s.value++] = e;
			else return !1;
			k.c = n, k.lc = r;
		}
		function te(e) {
			return e & 65535;
		}
		function ne(e) {
			let t = te(e);
			return t > 32767 ? t - 65536 : t;
		}
		let j = {
			a: 0,
			b: 0
		};
		function M(e, t) {
			let n = ne(e), r = ne(t), i = n + (r & 1) + (r >> 1), a = i, o = i - r;
			j.a = a, j.b = o;
		}
		function N(e, t) {
			let n = te(e), r = te(t), i = n - (r >> 1) & m, a = r + i - 32768 & m;
			j.a = a, j.b = i;
		}
		function P(e, t, n, r, i, a, o) {
			let s = o < 16384, c = n > i ? i : n, l = 1, u, d;
			for (; l <= c;) l <<= 1;
			for (l >>= 1, u = l, l >>= 1; l >= 1;) {
				d = 0;
				let o = d + a * (i - u), c = a * l, f = a * u, p = r * l, m = r * u, h, g, _, v;
				for (; d <= o; d += f) {
					let i = d, a = d + r * (n - u);
					for (; i <= a; i += m) {
						let n = i + p, r = i + c, a = r + p;
						s ? (M(e[i + t], e[r + t]), h = j.a, _ = j.b, M(e[n + t], e[a + t]), g = j.a, v = j.b, M(h, g), e[i + t] = j.a, e[n + t] = j.b, M(_, v), e[r + t] = j.a, e[a + t] = j.b) : (N(e[i + t], e[r + t]), h = j.a, _ = j.b, N(e[n + t], e[a + t]), g = j.a, v = j.b, N(h, g), e[i + t] = j.a, e[n + t] = j.b, N(_, v), e[r + t] = j.a, e[a + t] = j.b);
					}
					if (n & l) {
						let n = i + c;
						s ? M(e[i + t], e[n + t]) : N(e[i + t], e[n + t]), h = j.a, e[n + t] = j.b, e[i + t] = h;
					}
				}
				if (i & l) {
					let i = d, a = d + r * (n - u);
					for (; i <= a; i += m) {
						let n = i + p;
						s ? M(e[i + t], e[n + t]) : N(e[i + t], e[n + t]), h = j.a, e[n + t] = j.b, e[i + t] = h;
					}
				}
				u = l, l >>= 1;
			}
			return d;
		}
		function re(e, t, n, r, i, a, o, s, c) {
			let l = 0, u = 0, d = o, f = Math.trunc(r.value + (i + 7) / 8);
			for (; r.value < f;) for (O(l, u, n, r), l = D.c, u = D.lc; u >= 14;) {
				let i = t[l >> u - 14 & p];
				if (i.len) u -= i.len, A(i.lit, a, l, u, n, r, s, c, d), l = k.c, u = k.lc;
				else {
					if (!i.p) throw Error("THREE.EXRLoader: hufDecode issues");
					let t = 0;
					for (; t < i.lit; t++) {
						let o = T(e[i.p[t]]);
						for (; u < o && r.value < f;) O(l, u, n, r), l = D.c, u = D.lc;
						if (u >= o && E(e[i.p[t]]) == (l >> u - o & (1 << o) - 1)) {
							u -= o, A(i.p[t], a, l, u, n, r, s, c, d), l = k.c, u = k.lc;
							break;
						}
					}
					if (t == i.lit) throw Error("THREE.EXRLoader: hufDecode issues");
				}
			}
			let m = 8 - i & 7;
			for (l >>= m, u -= m; u > 0;) {
				let e = t[l << 14 - u & p];
				if (e.len) u -= e.len, A(e.lit, a, l, u, n, r, s, c, d), l = k.c, u = k.lc;
				else throw Error("THREE.EXRLoader: hufDecode issues");
			}
			return !0;
		}
		function I(e, t, n, r, i, a) {
			let o = { value: 0 }, s = n.value, c = J(t, n), l = J(t, n);
			n.value += 4;
			let u = J(t, n);
			if (n.value += 4, c < 0 || c >= d || l < 0 || l >= d) throw Error("THREE.EXRLoader: Something wrong with HUF_ENCSIZE");
			let p = Array(d), m = Array(f);
			if (y(m), w(e, n, r - (n.value - s), c, l, p), u > 8 * (r - (n.value - s))) throw Error("THREE.EXRLoader: Something wrong with hufUncompress");
			ee(p, c, l, m), re(p, m, e, n, u, l, a, i, o);
		}
		function ie(e, t, n) {
			for (let r = 0; r < n; ++r) t[r] = e[t[r]];
		}
		function L(e) {
			for (let t = 1; t < e.length; t++) {
				let n = e[t - 1] + e[t] - 128;
				e[t] = n;
			}
		}
		function R(e, t) {
			let n = 0, r = Math.floor((e.length + 1) / 2), i = 0, a = e.length - 1;
			for (; !(i > a || (t[i++] = e[n++], i > a));) t[i++] = e[r++];
		}
		function ae(e) {
			let t = e.byteLength, n = [], r = 0, i = new DataView(e);
			for (; t > 0;) {
				let e = i.getInt8(r++);
				if (e < 0) {
					let a = -e;
					t -= a + 1;
					for (let e = 0; e < a; e++) n.push(i.getUint8(r++));
				} else {
					let a = e;
					t -= 2;
					let o = i.getUint8(r++);
					for (let e = 0; e < a + 1; e++) n.push(o);
				}
			}
			return n;
		}
		function oe(e, t, r, i, a, o) {
			let s = new DataView(o.buffer), c = r[e.idx[0]].width, l = r[e.idx[0]].height, u = Math.floor(c / 8), d = Math.ceil(c / 8), f = Math.ceil(l / 8), p = c - (d - 1) * 8, m = l - (f - 1) * 8, h = { value: 0 }, g = [
				,
				,
				,
			], _ = [
				,
				,
				,
			], v = [
				,
				,
				,
			], y = [
				,
				,
				,
			], b = [
				,
				,
				,
			];
			for (let n = 0; n < 3; ++n) b[n] = t[e.idx[n]], g[n] = n < 1 ? 0 : g[n - 1] + d * f, _[n] = /* @__PURE__ */ new Float32Array(64), v[n] = /* @__PURE__ */ new Uint16Array(64), y[n] = new Uint16Array(d * 64);
			for (let t = 0; t < f; ++t) {
				let n = 8;
				t == f - 1 && (n = m);
				let o = 8;
				for (let e = 0; e < d; ++e) {
					e == d - 1 && (o = p);
					for (let e = 0; e < 3; ++e) v[e].fill(0), v[e][0] = a[g[e]++], z(h, i, v[e]), B(v[e], _[e]), ce(_[e]);
					V(_);
					for (let t = 0; t < 3; ++t) U(_[t], y[t], e * 64);
				}
				let c = 0;
				for (let i = 0; i < 3; ++i) {
					let a = r[e.idx[i]].type;
					for (let e = 8 * t; e < 8 * t + n; ++e) {
						c = b[i][e];
						for (let t = 0; t < u; ++t) {
							let n = t * 64 + (e & 7) * 8;
							s.setUint16(c + 0 * a, y[i][n + 0], !0), s.setUint16(c + 2 * a, y[i][n + 1], !0), s.setUint16(c + 4 * a, y[i][n + 2], !0), s.setUint16(c + 6 * a, y[i][n + 3], !0), s.setUint16(c + 8 * a, y[i][n + 4], !0), s.setUint16(c + 10 * a, y[i][n + 5], !0), s.setUint16(c + 12 * a, y[i][n + 6], !0), s.setUint16(c + 14 * a, y[i][n + 7], !0), c += 16 * a;
						}
					}
					if (u != d) for (let e = 8 * t; e < 8 * t + n; ++e) {
						let t = b[i][e] + 8 * u * 2 * a, n = u * 64 + (e & 7) * 8;
						for (let e = 0; e < o; ++e) s.setUint16(t + e * 2 * a, y[i][n + e], !0);
					}
				}
			}
			let x = new Uint16Array(c);
			s = new DataView(o.buffer);
			for (let t = 0; t < 3; ++t) {
				r[e.idx[t]].decoded = !0;
				let i = r[e.idx[t]].type;
				if (r[t].type == 2) for (let e = 0; e < l; ++e) {
					let r = b[t][e];
					for (let e = 0; e < c; ++e) x[e] = s.getUint16(r + e * 2 * i, !0);
					for (let e = 0; e < c; ++e) s.setFloat32(r + e * 2 * i, n.fromHalfFloat(x[e]), !0);
				}
			}
		}
		function se(e, t, n, r, i, a) {
			let o = new DataView(a.buffer), s = n[e], c = s.width, l = s.height, u = Math.ceil(c / 8), d = Math.ceil(l / 8), f = Math.floor(c / 8), p = c - (u - 1) * 8, m = l - (d - 1) * 8, h = { value: 0 }, g = 0, _ = /* @__PURE__ */ new Float32Array(64), v = /* @__PURE__ */ new Uint16Array(64), y = new Uint16Array(u * 64);
			for (let n = 0; n < d; ++n) {
				let a = 8;
				n == d - 1 && (a = m);
				for (let e = 0; e < u; ++e) v.fill(0), v[0] = i[g++], z(h, r, v), B(v, _), ce(_), U(_, y, e * 64);
				for (let r = 8 * n; r < 8 * n + a; ++r) {
					let n = t[e][r];
					for (let e = 0; e < f; ++e) {
						let t = e * 64 + (r & 7) * 8;
						for (let e = 0; e < 8; ++e) o.setUint16(n + e * 2 * s.type, y[t + e], !0);
						n += 16 * s.type;
					}
					if (u != f) {
						let e = f * 64 + (r & 7) * 8;
						for (let t = 0; t < p; ++t) o.setUint16(n + t * 2 * s.type, y[e + t], !0);
					}
				}
			}
			s.decoded = !0;
		}
		function z(e, t, n) {
			let r, i = 1;
			for (; i < 64;) r = t[e.value], r == 65280 ? i = 64 : r >> 8 == 255 ? i += r & 255 : (n[i] = r, i++), e.value++;
		}
		function B(e, t) {
			t[0] = n.fromHalfFloat(e[0]), t[1] = n.fromHalfFloat(e[1]), t[2] = n.fromHalfFloat(e[5]), t[3] = n.fromHalfFloat(e[6]), t[4] = n.fromHalfFloat(e[14]), t[5] = n.fromHalfFloat(e[15]), t[6] = n.fromHalfFloat(e[27]), t[7] = n.fromHalfFloat(e[28]), t[8] = n.fromHalfFloat(e[2]), t[9] = n.fromHalfFloat(e[4]), t[10] = n.fromHalfFloat(e[7]), t[11] = n.fromHalfFloat(e[13]), t[12] = n.fromHalfFloat(e[16]), t[13] = n.fromHalfFloat(e[26]), t[14] = n.fromHalfFloat(e[29]), t[15] = n.fromHalfFloat(e[42]), t[16] = n.fromHalfFloat(e[3]), t[17] = n.fromHalfFloat(e[8]), t[18] = n.fromHalfFloat(e[12]), t[19] = n.fromHalfFloat(e[17]), t[20] = n.fromHalfFloat(e[25]), t[21] = n.fromHalfFloat(e[30]), t[22] = n.fromHalfFloat(e[41]), t[23] = n.fromHalfFloat(e[43]), t[24] = n.fromHalfFloat(e[9]), t[25] = n.fromHalfFloat(e[11]), t[26] = n.fromHalfFloat(e[18]), t[27] = n.fromHalfFloat(e[24]), t[28] = n.fromHalfFloat(e[31]), t[29] = n.fromHalfFloat(e[40]), t[30] = n.fromHalfFloat(e[44]), t[31] = n.fromHalfFloat(e[53]), t[32] = n.fromHalfFloat(e[10]), t[33] = n.fromHalfFloat(e[19]), t[34] = n.fromHalfFloat(e[23]), t[35] = n.fromHalfFloat(e[32]), t[36] = n.fromHalfFloat(e[39]), t[37] = n.fromHalfFloat(e[45]), t[38] = n.fromHalfFloat(e[52]), t[39] = n.fromHalfFloat(e[54]), t[40] = n.fromHalfFloat(e[20]), t[41] = n.fromHalfFloat(e[22]), t[42] = n.fromHalfFloat(e[33]), t[43] = n.fromHalfFloat(e[38]), t[44] = n.fromHalfFloat(e[46]), t[45] = n.fromHalfFloat(e[51]), t[46] = n.fromHalfFloat(e[55]), t[47] = n.fromHalfFloat(e[60]), t[48] = n.fromHalfFloat(e[21]), t[49] = n.fromHalfFloat(e[34]), t[50] = n.fromHalfFloat(e[37]), t[51] = n.fromHalfFloat(e[47]), t[52] = n.fromHalfFloat(e[50]), t[53] = n.fromHalfFloat(e[56]), t[54] = n.fromHalfFloat(e[59]), t[55] = n.fromHalfFloat(e[61]), t[56] = n.fromHalfFloat(e[35]), t[57] = n.fromHalfFloat(e[36]), t[58] = n.fromHalfFloat(e[48]), t[59] = n.fromHalfFloat(e[49]), t[60] = n.fromHalfFloat(e[57]), t[61] = n.fromHalfFloat(e[58]), t[62] = n.fromHalfFloat(e[62]), t[63] = n.fromHalfFloat(e[63]);
		}
		function ce(e) {
			let t = .5 * Math.cos(3.14159 / 4), n = .5 * Math.cos(3.14159 / 16), r = .5 * Math.cos(3.14159 / 8), i = .5 * Math.cos(3 * 3.14159 / 16), a = .5 * Math.cos(15.70795 / 16), o = .5 * Math.cos(3 * 3.14159 / 8), s = .5 * Math.cos(21.99113 / 16), c = [
				,
				,
				,
				,
			], l = [
				,
				,
				,
				,
			], u = [
				,
				,
				,
				,
			], d = [
				,
				,
				,
				,
			];
			for (let f = 0; f < 8; ++f) {
				let p = f * 8;
				c[0] = r * e[p + 2], c[1] = o * e[p + 2], c[2] = r * e[p + 6], c[3] = o * e[p + 6], l[0] = n * e[p + 1] + i * e[p + 3] + a * e[p + 5] + s * e[p + 7], l[1] = i * e[p + 1] - s * e[p + 3] - n * e[p + 5] - a * e[p + 7], l[2] = a * e[p + 1] - n * e[p + 3] + s * e[p + 5] + i * e[p + 7], l[3] = s * e[p + 1] - a * e[p + 3] + i * e[p + 5] - n * e[p + 7], u[0] = t * (e[p + 0] + e[p + 4]), u[3] = t * (e[p + 0] - e[p + 4]), u[1] = c[0] + c[3], u[2] = c[1] - c[2], d[0] = u[0] + u[1], d[1] = u[3] + u[2], d[2] = u[3] - u[2], d[3] = u[0] - u[1], e[p + 0] = d[0] + l[0], e[p + 1] = d[1] + l[1], e[p + 2] = d[2] + l[2], e[p + 3] = d[3] + l[3], e[p + 4] = d[3] - l[3], e[p + 5] = d[2] - l[2], e[p + 6] = d[1] - l[1], e[p + 7] = d[0] - l[0];
			}
			for (let f = 0; f < 8; ++f) c[0] = r * e[16 + f], c[1] = o * e[16 + f], c[2] = r * e[48 + f], c[3] = o * e[48 + f], l[0] = n * e[8 + f] + i * e[24 + f] + a * e[40 + f] + s * e[56 + f], l[1] = i * e[8 + f] - s * e[24 + f] - n * e[40 + f] - a * e[56 + f], l[2] = a * e[8 + f] - n * e[24 + f] + s * e[40 + f] + i * e[56 + f], l[3] = s * e[8 + f] - a * e[24 + f] + i * e[40 + f] - n * e[56 + f], u[0] = t * (e[f] + e[32 + f]), u[3] = t * (e[f] - e[32 + f]), u[1] = c[0] + c[3], u[2] = c[1] - c[2], d[0] = u[0] + u[1], d[1] = u[3] + u[2], d[2] = u[3] - u[2], d[3] = u[0] - u[1], e[0 + f] = d[0] + l[0], e[8 + f] = d[1] + l[1], e[16 + f] = d[2] + l[2], e[24 + f] = d[3] + l[3], e[32 + f] = d[3] - l[3], e[40 + f] = d[2] - l[2], e[48 + f] = d[1] - l[1], e[56 + f] = d[0] - l[0];
		}
		function V(e) {
			for (let t = 0; t < 64; ++t) {
				let n = e[0][t], r = e[1][t], i = e[2][t];
				e[0][t] = n + 1.5747 * i, e[1][t] = n - .1873 * r - .4682 * i, e[2][t] = n + 1.8556 * r;
			}
		}
		let le = /* @__PURE__ */ new Float32Array(1), ue = new Uint32Array(le.buffer);
		function H(e) {
			le[0] = e;
			let t = ue[0], n = t >>> 16 & 32768, r = t & 2147483647;
			return r >= 1199570944 ? n | (r > 2139095040 ? 32256 : 31744) : r < 947912704 ? (le[0] = Math.abs(e) + .5, n | ue[0] - 1056964608) : n | r + 4095 + (r >>> 13 & 1) - 939524096 >>> 13;
		}
		function U(e, t, r) {
			if (_ === null) {
				_ = /* @__PURE__ */ new Uint16Array(65536);
				for (let e = 1; e < 65536; ++e) {
					if ((e & 31744) == 31744) continue;
					let t = n.fromHalfFloat(e), r = Math.abs(t), i = r <= 1 ? r ** 2.2 : h ** (r - 1);
					_[e] = H(t < 0 ? -i : i);
				}
			}
			for (let n = 0; n < 64; ++n) t[r + n] = _[H(e[n])];
		}
		function W(e) {
			return new DataView(e.array.buffer, e.offset.value, e.size);
		}
		function G(e) {
			let t = e.viewer.buffer.slice(e.offset.value, e.offset.value + e.size), n = new Uint8Array(ae(t)), r = new Uint8Array(n.length);
			return L(n), R(n, r), new DataView(r.buffer);
		}
		function K(e) {
			let t = F(e.array.slice(e.offset.value, e.offset.value + e.size)), n = new Uint8Array(t.length);
			return L(t), R(t, n), new DataView(n.buffer);
		}
		function de(e) {
			let t = e.viewer, n = { value: e.offset.value }, r = new Uint16Array(e.columns * e.lines * (e.inputChannels.length * e.type)), i = new Uint8Array(u), a = 0, o = Array(e.inputChannels.length);
			for (let t = 0, n = e.inputChannels.length; t < n; t++) o[t] = {}, o[t].start = a, o[t].end = o[t].start, o[t].nx = e.columns, o[t].ny = e.lines, o[t].size = e.type, a += o[t].nx * o[t].ny * o[t].size;
			let s = xe(t, n), c = xe(t, n);
			if (c >= u) throw Error("THREE.EXRLoader: Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");
			if (s <= c) for (let e = 0; e < c - s + 1; e++) i[e + s] = Y(t, n);
			let d = new Uint16Array(l), f = v(i, d), p = J(t, n);
			I(e.array, t, n, p, r, a);
			for (let t = 0; t < e.inputChannels.length; ++t) {
				let e = o[t];
				for (let n = 0; n < o[t].size; ++n) P(r, e.start + n, e.nx, e.size, e.ny, e.nx * e.size, f);
			}
			ie(d, r, a);
			let m = 0, h = new Uint8Array(r.buffer.byteLength);
			for (let t = 0; t < e.lines; t++) for (let t = 0; t < e.inputChannels.length; t++) {
				let e = o[t], n = e.nx * e.size, i = new Uint8Array(r.buffer, e.end * 2, n * 2);
				h.set(i, m), m += n * 2, e.end += n;
			}
			return new DataView(h.buffer);
		}
		function fe(e) {
			let t = F(e.array.slice(e.offset.value, e.offset.value + e.size)), n = e.inputChannels.length * e.lines * e.columns * e.totalBytes, r = new ArrayBuffer(n), i = new DataView(r), a = 0, o = 0, s = [
				,
				,
				,
				,
			];
			for (let n = 0; n < e.lines; n++) for (let n = 0; n < e.inputChannels.length; n++) {
				let r = 0;
				switch (e.inputChannels[n].pixelType) {
					case 1:
						s[0] = a, s[1] = s[0] + e.columns, a = s[1] + e.columns;
						for (let n = 0; n < e.columns; ++n) {
							let e = t[s[0]++] << 8 | t[s[1]++];
							r += e, i.setUint16(o, r, !0), o += 2;
						}
						break;
					case 2:
						s[0] = a, s[1] = s[0] + e.columns, s[2] = s[1] + e.columns, a = s[2] + e.columns;
						for (let n = 0; n < e.columns; ++n) {
							let e = t[s[0]++] << 24 | t[s[1]++] << 16 | t[s[2]++] << 8;
							r += e, i.setUint32(o, r, !0), o += 4;
						}
				}
			}
			return i;
		}
		function pe(e) {
			let t = e.array, r = e.offset.value, i = e.columns, a = e.lines, o = e.inputChannels, s = e.totalBytes, c = Q.compression === "B44A_COMPRESSION", l = new Uint8Array(a * i * s), u = /* @__PURE__ */ new Uint16Array(16), d = 0;
			for (let e = 0; e < o.length; e++) {
				let f = o[e], p = f.pixelType * 2, m = Math.ceil(i / f.xSampling), h = Math.ceil(a / f.ySampling), _ = f.xSampling === 1 && f.ySampling === 1;
				if (f.pixelType !== 1) {
					for (let e = 0; e < h; e++) if (_) {
						let n = e * i * s + d * i;
						for (let e = 0; e < m * p; e++) l[n + e] = t[r++];
					} else r += m * p;
					d += p;
					continue;
				}
				let v = Math.ceil(m / 4), y = Math.ceil(h / 4);
				for (let e = 0; e < y; e++) for (let o = 0; o < v; o++) {
					if (c && t[r + 2] >= 52) {
						let e = t[r] << 8 | t[r + 1], n = e & 32768 ? e & 32767 : ~e & 65535;
						u.fill(n), r += 3;
					} else {
						let e = t[r] << 8 | t[r + 1], n = t[r + 2] >> 2, i = 32 << n, a = e + ((t[r + 2] << 4 | t[r + 3] >> 4) & 63) * (1 << n) - i & 65535, o = a + ((t[r + 3] << 2 | t[r + 4] >> 6) & 63) * (1 << n) - i & 65535, s = o + (t[r + 4] & 63) * (1 << n) - i & 65535, c = e + (t[r + 5] >> 2 & 63) * (1 << n) - i & 65535, l = a + ((t[r + 5] << 4 | t[r + 6] >> 4) & 63) * (1 << n) - i & 65535, d = o + ((t[r + 6] << 2 | t[r + 7] >> 6) & 63) * (1 << n) - i & 65535, f = s + (t[r + 7] & 63) * (1 << n) - i & 65535, p = c + (t[r + 8] >> 2 & 63) * (1 << n) - i & 65535, m = l + ((t[r + 8] << 4 | t[r + 9] >> 4) & 63) * (1 << n) - i & 65535, h = d + ((t[r + 9] << 2 | t[r + 10] >> 6) & 63) * (1 << n) - i & 65535, g = f + (t[r + 10] & 63) * (1 << n) - i & 65535, _ = [
							e,
							c,
							p,
							p + (t[r + 11] >> 2 & 63) * (1 << n) - i & 65535,
							a,
							l,
							m,
							m + ((t[r + 11] << 4 | t[r + 12] >> 4) & 63) * (1 << n) - i & 65535,
							o,
							d,
							h,
							h + ((t[r + 12] << 2 | t[r + 13] >> 6) & 63) * (1 << n) - i & 65535,
							s,
							f,
							g,
							g + (t[r + 13] & 63) * (1 << n) - i & 65535
						];
						for (let e = 0; e < 16; e++) u[e] = _[e] & 32768 ? _[e] & 32767 : ~_[e] & 65535;
						r += 14;
					}
					if (f.pLinear) {
						if (g === null) {
							g = /* @__PURE__ */ new Uint16Array(65536);
							for (let e = 0; e < 65536; e++) if ((e & 31744) == 31744 || e > 32768) g[e] = 0;
							else {
								let t = n.fromHalfFloat(e);
								g[e] = t <= 0 ? 0 : n.toHalfFloat(8 * Math.log(t));
							}
						}
						for (let e = 0; e < 16; e++) u[e] = g[u[e]];
					}
					for (let t = 0; t < 4; t++) {
						let n = e * 4 + t;
						if (!(n >= h)) for (let e = 0; e < 4; e++) {
							let r = o * 4 + e;
							if (r >= m) continue;
							let c = u[t * 4 + e];
							for (let e = 0; e < f.ySampling; e++) {
								let t = n * f.ySampling + e;
								if (!(t >= a)) for (let e = 0; e < f.xSampling; e++) {
									let n = r * f.xSampling + e;
									if (n >= i) continue;
									let a = t * i * s + d * i + n * 2;
									l[a] = c & 255, l[a + 1] = c >> 8 & 255;
								}
							}
						}
					}
				}
				d += 2;
			}
			return new DataView(l.buffer);
		}
		function me(e) {
			let t = e.viewer, n = { value: e.offset.value }, r = new Uint8Array(e.columns * e.lines * (e.inputChannels.length * e.type * 2)), i = {
				version: X(t, n),
				unknownUncompressedSize: X(t, n),
				unknownCompressedSize: X(t, n),
				acCompressedSize: X(t, n),
				dcCompressedSize: X(t, n),
				rleCompressedSize: X(t, n),
				rleUncompressedSize: X(t, n),
				rleRawSize: X(t, n),
				totalAcUncompressedCount: X(t, n),
				totalDcUncompressedCount: X(t, n),
				acCompression: X(t, n)
			};
			if (i.version < 2) throw Error("THREE.EXRLoader: " + Q.compression + " version " + i.version + " is unsupported");
			let a = [], o = xe(t, n) - 2;
			for (; o > 0;) {
				let e = he(t.buffer, n), r = Y(t, n), i = r >> 2 & 3, s = (r >> 4) - 1, c = new Int8Array([s])[0], l = Y(t, n);
				a.push({
					name: e,
					index: c,
					type: l,
					compression: i
				}), o -= e.length + 3;
			}
			let s = Q.channels, c = Array(e.inputChannels.length);
			for (let t = 0; t < e.inputChannels.length; ++t) {
				let n = c[t] = {}, r = s[t];
				n.name = r.name, n.compression = 0, n.decoded = !1, n.type = r.pixelType, n.pLinear = r.pLinear, n.width = e.columns, n.height = e.lines;
			}
			let l = { idx: [
				,
				,
				,
			] };
			for (let t = 0; t < e.inputChannels.length; ++t) {
				let e = c[t], n = e.name.lastIndexOf("."), r = n >= 0 ? e.name.substring(n + 1) : e.name;
				for (let n = 0; n < a.length; ++n) {
					let i = a[n];
					r === i.name && e.type === i.type && (e.compression = i.compression, i.index >= 0 && (l.idx[i.index] = t), e.offset = t);
				}
			}
			let u, d, f;
			if (i.acCompressedSize > 0) switch (i.acCompression) {
				case 0:
					u = new Uint16Array(i.totalAcUncompressedCount), I(e.array, t, n, i.acCompressedSize, u, i.totalAcUncompressedCount);
					break;
				case 1:
					let r = F(e.array.slice(n.value, n.value + i.totalAcUncompressedCount));
					u = new Uint16Array(r.buffer), n.value += i.totalAcUncompressedCount;
			}
			if (i.dcCompressedSize > 0) {
				let t = {
					array: e.array,
					offset: n,
					size: i.dcCompressedSize
				};
				d = new Uint16Array(K(t).buffer), n.value += i.dcCompressedSize;
			}
			i.rleRawSize > 0 && (f = ae(F(e.array.slice(n.value, n.value + i.rleCompressedSize)).buffer), n.value += i.rleCompressedSize);
			let p = 0, m = Array(c.length);
			for (let e = 0; e < m.length; ++e) m[e] = [];
			for (let t = 0; t < e.lines; ++t) for (let t = 0; t < c.length; ++t) m[t].push(p), p += c[t].width * e.type * 2;
			l.idx[0] !== void 0 && c[l.idx[0]] && oe(l, m, c, u, d, r);
			for (let t = 0; t < c.length; ++t) {
				let n = c[t];
				if (!n.decoded) switch (n.compression) {
					case 2:
						let i = 0, a = 0;
						for (let o = 0; o < e.lines; ++o) {
							let e = m[t][i];
							for (let t = 0; t < n.width; ++t) {
								for (let t = 0; t < 2 * n.type; ++t) r[e++] = f[a + t * n.width * n.height];
								a++;
							}
							i++;
						}
						break;
					case 1:
						se(t, m, c, u, d, r);
						break;
					default: throw Error("THREE.EXRLoader: unsupported channel compression");
				}
			}
			return new DataView(r.buffer);
		}
		function he(e, t) {
			let n = new Uint8Array(e), r = 0;
			for (; n[t.value + r] != 0;) r += 1;
			let i = new TextDecoder().decode(n.slice(t.value, t.value + r));
			return t.value = t.value + r + 1, i;
		}
		function ge(e, t, n) {
			let r = new TextDecoder().decode(new Uint8Array(e).slice(t.value, t.value + n));
			return t.value += n, r;
		}
		function _e(e, t) {
			return [q(e, t), J(e, t)];
		}
		function ve(e, t) {
			return [J(e, t), J(e, t)];
		}
		function q(e, t) {
			let n = e.getInt32(t.value, !0);
			return t.value += 4, n;
		}
		function J(e, t) {
			let n = e.getUint32(t.value, !0);
			return t.value += 4, n;
		}
		function ye(e, t) {
			let n = e[t.value];
			return t.value += 1, n;
		}
		function Y(e, t) {
			let n = e.getUint8(t.value);
			return t.value += 1, n;
		}
		let X = function(e, t) {
			let n = Number(e.getBigInt64(t.value, !0));
			return t.value += 8, n;
		};
		function Z(e, t) {
			let n = e.getFloat32(t.value, !0);
			return t.value += 4, n;
		}
		function be(e, t) {
			return n.toHalfFloat(Z(e, t));
		}
		function xe(e, t) {
			let n = e.getUint16(t.value, !0);
			return t.value += 2, n;
		}
		function Se(e, t) {
			return n.fromHalfFloat(xe(e, t));
		}
		function Ce(e, t, n, r) {
			let i = n.value, a = [];
			for (; n.value < i + r - 1;) {
				let r = he(t, n), i = q(e, n), o = Y(e, n);
				n.value += 3;
				let s = q(e, n), c = q(e, n);
				a.push({
					name: r,
					pixelType: i,
					pLinear: o,
					xSampling: s,
					ySampling: c
				});
			}
			return n.value += 1, a;
		}
		function we(e, t) {
			return {
				redX: Z(e, t),
				redY: Z(e, t),
				greenX: Z(e, t),
				greenY: Z(e, t),
				blueX: Z(e, t),
				blueY: Z(e, t),
				whiteX: Z(e, t),
				whiteY: Z(e, t)
			};
		}
		function Te(e, t) {
			return [
				"NO_COMPRESSION",
				"RLE_COMPRESSION",
				"ZIPS_COMPRESSION",
				"ZIP_COMPRESSION",
				"PIZ_COMPRESSION",
				"PXR24_COMPRESSION",
				"B44_COMPRESSION",
				"B44A_COMPRESSION",
				"DWAA_COMPRESSION",
				"DWAB_COMPRESSION"
			][Y(e, t)];
		}
		function Ee(e, t) {
			return {
				xMin: q(e, t),
				yMin: q(e, t),
				xMax: q(e, t),
				yMax: q(e, t)
			};
		}
		function De(e, t) {
			return [
				"INCREASING_Y",
				"DECREASING_Y",
				"RANDOM_Y"
			][Y(e, t)];
		}
		function Oe(e, t) {
			return ["ENVMAP_LATLONG", "ENVMAP_CUBE"][Y(e, t)];
		}
		function ke(e, t) {
			let n = [
				"ONE_LEVEL",
				"MIPMAP_LEVELS",
				"RIPMAP_LEVELS"
			], r = ["ROUND_DOWN", "ROUND_UP"], i = J(e, t), a = J(e, t), o = Y(e, t);
			return {
				xSize: i,
				ySize: a,
				levelMode: n[o & 15],
				roundingMode: r[o >> 4]
			};
		}
		function Ae(e, t) {
			return [Z(e, t), Z(e, t)];
		}
		function je(e, t) {
			return [
				Z(e, t),
				Z(e, t),
				Z(e, t)
			];
		}
		function Me(e, t, n, r, i) {
			if (r === "string" || r === "stringvector" || r === "iccProfile") return ge(t, n, i);
			if (r === "chlist") return Ce(e, t, n, i);
			if (r === "chromaticities") return we(e, n);
			if (r === "compression") return Te(e, n);
			if (r === "box2i") return Ee(e, n);
			if (r === "envmap") return Oe(e, n);
			if (r === "tiledesc") return ke(e, n);
			if (r === "lineOrder") return De(e, n);
			if (r === "float") return Z(e, n);
			if (r === "v2f") return Ae(e, n);
			if (r === "v3f") return je(e, n);
			if (r === "int") return q(e, n);
			if (r === "rational") return _e(e, n);
			if (r === "timecode") return ve(e, n);
			if (r === "preview" || r === "deepImageState" || r === "idmanifest") return n.value += i, "skipped";
			n.value += i;
		}
		function Ne(e, t) {
			let n = Math.log2(e);
			return t == "ROUND_DOWN" ? Math.floor(n) : Math.ceil(n);
		}
		function Pe(e, t, n) {
			let r = 0;
			switch (e.levelMode) {
				case "ONE_LEVEL":
					r = 1;
					break;
				case "MIPMAP_LEVELS":
					r = Ne(Math.max(t, n), e.roundingMode) + 1;
					break;
				case "RIPMAP_LEVELS": throw Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.");
			}
			return r;
		}
		function Fe(e, t, n, r) {
			let i = Array(e);
			for (let a = 0; a < e; a++) {
				let e = 1 << a, o = t / e | 0;
				r == "ROUND_UP" && o * e < t && (o += 1), i[a] = (Math.max(o, 1) + n - 1) / n | 0;
			}
			return i;
		}
		function Ie() {
			let e = this, t = e.offset, n = { value: 0 };
			for (let r = 0; r < e.tileCount; r++) {
				let r = q(e.viewer, t), i = q(e.viewer, t);
				t.value += 8, e.size = J(e.viewer, t);
				let a = r * e.blockWidth, o = i * e.blockHeight;
				e.columns = a + e.blockWidth > e.width ? e.width - a : e.blockWidth, e.lines = o + e.blockHeight > e.height ? e.height - o : e.blockHeight;
				let s = e.columns * e.totalBytes, c = e.size < e.lines * s ? e.uncompress(e) : W(e);
				t.value += e.size;
				for (let t = 0; t < e.lines; t++) {
					let r = t * e.columns * e.totalBytes;
					for (let i = 0; i < e.inputChannels.length; i++) {
						let s = Q.channels[i].name, l = e.channelByteOffsets[s] * e.columns, u = e.decodeChannels[s];
						if (u === void 0) continue;
						n.value = r + l;
						let d = (e.height - (1 + o + t)) * e.outLineWidth;
						for (let t = 0; t < e.columns; t++) {
							let r = d + (t + a) * e.outputChannels + u;
							e.byteArray[r] = e.getter(c, n);
						}
					}
				}
			}
		}
		function Le() {
			let e = this, t = e.offset, n = { value: 0 };
			for (let r = 0; r < e.height / e.blockHeight; r++) {
				let r = q(e.viewer, t) - Q.dataWindow.yMin;
				e.size = J(e.viewer, t), e.lines = r + e.blockHeight > e.height ? e.height - r : e.blockHeight;
				let i = e.columns * e.totalBytes, a = e.size < e.lines * i ? e.uncompress(e) : W(e);
				t.value += e.size;
				for (let t = 0; t < e.lines; t++) {
					let o = r + t, s = t * i, c = (e.height - 1 - o) * e.outLineWidth;
					for (let t = 0; t < e.inputChannels.length; t++) {
						let r = Q.channels[t].name, i = e.channelByteOffsets[r] * e.columns, o = e.decodeChannels[r];
						if (o !== void 0) {
							n.value = s + i;
							for (let t = 0; t < e.columns; t++) {
								let r = c + t * e.outputChannels + o;
								e.byteArray[r] = e.getter(a, n);
							}
						}
					}
				}
			}
		}
		function Re() {
			let e = this, t = e.chunkOffsets, n = { value: 0 };
			for (let r = 0; r < t.length; r++) {
				let i = { value: t[r] };
				i.value += 4;
				let a = q(e.viewer, i) - Q.dataWindow.yMin;
				e.size = J(e.viewer, i), e.lines = a + e.blockHeight > e.height ? e.height - a : e.blockHeight;
				let o = e.columns * e.totalBytes, s = e.size < e.lines * o, c = e.offset;
				e.offset = i;
				let l = s ? e.uncompress(e) : W(e);
				e.offset = c;
				for (let t = 0; t < e.lines; t++) {
					let r = a + t, i = t * o, s = (e.height - 1 - r) * e.outLineWidth;
					for (let t = 0; t < e.inputChannels.length; t++) {
						let r = Q.channels[t].name, a = e.channelByteOffsets[r] * e.columns, o = e.decodeChannels[r];
						if (o !== void 0) {
							n.value = i + a;
							for (let t = 0; t < e.columns; t++) {
								let r = s + t * e.outputChannels + o;
								e.byteArray[r] = e.getter(l, n);
							}
						}
					}
				}
			}
		}
		function ze(e, t, n, r) {
			if (n === 0) return null;
			let i = e.slice(t, t + n);
			switch (r) {
				case "NO_COMPRESSION": return new DataView(i.buffer, i.byteOffset, i.byteLength);
				case "RLE_COMPRESSION": {
					let e = new Uint8Array(ae(i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength))), t = new Uint8Array(e.length);
					return L(e), R(e, t), new DataView(t.buffer);
				}
				case "ZIPS_COMPRESSION": {
					let e = F(i), t = new Uint8Array(e.length);
					return L(e), R(e, t), new DataView(t.buffer);
				}
				default: throw Error("THREE.EXRLoader: " + r + " is unsupported for deep data");
			}
		}
		function Be() {
			let e = this, t = e.chunkOffsets, r = e.width, i = e.height, a = e.deepChannels, o = Q.compression, s = e.multiPart, c = e.decodeChannels, l = e.outputChannels, u = e.byteArray instanceof Uint16Array, d = -1;
			for (let e = 0; e < a.length; e++) if (a[e].name === "A") {
				d = e;
				break;
			}
			for (let f = 0; f < t.length; f++) {
				let p = { value: t[f] };
				s && (p.value += 4);
				let m = q(e.viewer, p) - Q.dataWindow.yMin, h = X(e.viewer, p), g = X(e.viewer, p);
				X(e.viewer, p);
				let _ = ze(e.array, p.value, h, o);
				if (p.value += h, _ === null) continue;
				let v = new Uint32Array(r);
				for (let e = 0; e < r; e++) v[e] = _.getUint32(e * 4, !0);
				let y = v[r - 1];
				if (y === 0) {
					p.value += g;
					continue;
				}
				let b = ze(e.array, p.value, g, o), x = [], S = 0;
				for (let e = 0; e < a.length; e++) x.push(S), S += y * a[e].bytesPerSample;
				let C = (i - 1 - m) * e.outLineWidth;
				for (let t = 0; t < r; t++) {
					let r = t === 0 ? 0 : v[t - 1], i = v[t] - r;
					if (i === 0) continue;
					let o = new Float32Array(l), s = 0;
					for (let e = 0; e < i; e++) {
						let t = r + e, i = 1 - s;
						if (i <= 0) break;
						let l = 1;
						if (d >= 0) {
							let e = a[d].bytesPerSample, r = x[d] + t * e;
							l = e === 2 ? n.fromHalfFloat(b.getUint16(r, !0)) : b.getFloat32(r, !0);
						}
						for (let e = 0; e < a.length; e++) {
							let r = a[e], s = c[r.name];
							if (s === void 0) continue;
							let l = r.bytesPerSample, u = x[e] + t * l, d = l === 2 ? n.fromHalfFloat(b.getUint16(u, !0)) : b.getFloat32(u, !0);
							o[s] += d * i;
						}
						s += l * i;
					}
					c.A !== void 0 && (o[c.A] = s);
					let f = C + t * l;
					for (let t = 0; t < l; t++) e.byteArray[f + t] = u ? n.toHalfFloat(o[t]) : o[t];
				}
			}
		}
		function Ve(e, t, n) {
			let r = {}, i = !1;
			for (;;) {
				let a = he(t, n);
				if (a === "") break;
				i = !0;
				let o = he(t, n), s = Me(e, t, n, o, J(e, n));
				s === void 0 ? console.warn(`THREE.EXRLoader: Skipped unknown header attribute type \'${o}\'.`) : r[a] = s;
			}
			return i ? r : null;
		}
		function He(e, t, n) {
			if (e.getUint32(0, !0) != 20000630) throw Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");
			let r = e.getUint8(4), i = e.getUint8(5), a = {
				singleTile: !!(i & 2),
				longName: !!(i & 4),
				deepFormat: !!(i & 8),
				multiPart: !!(i & 16)
			};
			n.value = 8;
			let o = [];
			if (a.multiPart) {
				for (;;) {
					let i = Ve(e, t, n);
					if (i === null) break;
					i.version = r, i.spec = a, o.push(i);
				}
				if (o.length === 0) throw Error("THREE.EXRLoader: No valid part headers found.");
			} else {
				let i = Ve(e, t, n);
				i.version = r, i.spec = a, o.push(i);
			}
			return o;
		}
		function Ue(n, a, s, l, u, d) {
			let f = {
				size: 0,
				viewer: a,
				array: s,
				offset: l,
				width: n.dataWindow.xMax - n.dataWindow.xMin + 1,
				height: n.dataWindow.yMax - n.dataWindow.yMin + 1,
				inputChannels: n.channels,
				channelByteOffsets: {},
				shouldExpand: !1,
				yCbCr: !1,
				totalBytes: null,
				columns: null,
				lines: null,
				type: null,
				uncompress: null,
				getter: null,
				format: null,
				colorSpace: i
			};
			switch (n.compression) {
				case "NO_COMPRESSION":
					f.blockHeight = 1, f.uncompress = W;
					break;
				case "RLE_COMPRESSION":
					f.blockHeight = 1, f.uncompress = G;
					break;
				case "ZIPS_COMPRESSION":
					f.blockHeight = 1, f.uncompress = K;
					break;
				case "ZIP_COMPRESSION":
					f.blockHeight = 16, f.uncompress = K;
					break;
				case "PIZ_COMPRESSION":
					f.blockHeight = 32, f.uncompress = de;
					break;
				case "PXR24_COMPRESSION":
					f.blockHeight = 16, f.uncompress = fe;
					break;
				case "B44_COMPRESSION":
				case "B44A_COMPRESSION":
					f.blockHeight = 32, f.uncompress = pe;
					break;
				case "DWAA_COMPRESSION":
					f.blockHeight = 32, f.uncompress = me;
					break;
				case "DWAB_COMPRESSION":
					f.blockHeight = 256, f.uncompress = me;
					break;
				default: throw Error("THREE.EXRLoader: " + n.compression + " is unsupported");
			}
			let p = {};
			for (let e of n.channels) switch (e.name) {
				case "BY":
				case "RY":
				case "Y":
				case "R":
				case "G":
				case "B":
				case "A": p[e.name] = !0, f.type = e.pixelType;
			}
			let m = !1, h = !1;
			if (p.Y && p.RY && p.BY) f.outputChannels = 4, f.yCbCr = !0;
			else if (p.R && p.G && p.B) f.outputChannels = 4;
			else if (p.Y) f.outputChannels = 1;
			else throw Error("THREE.EXRLoader: file contains unsupported data channels.");
			switch (f.outputChannels) {
				case 4:
					d == 1023 ? (m = !p.A, f.format = r, f.colorSpace = i, f.outputChannels = 4, f.decodeChannels = {
						R: 0,
						G: 1,
						B: 2,
						A: 3
					}) : d == 1030 ? (f.format = o, f.colorSpace = i, f.outputChannels = 2, f.decodeChannels = {
						R: 0,
						G: 1
					}) : d == 1028 ? (f.format = t, f.colorSpace = i, f.outputChannels = 1, f.decodeChannels = { R: 0 }) : h = !0;
					break;
				case 1:
					d == 1023 ? (m = !0, f.format = r, f.colorSpace = i, f.outputChannels = 4, f.shouldExpand = !0, f.decodeChannels = { Y: 0 }) : d == 1030 ? (f.format = o, f.colorSpace = i, f.outputChannels = 2, f.shouldExpand = !0, f.decodeChannels = { Y: 0 }) : d == 1028 ? (f.format = t, f.colorSpace = i, f.outputChannels = 1, f.decodeChannels = { Y: 0 }) : h = !0;
					break;
				default: h = !0;
			}
			if (h) throw Error("THREE.EXRLoader: invalid output format for specified file.");
			if (f.yCbCr && (f.format = r, f.outputChannels = 4, f.decodeChannels = {
				Y: 0,
				RY: 1,
				BY: 2
			}, m = !0), f.type == 1) switch (u) {
				case e:
					f.getter = Se;
					break;
				case c: f.getter = xe;
			}
			else if (f.type == 2) switch (u) {
				case e:
					f.getter = Z;
					break;
				case c: f.getter = be;
			}
			else throw Error("THREE.EXRLoader: unsupported pixelType " + f.type + " for " + n.compression + ".");
			f.columns = f.width;
			let g = f.width * f.height * f.outputChannels;
			switch (u) {
				case e:
					f.byteArray = new Float32Array(g), m && f.byteArray.fill(1, 0, g);
					break;
				case c:
					f.byteArray = new Uint16Array(g), m && f.byteArray.fill(15360, 0, g);
					break;
				default: console.error("THREE.EXRLoader: unsupported type: ", u);
			}
			let _ = 0;
			for (let e of n.channels) f.decodeChannels[e.name] !== void 0 && (f.channelByteOffsets[e.name] = _), _ += e.pixelType * 2;
			if (f.totalBytes = _, f.outLineWidth = f.width * f.outputChannels, n.spec.deepFormat) {
				f.deepChannels = [];
				let e = 0;
				for (let t of n.channels) {
					let n = t.pixelType === 0 ? 4 : t.pixelType * 2;
					f.deepChannels.push({
						name: t.name,
						pixelType: t.pixelType,
						bytesPerSample: n
					}), e += n;
				}
				f.deepBytesPerSample = e, f.chunkOffsets = n._chunkOffsets, f.multiPart = n.spec.multiPart, f.decode = Be.bind(f);
			} else if (n.spec.singleTile) {
				f.blockHeight = n.tiles.ySize, f.blockWidth = n.tiles.xSize;
				let e = Pe(n.tiles, f.width, f.height), t = Fe(e, f.width, n.tiles.xSize, n.tiles.roundingMode), r = Fe(e, f.height, n.tiles.ySize, n.tiles.roundingMode);
				f.tileCount = t[0] * r[0];
				for (let n = 0; n < e; n++) for (let e = 0; e < r[n]; e++) for (let e = 0; e < t[n]; e++) X(a, l);
				f.decode = Ie.bind(f);
			} else if (n.spec.multiPart) f.blockWidth = f.width, f.chunkOffsets = n._chunkOffsets, f.decode = Re.bind(f);
			else {
				f.blockWidth = f.width;
				let e = Math.ceil(f.height / f.blockHeight);
				for (let t = 0; t < e; t++) X(a, l);
				f.decode = Le.bind(f);
			}
			return f;
		}
		let We = { value: 0 }, Ge = new DataView(s), Ke = new Uint8Array(s), qe = He(Ge, s, We), Je = Math.max(0, Math.min(this.part, qe.length - 1)), Q = qe[Je];
		if (Q.spec.multiPart || Q.spec.deepFormat) for (let e = 0; e < qe.length; e++) {
			let t = qe[e].chunkCount;
			if (e === Je) {
				Q._chunkOffsets = [];
				for (let e = 0; e < t; e++) Q._chunkOffsets.push(X(Ge, We));
			} else for (let e = 0; e < t; e++) X(Ge, We);
		}
		let $ = Ue(Q, Ge, Ke, We, this.type, this.outputFormat);
		if ($.decode(), $.shouldExpand) {
			let e = $.byteArray;
			if (this.outputFormat == 1023) for (let t = 0; t < e.length; t += 4) e[t + 2] = e[t + 1] = e[t];
			else if (this.outputFormat == 1030) for (let t = 0; t < e.length; t += 2) e[t + 1] = e[t];
		}
		if ($.yCbCr) {
			let e = $.byteArray, t = $.width * $.height;
			if (this.type === 1016) for (let r = 0; r < t; r++) {
				let t = r * 4, i = n.fromHalfFloat(e[t]), a = n.fromHalfFloat(e[t + 1]), o = n.fromHalfFloat(e[t + 2]), s = (1 + a) * i, c = (1 + o) * i, l = (i - s * .2126 - c * .0722) / .7152;
				e[t] = n.toHalfFloat(Math.max(0, s)), e[t + 1] = n.toHalfFloat(Math.max(0, l)), e[t + 2] = n.toHalfFloat(Math.max(0, c));
			}
			else for (let n = 0; n < t; n++) {
				let t = n * 4, r = e[t], i = e[t + 1], a = e[t + 2], o = (1 + i) * r, s = (1 + a) * r;
				e[t] = Math.max(0, o), e[t + 1] = Math.max(0, (r - o * .2126 - s * .0722) / .7152), e[t + 2] = Math.max(0, s);
			}
		}
		return {
			header: Q,
			width: $.width,
			height: $.height,
			data: $.byteArray,
			format: $.format,
			colorSpace: $.colorSpace,
			type: this.type,
			minFilter: a,
			magFilter: a,
			generateMipmaps: !1,
			flipY: !1
		};
	}
	setDataType(e) {
		return this.type = e, this;
	}
	setOutputFormat(e) {
		return this.outputFormat = e, this;
	}
	setPart(e) {
		return this.part = e, this;
	}
};
export { ie as EXRLoader };
