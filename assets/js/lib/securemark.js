/*! securemark v0.40.0 https://github.com/falsandtru/securemark | (c) 2018, falsandtru | (Apache-2.0 AND MPL-2.0) License */
require = function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == 'function' && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error('Cannot find module \'' + o + '\'');
                throw f.code = 'MODULE_NOT_FOUND', f;
            }
            var l = n[o] = { exports: {} };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++)
        s(r[o]);
    return s;
}({
    1: [
        function (require, module, exports) {
        },
        {}
    ],
    2: [
        function (require, module, exports) {
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    3: [
        function (require, module, exports) {
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    4: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const type_1 = require('./type');
            exports.assign = template((key, target, source) => target[key] = source[key]);
            exports.clone = template((key, target, source) => {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.clone([], source[key]);
                case 'Object':
                    return target[key] = source[key] instanceof Object ? exports.clone({}, source[key]) : source[key];
                default:
                    return target[key] = source[key];
                }
            });
            exports.extend = template((key, target, source) => {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.extend([], source[key]);
                case 'Object':
                    switch (type_1.type(target[key])) {
                    case 'Object':
                        return target[key] = source[key] instanceof Object ? exports.extend(target[key], source[key]) : source[key];
                    default:
                        return target[key] = source[key] instanceof Object ? exports.extend({}, source[key]) : source[key];
                    }
                default:
                    return target[key] = source[key];
                }
            });
            function template(strategy) {
                return walk;
                function walk(target, ...sources) {
                    if (target === undefined || target === null) {
                        throw new TypeError(`Spica: assign: Cannot walk on ${ target }.`);
                    }
                    for (const source of sources) {
                        if (source === undefined || source === null) {
                            continue;
                        }
                        for (const key of Object.keys(Object(source))) {
                            const desc = Object.getOwnPropertyDescriptor(Object(source), key);
                            if (desc !== undefined && desc.enumerable) {
                                void strategy(key, Object(target), Object(source));
                            }
                        }
                    }
                    return Object(target);
                }
            }
        },
        { './type': 7 }
    ],
    5: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const assign_1 = require('./assign');
            const equal_1 = require('./equal');
            class Cache {
                constructor(size, callback = () => undefined, opts = {}) {
                    this.size = size;
                    this.callback = callback;
                    this.opts = {
                        ignore: {
                            delete: false,
                            clear: false
                        }
                    };
                    if (size > 0 === false)
                        throw new Error(`Spica: Cache: Cache size must be greater than 0.`);
                    void Object.freeze(assign_1.extend(this.opts, opts));
                    const {stats, entries} = opts.data || {
                        stats: [
                            [],
                            []
                        ],
                        entries: []
                    };
                    const LFU = stats[1].slice(0, size);
                    const LRU = stats[0].slice(0, size - LFU.length);
                    this.stats = {
                        LRU,
                        LFU
                    };
                    this.store = new Map(entries);
                    void [
                        ...stats[1],
                        ...stats[0]
                    ].slice(LFU.length + LRU.length).forEach(k => void this.store.delete(k));
                    if (this.store.size !== LFU.length + LRU.length)
                        throw new Error(`Spica: Cache: Size of stats and entries is not matched.`);
                    if (![
                            ...LFU,
                            ...LRU
                        ].every(k => this.store.has(k)))
                        throw new Error(`Spica: Cache: Keys of stats and entries is not matched.`);
                }
                put(key, value, log = true) {
                    if (!log && this.store.has(key))
                        return void this.store.set(key, value), true;
                    if (this.access(key))
                        return void this.store.set(key, value), true;
                    const {LRU, LFU} = this.stats;
                    if (LRU.length + LFU.length === this.size && LRU.length < LFU.length) {
                        const key = LFU.pop();
                        const val = this.store.get(key);
                        void this.store.delete(key);
                        void this.callback(key, val);
                    }
                    void LRU.unshift(key);
                    void this.store.set(key, value);
                    if (LRU.length + LFU.length > this.size) {
                        const key = LRU.pop();
                        const val = this.store.get(key);
                        void this.store.delete(key);
                        void this.callback(key, val);
                    }
                    return false;
                }
                set(key, value, log) {
                    void this.put(key, value, log);
                    return value;
                }
                get(key, log = true) {
                    if (!log)
                        return this.store.get(key);
                    void this.access(key);
                    return this.store.get(key);
                }
                has(key) {
                    return this.store.has(key);
                }
                delete(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LRU, LFU} = this.stats;
                    for (const stat of [
                            LFU,
                            LRU
                        ]) {
                        const index = equal_1.findIndex(key, stat);
                        if (index === -1)
                            continue;
                        const val = this.store.get(key);
                        void this.store.delete(stat.splice(index, 1)[0]);
                        if (this.opts.ignore.delete)
                            return true;
                        void this.callback(key, val);
                        return true;
                    }
                    return false;
                }
                clear() {
                    const store = this.store;
                    this.store = new Map();
                    this.stats = {
                        LRU: [],
                        LFU: []
                    };
                    if (this.opts.ignore.clear)
                        return;
                    return void [...store].forEach(([key, val]) => void this.callback(key, val));
                }
                [Symbol.iterator]() {
                    return this.store[Symbol.iterator]();
                }
                export() {
                    return {
                        stats: [
                            this.stats.LRU.slice(),
                            this.stats.LFU.slice()
                        ],
                        entries: [...this]
                    };
                }
                inspect() {
                    const {LRU, LFU} = this.stats;
                    return [
                        LRU.slice(),
                        LFU.slice()
                    ];
                }
                access(key) {
                    return this.accessLFU(key) || this.accessLRU(key);
                }
                accessLRU(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LRU} = this.stats;
                    const index = equal_1.findIndex(key, LRU);
                    if (index === -1)
                        return false;
                    const {LFU} = this.stats;
                    void LFU.unshift(...LRU.splice(index, 1));
                    return true;
                }
                accessLFU(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LFU} = this.stats;
                    const index = equal_1.findIndex(key, LFU);
                    if (index === -1)
                        return false;
                    void LFU.unshift(...LFU.splice(index, 1));
                    return true;
                }
            }
            exports.Cache = Cache;
        },
        {
            './assign': 4,
            './equal': 6
        }
    ],
    6: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function findIndex(a1, as) {
                const isNaN = a1 !== a1;
                for (let i = 0; i < as.length; ++i) {
                    const a2 = as[i];
                    if (isNaN ? a2 !== a2 : a2 === a1)
                        return i;
                }
                return -1;
            }
            exports.findIndex = findIndex;
        },
        {}
    ],
    7: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function type(target) {
                const type = Object.prototype.toString.call(target).split(' ').pop().slice(0, -1);
                if (typeof target !== 'object' && target instanceof Object === false || target === null)
                    return type.toLowerCase();
                return type;
            }
            exports.type = type;
        },
        {}
    ],
    8: [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            __export(require('./src/export'));
            var export_1 = require('./src/export');
            exports.default = export_1.default;
        },
        { './src/export': 11 }
    ],
    9: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var ElChildrenType;
            (function (ElChildrenType) {
                ElChildrenType.Void = 'void';
                ElChildrenType.Text = 'text';
                ElChildrenType.Collection = 'collection';
                ElChildrenType.Record = 'record';
            }(ElChildrenType || (ElChildrenType = {})));
            const memory = new WeakSet();
            class El {
                constructor(element_, children_) {
                    this.element_ = element_;
                    this.children_ = children_;
                    this.type = this.children_ === undefined ? ElChildrenType.Void : typeof this.children_ === 'string' ? ElChildrenType.Text : Array.isArray(this.children_) ? ElChildrenType.Collection : ElChildrenType.Record;
                    this.tag;
                    void throwErrorIfNotUsable(this);
                    void memory.add(element_);
                    switch (this.type) {
                    case ElChildrenType.Void:
                        return;
                    case ElChildrenType.Text:
                        void clear();
                        this.children_ = element_.appendChild(document.createTextNode(''));
                        this.children = children_;
                        return;
                    case ElChildrenType.Collection:
                        void clear();
                        this.children_ = [];
                        this.children = children_;
                        void scope(element_.id, this.children_);
                        return;
                    case ElChildrenType.Record:
                        void clear();
                        this.children_ = observe(element_, Object.assign({}, children_));
                        void scope(element_.id, this.children_);
                        return;
                    }
                    function clear() {
                        while (element_.childNodes.length > 0) {
                            void element_.removeChild(element_.firstChild);
                        }
                    }
                    function scope(id, children) {
                        if (!id.match(/^[\w\-]+$/))
                            return;
                        return void Object.values(children).map(({element}) => element).forEach(element => element instanceof HTMLStyleElement && void parse(element, id));
                        function parse(style, id) {
                            style.innerHTML = style.innerHTML.replace(/^\s*\$scope(?!\w)/gm, `#${ id }`);
                            void [...style.querySelectorAll('*')].forEach(el => void el.remove());
                        }
                    }
                    function observe(element, children) {
                        return Object.defineProperties(children, Object.entries(children).reduce((descs, [name, child]) => {
                            void throwErrorIfNotUsable(child);
                            void element.appendChild(child.element);
                            descs[name] = {
                                configurable: true,
                                enumerable: true,
                                get: () => {
                                    return child;
                                },
                                set: newChild => {
                                    const oldChild = child;
                                    if (newChild === oldChild)
                                        return;
                                    newChild.element_.parentElement === element || void throwErrorIfNotUsable(newChild);
                                    child = newChild;
                                    void element.replaceChild(newChild.element, oldChild.element);
                                }
                            };
                            return descs;
                        }, {}));
                    }
                }
                get element() {
                    return this.element_;
                }
                get children() {
                    switch (this.type) {
                    case ElChildrenType.Text:
                        return this.children_.data;
                    default:
                        return this.children_;
                    }
                }
                set children(children) {
                    switch (this.type) {
                    case ElChildrenType.Void:
                        return;
                    case ElChildrenType.Text:
                        this.children_.data = children;
                        return;
                    case ElChildrenType.Collection:
                        void this.children_.reduce((cs, c) => {
                            const i = cs.indexOf(c);
                            if (i > -1)
                                return cs;
                            void cs.splice(i, 1);
                            void c.element.remove();
                            return cs;
                        }, [...children]);
                        this.children_ = [];
                        void children.forEach((child, i) => {
                            child.element_.parentElement === this.element_ || void throwErrorIfNotUsable(child);
                            this.children_[i] = child;
                            void this.element_.appendChild(child.element);
                        });
                        void Object.freeze(this.children_);
                        return;
                    case ElChildrenType.Record:
                        void Object.keys(this.children_).forEach(k => this.children_[k] = children[k]);
                        return;
                    }
                }
            }
            exports.El = El;
            function throwErrorIfNotUsable({element}) {
                if (element.parentElement === null || !memory.has(element.parentElement))
                    return;
                throw new Error(`TypedDOM: Cannot add an element used in another typed dom.`);
            }
        },
        {}
    ],
    10: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const builder_1 = require('./builder');
            var NS;
            (function (NS) {
                NS.HTML = 'html';
                NS.SVG = 'svg';
            }(NS || (NS = {})));
            exports.TypedHTML = new Proxy({}, handle(NS.HTML));
            exports.TypedSVG = new Proxy({}, handle(NS.SVG));
            function handle(ns) {
                return { get: (obj, prop) => obj[prop] || typeof prop !== 'string' ? obj[prop] : obj[prop] = builder(ns, prop) };
                function builder(ns, tag) {
                    return function build(attrs, children, factory) {
                        if (typeof attrs === 'function')
                            return build(undefined, undefined, attrs);
                        if (typeof children === 'function')
                            return build(attrs, undefined, children);
                        if (attrs !== undefined && isChildren(attrs))
                            return build(undefined, attrs, factory);
                        return new builder_1.El(elem(tag, factory, attrs), children);
                        function isChildren(children) {
                            return typeof children !== 'object' || Object.values(children).slice(-1).every(val => typeof val === 'object');
                        }
                        function elem(tag, factory, attrs) {
                            factory = factory || factory_;
                            const el = factory();
                            if (tag !== el.tagName.toLowerCase())
                                throw new Error(`TypedDOM: Tag name must be "${ tag }", but got "${ el.tagName.toLowerCase() }".`);
                            if (!attrs)
                                return el;
                            void Object.entries(attrs).forEach(([name, value]) => typeof value === 'string' ? void el.setAttribute(name, value) : void el.addEventListener(name.slice(2), value, {
                                passive: [
                                    'wheel',
                                    'mousewheel',
                                    'touchstart',
                                    'touchmove'
                                ].includes(name.slice(2))
                            }));
                            return el;
                            function factory_() {
                                switch (ns) {
                                case NS.HTML:
                                    return document.createElement(tag);
                                case NS.SVG:
                                    return document.createElementNS('http://www.w3.org/2000/svg', tag);
                                default:
                                    throw new Error(`TypedDOM: Namespace must be "${ NS.HTML }" or "${ NS.SVG }", but got "${ ns }".`);
                                }
                            }
                        }
                    };
                }
            }
        },
        { './builder': 9 }
    ],
    11: [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            var html_1 = require('./dom/html');
            exports.default = html_1.TypedHTML;
            exports.TypedHTML = html_1.TypedHTML;
            exports.TypedSVG = html_1.TypedSVG;
            __export(require('./util/dom'));
        },
        {
            './dom/html': 10,
            './util/dom': 12
        }
    ],
    12: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const noop_1 = require('./noop');
            exports.currentTargets = new WeakMap();
            function listen(target, a, b, c = false, d = {}) {
                return typeof b === 'string' ? delegate(target, a, b, c, d) : bind(target, a, b, c);
            }
            exports.listen = listen;
            function once(target, a, b, c = false, d = {}) {
                return typeof b === 'string' ? delegate(target, a, b, c, Object.assign({}, typeof d === 'boolean' ? { capture: d } : d, { once: true })) : bind(target, a, b, Object.assign({}, typeof c === 'boolean' ? { capture: c } : c, { once: true }));
            }
            exports.once = once;
            function bind(target, type, listener, option = false) {
                void target.addEventListener(type, handler, adjustEventListenerOptions(option));
                let unbind = () => (unbind = noop_1.noop, void target.removeEventListener(type, handler, adjustEventListenerOptions(option)));
                return () => void unbind();
                function handler(ev) {
                    if (typeof option === 'object') {
                        if (option.passive) {
                            ev.preventDefault = noop_1.noop;
                        }
                        if (option.once) {
                            void unbind();
                        }
                    }
                    void exports.currentTargets.set(ev, ev.currentTarget);
                    void listener(ev);
                }
                function adjustEventListenerOptions(option) {
                    return supportEventListenerOptions ? option : typeof option === 'boolean' ? option : !!option.capture;
                }
            }
            exports.bind = bind;
            function delegate(target, selector, type, listener, option = {}) {
                return bind(target instanceof Document ? target.documentElement : target, type, ev => {
                    const cx = ev.target.closest(selector);
                    if (!cx)
                        return;
                    void [...target.querySelectorAll(selector)].filter(el => el === cx).forEach(el => void once(el, type, ev => {
                        void listener(ev);
                    }, option));
                }, Object.assign({}, option, { capture: true }));
            }
            exports.delegate = delegate;
            let supportEventListenerOptions = false;
            try {
                document.createElement('div').addEventListener('test', function () {
                }, {
                    get capture() {
                        return supportEventListenerOptions = true;
                    }
                });
            } catch (e) {
            }
        },
        { './noop': 13 }
    ],
    13: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function noop() {
                return;
            }
            exports.noop = noop;
        },
        {}
    ],
    14: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var combine_1 = require('./combinator/combine');
            exports.combine = combine_1.combine;
            var subsequence_1 = require('./combinator/subsequence');
            exports.subsequence = subsequence_1.subsequence;
            var loop_1 = require('./combinator/loop');
            exports.loop = loop_1.loop;
            var bracket_1 = require('./combinator/bracket');
            exports.bracket = bracket_1.bracket;
            var transform_1 = require('./combinator/transform');
            exports.transform = transform_1.transform;
        },
        {
            './combinator/bracket': 15,
            './combinator/combine': 16,
            './combinator/loop': 17,
            './combinator/subsequence': 18,
            './combinator/transform': 19
        }
    ],
    15: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function bracket(start, parser, end) {
                return lmr_ => {
                    const l = match(lmr_, start);
                    if (l === undefined)
                        return;
                    const mr_ = lmr_.slice(l.length);
                    const [rs = [], r_ = mr_] = parser(mr_) || [];
                    const r = match(r_, end);
                    if (r === undefined)
                        return;
                    return l + r !== '' && r_.length - r.length < lmr_.length ? [
                        rs,
                        r_.slice(r.length)
                    ] : undefined;
                };
                function match(source, pattern) {
                    if (typeof pattern !== 'string') {
                        const result = source.slice(0, 9).match(pattern);
                        return result ? match(source, result[0]) : undefined;
                    }
                    return source.startsWith(pattern) ? pattern : undefined;
                }
            }
            exports.bracket = bracket;
        },
        {}
    ],
    16: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function combine(parsers) {
                return source => {
                    let rest = source;
                    const results = [];
                    for (const parse of parsers) {
                        if (rest === '')
                            break;
                        const r = parse(rest);
                        if (!r)
                            continue;
                        if (r[1].length >= rest.length)
                            return;
                        void results.push(...r[0]);
                        rest = r[1];
                        break;
                    }
                    return rest.length < source.length ? [
                        results,
                        rest
                    ] : undefined;
                };
            }
            exports.combine = combine;
        },
        {}
    ],
    17: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function loop(parser, until) {
                return source => {
                    let rest = source;
                    const results = [];
                    while (true) {
                        if (rest === '')
                            break;
                        if (until && rest.slice(0, 9).search(until) === 0)
                            break;
                        const result = parser(rest);
                        if (!result)
                            break;
                        const [rs, r] = result;
                        void results.push(...rs);
                        rest = r;
                    }
                    return rest.length === source.length ? undefined : [
                        results,
                        rest
                    ];
                };
            }
            exports.loop = loop;
        },
        {}
    ],
    18: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function subsequence(parsers) {
                return source => {
                    let rest = source;
                    const results = [];
                    for (const parse of parsers) {
                        if (rest === '')
                            break;
                        const r = parse(rest);
                        if (!r)
                            continue;
                        if (r[1].length >= rest.length)
                            return;
                        void results.push(...r[0]);
                        rest = r[1];
                    }
                    return rest.length < source.length ? [
                        results,
                        rest
                    ] : undefined;
                };
            }
            exports.subsequence = subsequence;
        },
        {}
    ],
    19: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function transform(parser, f) {
                return source => {
                    const [rs = [], rest = undefined] = parser(source) || [];
                    if (rest === undefined)
                        return;
                    if (rest.length >= source.length)
                        return;
                    const result = f(rs, rest);
                    return result && result[1].length <= rest.length ? result : undefined;
                };
            }
            exports.transform = transform;
        },
        {}
    ],
    20: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var parse_1 = require('./parser/parse');
            exports.parse = parse_1.parse;
            var escape_1 = require('./parser/escape');
            exports.escape = escape_1.escape;
            var bind_1 = require('./parser/bind');
            exports.bind = bind_1.bind;
            var cache_1 = require('./parser/cache');
            exports.caches = cache_1.caches;
        },
        {
            './parser/bind': 21,
            './parser/cache': 41,
            './parser/escape': 42,
            './parser/parse': 64
        }
    ],
    21: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const segment_1 = require('./segment');
            const parse_1 = require('./parse');
            function bind(target) {
                const pairs = [];
                let revision = [];
                return function* (source) {
                    const rev = revision = [];
                    const cs = pairs.map(([s]) => s);
                    if (source === cs.join(''))
                        return;
                    const ns = segment_1.segment(source);
                    let i = 0;
                    for (; i < cs.length; ++i) {
                        if (cs[i] !== ns[i])
                            break;
                    }
                    let j = 0;
                    for (; i + j < cs.length && i + j < ns.length; ++j) {
                        if (cs[cs.length - j - 1] !== ns[ns.length - j - 1])
                            break;
                    }
                    void pairs.splice(i, pairs.length - j - i).forEach(([, es]) => void es.forEach(el => void el.remove()));
                    const [, [ref = null] = []] = pairs.slice(i).find(([, [el]]) => !!el) || [];
                    for (const [seg, k] of ns.slice(i, ns.length - j).map((seg, k) => [
                            seg,
                            i + k
                        ])) {
                        const es = parse_1.parse_(seg);
                        void pairs.splice(k, 0, [
                            seg,
                            es
                        ]);
                        void es.forEach(el => void target.insertBefore(el, ref));
                        yield* es;
                        if (revision !== rev)
                            return;
                    }
                };
            }
            exports.bind = bind;
        },
        {
            './parse': 64,
            './segment': 65
        }
    ],
    22: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../combinator');
            const newline_1 = require('./block/newline');
            const horizontalrule_1 = require('./block/horizontalrule');
            const heading_1 = require('./block/heading');
            const ulist_1 = require('./block/ulist');
            const olist_1 = require('./block/olist');
            const dlist_1 = require('./block/dlist');
            const table_1 = require('./block/table');
            const blockquote_1 = require('./block/blockquote');
            const pretext_1 = require('./block/pretext');
            const mathblock_1 = require('./block/mathblock');
            const extension_1 = require('./block/extension');
            const paragraph_1 = require('./block/paragraph');
            exports.block = combinator_1.combine([
                newline_1.newline,
                horizontalrule_1.horizontalrule,
                heading_1.heading,
                ulist_1.ulist,
                olist_1.olist,
                dlist_1.dlist,
                table_1.table,
                blockquote_1.blockquote,
                pretext_1.pretext,
                mathblock_1.mathblock,
                extension_1.extension,
                paragraph_1.paragraph
            ]);
        },
        {
            '../combinator': 14,
            './block/blockquote': 23,
            './block/dlist': 24,
            './block/extension': 25,
            './block/heading': 27,
            './block/horizontalrule': 28,
            './block/mathblock': 29,
            './block/newline': 30,
            './block/olist': 31,
            './block/paragraph': 32,
            './block/pretext': 35,
            './block/table': 36,
            './block/ulist': 37
        }
    ],
    23: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const block_1 = require('../block');
            const unescapable_1 = require('../source/unescapable');
            const squash_1 = require('../squash');
            const syntax = /^>+(?=\s|$)/;
            exports.blockquote = verification_1.verify(source => {
                const mode = undefined || source.startsWith('>') && 'plain' || source.startsWith('|>') && 'markdown' || '';
                if (mode === '')
                    return;
                source = mode === 'plain' ? source : source.slice(1);
                let [indent = ''] = source.match(syntax) || [];
                if (!indent)
                    return;
                const top = document.createElement('blockquote');
                let bottom = indent.split('').slice(1).reduce(p => p.appendChild(document.createElement('blockquote')), top);
                while (true) {
                    if (source.split('\n', 1).shift().trim() === '')
                        break;
                    const diff = (source.match(syntax) || [indent])[0].length - indent.length;
                    if (diff > 0) {
                        bottom = source.slice(0, diff).split('').reduce(p => p.appendChild(document.createElement('blockquote')), bottom);
                    }
                    if (diff < 0) {
                        bottom = source.slice(0, -diff).split('').reduce(p => p.parentElement, bottom);
                    }
                    indent = indent[0].repeat(indent.length + diff);
                    if (bottom.lastChild instanceof Text) {
                        const node = mode === 'plain' ? document.createElement('br') : document.createTextNode('\n');
                        void bottom.appendChild(node);
                    }
                    source = source.split(/[^\S\n]/, 1)[0] === indent ? source.slice(indent.length + 1) : source.startsWith(`${ indent }\n`) ? source.slice(indent.length) : source;
                    const [cs = [], rest = source] = combinator_1.loop(combinator_1.combine([unescapable_1.unescsource]), '\n|$')(source) || [];
                    const node = mode === 'plain' ? document.createTextNode(squash_1.squash(cs).textContent.replace(/ /g, String.fromCharCode(160))) : squash_1.squash(cs);
                    if (bottom.childNodes.length === 0 && node.textContent.trim() === '')
                        return;
                    void bottom.appendChild(node);
                    source = rest.slice(1);
                }
                if (mode === 'markdown') {
                    void expand(top);
                }
                return [
                    [top],
                    source
                ];
            });
            function expand(el) {
                return void [...el.childNodes].reduce((ss, node) => {
                    switch (true) {
                    case node instanceof Text:
                        void ss.push(node.textContent);
                        const ref = node.nextSibling;
                        void el.removeChild(node);
                        if (ref instanceof Text)
                            return ss;
                        void el.insertBefore(parse(ss.join('')), ref);
                        return [];
                    case node instanceof HTMLQuoteElement:
                        void expand(node);
                        return [];
                    default:
                        void el.insertBefore(node, node.nextSibling);
                        return [];
                    }
                }, []);
                function parse(source) {
                    return (combinator_1.loop(block_1.block)(source) || [[]])[0].reduce((frag, node) => (frag.appendChild(node), frag), document.createDocumentFragment());
                }
            }
        },
        {
            '../../combinator': 14,
            '../block': 22,
            '../source/unescapable': 72,
            '../squash': 74,
            './util/verification': 40
        }
    ],
    24: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const index_1 = require('./util/index');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const syntax = /^~\s/;
            const separator = /^[~:](?:\s|$)/;
            exports.dlist = verification_1.verify(source => {
                const [whole = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const el = document.createElement('dl');
                while (true) {
                    const line = source.split('\n', 1)[0];
                    if (line.trim() === '')
                        break;
                    switch (line.slice(0, 2).trim()) {
                    case '~': {
                            const dt = el.appendChild(document.createElement('dt'));
                            void dt.appendChild(squash_1.squash((combinator_1.loop(combinator_1.combine([
                                index_1.index,
                                inline_1.inline
                            ]))(line.slice(1).trim()) || [[]])[0]));
                            void index_1.defineIndex(dt);
                            source = source.slice(line.length + 1);
                            continue;
                        }
                    default: {
                            const dd = line.slice(0, 2).trim() === ':' || el.lastElementChild.tagName.toLowerCase() !== 'dd' ? el.appendChild(document.createElement('dd')) : el.lastElementChild;
                            const texts = [line.slice(line.slice(0, 2).trim() === ':' ? 1 : 0)];
                            source = source.slice(line.length + 1);
                            while (true) {
                                const line = source.split('\n', 1)[0];
                                if (line.trim() === '' || line.search(separator) === 0)
                                    break;
                                void texts.push(line);
                                source = source.slice(line.length + 1);
                            }
                            void dd.appendChild(squash_1.squash((combinator_1.loop(combinator_1.combine([inline_1.inline]))(texts.join('\n').trim()) || [[]])[0]));
                            continue;
                        }
                    }
                }
                if (el.lastElementChild && el.lastElementChild.tagName.toLowerCase() === 'dt') {
                    void el.appendChild(document.createElement('dd'));
                }
                return [
                    [el],
                    source
                ];
            });
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './util/index': 39,
            './util/verification': 40
        }
    ],
    25: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const placeholder_1 = require('./extension/placeholder');
            exports.extension = combinator_1.combine([placeholder_1.placeholder]);
        },
        {
            '../../combinator': 14,
            './extension/placeholder': 26
        }
    ],
    26: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('../util/verification');
            const combinator_1 = require('../../../combinator');
            const block_1 = require('../../block');
            const unescapable_1 = require('../../source/unescapable');
            const squash_1 = require('../../squash');
            const syntax = /^(~{3,})([^\n]*)\n(?:[^\n]*\n)*?\1[^\S\n]*(?:\n|$)/;
            exports.placeholder = verification_1.verify(source => {
                if (!source.startsWith('~~~'))
                    return;
                const [whole = '', keyword = '', notes = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const [[message]] = block_1.block('**WARNING: DON\'T USE `~~~` SYNTAX!!**\\\nThis *extension syntax* is reserved for extensibility.');
                source = source.slice(source.indexOf('\n') + 1);
                const lines = [];
                while (true) {
                    const line = source.split('\n', 1)[0];
                    if (line.startsWith(`${ keyword }`) && line.trim() === `${ keyword }`)
                        break;
                    void lines.push(squash_1.squash((combinator_1.loop(unescapable_1.unescsource)(`${ line }\n`) || [[]])[0]).textContent);
                    source = source.slice(line.length + 1);
                    if (source === '')
                        return;
                }
                const quote = document.createElement('pre');
                void quote.appendChild(document.createTextNode(`${ keyword }${ notes }\n${ lines.join('') }${ keyword }`));
                return [
                    [
                        message,
                        quote
                    ],
                    source.slice(source.split('\n', 1)[0].length + 1)
                ];
            });
        },
        {
            '../../../combinator': 14,
            '../../block': 22,
            '../../source/unescapable': 72,
            '../../squash': 74,
            '../util/verification': 40
        }
    ],
    27: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const index_1 = require('./util/index');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const syntax = /^(#{1,6})[^\S\n]+?([^\n]+)/;
            exports.heading = verification_1.verify(source => {
                if (!source.startsWith('#'))
                    return;
                const [whole = '', {length: level} = '', title = ''] = source.split('\n', 1)[0].match(syntax) || [];
                if (!whole)
                    return;
                const [children = [], rest = undefined] = combinator_1.loop(combinator_1.combine([
                    index_1.index,
                    inline_1.inline
                ]))(title.trim()) || [];
                if (rest === undefined)
                    return;
                const el = document.createElement(`h${ level }`);
                void el.appendChild(squash_1.squash(children));
                void index_1.defineIndex(el);
                return [
                    [el],
                    source.slice(whole.length + 1)
                ];
            });
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './util/index': 39,
            './util/verification': 40
        }
    ],
    28: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const syntax = /^(?:\s*-){3,}\s*$/;
            exports.horizontalrule = verification_1.verify(source => {
                const [whole = ''] = source.split('\n', 1)[0].match(syntax) || [];
                if (!whole)
                    return;
                return [
                    [document.createElement('hr')],
                    source.slice(whole.length + 1)
                ];
            });
        },
        { './util/verification': 40 }
    ],
    29: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const syntax = /^\$\$[^\S\n]*\n(?:[^\n]*?\S[^\n]*\n)+?\$\$[^\S\n]*(?:\n|$)/;
            exports.mathblock = verification_1.verify(source => {
                if (!source.startsWith('$$'))
                    return;
                const [whole = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const el = document.createElement('div');
                void el.setAttribute('class', 'math');
                void el.appendChild(document.createTextNode(whole));
                return [
                    [el],
                    source.slice(whole.length)
                ];
            });
        },
        { './util/verification': 40 }
    ],
    30: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const syntax = /^(?:[^\S\n]*?\\?\n)+/;
            exports.newline = source => {
                const [whole = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                return [
                    [],
                    source.slice(whole.length)
                ];
            };
        },
        {}
    ],
    31: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const ulist_1 = require('./ulist');
            const indent_1 = require('./util/indent');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const syntax = /^([0-9]+|[A-Z]+|[a-z]+)(\.(?:\s|$)|(?=\n|$))/;
            exports.olist = verification_1.verify(source => {
                const [whole = '', index = '', flag = ''] = source.match(syntax) || [];
                if (!whole || !flag)
                    return;
                const el = document.createElement('ol');
                void el.setAttribute('start', index);
                void el.setAttribute('type', Number.isFinite(+index) ? '1' : index === index.toLowerCase() ? 'a' : 'A');
                while (true) {
                    const line = source.split('\n', 1)[0];
                    if (line.trim() === '')
                        break;
                    if (line.search(syntax) === 0) {
                        const text = line.slice(line.split(/\s/, 1)[0].length + 1).trim();
                        const li = el.appendChild(document.createElement('li'));
                        void li.appendChild(squash_1.squash((combinator_1.loop(combinator_1.combine([inline_1.inline]))(text) || [[]])[0]));
                        source = source.slice(line.length + 1);
                        continue;
                    } else {
                        const li = el.lastElementChild;
                        if (!li.firstChild || [
                                HTMLUListElement,
                                HTMLOListElement
                            ].some(E => li.lastElementChild instanceof E))
                            return;
                        const [block = '', rest = undefined] = indent_1.indent(source) || [];
                        if (rest === undefined)
                            return;
                        const [children = [], brest = block] = combinator_1.combine([
                            ulist_1.ulist,
                            exports.olist
                        ])(indent_1.fillOListFlag(block)) || [];
                        if (children.length !== 1 || brest.length !== 0)
                            return;
                        void li.appendChild(squash_1.squash(children));
                        source = rest;
                        continue;
                    }
                }
                return [
                    [el],
                    source
                ];
            });
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './ulist': 37,
            './util/indent': 38,
            './util/verification': 40
        }
    ],
    32: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const reference_1 = require('./paragraph/reference');
            const hashtag_1 = require('./paragraph/hashtag');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const separator = /^\s*$/m;
            const emptyline = /^\s*?\\?\n/mg;
            exports.paragraph = verification_1.verify(source => {
                if (source.split('\n', 1)[0].trim() === '')
                    return;
                const block = source.split(separator, 1)[0];
                const rest = source.slice(block.length);
                const [cs = []] = combinator_1.subsequence([
                    combinator_1.loop(reference_1.reference),
                    combinator_1.loop(combinator_1.combine([
                        hashtag_1.hashtag,
                        inline_1.inline
                    ]))
                ])(block.replace(emptyline, '').trim()) || [];
                const el = document.createElement('p');
                void el.appendChild(squash_1.squash(cs));
                void [...el.children].forEach(el => el.matches('.reference') && el.nextSibling && el.parentElement.insertBefore(document.createElement('br'), el.nextSibling));
                return [
                    [el],
                    rest
                ];
            });
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './paragraph/hashtag': 33,
            './paragraph/reference': 34,
            './util/verification': 40
        }
    ],
    33: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../../combinator');
            const unescapable_1 = require('../../source/unescapable');
            const squash_1 = require('../../squash');
            const escape = /^\S#+/;
            const closer = /^\s/;
            exports.hashtag = source => {
                const [flag = undefined] = source.match(escape) || [];
                if (flag)
                    return [
                        [document.createTextNode(flag)],
                        source.slice(flag.length)
                    ];
                if (!source.startsWith('#'))
                    return;
                const line = source.split('\n', 1)[0];
                const [ts = [], rest = undefined] = combinator_1.loop(combinator_1.combine([unescapable_1.unescsource]), closer)(line) || [];
                if (rest === undefined)
                    return;
                const el = document.createElement('a');
                void el.setAttribute('class', 'hashtag');
                void el.setAttribute('rel', 'noopener');
                void el.appendChild(document.createTextNode(squash_1.squash(ts).textContent));
                if (el.textContent.length < 2)
                    return;
                return [
                    [el],
                    rest + source.slice(line.length)
                ];
            };
        },
        {
            '../../../combinator': 14,
            '../../source/unescapable': 72,
            '../../squash': 74
        }
    ],
    34: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../../combinator');
            const unescapable_1 = require('../../source/unescapable');
            const squash_1 = require('../../squash');
            const validation_1 = require('../../source/validation');
            const syntax = /^>+[^>\s]\S*\s*?(?=\n|$)/;
            const closer = /^\s/;
            exports.reference = source => {
                if (!validation_1.match(source, '>', syntax))
                    return;
                const line = source.split('\n', 1)[0];
                const [ts = [], rest = undefined] = combinator_1.loop(combinator_1.combine([unescapable_1.unescsource]), closer)(line) || [];
                if (rest === undefined)
                    return;
                const el = document.createElement('span');
                void el.setAttribute('class', 'reference');
                void el.appendChild(document.createTextNode(squash_1.squash(ts).textContent));
                return [
                    [el],
                    source.slice(line.length + 1)
                ];
            };
        },
        {
            '../../../combinator': 14,
            '../../source/unescapable': 72,
            '../../source/validation': 73,
            '../../squash': 74
        }
    ],
    35: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const escapable_1 = require('../source/escapable');
            const squash_1 = require('../squash');
            const syntax = /^(`{3,})([^\n]*)\n(?:([\s\S]*?)\n)?\1[^\S\n]*(?:\n|$)/;
            exports.pretext = verification_1.verify(source => {
                if (!source.startsWith('```'))
                    return;
                const [whole = '', , notes = '', body = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const el = document.createElement('pre');
                const lang = notes.split(/\s/, 1)[0];
                if (lang) {
                    void el.setAttribute('class', `language-${ lang.toLowerCase() }`);
                    void el.setAttribute('data-lang', lang);
                }
                const filepath = squash_1.squash((combinator_1.loop(escapable_1.escsource, /^\s/)(notes.slice(lang.length).trim()) || [[]])[0]).textContent;
                if (filepath) {
                    void el.setAttribute('data-file', filepath);
                }
                void el.appendChild(document.createTextNode(body));
                return [
                    [el],
                    source.slice(whole.length)
                ];
            });
        },
        {
            '../../combinator': 14,
            '../source/escapable': 68,
            '../squash': 74,
            './util/verification': 40
        }
    ],
    36: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const syntax = /^(\|[^\n]*)+?[^\S\n]*\n/;
            const align = /^:?-+:?$/;
            exports.table = verification_1.verify(source => {
                if (!source.startsWith('|') || source.search(syntax) !== 0)
                    return;
                const table = document.createElement('table');
                const [headers = [], hrest = source] = parse(source) || [];
                if (hrest.length === source.length)
                    return;
                source = hrest;
                const [aligns_ = [], arest = source] = parse(source) || [];
                if (arest.length === source.length)
                    return;
                source = arest;
                if (aligns_.some(e => !e.textContent || e.textContent.search(align) !== 0))
                    return;
                const aligns = headers.map((_, i) => (aligns_[i] || aligns_[aligns_.length - 1]).textContent).map(s => s[0] === ':' ? s[s.length - 1] === ':' ? 'center' : 'left' : s[s.length - 1] === ':' ? 'right' : '');
                void table.appendChild(document.createElement('thead'));
                void append(headers, table, headers.map((_, i) => i > 1 ? aligns[1] : aligns[i] === 'right' ? 'center' : aligns[i]));
                void table.appendChild(document.createElement('tbody'));
                while (true) {
                    const line = source.split('\n', 1)[0];
                    if (line.trim() === '')
                        break;
                    const [cols = [], rest = line] = parse(line) || [];
                    if (rest.length !== 0)
                        return;
                    void append(headers.map((_, i) => cols[i] || document.createDocumentFragment()), table, aligns);
                    source = source.slice(line.length + 1);
                }
                return [
                    [table],
                    source
                ];
            });
            function append(cols, table, aligns) {
                return void cols.map((col, i) => {
                    const td = document.createElement('td');
                    void td.setAttribute('align', aligns[i] || '');
                    void td.appendChild(col);
                    return td;
                }).reduce((tr, td) => (void tr.appendChild(td), tr), table.lastChild.appendChild(document.createElement('tr')));
            }
            const rowseparator = /^\||^[^\S\n]*(?=\n|$)/;
            const rowend = /^\|?[^\S\n]*(?=\n|$)/;
            function parse(row) {
                const cols = [];
                while (true) {
                    if (row[0] !== '|')
                        return;
                    const [, rest = row.slice(1)] = combinator_1.loop(inline_1.inline, rowseparator)(row.slice(1)) || [];
                    const [col = []] = combinator_1.loop(inline_1.inline)(row.slice(1, row.length - rest.length).trim()) || [];
                    row = rest;
                    void cols.push(squash_1.squash(col));
                    if (row.search(rowend) === 0)
                        return [
                            cols,
                            row.slice(row.split('\n')[0].length + 1)
                        ];
                }
            }
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './util/verification': 40
        }
    ],
    37: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const verification_1 = require('./util/verification');
            const combinator_1 = require('../../combinator');
            const olist_1 = require('./olist');
            const indent_1 = require('./util/indent');
            const inline_1 = require('../inline');
            const squash_1 = require('../squash');
            const syntax = /^([-+*])(?=\s|$)/;
            const content = /^(\[[ x]\](?: +|$))?.*$/;
            exports.ulist = verification_1.verify(source => {
                const [whole = '', flag = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const el = document.createElement('ul');
                while (true) {
                    const line = source.split('\n', 1)[0];
                    if (line.trim() === '')
                        break;
                    if (line.search(syntax) === 0) {
                        if (!line.startsWith(flag))
                            return;
                        const [text, checkbox = ''] = line.slice(line.split(/\s/, 1)[0].length + 1).trim().match(content);
                        const li = el.appendChild(document.createElement('li'));
                        if (checkbox) {
                            const cb = document.createElement('span');
                            void cb.setAttribute('class', 'checkbox');
                            void cb.appendChild(document.createTextNode(`${ checkbox.trim() } `));
                            void li.appendChild(cb);
                        }
                        void li.appendChild(squash_1.squash((combinator_1.loop(combinator_1.combine([inline_1.inline]))(text.slice(checkbox.length)) || [[]])[0]));
                        source = source.slice(line.length + 1);
                        continue;
                    } else {
                        const li = el.lastElementChild;
                        if (!li.firstChild || [
                                HTMLUListElement,
                                HTMLOListElement
                            ].some(E => li.lastElementChild instanceof E))
                            return;
                        const [block = '', rest = undefined] = indent_1.indent(source) || [];
                        if (rest === undefined)
                            return;
                        const [children = [], brest = block] = combinator_1.combine([
                            exports.ulist,
                            olist_1.olist
                        ])(indent_1.fillOListFlag(block)) || [];
                        if (children.length !== 1 || brest.length !== 0)
                            return;
                        void li.appendChild(squash_1.squash(children));
                        source = rest;
                        continue;
                    }
                }
                return [
                    [el],
                    source
                ];
            });
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../squash': 74,
            './olist': 31,
            './util/indent': 38,
            './util/verification': 40
        }
    ],
    38: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const syntax = /^\s*/;
            function indent(source) {
                const [indent = ''] = source.split('\n', 1)[0].match(syntax) || [];
                if (indent === '')
                    return;
                const lines = [];
                let rest = source;
                while (true) {
                    const line = rest.split('\n', 1)[0];
                    if (!line.startsWith(indent))
                        break;
                    if (line.slice(indent.length).trim() === '')
                        break;
                    void lines.push(line.slice(indent.length));
                    rest = rest.slice(line.length + 1);
                }
                return rest.length < source.length ? [
                    lines.join('\n'),
                    rest
                ] : undefined;
            }
            exports.indent = indent;
            ;
            function fillOListFlag(source) {
                return source.replace(/^(?:[0-9]+|[A-Z]+|[a-z]+)(?=\n|$)/, str => `${ str }.`);
            }
            exports.fillOListFlag = fillOListFlag;
        },
        {}
    ],
    39: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../../inline');
            const index_1 = require('../../string/index');
            const syntax = /^\s+\[#\S+?\]$/;
            exports.index = source => {
                if (!source.trim().startsWith('[#') || source.search(syntax) !== 0)
                    return;
                source = source.trim();
                const [[el = undefined] = [], rest = ''] = inline_1.inline(source) || [];
                if (!(el instanceof HTMLAnchorElement))
                    return;
                if (rest !== '')
                    return;
                void el.setAttribute('class', 'index');
                return [
                    [el],
                    rest
                ];
            };
            function defineIndex(target) {
                const el = target.querySelector('.index') || target.cloneNode(true);
                void el.remove();
                void [...el.querySelectorAll('code[data-src], .math[data-src]')].forEach(el => el.textContent = el.getAttribute('data-src'));
                const text = el.textContent.trim();
                if (text === '')
                    return;
                void target.setAttribute('id', index_1.makeIndex(text));
            }
            exports.defineIndex = defineIndex;
        },
        {
            '../../inline': 43,
            '../../string/index': 75
        }
    ],
    40: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function verify(parser) {
                return source => {
                    const result = parser(source);
                    if (!result)
                        return result;
                    if (result[1].split('\n', 1)[0].trim() !== '')
                        return undefined;
                    return result;
                };
            }
            exports.verify = verify;
        },
        {}
    ],
    41: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const mathinline_1 = require('./inline/mathinline');
            const media_1 = require('./inline/media');
            exports.caches = {
                math: mathinline_1.cache,
                media: { image: media_1.cache }
            };
        },
        {
            './inline/mathinline': 60,
            './inline/media': 61
        }
    ],
    42: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const symbols = /^[~:|>`$-+*\s]|^#[^\S\n]|^[0-9a-z]+\.|[*`$&()\[\]{}]|\\./gim;
            function escape(source) {
                return source.replace(symbols, str => str[0] === '\\' ? str : `\\${ str }`);
            }
            exports.escape = escape;
        },
        {}
    ],
    43: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../combinator');
            const brace_1 = require('./inline/brace');
            const annotation_1 = require('./inline/annotation');
            const parenthesis_1 = require('./inline/parenthesis');
            const link_1 = require('./inline/link');
            const extension_1 = require('./inline/extension');
            const bracket_1 = require('./inline/bracket');
            const html_1 = require('./inline/html');
            const anglebracket_1 = require('./inline/anglebracket');
            const emphasis_1 = require('./inline/emphasis');
            const strong_1 = require('./inline/strong');
            const code_1 = require('./inline/code');
            const mathinline_1 = require('./inline/mathinline');
            const media_1 = require('./inline/media');
            const htmlentity_1 = require('./inline/htmlentity');
            const autolink_1 = require('./inline/autolink');
            const text_1 = require('./source/text');
            exports.inline = combinator_1.combine([
                brace_1.brace,
                annotation_1.annotation,
                parenthesis_1.parenthesis,
                link_1.link,
                extension_1.extension,
                bracket_1.bracket,
                html_1.html,
                anglebracket_1.anglebracket,
                emphasis_1.emphasis,
                strong_1.strong,
                code_1.code,
                mathinline_1.mathinline,
                media_1.media,
                htmlentity_1.htmlentity,
                autolink_1.autolink,
                text_1.text
            ]);
        },
        {
            '../combinator': 14,
            './inline/anglebracket': 44,
            './inline/annotation': 45,
            './inline/autolink': 46,
            './inline/brace': 49,
            './inline/bracket': 50,
            './inline/code': 51,
            './inline/emphasis': 52,
            './inline/extension': 53,
            './inline/html': 57,
            './inline/htmlentity': 58,
            './inline/link': 59,
            './inline/mathinline': 60,
            './inline/media': 61,
            './inline/parenthesis': 62,
            './inline/strong': 63,
            './source/text': 71
        }
    ],
    44: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^<[\s\S]*?>/;
            const closer = /^>/;
            exports.anglebracket = source => {
                if (!validation_1.match(source, '<', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('<', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), '>'), (ns, rest) => [
                    [...squash_1.squash([
                            document.createTextNode('<'),
                            ...ns,
                            document.createTextNode('>')
                        ]).childNodes],
                    rest
                ])(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    45: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^\(\([\s\S]+?\)\)/;
            const closer = /^\)\)/;
            exports.annotation = source => {
                if (!validation_1.match(source, '((', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('((', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), '))'), (ns, rest) => {
                    const el = document.createElement('sup');
                    void el.setAttribute('class', 'annotation');
                    void el.appendChild(squash_1.squash(ns));
                    if (!validation_1.isVisible(el.textContent))
                        return;
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    46: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const url_1 = require('./autolink/url');
            const account_1 = require('./autolink/account');
            exports.autolink = combinator_1.combine([
                url_1.url,
                account_1.account
            ]);
        },
        {
            '../../combinator': 14,
            './autolink/account': 47,
            './autolink/url': 48
        }
    ],
    47: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const syntax = /^@[a-zA-Z0-9]+(?:-[0-9a-zA-Z]+)*(?!@)/;
            const escape = /^[0-9a-zA-Z@]@.*?(?!@)/;
            exports.account = source => {
                const [flag = undefined] = source.match(escape) || [];
                if (flag)
                    return [
                        [document.createTextNode(flag)],
                        source.slice(flag.length)
                    ];
                const [whole = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                const el = document.createElement('a');
                void el.setAttribute('class', 'account');
                void el.setAttribute('rel', 'noopener');
                void el.appendChild(document.createTextNode(whole));
                return [
                    [el],
                    source.slice(whole.length)
                ];
            };
        },
        {}
    ],
    48: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../../combinator');
            const escapable_1 = require('../../source/escapable');
            const parenthesis_1 = require('../../source/parenthesis');
            const link_1 = require('../link');
            const syntax = /^(?:!?h)?ttps?:\/\/\S/;
            exports.closer = /^['"`|\[\](){}<>]|^[-+*~^,.;:!?]*(?=[\s|\[\](){}<>]|$)|^\\?(?:\n|$)/;
            const escape = /^(?:[0-9a-zA-Z][!?]*h|\?h|[0-9a-gi-zA-Z!?])ttps?:\/\/\S/;
            exports.url = source => {
                if (source.search(escape) === 0)
                    return [
                        [document.createTextNode(source.slice(0, source.indexOf(':')))],
                        source.slice(source.indexOf(':'))
                    ];
                if (source.search(syntax) !== 0)
                    return;
                const flag = source.startsWith('!h');
                source = flag ? source.slice(1) : source;
                const [, rest = undefined] = combinator_1.loop(combinator_1.combine([
                    combinator_1.bracket('[', ipv6, ']'),
                    parenthesis_1.parenthesis,
                    combinator_1.loop(escapable_1.escsource, exports.closer)
                ]))(source) || [];
                if (rest === undefined)
                    return;
                const attribute = source.startsWith('ttp') ? ' nofollow' : '';
                const url = `${ source.startsWith('ttp') ? 'h' : '' }${ source.slice(0, source.length - rest.length) }`.replace(/\\.?/g, str => str.length < 2 ? '' : str).replace(/\s/g, encodeURI);
                return !flag ? link_1.link(`[](${ url }${ attribute })${ rest }`) : link_1.link(`[![](${ url })](${ url })${ rest }`);
            };
            const ipv6 = source => {
                const [whole = ''] = source.match(/^[:0-9a-z]+/i) || [];
                if (!whole)
                    return;
                return [
                    [document.createTextNode(whole)],
                    source.slice(whole.length)
                ];
            };
        },
        {
            '../../../combinator': 14,
            '../../source/escapable': 68,
            '../../source/parenthesis': 70,
            '../link': 59
        }
    ],
    49: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^{[\s\S]*?}/;
            const closer = /^}/;
            exports.brace = source => {
                if (!validation_1.match(source, '{', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('{', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), '}'), (ns, rest) => [
                    [...squash_1.squash([
                            document.createTextNode('{'),
                            ...ns,
                            document.createTextNode('}')
                        ]).childNodes],
                    rest
                ])(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    50: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^\[[\s\S]*?\]/;
            const closer = /^\]/;
            exports.bracket = source => {
                if (!validation_1.match(source, '[', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('[', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), ']'), (ns, rest) => [
                    [...squash_1.squash([
                            document.createTextNode('['),
                            ...ns,
                            document.createTextNode(']')
                        ]).childNodes],
                    rest
                ])(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    51: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const unescapable_1 = require('../source/unescapable');
            const char_1 = require('../source/char');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^(`+)[^\n]+?\1(?!`)/;
            exports.code = source => {
                if (!validation_1.match(source, '`'))
                    return;
                const [whole = '', keyword = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                return combinator_1.transform(combinator_1.bracket(keyword, combinator_1.loop(combinator_1.combine([
                    combinator_1.loop(char_1.char('`')),
                    unescapable_1.unescsource
                ]), `^${ keyword }(?!\`)|^\n`), keyword), (ns, rest) => {
                    if (!validation_1.isSingleLine(source.slice(0, source.length - rest.length)))
                        return;
                    const el = document.createElement('code');
                    void el.appendChild(squash_1.squash(ns));
                    el.textContent = el.textContent.trim();
                    if (!validation_1.isVisible(el.textContent))
                        return;
                    void el.setAttribute('data-src', source.slice(0, source.length - rest.length));
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../source/char': 66,
            '../source/unescapable': 72,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    52: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const strong_1 = require('./strong');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^\*[\s\S]+?\*/;
            const closer = /^\*/;
            exports.emphasis = source => {
                if (!validation_1.match(source, '*', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('*', combinator_1.loop(combinator_1.combine([
                    combinator_1.loop(inline_1.inline, closer),
                    strong_1.strong
                ])), '*'), (ns, rest) => {
                    const el = document.createElement('em');
                    void el.appendChild(squash_1.squash(ns));
                    if (!validation_1.isVisible(el.textContent))
                        return;
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74,
            './strong': 63
        }
    ],
    53: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const index_1 = require('./extension/index');
            const placeholder_1 = require('./extension/placeholder');
            exports.extension = combinator_1.combine([
                index_1.index,
                placeholder_1.placeholder
            ]);
        },
        {
            '../../combinator': 14,
            './extension/index': 54,
            './extension/placeholder': 55
        }
    ],
    54: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const link_1 = require('../link');
            const validation_1 = require('../../source/validation');
            const index_1 = require('../../block/util/index');
            const template_1 = require('./template');
            exports.index = template_1.template((flag, query, frag) => {
                if (flag !== '#')
                    return;
                if (frag.textContent === flag)
                    return;
                const [[el = undefined] = [], rest = ''] = link_1.link(`[${ query }]()`) || [];
                if (!el)
                    return;
                if (!validation_1.isTightVisible(el.textContent))
                    return;
                void index_1.defineIndex(el);
                void el.setAttribute('href', `#${ el.id }`);
                void el.removeAttribute('id');
                return [
                    [el],
                    rest
                ];
            });
        },
        {
            '../../block/util/index': 39,
            '../../source/validation': 73,
            '../link': 59,
            './template': 56
        }
    ],
    55: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../../inline');
            const combinator_1 = require('../../../combinator');
            const squash_1 = require('../../squash');
            const template_1 = require('./template');
            exports.placeholder = template_1.template(flag => {
                const el = document.createElement('span');
                void el.appendChild(squash_1.squash(combinator_1.loop(inline_1.inline)(`++**WARNING: DON'T USE \`[${ flag } ]\` SYNTAX!!** This syntax is reserved for extensibility.++`)[0]));
                return [
                    [el],
                    ''
                ];
            });
        },
        {
            '../../../combinator': 14,
            '../../inline': 43,
            '../../squash': 74,
            './template': 56
        }
    ],
    56: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../../combinator');
            const inline_1 = require('../../inline');
            const squash_1 = require('../../squash');
            const validation_1 = require('../../source/validation');
            const syntax = /^\[[~#:^\[][^\n]*?\]/;
            exports.template = parser => {
                return function (source) {
                    const [flag = '', query = '', frag = undefined, rest = ''] = parse(source) || [];
                    if (!frag)
                        return undefined;
                    const result = parser(flag, query, frag);
                    if (!result)
                        return undefined;
                    return [
                        result[0],
                        rest
                    ];
                };
            };
            function parse(source) {
                if (!validation_1.match(source, '[', syntax))
                    return;
                const [ns = [], rest = undefined] = combinator_1.bracket('[', combinator_1.loop(inline_1.inline, /^[\]\n]/), ']')(source) || [];
                if (rest === undefined)
                    return;
                const text = source.slice(1, source.length - rest.length - 1);
                const flag = text[0];
                const query = text.slice(flag.length);
                if (!validation_1.isSingleLine(query))
                    return;
                return [
                    flag,
                    query,
                    squash_1.squash(ns),
                    rest
                ];
            }
        },
        {
            '../../../combinator': 14,
            '../../inline': 43,
            '../../source/validation': 73,
            '../../squash': 74
        }
    ],
    57: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^<([a-z]+)>/;
            const inlinetags = Object.freeze('ins|del|sup|sub|small|q|cite|mark|ruby|rt|rp|bdi|bdo|wbr'.split('|'));
            exports.html = source => {
                if (!validation_1.match(source, '<'))
                    return;
                const [whole = '', tagname = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                if (!inlinetags.includes(tagname))
                    return;
                const opentag = `<${ tagname }>`;
                if (tagname === 'wbr')
                    return [
                        [document.createElement(tagname)],
                        source.slice(opentag.length)
                    ];
                return combinator_1.transform(combinator_1.bracket(`<${ tagname }>`, combinator_1.loop(combinator_1.combine([inline_1.inline]), `^</${ tagname }>`), `</${ tagname }>`), (ns, rest) => {
                    const el = document.createElement(tagname);
                    void el.appendChild(squash_1.squash(ns));
                    if (!validation_1.isVisible(el.textContent))
                        return;
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    58: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const validation_1 = require('../source/validation');
            const syntax = /^&(?:[0-9a-z]+|#[0-9]{1,8}|#x[0-9a-f]{1,8});/i;
            exports.htmlentity = source => {
                if (!validation_1.match(source, '&'))
                    return;
                const [whole = ''] = source.match(syntax) || [];
                if (!whole)
                    return;
                return [
                    [document.createTextNode(parse(whole))],
                    source.slice(whole.length)
                ];
            };
            const parser = document.createElement('span');
            function parse(str) {
                parser.innerHTML = str;
                return parser.textContent;
            }
        },
        { '../source/validation': 73 }
    ],
    59: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const escapable_1 = require('../source/escapable');
            const parenthesis_1 = require('../source/parenthesis');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const url_1 = require('../string/url');
            const syntax = /^\[[^\n]*?\]\(/;
            exports.link = source => {
                if (!validation_1.match(source, '[', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('[', combinator_1.loop(combinator_1.combine([inline_1.inline]), /^]\n?|^\n/), ']'), (ns, rest) => {
                    if (!validation_1.isSingleLine(source.slice(0, source.length - rest.length).trim()))
                        return;
                    const children = squash_1.squash(ns);
                    if (children.querySelector('a, .annotation') && !children.querySelector('.media'))
                        return;
                    if (children.querySelector('img, .media')) {
                        if (children.childNodes.length > 1 || !children.firstElementChild || !children.firstElementChild.matches('img, .media'))
                            return;
                    } else {
                        if (children.childNodes.length > 0 && children.textContent.trim() === '')
                            return;
                    }
                    return combinator_1.transform(combinator_1.bracket('(', combinator_1.loop(combinator_1.combine([
                        parenthesis_1.parenthesis,
                        escapable_1.escsource
                    ]), /^\)|^\s(?!nofollow)|^\n/), ')'), (ns, rest) => {
                        const [INSECURE_URL, attribute] = ns.reduce((s, c) => s + c.textContent, '').replace(/\\(.)/g, '$1').split(/\s/);
                        const url = url_1.sanitize(INSECURE_URL);
                        if (INSECURE_URL !== '' && url === '')
                            return;
                        const el = document.createElement('a');
                        void el.setAttribute('href', url);
                        void el.setAttribute('rel', attribute === 'nofollow' ? 'noopener nofollow noreferrer' : 'noopener');
                        if (location.protocol !== el.protocol || location.host !== el.host) {
                            void el.setAttribute('target', '_blank');
                        }
                        void el.appendChild(children.textContent || children.querySelector('img') ? children : document.createTextNode((INSECURE_URL || el.href).replace(/^h(?=ttps?:\/\/)/, attribute === 'nofollow' ? '' : 'h')));
                        return [
                            [el],
                            rest
                        ];
                    })(rest);
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/escapable': 68,
            '../source/parenthesis': 70,
            '../source/validation': 73,
            '../squash': 74,
            '../string/url': 76
        }
    ],
    60: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const escapable_1 = require('../source/escapable');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const cache_1 = require('spica/cache');
            exports.cache = new cache_1.Cache(100);
            const syntax = /^\$[^\s$][^\n]*?\$(?!\d)/;
            const closer = /^\$|^\n/;
            exports.mathinline = source => {
                if (!validation_1.match(source, '$', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('$', combinator_1.loop(combinator_1.combine([escapable_1.escsource]), closer), /^\$(?![$\d])/), (ns, rest) => {
                    if (!validation_1.isTightVisible(source.slice(1, source.length - rest.length - 1)))
                        return;
                    if (!validation_1.isSingleLine(source.slice(0, source.length - rest.length)))
                        return;
                    const el = document.createElement('span');
                    void el.setAttribute('class', 'math');
                    void el.appendChild(squash_1.squash([
                        document.createTextNode('$'),
                        ...ns,
                        document.createTextNode('$')
                    ]));
                    if (exports.cache.has(el.textContent))
                        return [
                            [exports.cache.get(el.textContent).cloneNode(true)],
                            rest
                        ];
                    void el.setAttribute('data-src', el.textContent);
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../source/escapable': 68,
            '../source/validation': 73,
            '../squash': 74,
            'spica/cache': 5
        }
    ],
    61: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const text_1 = require('../source/text');
            const escapable_1 = require('../source/escapable');
            const parenthesis_1 = require('../source/parenthesis');
            const validation_1 = require('../source/validation');
            const url_1 = require('../string/url');
            const cache_1 = require('spica/cache');
            exports.cache = new cache_1.Cache(100);
            const syntax = /^!\[[^\n]*?\]\(/;
            exports.media = source => {
                if (!validation_1.match(source, '![', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('![', combinator_1.loop(combinator_1.combine([text_1.text]), /^]\n?|^\n/), ']'), (ns, rest) => {
                    if (!validation_1.isSingleLine(source.slice(0, source.length - rest.length).trim()))
                        return;
                    const caption = ns.reduce((s, c) => s + c.textContent, '').trim();
                    return combinator_1.transform(combinator_1.bracket('(', combinator_1.loop(combinator_1.combine([
                        parenthesis_1.parenthesis,
                        escapable_1.escsource
                    ]), /^\)|^\s/), ')'), (ns, rest) => {
                        const url = url_1.sanitize(ns.reduce((s, c) => s + c.textContent, '').replace(/\\(.)/g, '$1'));
                        if (url === '')
                            return;
                        if (exports.cache.has(url))
                            return [
                                [exports.cache.get(url).cloneNode(true)],
                                rest
                            ];
                        const el = document.createElement('img');
                        void el.setAttribute('data-src', url);
                        void el.setAttribute('alt', caption);
                        return [
                            [el],
                            rest
                        ];
                    })(rest);
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../source/escapable': 68,
            '../source/parenthesis': 70,
            '../source/text': 71,
            '../source/validation': 73,
            '../string/url': 76,
            'spica/cache': 5
        }
    ],
    62: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^\([\s\S]*?\)/;
            const closer = /^\)/;
            exports.parenthesis = source => {
                if (!validation_1.match(source, '(', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('(', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), ')'), (ns, rest) => [
                    [...squash_1.squash([
                            document.createTextNode('('),
                            ...ns,
                            document.createTextNode(')')
                        ]).childNodes],
                    rest
                ])(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    63: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const inline_1 = require('../inline');
            const combinator_1 = require('../../combinator');
            const squash_1 = require('../squash');
            const validation_1 = require('../source/validation');
            const syntax = /^\*\*[\s\S]+?\*\*/;
            const closer = /^\*\*/;
            exports.strong = source => {
                if (!validation_1.match(source, '**', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('**', combinator_1.loop(combinator_1.combine([inline_1.inline]), closer), '**'), (ns, rest) => {
                    const el = document.createElement('strong');
                    void el.appendChild(squash_1.squash(ns));
                    if (!validation_1.isVisible(el.textContent))
                        return;
                    return [
                        [el],
                        rest
                    ];
                })(source);
            };
        },
        {
            '../../combinator': 14,
            '../inline': 43,
            '../source/validation': 73,
            '../squash': 74
        }
    ],
    64: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../combinator');
            const block_1 = require('./block');
            const segment_1 = require('./segment');
            function parse(source) {
                return segment_1.segment(source).reduce((frag, seg) => parse_(seg).reduce((doc, el) => (void doc.appendChild(el), doc), frag), document.createDocumentFragment());
            }
            exports.parse = parse;
            function parse_(source) {
                return (block_1.block(source) || [[]])[0];
            }
            exports.parse_ = parse_;
            const symbols = /^[#~:|>`$-+*\s]|^[0-9a-z]+\.|[*`$&()\[\]{}]|\\./gim;
            function escape(source) {
                return source.replace(symbols, str => str[0] === '\\' ? str : `\\${ str }`);
            }
            exports.escape = escape;
        },
        {
            '../combinator': 14,
            './block': 22,
            './segment': 65
        }
    ],
    65: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../combinator');
            const pretext_1 = require('./block/pretext');
            const extension_1 = require('./block/extension');
            const nonemptyline_1 = require('./source/nonemptyline');
            const emptyline_1 = require('./source/emptyline');
            function segment(source) {
                const segments = [];
                while (source.length > 0) {
                    const [, rest = ''] = combinator_1.combine([
                        pretext_1.pretext,
                        extension_1.extension,
                        nonemptyline_1.nonemptylines,
                        emptyline_1.emptylines
                    ])(source) || [];
                    void segments.push(source.slice(0, source.length - rest.length));
                    source = rest;
                }
                return segments;
            }
            exports.segment = segment;
        },
        {
            '../combinator': 14,
            './block/extension': 25,
            './block/pretext': 35,
            './source/emptyline': 67,
            './source/nonemptyline': 69
        }
    ],
    66: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function char(char) {
                return source => {
                    switch (source[0]) {
                    case char:
                        return [
                            [document.createTextNode(source.slice(0, 1))],
                            source.slice(1)
                        ];
                    default:
                        return;
                    }
                };
            }
            exports.char = char;
            ;
        },
        {}
    ],
    67: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const syntax = /^(?:[^\S\n]*(?:\n|$))*/;
            exports.emptylines = source => {
                if (source.length === 0)
                    return;
                const [whole = ''] = source.match(syntax) || [];
                return whole === '' ? undefined : [
                    [],
                    source.slice(whole.length)
                ];
            };
        },
        {}
    ],
    68: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const separator = /[^0-9a-zA-Z\u0080-\uFFFF]/;
            exports.escsource = source => {
                if (source.length === 0)
                    return;
                const i = source.search(separator);
                switch (i) {
                case -1:
                    return [
                        [document.createTextNode(source)],
                        ''
                    ];
                case 0:
                    switch (source[0]) {
                    case '\\':
                        switch (source[1]) {
                        case '\n':
                            return [
                                [document.createTextNode(source.slice(0, 1))],
                                source.slice(1)
                            ];
                        default:
                            return [
                                [document.createTextNode(source.slice(0, 2))],
                                source.slice(2)
                            ];
                        }
                    default:
                        return [
                            [document.createTextNode(source.slice(0, 1))],
                            source.slice(1)
                        ];
                    }
                default:
                    return [
                        [document.createTextNode(source.slice(0, i))],
                        source.slice(i)
                    ];
                }
            };
        },
        {}
    ],
    69: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const syntax = /^(?:[^\S\n]*?\S[^\n]*(?:\n|$))*/;
            exports.nonemptylines = source => {
                if (source.length === 0)
                    return;
                const [whole = ''] = source.match(syntax) || [];
                return whole === '' ? undefined : [
                    [],
                    source.slice(whole.length)
                ];
            };
        },
        {}
    ],
    70: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const combinator_1 = require('../../combinator');
            const escapable_1 = require('../source/escapable');
            const validation_1 = require('../source/validation');
            const syntax = /^\(\S*?\)/;
            const closer = /^\)|^\s/;
            exports.parenthesis = source => {
                if (!validation_1.match(source, '(', syntax))
                    return;
                return combinator_1.transform(combinator_1.bracket('(', combinator_1.loop(combinator_1.combine([
                    exports.parenthesis,
                    escapable_1.escsource
                ]), closer), ')'), (_, rest) => [
                    [document.createTextNode(source.slice(0, source.length - rest.length))],
                    rest
                ])(source);
            };
        },
        {
            '../../combinator': 14,
            '../source/escapable': 68,
            '../source/validation': 73
        }
    ],
    71: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const separator = /[^0-9a-zA-Z\u0080-\uFFFF]|[\u0300-\u036F]|(?:[0-9a-zA-Z][!?]*h|\?h|[0-9a-gi-zA-Z!?])ttps?:|[0-9a-zA-Z@]?@[0-9a-zA-Z]|[、。]/;
            const linebreaks = /^(?:(?:\\?\s)*?\\?\n)+/;
            const newline = document.createElement('span');
            void newline.setAttribute('class', 'newline');
            void newline.appendChild(document.createTextNode(' '));
            exports.text = source => {
                if (source.length === 0)
                    return;
                const i = source.search(separator);
                switch (i) {
                case -1:
                    return [
                        [document.createTextNode(source)],
                        ''
                    ];
                case 0:
                    switch (source[0]) {
                    case '\\':
                        switch (source[1]) {
                        case '\n':
                            return [
                                [document.createElement('br')],
                                source.replace(linebreaks, '')
                            ];
                        default:
                            return [
                                [document.createTextNode(source.slice(1, 2))],
                                source.slice(2)
                            ];
                        }
                    case '\u3001':
                    case '\u3002':
                    case '\uFF01':
                    case '\uFF1F':
                        switch (source[1]) {
                        case '\n':
                            return [
                                [document.createTextNode(source.slice(0, 1))],
                                source.slice(2)
                            ];
                        default:
                            return [
                                [document.createTextNode(source.slice(0, 1))],
                                source.slice(1)
                            ];
                        }
                    case '\n':
                        return [
                            [newline.cloneNode(true)],
                            source.slice(1)
                        ];
                    default:
                        return [
                            [document.createTextNode(source.slice(0, 1))],
                            source.slice(1)
                        ];
                    }
                default:
                    return [
                        [document.createTextNode(source.slice(0, i))],
                        source.slice(i)
                    ];
                }
            };
        },
        {}
    ],
    72: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const separator = /`|<\/code>|\s/i;
            exports.unescsource = source => {
                if (source.length === 0)
                    return;
                const i = source.search(separator);
                switch (i) {
                case -1:
                    return [
                        [document.createTextNode(source)],
                        ''
                    ];
                case 0:
                    return [
                        [document.createTextNode(source.slice(0, 1))],
                        source.slice(1)
                    ];
                default:
                    return [
                        [document.createTextNode(source.slice(0, i))],
                        source.slice(i)
                    ];
                }
            };
        },
        {}
    ],
    73: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function match(source, start, syntax) {
                return source.startsWith(start) && (!syntax || source.search(syntax) === 0);
            }
            exports.match = match;
            function isVisible(source) {
                return source.trim() !== '';
            }
            exports.isVisible = isVisible;
            function isTightVisible(source) {
                return isVisible(source) && source === source.trim();
            }
            exports.isTightVisible = isTightVisible;
            function isSingleLine(source) {
                return !source.includes('\n');
            }
            exports.isSingleLine = isSingleLine;
        },
        {}
    ],
    74: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function squash(nodes) {
                const frag = document.createDocumentFragment();
                for (const curr of nodes) {
                    const prev = frag.lastChild;
                    if (prev && prev.nodeType === 3 && curr.nodeType === 3) {
                        prev.textContent += curr.textContent;
                        curr.textContent = '';
                    } else {
                        void frag.appendChild(curr);
                    }
                }
                return frag;
            }
            exports.squash = squash;
        },
        {}
    ],
    75: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function makeIndex(text) {
                return `index:${ text.trim().replace(/\s+/g, '-') }`;
            }
            exports.makeIndex = makeIndex;
        },
        {}
    ],
    76: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function sanitize(url) {
                url = url.trim().replace(/\s/g, encodeURIComponent);
                return isAcceptedProtocol(url) ? url : '';
            }
            exports.sanitize = sanitize;
            const parser = document.createElement('a');
            function isAcceptedProtocol(url) {
                parser.setAttribute('href', url);
                return [
                    'http:',
                    'https:'
                ].includes(parser.protocol);
            }
        },
        {}
    ],
    77: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var render_1 = require('./renderer/render');
            exports.render = render_1.render;
        },
        { './renderer/render': 78 }
    ],
    78: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const media_1 = require('./render/media');
            const code_1 = require('./render/code');
            const math_1 = require('./render/math');
            function render(target, opts = {}) {
                void [
                    target,
                    ...target.querySelectorAll('img, pre, .math')
                ].forEach(target => void new Promise(() => {
                    switch (true) {
                    case target.matches('img:not([src])[data-src]'): {
                            const el = media_1.media(target, opts.media);
                            const scope = el instanceof HTMLImageElement === false && target.closest('a, h1, h2, h3, h4, h5, h6, p, li, dl, td') instanceof HTMLAnchorElement ? target.closest('a') : target;
                            return void scope.parentElement.replaceChild(el, scope);
                        }
                    case target.matches('pre') && target.children.length === 0:
                        return void (opts.code || code_1.code)(target);
                    case target.matches('.math') && target.children.length === 0:
                        return void (opts.math || math_1.math)(target);
                    default:
                        return;
                    }
                }));
                return target;
            }
            exports.render = render;
        },
        {
            './render/code': 79,
            './render/math': 80,
            './render/media': 81
        }
    ],
    79: [
        function (require, module, exports) {
            (function (global) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const Prism = typeof window !== 'undefined' ? window['Prism'] : typeof global !== 'undefined' ? global['Prism'] : null;
                function code(target) {
                    void requestAnimationFrame(() => void Prism.highlightElement(target, false));
                }
                exports.code = code;
            }.call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}));
        },
        {}
    ],
    80: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const mathinline_1 = require('../../parser/inline/mathinline');
            function math(target) {
                if (target instanceof HTMLDivElement)
                    return void queue(target);
                void target.setAttribute('data-src', target.textContent);
                const expr = target.textContent;
                if (mathinline_1.cache.has(expr))
                    return void (target.innerHTML = mathinline_1.cache.get(expr).innerHTML);
                void queue(target, () => void mathinline_1.cache.set(expr, target.cloneNode(true)));
            }
            exports.math = math;
            function queue(target, callback = () => undefined) {
                void MathJax.Hub.Queue([
                    'Typeset',
                    MathJax.Hub,
                    target,
                    callback
                ]);
            }
        },
        { '../../parser/inline/mathinline': 60 }
    ],
    81: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const twitter_1 = require('./media/twitter');
            const youtube_1 = require('./media/youtube');
            const gist_1 = require('./media/gist');
            const slideshare_1 = require('./media/slideshare');
            const pdf_1 = require('./media/pdf');
            const video_1 = require('./media/video');
            const audio_1 = require('./media/audio');
            const image_1 = require('./media/image');
            function media(target, opts = {}) {
                const url = target.getAttribute('data-src');
                const alt = target.getAttribute('alt') || '';
                switch (true) {
                case url.startsWith('https://twitter.com/'):
                    return (opts.twitter || twitter_1.twitter)(url);
                case url.startsWith('https://www.youtube.com/') || url.startsWith('https://youtu.be/'):
                    return (opts.youtube || youtube_1.youtube)(url);
                case url.startsWith('https://gist.github.com/'):
                    return (opts.gist || gist_1.gist)(url);
                case url.startsWith('https://www.slideshare.net/'):
                    return (opts.slideshare || slideshare_1.slideshare)(url);
                case url.split('/').length > 3 && ['.pdf'].some(ext => url.split(/[?#]/, 1)[0].toLowerCase().endsWith(ext)):
                    return (opts.pdf || pdf_1.pdf)(url);
                case url.split('/').length > 3 && [
                        '.webm',
                        '.ogv'
                    ].some(ext => url.split(/[?#]/, 1)[0].toLowerCase().endsWith(ext)):
                    return (opts.video || video_1.video)(url, alt);
                case url.split('/').length > 3 && [
                        '.oga',
                        '.ogg'
                    ].some(ext => url.split(/[?#]/, 1)[0].toLowerCase().endsWith(ext)):
                    return (opts.audio || audio_1.audio)(url, alt);
                default:
                    return (opts.image || image_1.image)(url, alt);
                }
            }
            exports.media = media;
        },
        {
            './media/audio': 82,
            './media/gist': 83,
            './media/image': 84,
            './media/pdf': 85,
            './media/slideshare': 86,
            './media/twitter': 87,
            './media/video': 88,
            './media/youtube': 89
        }
    ],
    82: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const media_1 = require('../../../parser/inline/media');
            const typed_dom_1 = require('typed-dom');
            function audio(url, alt) {
                return media_1.cache.has(url) ? media_1.cache.get(url).cloneNode(true) : media_1.cache.set(url, typed_dom_1.default.audio({
                    class: 'media',
                    src: url,
                    alt,
                    controls: '',
                    style: 'width: 100%;'
                }).element.cloneNode(true));
            }
            exports.audio = audio;
        },
        {
            '../../../parser/inline/media': 61,
            'typed-dom': 8
        }
    ],
    83: [
        function (require, module, exports) {
            (function (global) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const parser_1 = require('../../../parser');
                const media_1 = require('../../../parser/inline/media');
                const dompurify_1 = typeof window !== 'undefined' ? window['DOMPurify'] : typeof global !== 'undefined' ? global['DOMPurify'] : null;
                const typed_dom_1 = require('typed-dom');
                function gist(url) {
                    if (media_1.cache.has(url))
                        return media_1.cache.get(url).cloneNode(true);
                    return typed_dom_1.default.div({
                        class: 'media',
                        style: 'position: relative;'
                    }, [typed_dom_1.default.em(`loading ${ url }`)], () => {
                        const outer = document.createElement('div');
                        void $.ajax(`${ url }.json`, {
                            dataType: 'jsonp',
                            timeout: 10 * 1000,
                            cache: true,
                            success({div, stylesheet, description}) {
                                if (!stylesheet.startsWith('https://assets-cdn.github.com/'))
                                    return;
                                outer.innerHTML = dompurify_1.sanitize(`<div style="position: relative; margin-bottom: -1em;">${ div }</div>`);
                                const gist = outer.querySelector('.gist');
                                void gist.insertBefore(typed_dom_1.default.div({ class: 'gist-description' }, [typed_dom_1.default.a({ style: 'text-decoration: none; color: #555; font-size: 14px; font-weight: 600;' }, description, () => parser_1.parse(parser_1.escape(url)).querySelector('a'))]).element, gist.firstChild);
                                void media_1.cache.set(url, outer.cloneNode(true));
                                if (document.head.querySelector(`link[rel="stylesheet"][href="${ stylesheet }"]`))
                                    return;
                                void document.head.appendChild(typed_dom_1.default.link({
                                    rel: 'stylesheet',
                                    href: stylesheet,
                                    crossorigin: 'anonymous'
                                }).element);
                            },
                            error({status, statusText}) {
                                outer.innerHTML = parser_1.parse(`*${ parser_1.escape(url) }\\\n-> ${ status }: ${ parser_1.escape(statusText) }*`).querySelector('p').innerHTML;
                            }
                        });
                        return outer;
                    }).element;
                }
                exports.gist = gist;
            }.call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}));
        },
        {
            '../../../parser': 20,
            '../../../parser/inline/media': 61,
            'typed-dom': 8
        }
    ],
    84: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const media_1 = require('../../../parser/inline/media');
            const typed_dom_1 = require('typed-dom');
            function image(url, alt) {
                return media_1.cache.has(url) ? media_1.cache.get(url).cloneNode(true) : media_1.cache.set(url, typed_dom_1.default.img({
                    class: 'media',
                    src: url,
                    alt,
                    style: 'max-width: 100%;'
                }).element.cloneNode(true));
            }
            exports.image = image;
        },
        {
            '../../../parser/inline/media': 61,
            'typed-dom': 8
        }
    ],
    85: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const parser_1 = require('../../../parser');
            const typed_dom_1 = require('typed-dom');
            function pdf(url) {
                return typed_dom_1.default.div({
                    class: 'media',
                    style: 'position: relative;'
                }, [
                    typed_dom_1.default.div({ style: 'position: relative; resize: vertical; overflow: hidden; padding-bottom: 10px;' }, [typed_dom_1.default.object({
                            type: 'application/pdf',
                            data: url,
                            style: 'width: 100%; height: 100%; min-height: 400px;'
                        }, () => {
                            const el = document.createElement('object');
                            el.typeMustMatch = true;
                            return el;
                        })]),
                    typed_dom_1.default.div([typed_dom_1.default.strong({ style: 'word-wrap: break-word;' }, () => parser_1.parse(`**${ parser_1.escape(url) }**`).querySelector('strong'))])
                ]).element;
            }
            exports.pdf = pdf;
        },
        {
            '../../../parser': 20,
            'typed-dom': 8
        }
    ],
    86: [
        function (require, module, exports) {
            (function (global) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const parser_1 = require('../../../parser');
                const media_1 = require('../../../parser/inline/media');
                const dompurify_1 = typeof window !== 'undefined' ? window['DOMPurify'] : typeof global !== 'undefined' ? global['DOMPurify'] : null;
                const typed_dom_1 = require('typed-dom');
                function slideshare(url) {
                    if (media_1.cache.has(url))
                        return media_1.cache.get(url).cloneNode(true);
                    return typed_dom_1.default.div({
                        class: 'media',
                        style: 'position: relative;'
                    }, [typed_dom_1.default.em(`loading ${ url }`)], () => {
                        const outer = document.createElement('div');
                        void $.ajax(`https://www.slideshare.net/api/oembed/2?url=${ url }&format=json`, {
                            dataType: 'jsonp',
                            timeout: 10 * 1000,
                            cache: true,
                            success({html}) {
                                outer.innerHTML = dompurify_1.sanitize(`<div style="position: relative; padding-top: 83%;">${ html }</div>`, { ADD_TAGS: ['iframe'] });
                                const iframe = outer.querySelector('iframe');
                                void iframe.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%;');
                                iframe.parentElement.style.paddingTop = `${ +iframe.height / +iframe.width * 100 }%`;
                                void outer.appendChild(iframe.nextElementSibling);
                                void outer.lastElementChild.removeAttribute('style');
                                void media_1.cache.set(url, outer.cloneNode(true));
                            },
                            error({status, statusText}) {
                                outer.innerHTML = parser_1.parse(`*${ parser_1.escape(url) }\\\n-> ${ status }: ${ parser_1.escape(statusText) }*`).querySelector('p').innerHTML;
                            }
                        });
                        return outer;
                    }).element;
                }
                exports.slideshare = slideshare;
            }.call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}));
        },
        {
            '../../../parser': 20,
            '../../../parser/inline/media': 61,
            'typed-dom': 8
        }
    ],
    87: [
        function (require, module, exports) {
            (function (global) {
                'use strict';
                Object.defineProperty(exports, '__esModule', { value: true });
                const parser_1 = require('../../../parser');
                const cache_1 = require('spica/cache');
                const dompurify_1 = typeof window !== 'undefined' ? window['DOMPurify'] : typeof global !== 'undefined' ? global['DOMPurify'] : null;
                const typed_dom_1 = require('typed-dom');
                let widgetScriptRequested = false;
                const cache = new cache_1.Cache(100);
                function twitter(url) {
                    if (cache.has(url)) {
                        const el = cache.get(url).cloneNode(true);
                        window.twttr && void window.twttr.widgets.load(el);
                        return el;
                    }
                    return typed_dom_1.default.div({
                        class: 'media',
                        style: 'position: relative;'
                    }, [typed_dom_1.default.em(`loading ${ url }`)], () => {
                        const outer = document.createElement('div');
                        void $.ajax(`https://publish.twitter.com/oembed?url=${ url.replace('?', '&') }`, {
                            dataType: 'jsonp',
                            timeout: 10 * 1000,
                            cache: true,
                            success({html}) {
                                outer.innerHTML = dompurify_1.sanitize(`<div style="margin-top: -10px; margin-bottom: -10px;">${ html }</div>`, { ADD_TAGS: ['script'] });
                                void cache.set(url, outer.cloneNode(true));
                                if (window.twttr)
                                    return void window.twttr.widgets.load(outer);
                                if (widgetScriptRequested)
                                    return;
                                widgetScriptRequested = true;
                                const script = outer.querySelector('script');
                                if (!script.getAttribute('src').startsWith('https://platform.twitter.com/'))
                                    return;
                                void $.ajax(script.src, {
                                    dataType: 'script',
                                    cache: true
                                });
                            },
                            error({status, statusText}) {
                                outer.innerHTML = parser_1.parse(`*${ parser_1.escape(url) }\\\n-> ${ status }: ${ parser_1.escape(statusText) }*`).querySelector('p').innerHTML;
                            }
                        });
                        return outer;
                    }).element;
                }
                exports.twitter = twitter;
            }.call(this, typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {}));
        },
        {
            '../../../parser': 20,
            'spica/cache': 5,
            'typed-dom': 8
        }
    ],
    88: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const media_1 = require('../../../parser/inline/media');
            const typed_dom_1 = require('typed-dom');
            function video(url, alt) {
                return media_1.cache.has(url) ? media_1.cache.get(url).cloneNode(true) : media_1.cache.set(url, typed_dom_1.default.video({
                    class: 'media',
                    src: url,
                    alt,
                    muted: '',
                    controls: '',
                    style: 'max-width: 100%;'
                }).element.cloneNode(true));
            }
            exports.video = video;
        },
        {
            '../../../parser/inline/media': 61,
            'typed-dom': 8
        }
    ],
    89: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const typed_dom_1 = require('typed-dom');
            function youtube(url) {
                return typed_dom_1.default.div({
                    class: 'media',
                    style: 'position: relative;'
                }, [typed_dom_1.default.div({ style: 'position: relative; padding-top: 56.25%;' }, [typed_dom_1.default.iframe({
                            src: `https://www.youtube.com/embed/${ url.startsWith('https://www.youtube.com/') && url.replace(/.+?=/, '').replace(/&/, '?') || url.startsWith('https://youtu.be/') && url.slice(url.indexOf('/', 9) + 1) }`,
                            allowfullscreen: '',
                            frameborder: '0',
                            style: 'position: absolute; top: 0; right: 0; width: 100%; height: 100%;'
                        })])]).element;
            }
            exports.youtube = youtube;
        },
        { 'typed-dom': 8 }
    ],
    'securemark': [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var parser_1 = require('./src/parser');
            exports.parse = parser_1.parse;
            exports.escape = parser_1.escape;
            exports.bind = parser_1.bind;
            exports.caches = parser_1.caches;
            var renderer_1 = require('./src/renderer');
            exports.render = renderer_1.render;
        },
        {
            './src/parser': 20,
            './src/renderer': 77
        }
    ]
}, {}, [
    1,
    2,
    'securemark',
    3
]);