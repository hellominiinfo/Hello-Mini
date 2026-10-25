// Built by scripts/build-server.mjs from server/*.ts. Do not edit by hand.
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../vendor/pgjs/src/index.js
import os from "os";
import fs from "fs";

// ../vendor/pgjs/src/query.js
var originCache = /* @__PURE__ */ new Map();
var originStackCache = /* @__PURE__ */ new Map();
var originError = /* @__PURE__ */ Symbol("OriginError");
var CLOSE = {};
var Query = class extends Promise {
  constructor(strings, args, handler, canceller, options = {}) {
    let resolve, reject;
    super((a, b2) => {
      resolve = a;
      reject = b2;
    });
    this.tagged = Array.isArray(strings.raw);
    this.strings = strings;
    this.args = args;
    this.handler = handler;
    this.canceller = canceller;
    this.options = options;
    this.state = null;
    this.statement = null;
    this.resolve = (x) => (this.active = false, resolve(x));
    this.reject = (x) => (this.active = false, reject(x));
    this.active = false;
    this.cancelled = null;
    this.executed = false;
    this.signature = "";
    this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
  }
  get origin() {
    return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || "";
  }
  static get [Symbol.species]() {
    return Promise;
  }
  cancel() {
    return this.canceller && (this.canceller(this), this.canceller = null);
  }
  simple() {
    this.options.simple = true;
    this.options.prepare = false;
    return this;
  }
  async readable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  async writable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  cursor(rows = 1, fn) {
    this.options.simple = false;
    if (typeof rows === "function") {
      fn = rows;
      rows = 1;
    }
    this.cursorRows = rows;
    if (typeof fn === "function")
      return this.cursorFn = fn, this;
    let prev;
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => {
          if (this.executed && !this.active)
            return { done: true };
          prev && prev();
          const promise = new Promise((resolve, reject) => {
            this.cursorFn = (value) => {
              resolve({ value, done: false });
              return new Promise((r) => prev = r);
            };
            this.resolve = () => (this.active = false, resolve({ done: true }));
            this.reject = (x) => (this.active = false, reject(x));
          });
          this.execute();
          return promise;
        },
        return() {
          prev && prev(CLOSE);
          return { done: true };
        }
      })
    };
  }
  describe() {
    this.options.simple = false;
    this.onlyDescribe = this.options.prepare = true;
    return this;
  }
  stream() {
    throw new Error(".stream has been renamed to .forEach");
  }
  forEach(fn) {
    this.forEachFn = fn;
    this.handle();
    return this;
  }
  raw() {
    this.isRaw = true;
    return this;
  }
  values() {
    this.isRaw = "values";
    return this;
  }
  async handle() {
    !this.executed && (this.executed = true) && await 1 && this.handler(this);
  }
  execute() {
    this.handle();
    return this;
  }
  then() {
    this.handle();
    return super.then.apply(this, arguments);
  }
  catch() {
    this.handle();
    return super.catch.apply(this, arguments);
  }
  finally() {
    this.handle();
    return super.finally.apply(this, arguments);
  }
};
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}

// ../vendor/pgjs/src/errors.js
var PostgresError = class extends Error {
  constructor(x) {
    super(x.message);
    this.name = this.constructor.name;
    Object.assign(this, x);
  }
};
var Errors = {
  connection,
  postgres,
  generic,
  notSupported
};
function connection(x, options, socket) {
  const { host, port } = socket || options;
  const error = Object.assign(
    new Error("write " + x + " " + (options.path || host + ":" + port)),
    {
      code: x,
      errno: x,
      address: options.path || host
    },
    options.path ? {} : { port }
  );
  Error.captureStackTrace(error, connection);
  return error;
}
function postgres(x) {
  const error = new PostgresError(x);
  Error.captureStackTrace(error, postgres);
  return error;
}
function generic(code, message) {
  const error = Object.assign(new Error(code + ": " + message), { code });
  Error.captureStackTrace(error, generic);
  return error;
}
function notSupported(x) {
  const error = Object.assign(
    new Error(x + " (B) is not supported"),
    {
      code: "MESSAGE_NOT_SUPPORTED",
      name: x
    }
  );
  Error.captureStackTrace(error, notSupported);
  return error;
}

// ../vendor/pgjs/src/types.js
var types = {
  string: {
    to: 25,
    from: null,
    // defaults to string
    serialize: (x) => "" + x
  },
  number: {
    to: 0,
    from: [21, 23, 26, 700, 701],
    serialize: (x) => "" + x,
    parse: (x) => +x
  },
  json: {
    to: 114,
    from: [114, 3802],
    serialize: (x) => JSON.stringify(x),
    parse: (x) => JSON.parse(x)
  },
  boolean: {
    to: 16,
    from: 16,
    serialize: (x) => x === true ? "t" : "f",
    parse: (x) => x === "t"
  },
  date: {
    to: 1184,
    from: [1082, 1114, 1184],
    serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
    parse: (x) => new Date(x)
  },
  bytea: {
    to: 17,
    from: 17,
    serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
    parse: (x) => Buffer.from(x.slice(2), "hex")
  }
};
var NotTagged = class {
  then() {
    notTagged();
  }
  catch() {
    notTagged();
  }
  finally() {
    notTagged();
  }
};
var Identifier = class extends NotTagged {
  constructor(value) {
    super();
    this.value = escapeIdentifier(value);
  }
};
var Parameter = class extends NotTagged {
  constructor(value, type, array) {
    super();
    this.value = value;
    this.type = type;
    this.array = array;
  }
};
var Builder = class extends NotTagged {
  constructor(first, rest) {
    super();
    this.first = first;
    this.rest = rest;
  }
  build(before, parameters, types2, options) {
    const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b2) => a.i - b2.i).pop();
    return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types2, options);
  }
};
function handleValue(x, parameters, types2, options) {
  let value = x instanceof Parameter ? x.value : x;
  if (value === void 0) {
    x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
    if (value === void 0)
      throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
  }
  return "$" + types2.push(
    x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
  );
}
var defaultHandlers = typeHandlers(types);
function stringify(q, string, value, parameters, types2, options) {
  for (let i = 1; i < q.strings.length; i++) {
    string += stringifyValue(string, value, parameters, types2, options) + q.strings[i];
    value = q.args[i];
  }
  return string;
}
function stringifyValue(string, value, parameters, types2, o) {
  return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
}
function fragment(q, parameters, types2, options) {
  q.fragment = true;
  return stringify(q, q.strings[0], q.args[0], parameters, types2, options);
}
function valuesBuilder(first, parameters, types2, columns, options) {
  return first.map(
    (row) => "(" + columns.map(
      (column) => stringifyValue("values", row[column], parameters, types2, options)
    ).join(",") + ")"
  ).join(",");
}
function values(first, rest, parameters, types2, options) {
  const multi = Array.isArray(first[0]);
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
  return valuesBuilder(multi ? first : [first], parameters, types2, columns, options);
}
function select(first, rest, parameters, types2, options) {
  typeof first === "string" && (first = [first].concat(rest));
  if (Array.isArray(first))
    return escapeIdentifiers(first, options);
  let value;
  const columns = rest.length ? rest.flat() : Object.keys(first);
  return columns.map((x) => {
    value = first[x];
    return (value instanceof Query ? fragment(value, parameters, types2, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options)) + " as " + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
  }).join(",");
}
var builders = Object.entries({
  values,
  in: (...xs) => {
    const x = values(...xs);
    return x === "()" ? "(null)" : x;
  },
  select,
  as: select,
  returning: select,
  "\\(": select,
  update(first, rest, parameters, types2, options) {
    return (rest.length ? rest.flat() : Object.keys(first)).map(
      (x) => escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options)
    );
  },
  insert(first, rest, parameters, types2, options) {
    const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
    return "(" + escapeIdentifiers(columns, options) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options);
  }
}).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
var serializers = defaultHandlers.serializers;
var parsers = defaultHandlers.parsers;
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
var mergeUserTypes = function(types2) {
  const user = typeHandlers(types2 || {});
  return {
    serializers: Object.assign({}, serializers, user.serializers),
    parsers: Object.assign({}, parsers, user.parsers)
  };
};
function typeHandlers(types2) {
  return Object.keys(types2).reduce((acc, k) => {
    types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
    if (types2[k].serialize) {
      acc.serializers[types2[k].to] = types2[k].serialize;
      types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
    }
    return acc;
  }, { parsers: {}, serializers: {} });
}
function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
}
var escapeIdentifier = function escape(str) {
  return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
};
var inferType = function inferType2(x) {
  return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
};
var escapeBackslash = /\\/g;
var escapeQuote = /"/g;
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
var arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
  if (Array.isArray(xs) === false)
    return xs;
  if (!xs.length)
    return "{}";
  const first = xs[0];
  const delimiter = typarray === 1020 ? ";" : ",";
  if (Array.isArray(first) && !first.type)
    return "{" + xs.map((x) => arraySerializer2(x, serializer, options, typarray)).join(delimiter) + "}";
  return "{" + xs.map((x) => {
    if (x === void 0) {
      x = options.transform.undefined;
      if (x === void 0)
        throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
    }
    return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
  }).join(delimiter) + "}";
};
var arrayParserState = {
  i: 0,
  char: null,
  str: "",
  quoted: false,
  last: 0
};
var arrayParser = function arrayParser2(x, parser, typarray) {
  arrayParserState.i = arrayParserState.last = 0;
  return arrayParserLoop(arrayParserState, x, parser, typarray);
};
function arrayParserLoop(s, x, parser, typarray) {
  const xs = [];
  const delimiter = typarray === 1020 ? ";" : ",";
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i];
    if (s.quoted) {
      if (s.char === "\\") {
        s.str += x[++s.i];
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str);
        s.str = "";
        s.quoted = x[s.i + 1] === '"';
        s.last = s.i + 2;
      } else {
        s.str += s.char;
      }
    } else if (s.char === '"') {
      s.quoted = true;
    } else if (s.char === "{") {
      s.last = ++s.i;
      xs.push(arrayParserLoop(s, x, parser, typarray));
    } else if (s.char === "}") {
      s.quoted = false;
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
      break;
    } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
    }
    s.p = s.char;
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
  return xs;
}
var toCamel = (x) => {
  let str = x[0];
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toPascal = (x) => {
  let str = x[0].toUpperCase();
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toKebab = (x) => x.replace(/_/g, "-");
var fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
var fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
var fromKebab = (x) => x.replace(/-/g, "_");
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
toCamel.column = { from: toCamel };
toCamel.value = { from: createJsonTransform(toCamel) };
fromCamel.column = { to: fromCamel };
var camel = { ...toCamel };
camel.column.to = fromCamel;
toPascal.column = { from: toPascal };
toPascal.value = { from: createJsonTransform(toPascal) };
fromPascal.column = { to: fromPascal };
var pascal = { ...toPascal };
pascal.column.to = fromPascal;
toKebab.column = { from: toKebab };
toKebab.value = { from: createJsonTransform(toKebab) };
fromKebab.column = { to: fromKebab };
var kebab = { ...toKebab };
kebab.column.to = fromKebab;

// ../vendor/pgjs/src/connection.js
import net from "net";
import tls from "tls";
import crypto from "crypto";
import Stream from "stream";
import { performance } from "perf_hooks";

// ../vendor/pgjs/src/result.js
var Result = class extends Array {
  constructor() {
    super();
    Object.defineProperties(this, {
      count: { value: null, writable: true },
      state: { value: null, writable: true },
      command: { value: null, writable: true },
      columns: { value: null, writable: true },
      statement: { value: null, writable: true }
    });
  }
  static get [Symbol.species]() {
    return Array;
  }
};

// ../vendor/pgjs/src/queue.js
var queue_default = Queue;
function Queue(initial = []) {
  let xs = initial.slice();
  let index = 0;
  return {
    get length() {
      return xs.length - index;
    },
    remove: (x) => {
      const index2 = xs.indexOf(x);
      return index2 === -1 ? null : (xs.splice(index2, 1), x);
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index++];
      if (index === xs.length) {
        index = 0;
        xs = [];
      } else {
        xs[index - 1] = void 0;
      }
      return out;
    }
  };
}

// ../vendor/pgjs/src/bytes.js
var size = 256;
var buffer = Buffer.allocUnsafe(size);
var messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
  const v = x.charCodeAt(0);
  acc[x] = () => {
    buffer[0] = v;
    b.i = 5;
    return b;
  };
  return acc;
}, {});
var b = Object.assign(reset, messages, {
  N: String.fromCharCode(0),
  i: 0,
  inc(x) {
    b.i += x;
    return b;
  },
  str(x) {
    const length = Buffer.byteLength(x);
    fit(length);
    b.i += buffer.write(x, b.i, length, "utf8");
    return b;
  },
  i16(x) {
    fit(2);
    buffer.writeUInt16BE(x, b.i);
    b.i += 2;
    return b;
  },
  i32(x, i) {
    if (i || i === 0) {
      buffer.writeUInt32BE(x, i);
      return b;
    }
    fit(4);
    buffer.writeUInt32BE(x, b.i);
    b.i += 4;
    return b;
  },
  z(x) {
    fit(x);
    buffer.fill(0, b.i, b.i + x);
    b.i += x;
    return b;
  },
  raw(x) {
    buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
    b.i = buffer.length;
    return b;
  },
  end(at = 1) {
    buffer.writeUInt32BE(b.i - at, at);
    const out = buffer.subarray(0, b.i);
    b.i = 0;
    buffer = Buffer.allocUnsafe(size);
    return out;
  }
});
var bytes_default = b;
function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer, length = prev.length;
    buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
    prev.copy(buffer);
  }
}
function reset() {
  b.i = 0;
  return b;
}

// ../vendor/pgjs/src/connection.js
var connection_default = Connection;
var uid = 1;
var Sync = bytes_default().S().end();
var Flush = bytes_default().H().end();
var SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
var ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
var DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
var noop = () => {
};
var retryRoutines = /* @__PURE__ */ new Set([
  "FetchPreparedStatement",
  "RevalidateCachedQuery",
  "transformAssignedExpr"
]);
var errorFields = {
  83: "severity_local",
  // S
  86: "severity",
  // V
  67: "code",
  // C
  77: "message",
  // M
  68: "detail",
  // D
  72: "hint",
  // H
  80: "position",
  // P
  112: "internal_position",
  // p
  113: "internal_query",
  // q
  87: "where",
  // W
  115: "schema_name",
  // s
  116: "table_name",
  // t
  99: "column_name",
  // c
  100: "data type_name",
  // d
  110: "constraint_name",
  // n
  70: "file",
  // F
  76: "line",
  // L
  82: "routine"
  // R
};
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    sslnegotiation,
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers: parsers2,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff: backoff2,
    target_session_attrs
  } = options;
  const sent = queue_default(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
  let socket = null, cancelMessage, errorResponse2 = null, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
  const connection2 = {
    queue: queues.closed,
    idleTimer,
    connect(query2) {
      initial = query2;
      reconnect();
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  };
  queues.closed && queues.closed.push(connection2);
  return connection2;
  async function createSocket() {
    let x;
    try {
      x = options.socket ? await Promise.resolve(options.socket(options)) : new net.Socket();
    } catch (e) {
      error(e);
      return;
    }
    x.on("error", error);
    x.on("close", closed);
    x.on("drain", drain);
    return x;
  }
  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes_default().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
      await connect();
      socket.once("error", reject);
      socket.once("close", resolve);
    } catch (error2) {
      reject(error2);
    }
  }
  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection("CONNECTION_DESTROYED", options));
    if (stream)
      return queryError(q, Errors.generic("COPY_IN_PROGRESS", "You cannot execute queries during copy"));
    if (q.cancelled)
      return;
    try {
      q.state = backend;
      query ? sent.push(q) : (query = q, query.active = true);
      build(q);
      return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection2));
    } catch (error2) {
      sent.length === 0 && write(Sync);
      errored(error2);
      return true;
    }
  }
  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
    return q.options.simple ? bytes_default().Q().str(q.statement.string + bytes_default.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
  }
  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe("S", q.statement.name)
    ]);
  }
  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
    ]);
  }
  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ]);
  }
  function build(q) {
    const parameters = [], types2 = [];
    const string = stringify(q, q.strings[0], q.args[0], parameters, types2, options);
    !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types2, options));
    q.prepare = options.prepare && ("prepare" in q.options ? q.options.prepare : true);
    q.string = string;
    q.signature = q.prepare && types2 + string;
    q.onlyDescribe && delete statements[q.signature];
    q.parameters = q.parameters || parameters;
    q.prepared = q.prepare && q.signature in statements;
    q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
    q.statement = q.prepared ? statements[q.signature] : { string, types: types2, name: q.prepare ? statementId + statementCount++ : "" };
    typeof options.debug === "function" && options.debug(id, string, parameters, types2);
  }
  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
    if (fn || chunk.length >= 1024)
      return nextWrite(fn);
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
    return true;
  }
  function nextWrite(fn) {
    const x = socket.write(chunk, fn);
    nextWriteTimer !== null && clearImmediate(nextWriteTimer);
    chunk = nextWriteTimer = null;
    return x;
  }
  function connectTimedOut() {
    errored(Errors.connection("CONNECT_TIMEOUT", options, socket));
    socket.destroy();
  }
  async function secure() {
    if (sslnegotiation !== "direct") {
      write(SSLRequest);
      const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
      if (!canSSL && ssl === "prefer")
        return connected();
    }
    const options2 = {
      socket,
      servername: net.isIP(socket.host) ? void 0 : socket.host
    };
    if (sslnegotiation === "direct")
      options2.ALPNProtocols = ["postgresql"];
    if (ssl === "require" || ssl === "allow" || ssl === "prefer")
      options2.rejectUnauthorized = false;
    else if (typeof ssl === "object")
      Object.assign(options2, ssl);
    socket.removeAllListeners();
    socket = tls.connect(options2);
    socket.on("secureConnect", connected);
    socket.on("error", error);
    socket.on("close", closed);
    socket.on("drain", drain);
  }
  function drain() {
    !query && onopen(connection2);
  }
  function data(x) {
    if (incomings) {
      incomings.push(x);
      remaining -= x.length;
      if (remaining > 0)
        return;
    }
    incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1);
      if (length >= incoming.length) {
        remaining = length - incoming.length;
        incomings = [incoming];
        break;
      }
      try {
        handle2(incoming.subarray(0, length + 1));
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        errored(e);
      }
      incoming = incoming.subarray(length + 1);
      remaining = 0;
      incomings = null;
    }
  }
  async function connect() {
    terminated = false;
    backendParameters = {};
    socket || (socket = await createSocket());
    if (!socket)
      return;
    connectTimer.start();
    if (options.socket)
      return ssl ? secure() : connected();
    socket.on("connect", ssl ? secure : connected);
    if (options.path)
      return socket.connect(options.path);
    socket.ssl = ssl;
    socket.connect(port[hostIndex], host[hostIndex]);
    socket.host = host[hostIndex];
    socket.port = port[hostIndex];
    hostIndex = (hostIndex + 1) % port.length;
  }
  function reconnect() {
    setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - performance.now()) : 0);
  }
  function connected() {
    try {
      statements = {};
      needsTypes = options.fetch_types;
      statementId = Math.random().toString(36).slice(2);
      statementCount = 1;
      lifeTimer.start();
      socket.on("data", data);
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
      const s = StartupMessage();
      write(s);
    } catch (err) {
      error(err);
    }
  }
  function error(err) {
    if (connection2.queue === queues.connecting && options.host[retries + 1])
      return;
    errored(err);
    while (sent.length)
      queryError(sent.shift(), err);
  }
  function errored(err) {
    stream && (stream.destroy(err), stream = null);
    query && queryError(query, err);
    initial && (queryError(initial, err), initial = null);
  }
  function queryError(query2, err) {
    if (query2.reserve)
      return query2.reject(err);
    if (!err || typeof err !== "object")
      err = new Error(err);
    "query" in err || "parameters" in err || Object.defineProperties(err, {
      stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options.debug },
      query: { value: query2.string, enumerable: options.debug },
      parameters: { value: query2.parameters, enumerable: options.debug },
      args: { value: query2.args, enumerable: options.debug },
      types: { value: query2.statement && query2.statement.types, enumerable: options.debug }
    });
    query2.reject(err);
  }
  function end() {
    return ending || (!connection2.reserved && onend(connection2), !connection2.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
  }
  function terminate() {
    terminated = true;
    if (stream || query || initial || sent.length)
      error(Errors.connection("CONNECTION_DESTROYED", options));
    clearImmediate(nextWriteTimer);
    if (socket) {
      socket.removeListener("data", data);
      socket.removeListener("connect", connected);
      socket.readyState === "open" && socket.end(bytes_default().X().end());
    }
    ended && (ended(), ending = ended = null);
  }
  async function closed(hadError) {
    incoming = Buffer.alloc(0);
    remaining = 0;
    incomings = null;
    clearImmediate(nextWriteTimer);
    socket.removeListener("data", data);
    socket.removeListener("connect", connected);
    idleTimer.cancel();
    lifeTimer.cancel();
    connectTimer.cancel();
    socket.removeAllListeners();
    socket = null;
    if (initial)
      return reconnect();
    !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options, socket));
    closedTime = performance.now();
    hadError && options.shared.retries++;
    delay = (typeof backoff2 === "function" ? backoff2(options.shared.retries) : backoff2) * 1e3;
    onclose(connection2, Errors.connection("CONNECTION_CLOSED", options, socket));
  }
  function handle2(xs, x = xs[0]) {
    (x === 68 ? DataRow : (
      // D
      x === 100 ? CopyData : (
        // d
        x === 65 ? NotificationResponse : (
          // A
          x === 83 ? ParameterStatus : (
            // S
            x === 90 ? ReadyForQuery : (
              // Z
              x === 67 ? CommandComplete : (
                // C
                x === 50 ? BindComplete : (
                  // 2
                  x === 49 ? ParseComplete : (
                    // 1
                    x === 116 ? ParameterDescription : (
                      // t
                      x === 84 ? RowDescription : (
                        // T
                        x === 82 ? Authentication : (
                          // R
                          x === 110 ? NoData : (
                            // n
                            x === 75 ? BackendKeyData : (
                              // K
                              x === 69 ? ErrorResponse : (
                                // E
                                x === 115 ? PortalSuspended : (
                                  // s
                                  x === 51 ? CloseComplete : (
                                    // 3
                                    x === 71 ? CopyInResponse : (
                                      // G
                                      x === 78 ? NoticeResponse : (
                                        // N
                                        x === 72 ? CopyOutResponse : (
                                          // H
                                          x === 99 ? CopyDone : (
                                            // c
                                            x === 73 ? EmptyQueryResponse : (
                                              // I
                                              x === 86 ? FunctionCallResponse : (
                                                // V
                                                x === 118 ? NegotiateProtocolVersion : (
                                                  // v
                                                  x === 87 ? CopyBothResponse : (
                                                    // W
                                                    /* c8 ignore next */
                                                    UnknownMessage
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))(xs);
  }
  function DataRow(x) {
    let index = 7;
    let length2;
    let column;
    let value;
    const row = query.isRaw ? new Array(query.statement.columns.length) : {};
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i];
      length2 = x.readInt32BE(index);
      index += 4;
      value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index, index += length2) : column.parser === void 0 ? x.toString("utf8", index, index += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index + 1, index += length2)) : column.parser(x.toString("utf8", index, index += length2));
      query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
  }
  function ParameterStatus(x) {
    const [k, v] = x.toString("utf8", 5, x.length - 1).split(bytes_default.N);
    backendParameters[k] = v;
    if (options.parameters[k] !== v) {
      options.parameters[k] = v;
      onparameter && onparameter(k, v);
    }
  }
  function ReadyForQuery(x) {
    if (query) {
      if (errorResponse2) {
        query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse2.routine) ? retry(query, errorResponse2) : errored(errorResponse2);
      } else {
        query.resolve(results || result);
      }
    } else if (errorResponse2) {
      errored(errorResponse2);
    }
    query = results = errorResponse2 = null;
    result = new Result();
    connectTimer.cancel();
    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState();
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate();
      }
      if (needsTypes) {
        initial.reserve && (initial = null);
        return fetchArrayTypes();
      }
      initial && !initial.reserve && execute(initial);
      options.shared.retries = retries = 0;
      initial = null;
      return;
    }
    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
    if (query)
      return;
    connection2.reserved ? !connection2.reserved.release && x[5] === 73 ? ending ? terminate() : (connection2.reserved = null, onopen(connection2)) : connection2.reserved() : ending ? terminate() : onopen(connection2);
  }
  function CommandComplete(x) {
    rows = 0;
    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString("utf8", i + 1, x.length - 1);
      if (x[i - 1] >= 65) {
        result.command = x.toString("utf8", 5, i);
        result.state = backend;
        break;
      }
    }
    final && (final(), final = null);
    if (result.command === "BEGIN" && max !== 1 && !connection2.reserved)
      return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin, sql.reserved or max: 1"));
    if (query.options.simple)
      return BindComplete();
    if (query.cursorFn) {
      result.count && query.cursorFn(result);
      write(Sync);
    }
  }
  function ParseComplete() {
    query.parsing = false;
  }
  function BindComplete() {
    !result.statement && (result.statement = query.statement);
    result.columns = query.statement.columns;
  }
  function ParameterDescription(x) {
    const length2 = x.readUInt16BE(5);
    for (let i = 0; i < length2; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
    query.prepare && (statements[query.signature] = query.statement);
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
  }
  function RowDescription(x) {
    if (result.command) {
      results = results || [result];
      results.push(result = new Result());
      result.count = null;
      query.statement.columns = null;
    }
    const length2 = x.readUInt16BE(5);
    let index = 7;
    let start;
    query.statement.columns = Array(length2);
    for (let i = 0; i < length2; ++i) {
      start = index;
      while (x[index++] !== 0) ;
      const table = x.readUInt32BE(index);
      const number = x.readUInt16BE(index + 4);
      const type = x.readUInt32BE(index + 6);
      query.statement.columns[i] = {
        name: transform.column.from ? transform.column.from(x.toString("utf8", start, index - 1)) : x.toString("utf8", start, index - 1),
        parser: parsers2[type],
        table,
        number,
        type
      };
      index += 18;
    }
    result.statement = query.statement;
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  async function Authentication(x, type = x.readUInt32BE(5)) {
    (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
  }
  async function AuthenticationCleartextPassword() {
    const payload = await Pass();
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function AuthenticationMD5Password(x) {
    const payload = "md5" + await md5(
      Buffer.concat([
        Buffer.from(await md5(await Pass() + user)),
        x.subarray(9)
      ])
    );
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function SASL() {
    nonce = (await crypto.randomBytes(18)).toString("base64");
    bytes_default().p().str("SCRAM-SHA-256" + bytes_default.N);
    const i = bytes_default.i;
    write(bytes_default.inc(4).str("n,,n=*,r=" + nonce).i32(bytes_default.i - i - 4, i).end());
  }
  async function SASLContinue(x) {
    const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
    const saltedPassword = await crypto.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, "base64"),
      parseInt(res.i),
      32,
      "sha256"
    );
    const clientKey = await hmac(saltedPassword, "Client Key");
    const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
    serverSignature = (await hmac(await hmac(saltedPassword, "Server Key"), auth)).toString("base64");
    const payload = "c=biws,r=" + res.r + ",p=" + xor(
      clientKey,
      Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString("base64");
    write(
      bytes_default().p().str(payload).end()
    );
  }
  function SASLFinal(x) {
    if (x.toString("utf8", 9).split(bytes_default.N, 1)[0].slice(2) === serverSignature)
      return;
    errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
    socket.destroy();
  }
  function Pass() {
    return Promise.resolve(
      typeof options.pass === "function" ? options.pass() : options.pass
    );
  }
  function NoData() {
    result.statement = query.statement;
    result.statement.columns = [];
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5);
    backend.secret = x.readUInt32BE(9);
  }
  async function fetchArrayTypes() {
    needsTypes = false;
    const types2 = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
    types2.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
  }
  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
    const parser = options.parsers[oid];
    options.shared.typeArrayMap[oid] = typarray;
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray);
    options.parsers[typarray].array = true;
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray);
  }
  function tryNext(x, xs) {
    return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options.host[retries];
  }
  function fetchState() {
    const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
    query2.resolve = ([[a], [b2]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only;
      backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
    };
    query2.execute();
  }
  function ErrorResponse(x) {
    if (query) {
      (query.cursorFn || query.describeFirst) && write(Sync);
      errorResponse2 = Errors.postgres(parseError(x));
    } else {
      errored(Errors.postgres(parseError(x)));
    }
  }
  function retry(q, error2) {
    delete statements[q.signature];
    q.retried = error2;
    execute(q);
  }
  function NotificationResponse(x) {
    if (!onnotify)
      return;
    let index = 9;
    while (x[index++] !== 0) ;
    onnotify(
      x.toString("utf8", 9, index - 1),
      x.toString("utf8", index, x.length - 1)
    );
  }
  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result));
      rows = 0;
      x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
    } catch (err) {
      write(Sync);
      query.reject(err);
    }
  }
  function CloseComplete() {
    result.count && query.cursorFn(result);
    query.resolve(result);
  }
  function CopyInResponse() {
    stream = new Stream.Writable({
      autoDestroy: true,
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
        stream = null;
      }
    });
    query.resolve(stream);
  }
  function CopyOutResponse() {
    stream = new Stream.Readable({
      read() {
        socket.resume();
      }
    });
    query.resolve(stream);
  }
  function CopyBothResponse() {
    stream = new Stream.Duplex({
      autoDestroy: true,
      read() {
        socket.resume();
      },
      /* c8 ignore next 11 */
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
      }
    });
    query.resolve(stream);
  }
  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause());
  }
  function CopyDone() {
    stream && stream.push(null);
    stream = null;
  }
  function NoticeResponse(x) {
    onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
  }
  function EmptyQueryResponse() {
  }
  function FunctionCallResponse() {
    errored(Errors.notSupported("FunctionCallResponse"));
  }
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported("NegotiateProtocolVersion"));
  }
  function UnknownMessage(x) {
    console.error("Postgres.js : Unknown Message:", x[0]);
  }
  function UnknownAuth(x, type) {
    console.error("Postgres.js : Unknown Auth:", type);
  }
  function Bind(parameters, types2, statement = "", portal = "") {
    let prev, type;
    bytes_default().B().str(portal + bytes_default.N).str(statement + bytes_default.N).i16(0).i16(parameters.length);
    parameters.forEach((x, i) => {
      if (x === null)
        return bytes_default.i32(4294967295);
      type = types2[i];
      parameters[i] = x = type in options.serializers ? options.serializers[type](x) : "" + x;
      prev = bytes_default.i;
      bytes_default.inc(4).str(x).i32(bytes_default.i - prev - 4, prev);
    });
    bytes_default.i16(0);
    return bytes_default.end();
  }
  function Parse(str, parameters, types2, name = "") {
    bytes_default().P().str(name + bytes_default.N).str(str + bytes_default.N).i16(parameters.length);
    parameters.forEach((x, i) => bytes_default.i32(types2[i] || 0));
    return bytes_default.end();
  }
  function Describe(x, name = "") {
    return bytes_default().D().str(x).str(name + bytes_default.N).end();
  }
  function Execute(portal = "", rows2 = 0) {
    return Buffer.concat([
      bytes_default().E().str(portal + bytes_default.N).i32(rows2).end(),
      Flush
    ]);
  }
  function Close(portal = "") {
    return Buffer.concat([
      bytes_default().C().str("P").str(portal + bytes_default.N).end(),
      bytes_default().S().end()
    ]);
  }
  function StartupMessage() {
    return cancelMessage || bytes_default().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign(
        {
          user,
          database,
          client_encoding: "UTF8"
        },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes_default.N + v).join(bytes_default.N)
    ).z(2).end(0);
  }
}
function parseError(x) {
  const error = {};
  let start = 5;
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
      start = i + 1;
    }
  }
  return error;
}
function md5(x) {
  return crypto.createHash("md5").update(x).digest("hex");
}
function hmac(key, x) {
  return crypto.createHmac("sha256", key).update(x).digest();
}
function sha256(x) {
  return crypto.createHash("sha256").update(x).digest();
}
function xor(a, b2) {
  const length = Math.max(a.length, b2.length);
  const buffer2 = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++)
    buffer2[i] = a[i] ^ b2[i];
  return buffer2;
}
function timer(fn, seconds) {
  seconds = typeof seconds === "function" ? seconds() : seconds;
  if (!seconds)
    return { cancel: noop, start: noop };
  let timer2;
  return {
    cancel() {
      timer2 && (clearTimeout(timer2), timer2 = null);
    },
    start() {
      timer2 && clearTimeout(timer2);
      timer2 = setTimeout(done, seconds * 1e3, arguments);
    }
  };
  function done(args) {
    fn.apply(null, args);
    timer2 = null;
  }
}

// ../vendor/pgjs/src/subscribe.js
var noop2 = () => {
};
function Subscribe(postgres2, options) {
  const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
  let connection2, stream, ended = false;
  const sql2 = subscribe.sql = postgres2({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: "database"
    },
    onclose: async function() {
      if (ended)
        return;
      stream = null;
      state.pid = state.secret = void 0;
      connected(await init(sql2, slot, options.publications));
      subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
    },
    no_subscribe: true
  });
  const end = sql2.end, close = sql2.close;
  sql2.end = async () => {
    ended = true;
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return end();
  };
  sql2.close = async () => {
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return close();
  };
  return subscribe;
  async function subscribe(event, fn, onsubscribe = noop2, onerror = noop2) {
    event = parseEvent(event);
    if (!connection2)
      connection2 = init(sql2, slot, options.publications);
    const subscriber = { fn, onsubscribe };
    const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
    const unsubscribe = () => {
      fns.delete(subscriber);
      fns.size === 0 && subscribers.delete(event);
    };
    return connection2.then((x) => {
      connected(x);
      onsubscribe();
      stream && stream.on("error", onerror);
      return { unsubscribe, state, sql: sql2 };
    });
  }
  function connected(x) {
    stream = x.stream;
    state.pid = x.state.pid;
    state.secret = x.state.secret;
  }
  async function init(sql3, slot2, publications) {
    if (!publications)
      throw new Error("Missing publication names");
    const xs = await sql3.unsafe(
      `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    );
    const [x] = xs;
    const stream2 = await sql3.unsafe(
      `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
    ).writable();
    const state2 = {
      lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
    };
    stream2.on("data", data);
    stream2.on("error", error);
    stream2.on("close", sql3.close);
    return { stream: stream2, state: xs.state };
    function error(e) {
      console.error("Unexpected error during logical streaming - reconnecting", e);
    }
    function data(x2) {
      if (x2[0] === 119) {
        parse(x2.subarray(25), state2, sql3.options.parsers, handle2, options.transform);
      } else if (x2[0] === 107 && x2[17]) {
        state2.lsn = x2.subarray(1, 9);
        pong();
      }
    }
    function handle2(a, b2) {
      const path = b2.relation.schema + "." + b2.relation.table;
      call("*", a, b2);
      call("*:" + path, a, b2);
      b2.relation.keys.length && call("*:" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
      call(b2.command, a, b2);
      call(b2.command + ":" + path, a, b2);
      b2.relation.keys.length && call(b2.command + ":" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
    }
    function pong() {
      const x2 = Buffer.alloc(34);
      x2[0] = "r".charCodeAt(0);
      x2.fill(state2.lsn, 1);
      x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
      stream2.write(x2);
    }
  }
  function call(x, a, b2) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b2, x));
  }
}
function Time(x) {
  return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
}
function parse(x, state, parsers2, handle2, transform) {
  const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
  Object.entries({
    R: (x2) => {
      let i = 1;
      const r = state[x2.readUInt32BE(i)] = {
        schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
        table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
        columns: Array(x2.readUInt16BE(i += 2)),
        keys: []
      };
      i += 2;
      let columnIndex = 0, column;
      while (i < x2.length) {
        column = r.columns[columnIndex++] = {
          key: x2[i++],
          name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
          type: x2.readUInt32BE(i += 1),
          parser: parsers2[x2.readUInt32BE(i)],
          atttypmod: x2.readUInt32BE(i += 4)
        };
        column.key && r.keys.push(column);
        i += 4;
      }
    },
    Y: () => {
    },
    // Type
    O: () => {
    },
    // Origin
    B: (x2) => {
      state.date = Time(x2.readBigInt64BE(9));
      state.lsn = x2.subarray(1, 9);
    },
    I: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      const { row } = tuples(x2, relation.columns, i += 7, transform);
      handle2(row, {
        command: "insert",
        relation
      });
    },
    D: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      handle2(
        key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform).row : null,
        {
          command: "delete",
          relation,
          key
        }
      );
    },
    U: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      const xs = key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform) : null;
      xs && (i = xs.i);
      const { row } = tuples(x2, relation.columns, i + 3, transform);
      handle2(row, {
        command: "update",
        relation,
        key,
        old: xs && xs.row
      });
    },
    T: () => {
    },
    // Truncate,
    C: () => {
    }
    // Commit
  }).reduce(char, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
  let type, column, value;
  const row = transform.raw ? new Array(columns.length) : {};
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++];
    column = columns[i];
    value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
    transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
  }
  return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
}
function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
  if (!xs)
    throw new Error("Malformed subscribe pattern: " + x);
  const [, command, path, key] = xs;
  return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
}

// ../vendor/pgjs/src/large.js
import Stream2 from "stream";
function largeObject(sql2, oid, mode = 131072 | 262144) {
  return new Promise(async (resolve, reject) => {
    await sql2.begin(async (sql3) => {
      let finish;
      !oid && ([{ oid }] = await sql3`select lo_creat(-1) as oid`);
      const [{ fd }] = await sql3`select lo_open(${oid}, ${mode}) as fd`;
      const lo = {
        writable,
        readable,
        close: () => sql3`select lo_close(${fd})`.then(finish),
        tell: () => sql3`select lo_tell64(${fd})`,
        read: (x) => sql3`select loread(${fd}, ${x}) as data`,
        write: (x) => sql3`select lowrite(${fd}, ${x})`,
        truncate: (x) => sql3`select lo_truncate64(${fd}, ${x})`,
        seek: (x, whence = 0) => sql3`select lo_lseek64(${fd}, ${x}, ${whence})`,
        size: () => sql3`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      };
      resolve(lo);
      return new Promise(async (r) => finish = r);
      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start;
        start && await lo.seek(start);
        return new Stream2.Readable({
          highWaterMark,
          async read(size2) {
            const l = size2 > max ? size2 - max : size2;
            max -= size2;
            const [{ data }] = await lo.read(l);
            this.push(data);
            if (data.length < size2)
              this.push(null);
          }
        });
      }
      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start);
        return new Stream2.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback);
          }
        });
      }
    }).catch(reject);
  });
}

// ../vendor/pgjs/src/index.js
Object.assign(Postgres, {
  PostgresError,
  toPascal,
  pascal,
  toCamel,
  camel,
  toKebab,
  kebab,
  fromPascal,
  fromCamel,
  fromKebab,
  BigInt: {
    to: 20,
    from: [20],
    parse: (x) => BigInt(x),
    // eslint-disable-line
    serialize: (x) => x.toString()
  }
});
var src_default = Postgres;
function Postgres(a, b2) {
  const options = parseOptions(a, b2), subscribe = options.no_subscribe || Subscribe(Postgres, { ...options });
  let ending = false;
  const queries = queue_default(), connecting = queue_default(), reserved = queue_default(), closed = queue_default(), ended = queue_default(), open = queue_default(), busy = queue_default(), full = queue_default(), queues = { connecting, reserved, closed, ended, open, busy, full };
  const connections = [...Array(options.max)].map(() => connection_default(options, queues, { onopen, onend, onclose }));
  const sql2 = Sql(handler);
  Object.assign(sql2, {
    get parameters() {
      return options.parameters;
    },
    largeObject: largeObject.bind(null, sql2),
    subscribe,
    CLOSE,
    END: CLOSE,
    PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  });
  return sql2;
  function Sql(handler2) {
    handler2.debug = options.debug;
    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to);
      return acc;
    }, typed);
    Object.assign(sql3, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json: json2,
      file
    });
    return sql3;
    function typed(value, type) {
      return new Parameter(value, type);
    }
    function sql3(strings, ...args) {
      const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler2, cancel) : typeof strings === "string" && !args.length ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings) : new Builder(strings, args);
      return query;
    }
    function unsafe(string, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([string], args, handler2, cancel, {
        prepare: false,
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
    function file(path, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([], args, (query2) => {
        fs.readFile(path, "utf8", (err, string) => {
          if (err)
            return query2.reject(err);
          query2.strings = [string];
          handler2(query2);
        });
      }, cancel, {
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
  }
  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten };
    const sql3 = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
          delete listen.channels[name2];
          Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
          })));
        });
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
      }
    }));
    const channels = listen.channels || (listen.channels = {}), exists = name in channels;
    if (exists) {
      channels[name].listeners.push(listener);
      const result2 = await channels[name].result;
      listener.onlisten && listener.onlisten();
      return { state: result2.state, unlisten };
    }
    channels[name] = { result: sql3`listen ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
    const result = await channels[name].result;
    listener.onlisten && listener.onlisten();
    return { state: result.state, unlisten };
    async function unlisten() {
      if (name in channels === false)
        return;
      channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
      if (channels[name].listeners.length)
        return;
      delete channels[name];
      return sql3`unlisten ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
    }
  }
  async function notify(channel, payload) {
    return await sql2`select pg_notify(${channel}, ${"" + payload})`;
  }
  async function reserve() {
    const queue = queue_default();
    const c = open.length ? open.shift() : await new Promise((resolve, reject) => {
      const query = { reserve: resolve, reject };
      queries.push(query);
      closed.length && connect(closed.shift(), query);
    });
    move(c, reserved);
    c.reserved = () => queue.length ? c.execute(queue.shift()) : move(c, reserved);
    c.reserved.release = true;
    const sql3 = Sql(handler2);
    sql3.release = () => {
      c.reserved = null;
      onopen(c);
    };
    return sql3;
    function handler2(q) {
      c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
    }
  }
  async function begin(options2, fn) {
    !fn && (fn = options2, options2 = "");
    const queries2 = queue_default();
    let savepoints = 0, connection2, prepare = null;
    try {
      await sql2.unsafe("begin " + options2.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
      return await Promise.race([
        scope(connection2, fn),
        new Promise((_, reject) => connection2.onclose = reject)
      ]);
    } catch (error) {
      throw error;
    }
    async function scope(c, fn2, name) {
      const sql3 = Sql(handler2);
      sql3.savepoint = savepoint;
      sql3.prepare = (x) => prepare = x.replace(/[^a-z0-9$-_. ]/gi);
      let uncaughtError, result;
      name && await sql3`savepoint ${sql3(name)}`;
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn2(sql3);
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
        });
        if (uncaughtError)
          throw uncaughtError;
      } catch (e) {
        await (name ? sql3`rollback to ${sql3(name)}` : sql3`rollback`);
        throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
      }
      if (!name) {
        prepare ? await sql3`prepare transaction '${sql3.unsafe(prepare)}'` : await sql3`commit`;
      }
      return result;
      function savepoint(name2, fn3) {
        if (name2 && Array.isArray(name2.raw))
          return savepoint((sql4) => sql4.apply(sql4, arguments));
        arguments.length === 1 && (fn3 = name2, name2 = null);
        return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
      }
      function handler2(q) {
        q.catch((e) => uncaughtError || (uncaughtError = e));
        c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
      }
    }
    function onexecute(c) {
      connection2 = c;
      move(c, reserved);
      c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
    }
  }
  function move(c, queue) {
    c.queue.remove(c);
    queue.push(c);
    c.queue = queue;
    queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
    return c;
  }
  function json2(x) {
    return new Parameter(x, 3802);
  }
  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments));
    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap);
  }
  function handler(query) {
    if (ending)
      return query.reject(Errors.connection("CONNECTION_ENDED", options, options));
    if (open.length)
      return go(open.shift(), query);
    if (closed.length)
      return connect(closed.shift(), query);
    busy.length ? go(busy.shift(), query) : queries.push(query);
  }
  function go(c, query) {
    return c.execute(query) ? move(c, busy) : move(c, full);
  }
  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state ? query.active ? connection_default(options).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
    });
  }
  async function end({ timeout = null } = {}) {
    if (ending)
      return ending;
    await 1;
    let timer2;
    return ending = Promise.race([
      new Promise((r) => timeout !== null && (timer2 = setTimeout(destroy, timeout * 1e3, r))),
      Promise.all(connections.map((c) => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer2));
  }
  async function close() {
    await Promise.all(connections.map((c) => c.end()));
  }
  async function destroy(resolve) {
    await Promise.all(connections.map((c) => c.terminate()));
    while (queries.length)
      queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options));
    resolve();
  }
  function connect(c, query) {
    move(c, connecting);
    c.connect(query);
    return c;
  }
  function onend(c) {
    move(c, ended);
  }
  function onopen(c) {
    if (queries.length === 0)
      return move(c, open);
    let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
    while (ready && queries.length && max-- > 0) {
      const query = queries.shift();
      if (query.reserve)
        return query.reserve(c);
      ready = c.execute(query);
    }
    ready ? move(c, busy) : move(c, full);
  }
  function onclose(c, e) {
    move(c, closed);
    c.reserved = null;
    c.onclose && (c.onclose(e), c.onclose = null);
    options.onclose && options.onclose(c.id);
    queries.length && connect(c, queries.shift());
  }
}
function parseOptions(a, b2) {
  if (a && a.shared)
    return a;
  const env2 = process.env, o = (!a || typeof a === "string" ? b2 : a) || {}, { url, multihost } = parseUrl(a), query = [...url.searchParams].reduce((a2, [b3, c]) => (a2[b3] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env2.PGHOST || "localhost", port = o.port || url.port || env2.PGPORT || 5432, user = o.user || o.username || url.username || env2.PGUSERNAME || env2.PGUSER || osUsername();
  o.no_prepare && (o.prepare = false);
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
  "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
  query.sslrootcert === "system" && (query.ssl = "verify-full");
  const ints = ["idle_timeout", "connect_timeout", "max_lifetime", "max_pipeline", "backoff", "keep_alive"];
  const defaults = {
    max: globalThis.Cloudflare ? 3 : 10,
    ssl: false,
    sslnegotiation: null,
    idle_timeout: null,
    connect_timeout: 30,
    max_lifetime,
    max_pipeline: 100,
    backoff,
    keep_alive: 60,
    prepare: true,
    debug: false,
    fetch_types: true,
    publications: "alltables",
    target_session_attrs: null
  };
  return {
    host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
    port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
    path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
    database: o.database || o.db || (url.pathname || "").slice(1) || env2.PGDATABASE || user,
    user,
    pass: o.pass || o.password || url.password || env2.PGPASSWORD || "",
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env2["PG" + k.toUpperCase()] || d;
        acc[k] = typeof value === "string" && ints.includes(k) ? +value : value;
        return acc;
      },
      {}
    ),
    connection: {
      application_name: env2.PGAPPNAME || "postgres.js",
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types: o.types || {},
    target_session_attrs: tsa(o, url, env2),
    onnotice: o.onnotice,
    onnotify: o.onnotify,
    onclose: o.onclose,
    onparameter: o.onparameter,
    socket: o.socket,
    transform: parseTransform(o.transform || { undefined: void 0 }),
    parameters: {},
    shared: { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  };
}
function tsa(o, url, env2) {
  const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env2.PGTARGETSESSIONATTRS;
  if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
    return x;
  throw new Error("target_session_attrs " + x + " is not supported");
}
function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
  return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === "function" ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === "function" ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === "function" ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  };
}
function parseUrl(url) {
  if (!url || typeof url !== "string")
    return { url: { searchParams: /* @__PURE__ */ new Map() } };
  let host = url;
  host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
  host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
  const urlObj = new URL(url.replace(host, host.split(",")[0]));
  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(",") > -1 && host
  };
}
function osUsername() {
  try {
    return os.userInfo().username;
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
  }
}

// server/util.ts
import crypto2 from "node:crypto";
var HttpError = class extends Error {
  constructor(status, message, code = "error") {
    super(message);
    this.status = status;
    this.code = code;
  }
  status;
  code;
};
var env = (k, fallback = "") => (process.env[k] ?? fallback).trim();
function requireEnv(k) {
  const v = env(k);
  if (!v) throw new HttpError(500, `Server setting ${k} is missing. Add it in Netlify \u2192 Project configuration \u2192 Environment variables, then redeploy.`, "config");
  return v;
}
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
function errorResponse(e) {
  if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
  if (e && typeof e === "object" && "issues" in e) {
    const issues = e.issues;
    const first = issues[0];
    return json({ error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input", code: "invalid" }, 400);
  }
  console.error("Unhandled error", e);
  return json({ error: "Something went wrong on the server. Please try again.", code: "server" }, 500);
}
async function readJson(req, maxBytes = 64 * 1024) {
  const len = Number(req.headers.get("content-length") || "0");
  if (len > maxBytes) throw new HttpError(413, "Request is too large.", "too_large");
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new HttpError(415, "Send JSON.", "content_type");
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request is too large.", "too_large");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON.", "bad_json");
  }
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.get("cookie");
  if (!raw) return out;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}
var trustedIp = /* @__PURE__ */ new WeakMap();
function setClientIp(req, ip) {
  if (ip) trustedIp.set(req, String(ip).slice(0, 64));
}
function clientIp(req) {
  const t = trustedIp.get(req);
  if (t) return t;
  const v = req.headers.get("x-nf-client-connection-ip");
  if (v) return v.split(",")[0].trim().slice(0, 64) || "unknown";
  const parts = (req.headers.get("x-forwarded-for") || "").split(",").map((s) => s.trim()).filter(Boolean);
  return (parts[parts.length - 1] || "unknown").slice(0, 64);
}
var sha2562 = (s) => crypto2.createHash("sha256").update(s).digest("hex");
var randomToken = (bytes = 32) => crypto2.randomBytes(bytes).toString("base64url");
var randomId = (prefix = "", bytes = 9) => prefix + crypto2.randomBytes(bytes).toString("base64url").replace(/[-_]/g, "x");
function safeEqual(a, b2) {
  const ab = Buffer.from(a), bb = Buffer.from(b2);
  if (ab.length !== bb.length) {
    crypto2.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto2.timingSafeEqual(ab, bb);
}
function secretKey() {
  const s = requireEnv("APP_SECRET");
  if (s.length < 32) throw new HttpError(500, "APP_SECRET must be at least 32 characters long.", "config");
  return crypto2.createHash("sha256").update("sitraya-secrets:" + s).digest();
}
function encrypt(plain) {
  const iv = crypto2.randomBytes(12);
  const c = crypto2.createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return "v1." + Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url");
}
function decrypt(blob) {
  if (!blob.startsWith("v1.")) throw new Error("bad secret format");
  const raw = Buffer.from(blob.slice(3), "base64url");
  const d = crypto2.createDecipheriv("aes-256-gcm", secretKey(), raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
}
var escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var BN_DIGITS = "\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF";
function enDigits(v) {
  return v.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}
function normPhone(v) {
  let s = enDigits(String(v ?? "")).replace(/[\s\-().]/g, "");
  if (s.startsWith("+88")) s = s.slice(3);
  else if (s.startsWith("88") && s.length === 13) s = s.slice(2);
  return /^01[3-9]\d{8}$/.test(s) ? s : "";
}
var isDhaka = (d) => /^\s*(dhaka|ঢাকা)\s*$/i.test(d || "");
function siteOrigin(req) {
  const fixed = env("SITE_URL").replace(/\/+$/, "");
  if (fixed) return fixed;
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// server/db.ts
var _sql = null;
function sql() {
  if (_sql) return _sql;
  let url = env("DATABASE_URL") || env("NETLIFY_DATABASE_URL") || env("POSTGRES_URL") || requireEnv("DATABASE_URL");
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    url = u.toString();
  } catch {
  }
  _sql = src_default(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    // Neon / pgbouncer pooled connections do not support prepared statements.
    prepare: false,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
    onnotice: () => {
    },
    transform: { undefined: null }
  });
  return _sql;
}
var MIGRATIONS = [
  {
    id: 1,
    sql: `
create table if not exists admins (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null,
  pass_hash text not null,
  active boolean not null default true,
  is_owner boolean not null default false,
  must_change boolean not null default false,
  created_at timestamptz not null default now(),
  last_login timestamptz
);
create table if not exists sessions (
  id_hash text primary key,
  admin_id text not null references admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  ua text,
  ip text
);
create index if not exists sessions_admin on sessions(admin_id);
create table if not exists kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists products (
  id text primary key,
  sort int not null default 0,
  status text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists variants (
  sku text primary key,
  product_id text not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  stock int not null check (stock >= 0),
  pos int not null default 0
);
create index if not exists variants_product on variants(product_id);
create table if not exists orders (
  ref text primary key,
  created_at timestamptz not null default now(),
  status text not null,
  phone text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists orders_created on orders(created_at desc);
create index if not exists orders_phone on orders(phone);
create table if not exists coupons (
  code text primary key,
  doc jsonb not null,
  uses int not null default 0
);
create table if not exists moves (
  id bigserial primary key,
  at timestamptz not null default now(),
  product_id text,
  sku text,
  delta int not null,
  why text,
  by_name text
);
create index if not exists moves_at on moves(at desc);
create table if not exists notifs (
  id bigserial primary key,
  at timestamptz not null default now(),
  type text not null,
  title text not null,
  body text not null default '',
  ref text not null default '',
  read boolean not null default false
);
create index if not exists notifs_at on notifs(at desc);
create table if not exists logs (
  id bigserial primary key,
  at timestamptz not null default now(),
  who text not null,
  action text not null,
  detail text not null default ''
);
create index if not exists logs_at on logs(at desc);
create table if not exists push_subs (
  endpoint text primary key,
  admin_id text not null references admins(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz not null default now()
);
create table if not exists media (
  id text primary key,
  mime text not null,
  bytes bytea not null,
  size int not null,
  created_at timestamptz not null default now(),
  created_by text
);
create table if not exists rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null
);
create table if not exists subscribers (
  email text primary key,
  lang text,
  created_at timestamptz not null default now()
);
`
  },
  {
    id: 2,
    sql: `
-- product view counter: one row per product per day
create table if not exists product_views (
  product_id text not null,
  day date not null,
  views int not null default 0,
  uniques int not null default 0,
  primary key (product_id, day)
);
-- short-lived "already counted" marks (hashed, no personal data)
create table if not exists view_seen (
  k text primary key,
  until timestamptz not null
);
create index if not exists view_seen_until on view_seen (until);
-- carts left at checkout (Cart Recovery)
create table if not exists carts (
  id text primary key,
  sid text not null,
  phone text,
  name text not null default '',
  wa text not null default '',
  district text not null default '',
  items jsonb not null default '[]',
  value int not null default 0,
  status text not null default 'pending',
  reminders jsonb not null default '[]',
  optout boolean not null default false,
  lang text not null default 'bn',
  order_ref text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists carts_phone on carts (phone);
create index if not exists carts_sid on carts (sid);
create index if not exists carts_updated on carts (updated_at);
`
  }
];
var migrated = null;
function ensureSchema() {
  if (!migrated) {
    migrated = (async () => {
      const db = sql();
      await db.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(726354001)`;
        await tx`create table if not exists schema_migrations (id int primary key, applied_at timestamptz not null default now())`;
        const done = new Set((await tx`select id from schema_migrations`).map((r) => r.id));
        for (const m of MIGRATIONS) {
          if (done.has(m.id)) continue;
          await tx.unsafe(m.sql);
          await tx`insert into schema_migrations (id) values (${m.id})`;
        }
      });
    })().catch((e) => {
      migrated = null;
      throw e;
    });
  }
  return migrated;
}
var asJson = (v) => sql().json(v);

// ../../../../../../opt/npm-tools/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../../../../../opt/npm-tools/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../../../../../opt/npm-tools/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../../../../../opt/npm-tools/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../../../../../opt/npm-tools/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../../../../../opt/npm-tools/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../../../../../opt/npm-tools/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../../../../../opt/npm-tools/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types2, params) => {
  return new ZodUnion({
    options: types2,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b2) {
  const aType = getParsedType(a);
  const bType = getParsedType(b2);
  if (a === b2) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b2);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b2 };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b2[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b2.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b2[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b2) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size2, message) {
    return this.min(size2, message).max(size2, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values2, params) {
  return new ZodEnum({
    values: values2,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values2, newDef = this._def) {
    return _ZodEnum.create(values2, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values2, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values2.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values2, params) => {
  return new ZodNativeEnum({
    values: values2,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b2) {
    return new _ZodPipeline({
      in: a,
      out: b2,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// server/auth.ts
import crypto3 from "node:crypto";
var SCRYPT = { N: 1 << 15, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };
function hashPassword(pw) {
  const salt = crypto3.randomBytes(16);
  return new Promise((res, rej) => crypto3.scrypt(pw.normalize("NFKC"), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem }, (err, key) => {
    if (err) return rej(err);
    res(`scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`);
  }));
}
function verifyPassword(pw, stored) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return Promise.resolve(false);
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  return new Promise((res) => crypto3.scrypt(pw.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, { N: +n, r: +r, p: +p, maxmem: SCRYPT.maxmem }, (err, key) => {
    if (err) return res(false);
    res(crypto3.timingSafeEqual(key, expected));
  }));
}
var dummyHash = null;
var getDummy = () => dummyHash ??= hashPassword("not-a-real-password-" + randomToken(8));
var A = (edit, view = []) => ({ edit, view: [...edit, ...view] });
var SA = "Super Admin";
var AD = "Administrator";
var OM = "Order Manager";
var PM = "Product Manager";
var IM = "Inventory Manager";
var CM = "Content Manager";
var RA = "Read-only Analyst";
var PERMS = {
  orders: A([SA, AD, OM], [RA]),
  products: A([SA, AD, PM], [IM, RA]),
  inventory: A([SA, AD, PM, IM], [OM, RA]),
  site: A([SA, AD, CM]),
  coupons: A([SA, AD, PM], [RA]),
  settings: A([SA, AD]),
  users: A([SA]),
  log: A([SA, AD]),
  dashboard: A([SA, AD, OM, PM, IM, CM, RA])
};
var can = (role, area, mode = "view") => PERMS[area][mode].includes(role);
var SESSION_DAYS = 7;
function cookieName(req) {
  return isSecure(req) ? "__Host-st_s" : "st_s";
}
function isSecure(req) {
  return new URL(req.url).protocol === "https:" || env("FORCE_SECURE_COOKIES") === "1";
}
function sessionCookie(req, token, maxAgeSec) {
  const parts = [`${cookieName(req)}=${token}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSec}`];
  if (isSecure(req)) parts.push("Secure");
  return parts.join("; ");
}
async function createSession(req, adminId) {
  const token = randomToken(32);
  const db = sql();
  await db`delete from sessions where expires_at < now()`;
  await db`insert into sessions (id_hash, admin_id, expires_at, ua, ip)
           values (${sha2562(token)}, ${adminId}, now() + ${SESSION_DAYS + " days"}::interval, ${(req.headers.get("user-agent") || "").slice(0, 200)}, ${clientIp(req)})`;
  await db`update admins set last_login = now() where id = ${adminId}`;
  return sessionCookie(req, token, SESSION_DAYS * 86400);
}
async function destroySession(req) {
  const token = parseCookies(req)[cookieName(req)];
  if (token) await sql()`delete from sessions where id_hash = ${sha2562(token)}`;
  return sessionCookie(req, "", 0);
}
function checkSameOrigin(req) {
  if (req.method === "GET" || req.method === "HEAD") return;
  if (req.headers.get("x-sitraya") !== "1") throw new HttpError(403, "Request blocked.", "csrf");
  const origin = req.headers.get("origin");
  if (origin && origin !== siteOrigin(req) && origin !== new URL(req.url).origin) throw new HttpError(403, "Request blocked (wrong origin).", "csrf");
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs && sfs !== "same-origin" && sfs !== "none") throw new HttpError(403, "Request blocked (cross-site).", "csrf");
}
async function getAdmin(req) {
  const token = parseCookies(req)[cookieName(req)];
  if (!token || token.length > 100) return null;
  const rows = await sql()`
    select a.id, a.email, a.name, a.role, a.active, a.is_owner, a.must_change, s.expires_at
    from sessions s join admins a on a.id = s.admin_id
    where s.id_hash = ${sha2562(token)} and s.expires_at > now()`;
  const a = rows[0];
  if (!a || !a.active) return null;
  if (a.expires_at.getTime() - Date.now() < (SESSION_DAYS - 1) * 864e5)
    await sql()`update sessions set expires_at = now() + ${SESSION_DAYS + " days"}::interval where id_hash = ${sha2562(token)}`;
  return a;
}
async function requireAdmin(req, area = "dashboard", mode = "view", opts = {}) {
  checkSameOrigin(req);
  const a = await getAdmin(req);
  if (!a) throw new HttpError(401, "Please sign in again.", "auth");
  if (a.must_change && !opts.allowMustChange && req.method !== "GET") throw new HttpError(403, "Please choose your own password first.", "must_change");
  if (!can(a.role, area, mode)) throw new HttpError(403, `Your role (${a.role}) cannot ${mode === "edit" ? "change" : "see"} this.`, "forbidden");
  return a;
}
async function login(req, emailRaw, password) {
  const email = String(emailRaw || "").trim().toLowerCase().slice(0, 200);
  const ip = clientIp(req);
  await rateLimit(`login:ip:${ip}`, 20, 15 * 60);
  await rateLimit(`login:em:${ip}:${email}`, 8, 15 * 60);
  await rateLimit(`login:emall:${email}`, 60, 15 * 60);
  if (!email || !password) throw new HttpError(400, "Enter your email and password.", "invalid");
  const db = sql();
  const [{ n }] = await db`select count(*)::int as n from admins`;
  if (n === 0) {
    const be = env("ADMIN_EMAIL").toLowerCase(), bp = env("ADMIN_PASSWORD");
    if (!be || bp.length < 10) throw new HttpError(503, "No admin exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) in Netlify, then redeploy.", "setup");
    if (email === be && safeEqual(password, bp)) {
      const id = randomId("u");
      const made = await db`insert into admins (id, email, name, role, pass_hash, is_owner, must_change)
               values (${id}, ${be}, ${env("ADMIN_NAME", "Owner")}, ${"Super Admin"}, ${await hashPassword(bp)}, true, true)
               on conflict (email) do nothing`;
      if (made.count === 1) await audit("System", "Owner account created", be);
    }
  }
  const rows = await db`select id, email, name, role, active, is_owner, must_change, pass_hash from admins where email = ${email}`;
  const u = rows[0];
  const ok = await verifyPassword(password, u ? u.pass_hash : await getDummy());
  if (!u || !ok || !u.active) {
    await audit("System", "Failed sign-in", email + " \xB7 " + ip);
    throw new HttpError(401, "That email and password do not match.", "auth");
  }
  await db`delete from rate_limits where key = ${`login:em:${ip}:${email}`}`;
  const cookie = await createSession(req, u.id);
  await audit(u.name, "Signed in", ip);
  const { pass_hash: _, ...admin } = u;
  return { admin, cookie };
}
async function rateLimit(key, max, windowSec) {
  const rows = await sql()`
    insert into rate_limits (key, count, reset_at) values (${key}, 1, now() + ${windowSec + " seconds"}::interval)
    on conflict (key) do update set
      count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then now() + ${windowSec + " seconds"}::interval else rate_limits.reset_at end
    returning count`;
  if (rows[0].count > max) throw new HttpError(429, "Too many attempts. Please wait a few minutes and try again.", "rate_limited");
  if (Math.random() < 0.02) await sql()`delete from rate_limits where reset_at < now() - interval '1 hour'`;
}
async function audit(who, action, detail = "") {
  await sql()`insert into logs (who, action, detail) values (${who.slice(0, 80)}, ${action.slice(0, 120)}, ${detail.slice(0, 500)})`;
}

// server/orders.ts
import crypto4 from "node:crypto";

// server/validate.ts
var hexColor = external_exports.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a colour like #1B1A18");
var SAFE_URL = /^https:\/\/[^\s"'()<>\\`]{4,400}$/;
function isImgRef(v) {
  return v === "" || /^[a-z0-9-]{1,40}$/.test(v) || /^\/m\/[A-Za-z0-9]{8,40}$/.test(v) || SAFE_URL.test(v);
}
function isVideoRef(v) {
  return v === "" || SAFE_URL.test(v);
}
var imgRef = external_exports.string().max(420).refine(isImgRef, "must be an uploaded image or an https link");
var videoRef = external_exports.string().max(420).refine(isVideoRef, "must be an https link (YouTube, Facebook or .mp4)");
var flag = external_exports.union([external_exports.boolean(), external_exports.number()]).transform((v) => v ? 1 : 0);
var bi = (n) => external_exports.object({ bn: external_exports.string().max(n).default(""), en: external_exports.string().max(n).default("") });
var int = (min, max) => external_exports.coerce.number().int().min(min).max(max);
var variantSchema = external_exports.object({
  sku: external_exports.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/, "variant SKU: 3\u201340 letters, numbers or dashes"),
  size: external_exports.string().trim().min(1).max(20),
  color: hexColor,
  stock: int(0, 1e6)
});
var productSchema = external_exports.object({
  id: external_exports.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
  sku: external_exports.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/, "SKU must be 3\u201330 letters, numbers or dashes"),
  cat: external_exports.string().regex(/^[a-z0-9-]{1,30}$/),
  en: external_exports.string().trim().min(1, "English name is required").max(140),
  bn: external_exports.string().trim().min(1, "\u09AC\u09BE\u0982\u09B2\u09BE \u09A8\u09BE\u09AE \u09A6\u09BF\u09A8").max(140),
  den: external_exports.string().max(4e3).default(""),
  dbn: external_exports.string().max(4e3).default(""),
  price: int(1, 1e7),
  sale: int(0, 1e7).optional().default(0),
  cost: int(0, 1e7).optional().default(0),
  status: external_exports.enum(["active", "draft", "archived"]),
  isNew: flag.default(0),
  top: flag.default(0),
  tint: hexColor.default("#EFE6D6"),
  img: imgRef.default(""),
  gallery: external_exports.array(imgRef).max(6).default([]),
  video: videoRef.default(""),
  sizes: external_exports.array(external_exports.string().trim().min(1).max(20)).min(1).max(20),
  colors: external_exports.array(hexColor).min(1).max(12),
  variants: external_exports.array(variantSchema).min(1).max(240),
  // how the photo sits in cards: focus point "x% y%", whole photo or fill, and the view-count override
  fpos: external_exports.string().regex(/^(\d{1,3}% \d{1,3}%)?$/, "focus point must look like 50% 30%").default(""),
  fit: external_exports.enum(["", "contain", "cover"]).default(""),
  views: external_exports.enum(["", "show", "hide"]).default(""),
  // 1200 × 630 picture made in the browser for Facebook/WhatsApp previews, and which photo it was made from
  shareImg: imgRef.default(""),
  _shareFrom: imgRef.default("")
}).superRefine((p, ctx) => {
  if (p.sale && p.sale >= p.price) ctx.addIssue({ code: "custom", path: ["sale"], message: "Sale price must be lower than the regular price" });
  const seen = /* @__PURE__ */ new Set();
  for (const v of p.variants) {
    if (seen.has(v.sku)) ctx.addIssue({ code: "custom", path: ["variants"], message: `Variant SKU ${v.sku} is used twice` });
    seen.add(v.sku);
    if (!p.sizes.includes(v.size) || !p.colors.map((c) => c.toLowerCase()).includes(v.color.toLowerCase()))
      ctx.addIssue({ code: "custom", path: ["variants"], message: `Variant ${v.sku} uses a size or colour that is not in the product` });
  }
});
var categoriesSchema = external_exports.array(external_exports.object({
  id: external_exports.string().regex(/^[a-z0-9-]{1,30}$/),
  bn: external_exports.string().trim().min(1).max(60),
  en: external_exports.string().trim().min(1).max(60),
  img: imgRef.default(""),
  tint: hexColor.default("#EFE6D6")
}).passthrough()).min(1).max(40);
var couponSchema = external_exports.object({
  code: external_exports.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,16}$/, "Code must be 4\u201316 letters or numbers"),
  type: external_exports.enum(["percent", "fixed"]),
  value: int(1, 1e6),
  min: int(0, 1e7).default(0),
  maxUses: int(0, 1e7).default(0),
  expires: int(0, 3250368e7).default(0),
  active: external_exports.boolean().default(true)
}).superRefine((c, ctx) => {
  if (c.type === "percent" && c.value > 90) ctx.addIssue({ code: "custom", path: ["value"], message: "Percent off can be at most 90%" });
});
var sw = (d) => external_exports.boolean().default(d);
var secS = (d) => external_exports.object({
  mode: external_exports.enum(["grid", "slider"]).default(d.mode),
  auto: sw(d.auto),
  sec: int(2, 30).default(d.sec),
  d: int(1, 6).default(d.d),
  t: int(1, 4).default(d.t),
  m: int(1, 3).default(d.m),
  arrows: sw(d.arrows),
  dots: sw(d.dots),
  loop: sw(d.loop),
  dir: external_exports.enum(["ltr", "rtl"]).default(d.dir),
  speed: int(150, 2e3).default(d.speed)
}).default({});
var S0 = { mode: "slider", auto: true, sec: 3, arrows: true, dots: false, loop: true, dir: "ltr", speed: 600 };
var siteSchema = external_exports.object({
  brand: external_exports.object({
    title: bi(70).default({ bn: "", en: "" }),
    desc: bi(160).default({ bn: "", en: "" }),
    logoLight: imgRef.default(""),
    favicon: imgRef.default(""),
    appIcon: imgRef.default(""),
    shareImg: imgRef.default(""),
    appName: external_exports.string().trim().max(45).default(""),
    appShort: external_exports.string().trim().max(12).default(""),
    theme: hexColor.default("#0D2B26"),
    lang: external_exports.enum(["bn", "en"]).default("bn")
  }).default({}),
  img: external_exports.object({ ratio: external_exports.enum(["auto", "1/1", "4/5", "3/4", "2/3"]).default("auto"), fit: external_exports.enum(["contain", "cover"]).default("contain"), bg: hexColor.default("#F4F1EC"), webp: sw(true) }).default({}),
  views: external_exports.object({ on: sw(true), show: sw(false), min: int(0, 1e5).default(10) }).default({}),
  search: external_exports.object({ recent: sw(true), popular: sw(true) }).default({}),
  ui: external_exports.object({ m: int(85, 120).default(100), d: int(85, 120).default(100), user: sw(true) }).default({}),
  hero: external_exports.object({ h: external_exports.enum(["s", "m", "l"]).default("m") }).default({}),
  sections: external_exports.object({
    top: secS({ ...S0, dots: true, d: 2, t: 2, m: 1 }),
    new: secS({ ...S0, mode: "grid", d: 4, t: 3, m: 2 }),
    rowA: secS({ ...S0, d: 5, t: 3, m: 2 }),
    rowB: secS({ ...S0, sec: 4, d: 5, t: 3, m: 2, dir: "rtl" })
  }).default({}),
  cart: external_exports.object({
    on: sw(true),
    days: int(1, 60).default(7),
    cool: int(1, 720).default(24),
    max: int(1, 5).default(3),
    tpl: external_exports.object({ bn: external_exports.string().max(600).default(""), en: external_exports.string().max(600).default("") }).default({})
  }).default({})
});
var payM = external_exports.object({ on: external_exports.boolean().default(false), num: external_exports.string().trim().max(20).default("") });
var settingsSchema = external_exports.object({
  store: external_exports.object({
    phone: external_exports.string().trim().max(30).default(""),
    whatsapp: external_exports.string().trim().max(30).default(""),
    email: external_exports.string().trim().max(120).default(""),
    domain: external_exports.string().trim().max(120).default(""),
    addr: bi(300).default({ bn: "", en: "" }),
    social: external_exports.object({ fb: external_exports.string().trim().max(300).default(""), ig: external_exports.string().trim().max(300).default(""), yt: external_exports.string().trim().max(300).default(""), tt: external_exports.string().trim().max(300).default("") }).default({}),
    about: bi(1e3).default({ bn: "", en: "" })
  }).default({}),
  pay: external_exports.object({ cod: external_exports.object({ on: external_exports.boolean().default(true) }).default({ on: true }), bkash: payM.default({}), nagad: payM.default({}), rocket: payM.default({}) }).default({}),
  lowStock: int(0, 1e3).default(3),
  reviewsApprove: external_exports.boolean().default(true),
  notif: external_exports.object({
    order: external_exports.boolean().default(true),
    stock: external_exports.boolean().default(true),
    cancel: external_exports.boolean().default(true),
    review: external_exports.boolean().default(true),
    telegramChat: external_exports.string().trim().max(40).regex(/^-?\d{0,20}$|^@[A-Za-z0-9_]{4,40}$/, "Telegram chat ID is a number").default("")
  }).default({}),
  meta: external_exports.object({
    pixel: external_exports.string().trim().regex(/^(\d{15,16})?$/, "A Pixel ID is 15 or 16 digits").default(""),
    test: external_exports.string().trim().max(40).default(""),
    pixelOn: external_exports.boolean().default(false),
    capiOn: external_exports.boolean().default(false),
    testMode: external_exports.boolean().default(true),
    events: external_exports.record(external_exports.string().max(40), external_exports.boolean()).default({})
  }).default({}),
  site: siteSchema.default({})
});
function checkCfg(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new HttpError(400, "Homepage content must be an object.", "invalid");
  const size2 = JSON.stringify(v).length;
  if (size2 > 4e5) throw new HttpError(413, "Homepage content is too large.", "too_large");
  const walk = (x, key, depth) => {
    if (depth > 8) throw new HttpError(400, "Homepage content is nested too deeply.", "invalid");
    if (typeof x === "string") {
      if (x.length > 2e4) throw new HttpError(400, `Text in "${key}" is too long.`, "invalid");
      if (/^(skin|btn|bg|link|interval|tickerOn|v|on|fit|pos)$/.test(key) && !/^[a-z0-9-]{0,40}$/i.test(x)) throw new HttpError(400, `"${key}" has an invalid value.`, "invalid");
      if (/^(img|imgM|logo|image|pic|art|light|dark|gold)$/i.test(key) && !isImgRef(x)) throw new HttpError(400, `"${key}" must be an uploaded image or https link.`, "invalid");
      if (/^(vid|video)$/i.test(key) && !isVideoRef(x)) throw new HttpError(400, `"${key}" must be an https video link.`, "invalid");
      return;
    }
    if (Array.isArray(x)) {
      if (x.length > 200) throw new HttpError(400, "A list in the homepage content is too long.", "invalid");
      x.forEach((y) => walk(y, key, depth + 1));
      return;
    }
    if (x && typeof x === "object") {
      for (const [k, y] of Object.entries(x)) {
        if (k === "__proto__" || k === "constructor") throw new HttpError(400, "Invalid key.", "invalid");
        walk(y, k, depth + 1);
      }
      return;
    }
    if (x === null || typeof x === "number" || typeof x === "boolean") return;
    throw new HttpError(400, "Invalid value in homepage content.", "invalid");
  };
  walk(v, "", 0);
  const o = v;
  o.interval = external_exports.coerce.number().min(2).max(60).catch(6.5).parse(o.interval ?? 6.5);
  if (o.tickerOn !== void 0) o.tickerOn = !!o.tickerOn;
  const d = o.delivery || {};
  o.delivery = { inside: int(0, 1e5).parse(d.inside ?? 80), outside: int(0, 1e5).parse(d.outside ?? 150), free: int(0, 1e7).parse(d.free ?? 2e3) };
  return o;
}
var orderInputSchema = external_exports.object({
  items: external_exports.array(external_exports.object({
    pid: external_exports.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
    size: external_exports.string().max(20),
    color: hexColor,
    qty: int(1, 10)
  })).min(1).max(30),
  customer: external_exports.object({
    name: external_exports.string().trim().min(2, "Enter your name").max(80),
    phone: external_exports.string().max(30),
    wa: external_exports.string().max(30).optional().default(""),
    district: external_exports.string().trim().min(2).max(60),
    area: external_exports.string().trim().min(1).max(80),
    po: external_exports.string().trim().max(60).optional().default(""),
    addr: external_exports.string().trim().min(3).max(300),
    note: external_exports.string().trim().max(500).optional().default("")
  }),
  pay: external_exports.enum(["cod", "bkash", "nagad", "rocket"]),
  trx: external_exports.string().trim().max(40).optional().default(""),
  coupon: external_exports.string().trim().toUpperCase().max(16).optional().default(""),
  lang: external_exports.enum(["bn", "en"]).optional().default("bn"),
  fbp: external_exports.string().max(200).optional().default(""),
  fbc: external_exports.string().max(400).optional().default(""),
  sid: external_exports.string().regex(/^[a-z0-9]{0,40}$/).optional().default("")
});
var cartInputSchema = external_exports.object({
  sid: external_exports.string().regex(/^[a-z0-9]{12,40}$/),
  items: external_exports.array(external_exports.object({ pid: external_exports.string().regex(/^[A-Za-z0-9_-]{1,40}$/), size: external_exports.string().max(20), color: hexColor, qty: int(1, 10) })).max(30),
  phone: external_exports.string().max(30).optional().default(""),
  name: external_exports.string().trim().max(60).optional().default(""),
  wa: external_exports.string().max(30).optional().default(""),
  district: external_exports.string().trim().max(40).optional().default(""),
  lang: external_exports.enum(["bn", "en"]).optional().default("bn")
});
var STATUSES = ["received", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
var FLOW = ["received", "confirmed", "processing", "shipped", "delivered"];
var PAY_STATUSES = ["unpaid", "verify", "paid", "refunded"];
var orderPatchSchema = external_exports.object({
  payStatus: external_exports.enum(PAY_STATUSES).optional(),
  courier: external_exports.string().trim().max(40).optional(),
  tracking: external_exports.string().trim().max(80).optional(),
  notes: external_exports.string().max(4e3).optional()
});
var statusChangeSchema = external_exports.object({ status: external_exports.enum(STATUSES), note: external_exports.string().trim().max(300).optional().default("") });
var ROLES = ["Super Admin", "Administrator", "Order Manager", "Product Manager", "Inventory Manager", "Content Manager", "Read-only Analyst"];
var passwordSchema = external_exports.string().min(10, "Password must be at least 10 characters").max(200);

// server/generated/shell.ts
var ASSET_VER = "6cb1c9f9e5";
var BODY = '<div class="ticker" id="tickerBar" aria-label="Announcements"><div class="track" id="ticker"></div></div>\n\n<header class="mast" id="top">\n  <div class="wrap">\n    <button class="act burger" id="openMenu" data-ta="menu"><i data-ic="menu"></i></button>\n    <a href="#top" class="logo"><img class="brandLogo" data-logo="dark" src="" alt=""></a>\n    <button class="sbox" id="openSearch2" data-ta="search"><span id="typed"></span><b><i data-ic="search"></i></b></button>\n    <div class="acts">\n      <div class="lang" role="group" aria-label="Language"><button data-lang="bn">\u09AC\u09BE\u0982</button><button data-lang="en">EN</button></div>\n      <a class="act hide-m" href="#track"><i data-ic="pin"></i><span data-t="track"></span></a>\n      <button class="act hide-m" data-toastk="signin_soon"><i data-ic="user"></i><span data-t="signin"></span></button>\n      <button class="act" id="wishBtn"><i data-ic="heart"></i><span data-t="wishlist"></span><i class="cnt" id="wishCount" hidden>0</i></button>\n      <button class="act" id="openCart"><i data-ic="bag"></i><span data-t="cart"></span><i class="cnt em" id="cartCount">0</i></button>\n    </div>\n  </div>\n</header>\n\n<nav class="navbar" aria-label="Categories">\n  <div class="wrap">\n    <a class="nl offer" href="#new" data-cat="sale"><i data-ic="fire"></i><span data-t="offer"></span></a>\n    <a class="nl" href="#new" data-cat="abaya" data-t="c_abaya"></a>\n    <a class="nl" href="#new" data-cat="three" data-t="c_three"></a>\n    <a class="nl" href="#new" data-cat="hijab" data-t="c_hijab"></a>\n    <a class="nl" href="#new" data-cat="kurti" data-t="c_kurti"></a>\n    <a class="nl" href="#new" data-cat="women" data-t="c_women"></a>\n    <a class="nl" href="#new" data-cat="men" data-t="c_men"></a>\n    <a class="nl" href="#new" data-cat="kids" data-t="c_kids"></a>\n    <div class="right"><a href="#track" id="track" data-t="track"></a><a href="#help" data-t="help"></a></div>\n  </div>\n</nav>\n\n<main>\n<section class="hero">\n  <div class="wrap htop" id="htop">\n    <div class="slider" id="slider" aria-roledescription="carousel" aria-label="Featured">\n      <div id="slides"></div>\n      <button class="sarr p" id="prev" data-ta="prev"><i data-ic="chevL"></i></button>\n      <button class="sarr n" id="next" data-ta="next"><i data-ic="chevR"></i></button>\n      <div class="sctl" id="dots"></div>\n      <div class="prog" id="prog"></div>\n    </div>\n    <div class="hside" id="hside"></div>\n  </div>\n</section>\n\n<section class="sec" id="categories" aria-labelledby="cat-h">\n  <div class="wrap">\n    <div class="head center rv-me"><span class="kick" data-t="cat_k"></span><h2 id="cat-h" data-t="cat_h"></h2></div>\n    <div class="carousel">\n      <button class="rarr p" id="cPrev" data-ta="prev"><i data-ic="chevL"></i></button>\n      <div class="rail" id="cats"></div>\n      <button class="rarr n" id="cNext" data-ta="next"><i data-ic="chevR"></i></button>\n    </div>\n  </div>\n</section>\n\n<section class="promo-sec" aria-label="Offers">\n  <div class="wrap"><div class="promos" id="promos"></div></div>\n</section>\n\n<section class="trust" aria-label="Services">\n  <div class="wrap grid4">\n    <div class="tr"><span class="badge"><i data-ic="truck"></i></span><div><b data-t="tr1t"></b><span data-t="tr1s"></span></div></div>\n    <div class="tr"><span class="badge"><i data-ic="cash"></i></span><div><b data-t="tr2t"></b><span data-t="tr2s"></span></div></div>\n    <div class="tr"><span class="badge"><i data-ic="wa"></i></span><div><b data-t="tr3t"></b><span data-t="tr3s"></span></div></div>\n    <div class="tr"><span class="badge"><i data-ic="route"></i></span><div><b data-t="tr4t"></b><span data-t="tr4s"></span></div></div>\n  </div>\n</section>\n\n<section class="sec" aria-labelledby="top-h">\n  <div class="wrap">\n    <div class="head rv-me"><div><span class="kick" data-t="top_k"></span><h2 id="top-h" data-t="top_h"></h2></div><a class="seeall" href="#new" data-cat="all"><span data-t="see_all"></span><i data-ic="arrow"></i></a></div>\n    <div class="big2" id="big2"></div>\n  </div>\n</section>\n\n<section class="sec" aria-label="Brand">\n  <div class="wrap">\n    <div class="brandban rv-me" id="about">\n      <div class="bb-copy">\n        <img class="lg brandLogo" data-logo="dark" src="" alt="">\n        <h3 id="bbH"></h3>\n        <span class="line1" id="bbL"></span>\n        <div class="vals">\n          <div class="val"><i data-ic="shield"></i><span data-t="v1"></span></div>\n          <div class="val"><i data-ic="layers"></i><span data-t="v2"></span></div>\n          <div class="val"><i data-ic="leaf"></i><span data-t="v3"></span></div>\n          <div class="val"><i data-ic="heart"></i><span data-t="v4"></span></div>\n        </div>\n        <a class="btn b-em" href="#new" data-cat="all"><span data-t="bb_btn"></span><i data-ic="arrow"></i></a>\n      </div>\n      <div class="bb-stage" id="bbStage"></div>\n    </div>\n  </div>\n</section>\n\n<section class="sec" id="new" aria-labelledby="new-h">\n  <div class="wrap">\n    <div class="head rv-me"><div><span class="kick" data-t="new_k"></span><h2 id="new-h" data-t="new_h"></h2></div><div class="tabs" role="tablist" id="tabs"></div></div>\n    <div class="pgrid" id="newGrid"></div>\n  </div>\n</section>\n\n<section class="sec" aria-labelledby="ab-h">\n  <div class="wrap">\n    <div class="head rv-me"><div><span class="kick" data-t="ab_k"></span><h2 id="ab-h" data-t="ab_h"></h2></div><a class="seeall" href="#new" data-cat="abaya"><span data-t="see_all"></span><i data-ic="arrow"></i></a></div>\n    <div class="pgrid" id="rowAbaya"></div>\n  </div>\n</section>\n\n<section class="sec" aria-labelledby="tp-h">\n  <div class="wrap">\n    <div class="head rv-me"><div><span class="kick" data-t="tp_k"></span><h2 id="tp-h" data-t="tp_h"></h2></div><a class="seeall" href="#new" data-cat="three"><span data-t="see_all"></span><i data-ic="arrow"></i></a></div>\n    <div class="pgrid" id="rowThree"></div>\n  </div>\n</section>\n\n<section class="news" aria-labelledby="news-h">\n  <div id="leaves" aria-hidden="true"></div>\n  <div class="wrap">\n    <div><h2 id="news-h" data-t="news_h"></h2><span class="news-alt" data-t="news_alt"></span><p data-t="news_p"></p></div>\n    <div>\n      <div class="nlang" role="group" aria-label="Language"><span data-t="news_lang"></span><button type="button" data-lang="bn">\u09AC\u09BE\u0982\u09B2\u09BE</button><button type="button" data-lang="en">English</button></div>\n      <form class="nform" id="nlForm" novalidate><label class="sr" for="nlEmail">Email</label><i data-ic="mail" class="nfi"></i><input id="nlEmail" type="email" data-tp="news_ph" autocomplete="email"><button class="btn b-gold" type="submit" data-t="subscribe"></button></form>\n      <div class="nmsg" id="nlMsg" role="status"></div>\n    </div>\n  </div>\n</section>\n</main>\n\n<footer class="ftr" id="help">\n  <div class="wrap">\n    <div class="fcols">\n      <div>\n        <a href="#top"><img class="lg brandLogo" data-logo="dark" src="" alt=""></a>\n        <p class="about" id="fAbout"></p>\n        <ul class="ci">\n          <li><i data-ic="pin"></i><span data-t="addr"></span></li>\n          <li><i data-ic="call"></i><span data-t="phone"></span></li>\n          <li><i data-ic="mail"></i><span data-t="email"></span></li>\n        </ul>\n        <div class="soc">\n          <a href="#top" aria-label="Facebook"><i data-ic="fb"></i></a>\n          <a href="#top" aria-label="Instagram"><i data-ic="ig"></i></a>\n          <a href="#top" aria-label="YouTube"><i data-ic="yt"></i></a>\n          <a href="#top" aria-label="TikTok"><i data-ic="tt"></i></a>\n        </div>\n      </div>\n      <div><h4 data-t="f_info"></h4><ul><li><a href="#about" data-t="l_about"></a></li><li><a href="#help" data-t="l_contact"></a></li><li><a href="#help" data-t="l_terms"></a></li><li><a href="#help" data-t="l_privacy"></a></li></ul></div>\n      <div><h4 data-t="f_shop"></h4><ul><li><a href="#new" data-cat="abaya" data-t="c_abaya"></a></li><li><a href="#new" data-cat="three" data-t="c_three"></a></li><li><a href="#new" data-cat="hijab" data-t="c_hijab"></a></li><li><a href="#new" data-cat="kurti" data-t="c_kurti"></a></li><li><a href="#new" data-cat="men" data-t="c_men"></a></li><li><a href="#new" data-cat="kids" data-t="c_kids"></a></li></ul></div>\n      <div><h4 data-t="f_support"></h4><ul><li><a href="#help" data-t="l_how"></a></li><li><a href="#track" data-t="track"></a></li><li><a href="#help" data-t="l_pay"></a></li><li><a href="#help" data-t="l_ship"></a></li><li><a href="#help" data-t="l_faq"></a></li></ul></div>\n      <div><h4 data-t="f_policy"></h4><ul><li><a href="#help" data-t="l_return"></a></li><li><a href="#help" data-t="l_exchange"></a></li><li><a href="#help" data-t="l_refund"></a></li><li><a href="#help" data-t="l_size"></a></li></ul></div>\n    </div>\n    <div class="fbot"><span id="fCopy"></span><div class="pays"><span data-t="cod"></span><span class="bk">bKash</span><span class="ng">Nagad</span><span class="rk">Rocket</span></div></div>\n  </div>\n</footer>\n\n<button class="minicart" id="miniCart" data-ta="cart"><span class="t"><i data-ic="bag"></i><span id="mcN"></span></span><span class="b" id="mcT"></span></button>\n<a class="fab" id="fabWa" href="#" target="_blank" rel="noopener" aria-label="WhatsApp"><i data-ic="wa"></i></a>\n<button class="totop" id="toTop" data-ta="top"><i data-ic="up"></i></button>\n<a class="czbtn" href="#admin"><i data-ic="lock"></i><span data-t="admin_btn"></span></a>\n<nav class="tabbar" aria-label="Quick">\n  <a href="#top" class="on"><i data-ic="home"></i><span data-t="home"></span></a>\n  <button id="tbMenu"><i data-ic="grid"></i><span data-t="categories"></span></button>\n  <button id="tbSearch"><i data-ic="search"></i><span data-t="search"></span></button>\n  <button id="tbWish"><i data-ic="heart"></i><span data-t="wishlist"></span></button>\n  <button id="tbCart"><i data-ic="bag"></i><span data-t="cart"></span><i class="cnt em" id="tbCount">0</i></button>\n</nav>\n\n<div class="scrim" id="scrim"></div>\n\n<aside class="menu" id="menu" aria-hidden="true">\n  <div class="dhd"><img class="brandLogo" data-logo="light" src="" alt=""><button class="x" data-close data-ta="close"><i data-ic="x"></i></button></div>\n  <nav id="mnav"></nav>\n</aside>\n\n<aside class="drawer" id="cart" aria-hidden="true">\n  <div class="dhd"><h2><span data-t="bag"></span> <small id="bagN">0</small></h2><button class="x" data-close data-ta="close"><i data-ic="x"></i></button></div>\n  <div class="freebar" id="freebar"><p id="freeMsg"></p><div class="fb-track"><div class="fb-fill" id="fbFill"></div><span class="fb-truck" id="fbTruck"><i data-ic="truck"></i></span></div></div>\n  <div class="dbd" id="bagBody"></div>\n  <div class="dft" id="bagFoot">\n    <div class="seg" role="group"><button id="zIn" aria-pressed="true" data-t="inside"></button><button id="zOut" aria-pressed="false" data-t="outside"></button></div>\n    <div class="sum"><span data-t="subtotal"></span><span id="sub"></span></div>\n    <div class="sum" id="discRow" hidden><span data-t="discount"></span><span id="disc" style="color:var(--mint);font-weight:700"></span></div>\n    <div class="sum"><span data-t="delivery"></span><span id="del"></span></div>\n    <div class="sum tot"><span data-t="total"></span><span id="tot"></span></div>\n    <button class="btn b-em" id="checkout"><span data-t="checkout"></span><i data-ic="arrow"></i></button>\n    <a class="btn b-wa" id="bagWa" href="#" target="_blank" rel="noopener"><i data-ic="wa"></i><span data-t="wa_order"></span></a>\n  </div>\n</aside>\n\n<div class="modal" id="pm" role="dialog" aria-modal="true" aria-labelledby="pmName" aria-hidden="true">\n  <div class="gal">\n    <div class="mstage" id="mstage"><span class="stage-shadow"></span><div class="floaty" style="--d:5s"><img id="pmImg" src="" alt=""></div></div>\n    <div class="thumbs" id="pmThumbs"></div>\n    <div class="pmvid" id="pmVid" hidden></div>\n  </div>\n  <div class="minfo" id="pmInfo"></div>\n</div>\n\n<div class="search" id="search" aria-hidden="true">\n  <div class="wrap">\n    <div class="sfield"><i data-ic="search"></i><label class="sr" for="q">Search</label><input id="q" type="search" data-tp="search_ph" autocomplete="off"><button class="x" data-close data-ta="close"><i data-ic="x"></i></button></div>\n    <div class="chips" id="chips"></div>\n    <div class="sres" id="sres"></div>\n  </div>\n</div>\n\n\n<div class="modal tk" id="trk" role="dialog" aria-modal="true" aria-labelledby="trkH" aria-hidden="true"><div class="tkin"><button class="x" data-close data-ta="close"><i data-ic="x"></i></button><h2 id="trkH" data-t="trk_h"></h2><p data-t="trk_p"></p><form class="tkf" id="trkForm" novalidate><label class="cf" for="trkRef"><span data-t="trk_ref"></span><input id="trkRef" autocapitalize="characters" placeholder="ST-XXXXXX"></label><label class="cf" for="trkPh"><span data-t="f_phone"></span><input id="trkPh" type="tel" inputmode="tel" placeholder="01XXXXXXXXX"></label><button class="btn b-em" type="submit"><span data-t="trk_btn"></span></button></form><div id="trkRes" aria-live="polite"></div></div></div>\n\n<div class="toast" id="toast" role="status"><span class="th" id="toTh"></span><span class="tx"><b id="toT"></b><span id="toS"></span></span><button class="go" id="toGo" hidden></button><span class="bar" id="toBar"></span></div>\n\n<div id="admin" hidden>\n  <div class="a-login" id="aLogin">\n    <div class="lg-scene" aria-hidden="true">\n      <span class="lg-blob b1"></span><span class="lg-blob b2"></span><span class="lg-blob b3"></span>\n      <span class="lg-floor"></span>\n      <span class="lg-ring r1"></span><span class="lg-ring r2"></span><span class="lg-ring r3"></span>\n      <div class="lg-dots" id="lgDots"></div>\n      <div class="lg-fig f1" style="--k:22"><span class="floaty" style="--d:7s"><img data-alimg="b2" alt=""></span></div>\n      <div class="lg-fig f2" style="--k:34"><span class="floaty" style="--d:6s;--dl:.8s"><img data-alimg="n1" alt=""></span></div>\n      <div class="lg-fig f3" style="--k:12"><span class="floaty" style="--d:8s;--dl:1.4s"><img data-alimg="b4" alt=""></span></div>\n      <div class="lg-fig f4" style="--k:16"><span class="floaty" style="--d:7.5s;--dl:.3s"><img data-alimg="n2" alt=""></span></div>\n    </div>\n    <div class="lg-stage">\n      <div class="lg-wrap">\n        <form class="a-lcard" id="aLoginForm" novalidate data-tilt="5">\n          <span class="lg-glare" aria-hidden="true"></span>\n          <div class="lg-head">\n            <span class="lg-badge"><img class="brandLogo" data-logo="dark" src="" alt=""></span>\n            <h1>Welcome back</h1>\n            <p class="al-sub">\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AA\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u09C7 \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6 \u0995\u09B0\u09C1\u09A8</p>\n          </div>\n          <label class="lf" for="alEmail"><span>Email</span><span class="lfi"><i data-ic="mail"></i><input id="alEmail" type="email" autocomplete="username" value="owner@sitraya.com"></span></label>\n          <label class="lf" for="alPass"><span>Password</span><span class="lfi"><i data-ic="lock"></i><input id="alPass" type="password" autocomplete="current-password" placeholder="Enter password"><button type="button" class="pwt" data-pwtoggle aria-label="Show password"><i data-ic="eye"></i></button></span></label>\n          <p class="err" id="alMsg" role="alert" hidden></p>\n          <button class="btn b-gold al-go" type="submit" id="alGo"><span class="sp" aria-hidden="true"></span><span class="tx">Sign in</span><i data-ic="arrow"></i></button>\n          <p class="demo-note"><i data-ic="info"></i><span>Demo login: <b>owner@sitraya.com</b> / <b>demo1234</b></span></p>\n          <a class="lk al-back" href="#top">\u2190 Back to website</a>\n        </form>\n        <p class="lg-foot"><i data-ic="lock"></i>Secure admin area \xB7 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6 \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u098F\u09B2\u09BE\u0995\u09BE</p>\n      </div>\n    </div>\n  </div>\n  <div class="a-shell" id="aShell" hidden>\n    <aside class="a-side" id="aSide" aria-label="Admin menu">\n      <div class="a-brand"><img class="brandLogo" data-logo="light" src="" alt=""><span>Admin</span></div>\n      <nav id="aNav"></nav>\n      <div class="a-sfoot"><a class="ni" href="#top"><span class="nic"><i data-ic="eye"></i></span><span>View website<small>\u0993\u09AF\u09BC\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09A6\u09C7\u0996\u09C1\u09A8</small></span></a><button class="ni" id="aLogout"><span class="nic"><i data-ic="logout"></i></span><span>Sign out<small>\u09AC\u09C7\u09B0 \u09B9\u09A8</small></span></button></div>\n    </aside>\n    <div class="a-main" id="aMain">\n      <header class="a-top">\n        <button class="mini a-burger" id="aBurger" aria-label="Open admin menu"><i data-ic="menu"></i></button>\n        <div class="a-tt"><span class="hello" id="aHello"></span><h1 id="aTitle"></h1><span id="aSub"></span></div>\n        <div class="a-tools">\n          <button class="a-bell" id="aBell" aria-label="Notifications"><i data-ic="bell"></i><i class="cnt" id="aBellN" hidden>0</i></button>\n          <a class="btn b-out sm a-view" href="#top"><i data-ic="eye"></i><span>View website</span></a>\n          <span class="av" title="Owner">O</span>\n        </div>\n      </header>\n      <div class="a-body" id="aBody"></div>\n      <section class="a-body" id="cz" hidden>\n        <p class="note2"><i data-ic="info"></i><span>Changes show on the website straight away. Open \u201CView website\u201D to see them.</span></p>\n        <div class="cztabs" role="tablist" id="czTabs"></div>\n        <div class="czb" id="czBody"></div>\n      </section>\n    </div>\n  </div>\n  <div class="a-scrim" id="aScrim"></div>\n  <aside class="a-drawer" id="aDrawer" aria-hidden="true" role="dialog" aria-labelledby="adT">\n    <span class="ad-grab" aria-hidden="true"></span><div class="dhd"><span class="adi" id="adI" aria-hidden="true"></span><div class="adtt"><span id="adS"></span><h2 id="adT"></h2></div><button class="x" data-adclose aria-label="Close"><i data-ic="x"></i></button></div>\n    <div class="adb" id="adB"></div>\n    <div class="adf" id="adF"></div>\n  </aside>\n  <div class="a-tip" id="aTip" hidden></div>\n</div>';

// server/shell.ts
function securityHeaders(req) {
  const https = new URL(req.url).protocol === "https:";
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    ...https ? ["upgrade-insecure-requests"] : []
  ].join("; ");
  return {
    "content-security-policy": csp,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    ...https ? { "strict-transport-security": "max-age=63072000; includeSubDomains" } : {}
  };
}
var safeJson = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
function imgUrl(origin, ref, isOrig = true) {
  if (ref && ref.startsWith("https://")) return ref;
  if (ref && ref.startsWith("/m/")) return origin + ref;
  return isOrig ? origin + "/assets/brand/cover.jpg" : origin + "/brand/icon.svg";
}
var ORIG_BRAND = "Sitraya";
function brandIconRefs(site, brand) {
  const b2 = site && site.brand || {};
  const orig = brand === ORIG_BRAND;
  const up = (r) => r && (r.startsWith("/m/") || r.startsWith("https://")) ? r : "";
  const favicon = up(b2.favicon) || up(b2.appIcon) || (orig ? "/assets/icon-192.png" : "/brand/icon.svg");
  const touch = up(b2.appIcon) || up(b2.favicon) || (orig ? "/assets/icon-192.png" : "/brand/icon.svg");
  return { favicon, touch };
}
async function renderPage(req, route2) {
  const origin = siteOrigin(req);
  const boot = await publicBoot();
  const brand = boot.cfg.brand && boot.cfg.brand.name || "Shop";
  const site = boot.settings.site || {};
  const B = site.brand || {}, lang = B.lang === "en" ? "en" : "bn", orig = brand === ORIG_BRAND;
  const fill = (s) => String(s || "").replace(/\{brand\}/g, () => brand);
  let title = fill(B.title && B.title[lang]) || (lang === "bn" ? `${brand} \u2014 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09AE\u09A1\u09C7\u09B8\u09CD\u099F \u09AB\u09CD\u09AF\u09BE\u09B6\u09A8` : `${brand} \u2014 Premium modest fashion in Bangladesh`);
  let desc = fill(B.desc && B.desc[lang]) || `${brand}: burqa, abaya, hijab, three piece, kurti and festive wear. Cash on delivery all over Bangladesh.`;
  let image = imgUrl(origin, B.shareImg || void 0, orig);
  let wide = !!B.shareImg;
  let ld = "";
  let path = "/";
  let status = 200;
  if (route2.kind === "product" && route2.id) {
    const p = boot.products.find((x) => x.id === route2.id);
    if (p) {
      const price = p.sale && p.sale < p.price ? p.sale : p.price;
      title = `${p.en} \xB7 \u09F3${price.toLocaleString("en-IN")} \u2014 ${brand}`;
      desc = (p.den || `${p.bn} \u2014 ${p.en}`).slice(0, 200);
      const share = p.shareImg && p._shareFrom === p.img ? p.shareImg : "";
      image = imgUrl(origin, share || p.img, orig);
      wide = !!share;
      path = `/p/${encodeURIComponent(p.id)}`;
      const stock = (p.variants || []).reduce((a, v) => a + v.stock, 0);
      ld = `<script type="application/ld+json">${safeJson({
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.en,
        sku: p.sku,
        description: (p.den || p.en).slice(0, 300),
        image: imgUrl(origin, p.img, orig),
        brand: { "@type": "Brand", name: brand },
        url: origin + path,
        offers: { "@type": "Offer", priceCurrency: "BDT", price: String(price), availability: stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: origin + path }
      })}</script>`;
    } else status = 404;
  } else if (route2.kind === "category" && route2.id) {
    const c = boot.categories.find((x) => x.id === route2.id);
    if (c) {
      title = `${c.en} \xB7 ${c.bn} \u2014 ${brand}`;
      path = `/c/${encodeURIComponent(c.id)}`;
    } else status = 404;
  } else if (route2.kind === "admin") {
    title = `${brand} Admin`;
    path = "/admin";
  }
  const icons = brandIconRefs(site, brand);
  const theme = /^#[0-9a-fA-F]{6}$/.test(B.theme || "") ? B.theme : "#0D2B26";
  const appShort = String(B.appShort || "").trim() || brand;
  const head = `<!doctype html>
<html lang="${lang}" translate="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="${escHtml(origin + path)}">
<meta name="theme-color" content="${escHtml(theme)}">
<meta name="google" content="notranslate">
${route2.kind === "admin" ? `<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="/admin.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${escHtml(appShort.slice(0, 30))}">` : `<meta property="og:type" content="${route2.kind === "product" ? "product" : "website"}">
<meta property="og:site_name" content="${escHtml(brand)}">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:image" content="${escHtml(image)}">
${wide ? `<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
` : ""}<meta property="og:image:alt" content="${escHtml(title)}">
<meta property="og:url" content="${escHtml(origin + path)}">
<meta name="twitter:card" content="summary_large_image">`}
<link rel="icon" href="${escHtml(icons.favicon)}">
<link rel="apple-touch-icon" href="${escHtml(icons.touch)}">
${ld}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Outfit:wght@400;500;600;700;800&family=Anek+Bangla:wght@500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_VER}">
<script id="boot" type="application/json">${safeJson({ ...boot, route: route2 })}</script>
<script src="/assets/app.js?v=${ASSET_VER}" defer></script>
</head>
<body>
`;
  const html = head + BODY + "\n</body>\n</html>\n";
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // public pages are cached for a short time at the edge; admin never
      "cache-control": route2.kind === "admin" ? "no-store" : "public, max-age=0, s-maxage=20, stale-while-revalidate=60",
      ...securityHeaders(req)
    }
  });
}

// server/extras.ts
var BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|preview|headless|lighthouse|pingdom|curl|wget|python|httpclient/i;
var bdDay = () => new Date(Date.now() + 6 * 3600 * 1e3).toISOString().slice(0, 10);
async function recordView(req) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  const ip = clientIp(req);
  await rateLimit(`view:ip:${ip}`, 240, 10 * 60);
  const b2 = external_exports.object({ pid: external_exports.string().regex(/^[A-Za-z0-9_-]{1,40}$/), vid: external_exports.string().regex(/^[a-z0-9]{12,40}$/).optional().default("") }).parse(await readJson(req, 1024));
  const s = await getSettings();
  if (!s.site.views.on) return new Response(null, { status: 204 });
  const db = sql();
  const [p] = await db`select id from products where id = ${b2.pid} and status = 'active'`;
  if (!p) return new Response(null, { status: 204 });
  try {
    await rateLimit(`viewp:${ip}:${b2.pid}`, 20, 24 * 3600);
  } catch {
    return new Response(null, { status: 204 });
  }
  const kView = sha2562(`v|${ip}|${b2.pid}`);
  const fresh = await db`insert into view_seen (k, until) values (${kView}, now() + interval '30 minutes')
    on conflict (k) do update set until = excluded.until where view_seen.until < now()`;
  if (fresh.count !== 1) return new Response(null, { status: 204 });
  const kUniq = sha2562(`u|${b2.vid || ip + "|" + ua}|${b2.pid}`);
  const uniq = await db`insert into view_seen (k, until) values (${kUniq}, now() + interval '30 days') on conflict (k) do nothing`;
  await db`insert into product_views (product_id, day, views, uniques) values (${b2.pid}, ${bdDay()}, 1, ${uniq.count === 1 ? 1 : 0})
    on conflict (product_id, day) do update set views = product_views.views + 1, uniques = product_views.uniques + excluded.uniques`;
  if (Math.random() < 0.02) await db`delete from view_seen where until < now()`;
  return new Response(null, { status: 204 });
}
async function viewTotals(keep) {
  const rows = await sql()`select product_id, sum(views)::int as t, sum(uniques)::int as u from product_views group by product_id`;
  const out = {};
  for (const r of rows) if (!keep || keep(r.product_id, r.t)) out[r.product_id] = keep ? { t: r.t, u: 0 } : { t: r.t, u: r.u };
  return out;
}
var cartOut = (c) => ({ id: c.id, sid: c.sid, phone: c.phone || "", name: c.name, wa: c.wa, district: c.district, items: c.items, value: c.value, status: c.status, reminders: c.reminders || [], optout: c.optout, lang: c.lang, order: c.order_ref, created: new Date(c.created_at).getTime(), updated: new Date(c.updated_at).getTime() });
async function saveCart(req) {
  await rateLimit(`cart:ip:${clientIp(req)}`, 60, 10 * 60);
  const b2 = cartInputSchema.parse(await readJson(req, 16 * 1024));
  const s = await getSettings();
  if (!s.site.cart.on) return json({ ok: true });
  const phone = normPhone(b2.phone) || "";
  const products = await loadProducts({ activeOnly: true });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = b2.items.filter((l) => {
    const p = byId.get(l.pid);
    return p && p.variants.some((v) => v.size === l.size && v.color.toLowerCase() === l.color.toLowerCase());
  }).map((l) => {
    const p = byId.get(l.pid);
    const unit = p.sale && p.sale < p.price ? p.sale : p.price;
    return { id: l.pid, size: l.size, color: l.color, qty: l.qty, price: unit };
  });
  const value = items.reduce((a, l) => a + l.price * l.qty, 0);
  const db = sql();
  if (Math.random() < 0.02) {
    await db`delete from carts where phone is null and updated_at < now() - interval '2 days'`;
    await db`delete from carts where status in ('expired', 'converted') and updated_at < now() - interval '90 days'`;
  }
  return await db.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext(${"cart:" + b2.sid}))`;
    let [rec] = phone ? await tx`select * from carts where phone = ${phone} and sid = ${b2.sid} and status in ('pending', 'reminded') order by updated_at desc limit 1 for update` : await tx`select * from carts where sid = ${b2.sid} and phone is null and status = 'pending' order by updated_at desc limit 1 for update`;
    if (phone) await tx`delete from carts where sid = ${b2.sid} and phone is null and status = 'pending'`;
    if (!items.length) {
      if (rec && (!rec.phone || rec.status === "pending")) await tx`delete from carts where id = ${rec.id}`;
      else if (rec) await tx`update carts set status = 'expired', updated_at = now() where id = ${rec.id}`;
      return json({ ok: true });
    }
    if (!rec) {
      const id = "c" + randomToken(12).replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 16);
      await tx`insert into carts (id, sid, phone, name, wa, district, items, value, lang) values (${id}, ${b2.sid}, ${phone || null}, ${b2.name}, ${normPhone(b2.wa) || ""}, ${b2.district}, ${tx.json(items)}, ${value}, ${b2.lang})`;
      return json({ ok: true, id });
    }
    await tx`update carts set items = ${tx.json(items)}, value = ${value}, sid = ${b2.sid}, lang = ${b2.lang}, updated_at = now(),
      name = case when ${b2.name} <> '' then ${b2.name} else name end,
      wa = case when ${normPhone(b2.wa) || ""} <> '' then ${normPhone(b2.wa) || ""} else wa end,
      district = case when ${b2.district} <> '' then ${b2.district} else district end
      where id = ${rec.id}`;
    return json({ ok: true, id: rec.id });
  });
}
async function getCart(id) {
  const [c] = await sql()`select items from carts where id = ${id} and status <> 'converted'`;
  if (!c) throw new HttpError(404, "This cart is no longer available.", "not_found");
  return json({ items: (c.items || []).map((l) => ({ id: l.id, size: l.size, color: l.color, qty: l.qty })) });
}
async function convertCarts(phone, sid, ref) {
  await sql()`update carts set status = 'converted', order_ref = ${ref}, updated_at = now()
    where status in ('pending', 'reminded', 'expired') and (phone = ${phone} or (${sid} <> '' and sid = ${sid}))`;
}
async function expireOld(days) {
  await sql()`update carts set status = 'expired' where status in ('pending', 'reminded') and updated_at < now() - make_interval(days => ${days})`;
}
async function adminCarts(req) {
  await requireAdmin(req, "orders");
  const s = await getSettings();
  await expireOld(s.site.cart.days);
  const rows = await sql()`select * from carts where phone is not null order by updated_at desc limit 400`;
  const [anon] = await sql()`select count(*)::int as n, coalesce(sum(value), 0)::int as v from carts c
    where c.phone is null and c.status = 'pending' and not exists (select 1 from carts d where d.sid = c.sid and d.phone is not null)`;
  return json({ carts: rows.map(cartOut), anon: { n: anon.n, v: anon.v } });
}
async function adminCartReminded(req, id) {
  const a = await requireAdmin(req, "orders", "edit");
  const C = (await getSettings()).site.cart;
  return await sql().begin(async (tx) => {
    const [c] = await tx`select * from carts where id = ${id} for update`;
    if (!c) throw new HttpError(404, "Cart not found.", "not_found");
    const rem = c.reminders || [], last = rem.length ? rem[rem.length - 1] : 0, age = Date.now() - new Date(c.updated_at).getTime();
    if (!c.phone) throw new HttpError(400, "This cart has no phone number.", "invalid");
    if (c.optout) throw new HttpError(400, "The customer asked not to be messaged.", "invalid");
    if (c.status === "converted") throw new HttpError(400, "The customer already ordered.", "invalid");
    if (c.status === "expired" || age > C.days * 864e5) throw new HttpError(400, "This cart has expired.", "invalid");
    if (rem.length >= C.max) throw new HttpError(400, `Already reminded ${C.max} times.`, "invalid");
    if (last && Date.now() - last < C.cool * 36e5) throw new HttpError(400, "Please wait before sending another reminder.", "invalid");
    const next = rem.concat(Date.now());
    await tx`update carts set reminders = ${tx.json(next)}, status = 'reminded' where id = ${id}`;
    await audit(a.name, "Cart reminder sent", `${c.name} ${c.phone}`);
    return json({ cart: cartOut({ ...c, reminders: next, status: "reminded" }) });
  });
}
async function adminCartOptout(req, id) {
  const a = await requireAdmin(req, "orders", "edit");
  const b2 = external_exports.object({ optout: external_exports.boolean() }).parse(await readJson(req, 512));
  const r = await sql()`update carts set optout = ${b2.optout} where id = ${id} returning *`;
  if (!r.length) throw new HttpError(404, "Cart not found.", "not_found");
  await audit(a.name, b2.optout ? "Customer opted out of messages" : "Customer messages allowed", r[0].phone || "");
  return json({ cart: cartOut(r[0]) });
}
function monogramSvg(name, color) {
  const ch = escHtml((name.trim().charAt(0) || "S").toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${color}"/><text x="50" y="67" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#fff">${ch}</text></svg>`;
}
async function brandBasics() {
  const [cfg, s] = await Promise.all([getCfg(), getSettings()]);
  const name = String(cfg.brand && cfg.brand.name || "Shop");
  const B = s.site.brand;
  return { name, B, site: s.site, theme: /^#[0-9a-fA-F]{6}$/.test(B.theme) ? B.theme : "#0D2B26" };
}
async function brandIcon() {
  const { name, theme } = await brandBasics();
  return new Response(monogramSvg(name, theme), { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=300", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
}
async function adminManifest() {
  const { name, B, site, theme } = await brandBasics();
  const icons = brandIconRefs(site, name);
  const list = B.appIcon && /^(\/m\/|https:\/\/)/.test(B.appIcon) ? [{ src: B.appIcon, sizes: "512x512", purpose: "any" }] : name === ORIG_BRAND ? [{ src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/assets/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] : [{ src: icons.touch, sizes: "any", type: "image/svg+xml", purpose: "any" }];
  const man = {
    name: (B.appName || name + " Admin").slice(0, 45),
    short_name: (B.appShort || name).slice(0, 12),
    description: `Orders, products and notifications for ${name}`,
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: theme,
    theme_color: theme,
    icons: list
  };
  return new Response(JSON.stringify(man), { headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "no-cache", "x-content-type-options": "nosniff" } });
}

// server/seed-data.ts
var DEFAULT_CFG = { "v": 3, "skin": "emerald", "tickerOn": true, "interval": 6.5, "brand": { "name": "Sitraya", "logo": "" }, "delivery": { "inside": 80, "outside": 150, "free": 2e3 }, "ticker": [{ "bn": "\u09A2\u09BE\u0995\u09BE\u09AF\u09BC \u09F3\u09E8,\u09E6\u09E6\u09E6+ \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09AB\u09CD\u09B0\u09BF \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF", "en": "Free delivery inside Dhaka above \u09F32,000" }, { "bn": "\u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF", "en": "Cash on Delivery all over Bangladesh" }, { "bn": "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09AC\u09CB\u09B0\u0995\u09BE \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u098F\u09B8\u09C7\u099B\u09C7", "en": "The new premium burka collection is here" }, { "bn": "WhatsApp-\u098F \u09B8\u09B9\u099C\u09C7\u0987 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8", "en": "Order easily on WhatsApp" }], "slides": [{ "on": true, "img": "cover", "bg": "noir", "art": [], "pill": { "bn": "", "en": "" }, "h": { "bn": "", "en": "" }, "p": { "bn": "", "en": "" }, "btn": { "bn": "\u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8 \u09A6\u09C7\u0996\u09C1\u09A8", "en": "Shop the Collection" }, "link": "abaya" }, { "on": true, "img": "", "bg": "emerald", "art": ["b2", "b1", "n2"], "pill": { "bn": "\u09A8\u09A4\u09C1\u09A8 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8", "en": "New Collection" }, "h": { "bn": "\u09AC\u09CB\u09B0\u0995\u09BE \u0993 \u0986\u09AC\u09BE\u09AF\u09BC\u09BE", "en": "Burqa & Abaya" }, "p": { "bn": "\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09AF\u09BC\u0995, \u0989\u09CE\u09B8\u09AC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0985\u09AD\u09BF\u099C\u09BE\u09A4\u0964 \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0 \u09A1\u09BF\u099C\u09BE\u0987\u09A8\u0964", "en": "Comfortable for every day, refined for every occasion. Find the design that is yours." }, "btn": { "bn": "\u098F\u0996\u09A8\u0987 \u0995\u09BF\u09A8\u09C1\u09A8", "en": "Shop Now" }, "link": "abaya" }, { "on": true, "img": "", "bg": "plum", "art": ["b4", "x-hijab-teal", "b1"], "pill": { "bn": "\u09A8\u09B0\u09AE \u0993 \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09AF\u09BC\u0995", "en": "Soft & Breathable" }, "h": { "bn": "\u09B9\u09BF\u099C\u09BE\u09AC \u0993 \u0996\u09BF\u09AE\u09BE\u09B0", "en": "Hijab & Khimar" }, "p": { "bn": "\u09A8\u09B0\u09AE \u09AB\u09C7\u09AC\u09CD\u09B0\u09BF\u0995 \u0986\u09B0 \u09AE\u09BE\u09A8\u09BE\u09A8\u09B8\u0987 \u09B0\u0999\u09C7 \u09B8\u09BE\u099C\u09BE\u09A8\u09CB \u09B9\u09BF\u099C\u09BE\u09AC \u0993 \u0996\u09BF\u09AE\u09BE\u09B0 \u09B8\u09C7\u099F\u0964", "en": "Hijab and khimar sets in soft fabrics and easy colours." }, "btn": { "bn": "\u098F\u0996\u09A8\u0987 \u0995\u09BF\u09A8\u09C1\u09A8", "en": "Shop Now" }, "link": "hijab" }, { "on": true, "img": "", "bg": "teal", "art": ["n1", "b3", "n5"], "pill": { "bn": "\u09AC\u09BF\u09B6\u09C7\u09B7 \u099B\u09BE\u09A1\u09BC", "en": "Special Offer" }, "h": { "bn": "\u09A5\u09CD\u09B0\u09BF-\u09AA\u09BF\u09B8 \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8", "en": "Three Piece" }, "p": { "bn": "\u0990\u09A4\u09BF\u09B9\u09CD\u09AF \u0986\u09B0 \u0986\u09A7\u09C1\u09A8\u09BF\u0995\u09A4\u09BE\u09B0 \u09AE\u09C7\u09B2\u09AC\u09A8\u09CD\u09A7\u09A8, \u0989\u09CE\u09B8\u09AC \u09A5\u09C7\u0995\u09C7 \u0985\u09AB\u09BF\u09B8 \u09B8\u09AC \u099C\u09BE\u09AF\u09BC\u0997\u09BE\u09AF\u09BC \u09AE\u09BE\u09A8\u09BE\u09A8\u09B8\u0987\u0964", "en": "Tradition meets modern cuts, from festivals to the office." }, "btn": { "bn": "\u098F\u0996\u09A8\u0987 \u0995\u09BF\u09A8\u09C1\u09A8", "en": "Shop Now" }, "link": "three" }], "promos": [{ "on": true, "img": "b5", "bg": "rose", "k": { "bn": "\u09A8\u09A4\u09C1\u09A8 \u09B0\u0999\u09C7", "en": "New colours" }, "h": { "bn": "\u0995\u09C1\u09B0\u09CD\u09A4\u09BF \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8", "en": "Kurti Collection" }, "link": "kurti" }, { "on": true, "img": "n8", "bg": "gold", "k": { "bn": "\u099B\u09CB\u099F\u09CD\u099F \u09AE\u09A8\u09BF\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF", "en": "For little ones" }, "h": { "bn": "\u0995\u09BF\u09A1\u09B8 \u09AA\u09BE\u09B0\u09CD\u099F\u09BF \u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0", "en": "Kids' Party Wear" }, "link": "kids" }, { "on": true, "img": "b6", "bg": "mint", "k": { "bn": "\u0989\u09CE\u09B8\u09AC\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF", "en": "For celebrations" }, "h": { "bn": "\u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF \u0995\u09BE\u09B2\u09C7\u0995\u09B6\u09A8", "en": "Panjabi Collection" }, "link": "men" }], "bb": { "h": { "bn": "\u09B6\u09BE\u09B2\u09C0\u09A8\u09A4\u09BE\u09AF\u09BC \u09B8\u09CC\u09A8\u09CD\u09A6\u09B0\u09CD\u09AF", "en": "Beauty in Modesty" }, "line": { "bn": "\u0986\u09A4\u09CD\u09AE\u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8\u09C7 \u09AA\u09B0\u09BF\u099A\u09AF\u09BC, \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AC\u09CB\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF", "en": "Confidence, for every sister" } }, "btn": "ghorer" };
var DEFAULT_CATEGORIES = [{ "id": "abaya", "bn": "\u09AC\u09CB\u09B0\u0995\u09BE \u0993 \u0986\u09AC\u09BE\u09AF\u09BC\u09BE", "en": "Burqa & Abaya", "img": "b1", "tint": "#EFE6D6" }, { "id": "three", "bn": "\u09A5\u09CD\u09B0\u09BF-\u09AA\u09BF\u09B8", "en": "Three Piece", "img": "n1", "tint": "#E1EEE8" }, { "id": "hijab", "bn": "\u09B9\u09BF\u099C\u09BE\u09AC \u0993 \u0996\u09BF\u09AE\u09BE\u09B0", "en": "Hijab & Khimar", "img": "b4", "tint": "#F5E3EA" }, { "id": "kurti", "bn": "\u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "en": "Kurti", "img": "b5", "tint": "#FBE5E3" }, { "id": "women", "bn": "\u09A8\u09BE\u09B0\u09C0\u09A6\u09C7\u09B0 \u09AA\u09CB\u09B6\u09BE\u0995", "en": "Women's Wear", "img": "x-womens", "tint": "#E8E8EC" }, { "id": "men", "bn": "\u09AA\u09C1\u09B0\u09C1\u09B7\u09A6\u09C7\u09B0 \u09AA\u09CB\u09B6\u09BE\u0995", "en": "Men's Fashion", "img": "b6", "tint": "#E3EDE7" }, { "id": "kids", "bn": "\u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u09AA\u09CB\u09B6\u09BE\u0995", "en": "Kids", "img": "b7", "tint": "#FCE6EC" }];
var DEFAULT_SETTINGS = { "store": { "phone": "", "whatsapp": "", "email": "", "addr": { "bn": "", "en": "" }, "domain": "" }, "pay": { "cod": { "on": true }, "bkash": { "on": false, "num": "" }, "nagad": { "on": false, "num": "" }, "rocket": { "on": false, "num": "" } }, "lowStock": 3, "reviewsApprove": true, "notif": { "order": true, "stock": true, "cancel": true, "review": true, "telegramChat": "" }, "meta": { "pixel": "", "test": "", "pixelOn": false, "capiOn": false, "testMode": true, "events": { "PageView": true, "ViewContent": true, "Search": true, "AddToCart": true, "InitiateCheckout": true, "AddPaymentInfo": false, "Purchase": true } } };
var DEMO_PRODUCTS = [{ "id": "n1", "en": "Noor Embroidered Three Piece", "bn": "\u09A8\u09C2\u09B0 \u098F\u09AE\u09AC\u09CD\u09B0\u09AF\u09BC\u09A1\u09BE\u09B0\u09BF \u09A5\u09CD\u09B0\u09BF-\u09AA\u09BF\u09B8", "cat": "three", "price": 3450, "sale": 2950, "sizes": ["M", "L", "XL"], "colors": ["#0F4A3F", "#7A2540", "#8DB3C2"], "tint": "#E1EEE8", "isNew": 1, "top": 1, "den": "Emerald cotton kameez with gold-tone neckline embroidery, a soft printed dupatta and matching salwar.", "dbn": "\u0997\u09CB\u09B2\u09CD\u09A1\u09C7\u09A8 \u098F\u09AE\u09AC\u09CD\u09B0\u09AF\u09BC\u09A1\u09BE\u09B0\u09BF \u0995\u09B0\u09BE \u098F\u09AE\u09BE\u09B0\u09C7\u09B2\u09CD\u09A1 \u0995\u099F\u09A8 \u0995\u09BE\u09AE\u09BF\u099C, \u09A8\u09B0\u09AE \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09C7\u09A1 \u0993\u09A1\u09BC\u09A8\u09BE \u0986\u09B0 \u09AE\u09CD\u09AF\u09BE\u099A\u09BF\u0982 \u09B8\u09BE\u09B2\u09CB\u09AF\u09BC\u09BE\u09B0\u0964", "sku": "ST-TH-101", "status": "active", "img": "n1", "cost": 1620, "variants": [{ "sku": "ST-TH-101-M-1", "size": "M", "color": "#0F4A3F", "stock": 6 }, { "sku": "ST-TH-101-M-2", "size": "M", "color": "#7A2540", "stock": 6 }, { "sku": "ST-TH-101-M-3", "size": "M", "color": "#8DB3C2", "stock": 4 }, { "sku": "ST-TH-101-L-1", "size": "L", "color": "#0F4A3F", "stock": 3 }, { "sku": "ST-TH-101-L-2", "size": "L", "color": "#7A2540", "stock": 7 }, { "sku": "ST-TH-101-L-3", "size": "L", "color": "#8DB3C2", "stock": 12 }, { "sku": "ST-TH-101-XL-1", "size": "XL", "color": "#0F4A3F", "stock": 0 }, { "sku": "ST-TH-101-XL-2", "size": "XL", "color": "#7A2540", "stock": 5 }, { "sku": "ST-TH-101-XL-3", "size": "XL", "color": "#8DB3C2", "stock": 0 }], "gallery": [], "video": "" }, { "id": "n2", "en": "Mehr Chiffon Abaya", "bn": "\u09AE\u09C7\u09B9\u09C7\u09B0 \u09B6\u09BF\u09AB\u09A8 \u0986\u09AC\u09BE\u09AF\u09BC\u09BE", "cat": "abaya", "price": 4200, "sizes": ["52", "54", "56"], "colors": ["#1C1B19", "#3B3F45"], "tint": "#EFE9DF", "isNew": 1, "den": "Flowing black chiffon abaya with a gold front trim and wide bell sleeves.", "dbn": "\u09B8\u09BE\u09AE\u09A8\u09C7 \u09B8\u09CB\u09A8\u09BE\u09B2\u09BF \u099F\u09CD\u09B0\u09BF\u09AE \u0986\u09B0 \u099A\u0993\u09A1\u09BC\u09BE \u09B9\u09BE\u09A4\u09BE\u09B0 \u09B9\u09BE\u09B2\u0995\u09BE \u0995\u09BE\u09B2\u09CB \u09B6\u09BF\u09AB\u09A8 \u0986\u09AC\u09BE\u09AF\u09BC\u09BE\u0964", "sku": "ST-AB-102", "status": "active", "img": "n2", "cost": 2310, "variants": [{ "sku": "ST-AB-102-52-1", "size": "52", "color": "#1C1B19", "stock": 8 }, { "sku": "ST-AB-102-52-2", "size": "52", "color": "#3B3F45", "stock": 0 }, { "sku": "ST-AB-102-54-1", "size": "54", "color": "#1C1B19", "stock": 2 }, { "sku": "ST-AB-102-54-2", "size": "54", "color": "#3B3F45", "stock": 2 }, { "sku": "ST-AB-102-56-1", "size": "56", "color": "#1C1B19", "stock": 4 }, { "sku": "ST-AB-102-56-2", "size": "56", "color": "#3B3F45", "stock": 11 }], "gallery": [], "video": "" }, { "id": "n3", "en": "Zarin Block-Print Kurti", "bn": "\u099C\u09BE\u09B0\u09BF\u09A8 \u09AC\u09CD\u09B2\u0995-\u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F \u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "cat": "kurti", "price": 1450, "sizes": ["S", "M", "L", "XL"], "colors": ["#C98C8C", "#D19E2F"], "tint": "#F7E6E3", "isNew": 1, "den": "Hand-block style print on breathable cotton for everyday wear.", "dbn": "\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09AA\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09AF\u09BC\u0995 \u0995\u099F\u09A8\u09C7 \u09AC\u09CD\u09B2\u0995-\u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F \u09A1\u09BF\u099C\u09BE\u0987\u09A8\u0964", "sku": "ST-KU-103", "status": "active", "img": "n3", "cost": 800, "variants": [{ "sku": "ST-KU-103-S-1", "size": "S", "color": "#C98C8C", "stock": 2 }, { "sku": "ST-KU-103-S-2", "size": "S", "color": "#D19E2F", "stock": 10 }, { "sku": "ST-KU-103-M-1", "size": "M", "color": "#C98C8C", "stock": 3 }, { "sku": "ST-KU-103-M-2", "size": "M", "color": "#D19E2F", "stock": 0 }, { "sku": "ST-KU-103-L-1", "size": "L", "color": "#C98C8C", "stock": 0 }, { "sku": "ST-KU-103-L-2", "size": "L", "color": "#D19E2F", "stock": 2 }, { "sku": "ST-KU-103-XL-1", "size": "XL", "color": "#C98C8C", "stock": 8 }, { "sku": "ST-KU-103-XL-2", "size": "XL", "color": "#D19E2F", "stock": 6 }], "gallery": [], "video": "" }, { "id": "n4", "en": "Ayra Jamdani-Style Saree", "bn": "\u0986\u09AF\u09BC\u09B0\u09BE \u099C\u09BE\u09AE\u09A6\u09BE\u09A8\u09BF-\u09B8\u09CD\u099F\u09BE\u0987\u09B2 \u09B6\u09BE\u09A1\u09BC\u09BF", "cat": "women", "price": 5800, "sizes": ["Free size"], "colors": ["#F7F0DF", "#0F4A3F"], "tint": "#F3EEE2", "isNew": 1, "den": "Ivory saree with a woven gold border and a contrasting emerald blouse piece.", "dbn": "\u09B8\u09CB\u09A8\u09BE\u09B2\u09BF \u09AA\u09BE\u09A1\u09BC\u09C7\u09B0 \u0986\u0987\u09AD\u09B0\u09BF \u09B6\u09BE\u09A1\u09BC\u09BF, \u09B8\u09BE\u09A5\u09C7 \u098F\u09AE\u09BE\u09B0\u09C7\u09B2\u09CD\u09A1 \u09AC\u09CD\u09B2\u09BE\u0989\u099C \u09AA\u09BF\u09B8\u0964", "sku": "ST-WO-104", "status": "active", "img": "n4", "cost": 3190, "variants": [{ "sku": "ST-WO-104-Freesize-1", "size": "Free size", "color": "#F7F0DF", "stock": 10 }, { "sku": "ST-WO-104-Freesize-2", "size": "Free size", "color": "#0F4A3F", "stock": 5 }], "gallery": [], "video": "" }, { "id": "n5", "en": "Saba Lawn Three Piece", "bn": "\u09B8\u09BE\u09AC\u09BE \u09B2\u09A8 \u09A5\u09CD\u09B0\u09BF-\u09AA\u09BF\u09B8", "cat": "three", "price": 2650, "sale": 2250, "sizes": ["M", "L", "XL"], "colors": ["#8DB3C2", "#F6F1E6"], "tint": "#E4EEF2", "isNew": 1, "den": "Light sky-blue lawn set with a white dupatta, made for warm days.", "dbn": "\u0997\u09B0\u09AE\u09C7\u09B0 \u09A6\u09BF\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B9\u09BE\u09B2\u0995\u09BE \u0986\u0995\u09BE\u09B6\u09BF \u09B2\u09A8 \u09B8\u09C7\u099F, \u09B8\u09BE\u09A5\u09C7 \u09B8\u09BE\u09A6\u09BE \u0993\u09A1\u09BC\u09A8\u09BE\u0964", "sku": "ST-TH-105", "status": "active", "img": "n5", "cost": 1240, "variants": [{ "sku": "ST-TH-105-M-1", "size": "M", "color": "#8DB3C2", "stock": 8 }, { "sku": "ST-TH-105-M-2", "size": "M", "color": "#F6F1E6", "stock": 0 }, { "sku": "ST-TH-105-L-1", "size": "L", "color": "#8DB3C2", "stock": 2 }, { "sku": "ST-TH-105-L-2", "size": "L", "color": "#F6F1E6", "stock": 4 }, { "sku": "ST-TH-105-XL-1", "size": "XL", "color": "#8DB3C2", "stock": 3 }, { "sku": "ST-TH-105-XL-2", "size": "XL", "color": "#F6F1E6", "stock": 10 }], "gallery": [], "video": "" }, { "id": "n6", "en": "Rida Nida Burqa Set", "bn": "\u09B0\u09BF\u09A6\u09BE \u09A8\u09BF\u09A6\u09BE \u09AC\u09CB\u09B0\u0995\u09BE \u09B8\u09C7\u099F", "cat": "abaya", "price": 3600, "sizes": ["52", "54", "56", "58"], "colors": ["#8A7A68", "#1C1B19", "#5A2B3E"], "tint": "#EEE8DF", "isNew": 1, "den": "Two-piece nida burqa with a matching khimar in warm taupe.", "dbn": "\u09AE\u09CD\u09AF\u09BE\u099A\u09BF\u0982 \u0996\u09BF\u09AE\u09BE\u09B0\u09B8\u09B9 \u09A6\u09C1\u0987 \u09AA\u09BF\u09B8\u09C7\u09B0 \u09A8\u09BF\u09A6\u09BE \u09AC\u09CB\u09B0\u0995\u09BE \u09B8\u09C7\u099F\u0964", "sku": "ST-AB-106", "status": "active", "img": "n6", "cost": 1980, "variants": [{ "sku": "ST-AB-106-52-1", "size": "52", "color": "#8A7A68", "stock": 0 }, { "sku": "ST-AB-106-52-2", "size": "52", "color": "#1C1B19", "stock": 9 }, { "sku": "ST-AB-106-52-3", "size": "52", "color": "#5A2B3E", "stock": 12 }, { "sku": "ST-AB-106-54-1", "size": "54", "color": "#8A7A68", "stock": 0 }, { "sku": "ST-AB-106-54-2", "size": "54", "color": "#1C1B19", "stock": 2 }, { "sku": "ST-AB-106-54-3", "size": "54", "color": "#5A2B3E", "stock": 8 }, { "sku": "ST-AB-106-56-1", "size": "56", "color": "#8A7A68", "stock": 11 }, { "sku": "ST-AB-106-56-2", "size": "56", "color": "#1C1B19", "stock": 2 }, { "sku": "ST-AB-106-56-3", "size": "56", "color": "#5A2B3E", "stock": 2 }, { "sku": "ST-AB-106-58-1", "size": "58", "color": "#8A7A68", "stock": 0 }, { "sku": "ST-AB-106-58-2", "size": "58", "color": "#1C1B19", "stock": 5 }, { "sku": "ST-AB-106-58-3", "size": "58", "color": "#5A2B3E", "stock": 2 }], "gallery": [], "video": "" }, { "id": "n7", "en": "Inaya Festive Kurti", "bn": "\u0987\u09A8\u09BE\u09AF\u09BC\u09BE \u09AB\u09C7\u09B8\u09CD\u099F\u09BF\u09AD \u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "cat": "kurti", "price": 1850, "sale": 1650, "sizes": ["S", "M", "L"], "colors": ["#D19E2F", "#C8526A"], "tint": "#FAF0D9", "isNew": 1, "den": "Mustard festive kurti with a contrast placket and printed stripes.", "dbn": "\u0995\u09A8\u099F\u09CD\u09B0\u09BE\u09B8\u09CD\u099F \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u0995\u09C7\u099F \u0986\u09B0 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09C7\u09A1 \u09B8\u09CD\u099F\u09CD\u09B0\u09BE\u0987\u09AA\u09C7\u09B0 \u09B8\u09B0\u09BF\u09B7\u09BE \u09B0\u0999\u09C7\u09B0 \u0989\u09CE\u09B8\u09AC\u09C7\u09B0 \u0995\u09C1\u09B0\u09CD\u09A4\u09BF\u0964", "sku": "ST-KU-107", "status": "active", "img": "n7", "cost": 910, "variants": [{ "sku": "ST-KU-107-S-1", "size": "S", "color": "#D19E2F", "stock": 0 }, { "sku": "ST-KU-107-S-2", "size": "S", "color": "#C8526A", "stock": 0 }, { "sku": "ST-KU-107-M-1", "size": "M", "color": "#D19E2F", "stock": 10 }, { "sku": "ST-KU-107-M-2", "size": "M", "color": "#C8526A", "stock": 7 }, { "sku": "ST-KU-107-L-1", "size": "L", "color": "#D19E2F", "stock": 2 }, { "sku": "ST-KU-107-L-2", "size": "L", "color": "#C8526A", "stock": 3 }], "gallery": [], "video": "" }, { "id": "n8", "en": "Little Maryam Frock", "bn": "\u09B2\u09BF\u099F\u09B2 \u09AE\u09BE\u09B0\u09BF\u09AF\u09BC\u09BE\u09AE \u09AB\u09CD\u09B0\u0995", "cat": "kids", "price": 1250, "sizes": ["2-3Y", "4-5Y", "6-7Y"], "colors": ["#F1B8A0", "#EBA3B6"], "tint": "#FCEBE4", "isNew": 1, "den": "Peach party frock with a tiered skirt and flower trim.", "dbn": "\u09AB\u09C1\u09B2\u09C7\u09B2 \u099F\u09CD\u09B0\u09BF\u09AE \u0986\u09B0 \u0998\u09C7\u09B0 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE \u09AA\u09BF\u099A \u09B0\u0999\u09C7\u09B0 \u09AA\u09BE\u09B0\u09CD\u099F\u09BF \u09AB\u09CD\u09B0\u0995\u0964", "sku": "ST-KI-108", "status": "active", "img": "n8", "cost": 690, "variants": [{ "sku": "ST-KI-108-23Y-1", "size": "2-3Y", "color": "#F1B8A0", "stock": 2 }, { "sku": "ST-KI-108-23Y-2", "size": "2-3Y", "color": "#EBA3B6", "stock": 4 }, { "sku": "ST-KI-108-45Y-1", "size": "4-5Y", "color": "#F1B8A0", "stock": 11 }, { "sku": "ST-KI-108-45Y-2", "size": "4-5Y", "color": "#EBA3B6", "stock": 5 }, { "sku": "ST-KI-108-67Y-1", "size": "6-7Y", "color": "#F1B8A0", "stock": 2 }, { "sku": "ST-KI-108-67Y-2", "size": "6-7Y", "color": "#EBA3B6", "stock": 0 }], "gallery": [], "video": "" }, { "id": "b1", "en": "Classic Black Abaya", "bn": "\u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995 \u0995\u09BE\u09B2\u09CB \u0986\u09AC\u09BE\u09AF\u09BC\u09BE", "cat": "abaya", "price": 3200, "sale": 2850, "sizes": ["52", "54", "56", "58"], "colors": ["#1B1A18", "#2F4A46"], "tint": "#EFE6D6", "den": "A clean everyday black abaya with a matching khimar.", "dbn": "\u09AE\u09CD\u09AF\u09BE\u099A\u09BF\u0982 \u0996\u09BF\u09AE\u09BE\u09B0\u09B8\u09B9 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995 \u0995\u09BE\u09B2\u09CB \u0986\u09AC\u09BE\u09AF\u09BC\u09BE\u0964", "sku": "ST-AB-109", "status": "active", "img": "b1", "cost": 1570, "variants": [{ "sku": "ST-AB-109-52-1", "size": "52", "color": "#1B1A18", "stock": 2 }, { "sku": "ST-AB-109-52-2", "size": "52", "color": "#2F4A46", "stock": 0 }, { "sku": "ST-AB-109-54-1", "size": "54", "color": "#1B1A18", "stock": 0 }, { "sku": "ST-AB-109-54-2", "size": "54", "color": "#2F4A46", "stock": 5 }, { "sku": "ST-AB-109-56-1", "size": "56", "color": "#1B1A18", "stock": 4 }, { "sku": "ST-AB-109-56-2", "size": "56", "color": "#2F4A46", "stock": 3 }, { "sku": "ST-AB-109-58-1", "size": "58", "color": "#1B1A18", "stock": 12 }, { "sku": "ST-AB-109-58-2", "size": "58", "color": "#2F4A46", "stock": 4 }], "gallery": [], "video": "" }, { "id": "b2", "en": "Luxury Embroidered Burqa", "bn": "\u09B2\u09BE\u0995\u09CD\u09B8\u09BE\u09B0\u09BF \u098F\u09AE\u09AC\u09CD\u09B0\u09AF\u09BC\u09A1\u09BE\u09B0\u09BF \u09AC\u09CB\u09B0\u0995\u09BE", "cat": "abaya", "price": 3800, "sale": 3200, "sizes": ["52", "54", "56"], "colors": ["#141312", "#0F3B33"], "tint": "#F1E7D2", "top": 1, "den": "Long khimar burqa with gold motif embroidery down the front and along the hem.", "dbn": "\u09B8\u09BE\u09AE\u09A8\u09C7 \u0993 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AA\u09BE\u09A1\u09BC\u09C7 \u09B8\u09CB\u09A8\u09BE\u09B2\u09BF \u09AE\u09CB\u099F\u09BF\u09AB \u098F\u09AE\u09AC\u09CD\u09B0\u09AF\u09BC\u09A1\u09BE\u09B0\u09BF \u0995\u09B0\u09BE \u09B2\u09AE\u09CD\u09AC\u09BE \u0996\u09BF\u09AE\u09BE\u09B0 \u09AC\u09CB\u09B0\u0995\u09BE\u0964", "sku": "ST-AB-110", "status": "active", "img": "b2", "cost": 1760, "variants": [{ "sku": "ST-AB-110-52-1", "size": "52", "color": "#141312", "stock": 12 }, { "sku": "ST-AB-110-52-2", "size": "52", "color": "#0F3B33", "stock": 6 }, { "sku": "ST-AB-110-54-1", "size": "54", "color": "#141312", "stock": 3 }, { "sku": "ST-AB-110-54-2", "size": "54", "color": "#0F3B33", "stock": 6 }, { "sku": "ST-AB-110-56-1", "size": "56", "color": "#141312", "stock": 2 }, { "sku": "ST-AB-110-56-2", "size": "56", "color": "#0F3B33", "stock": 7 }], "gallery": [], "video": "" }, { "id": "b3", "en": "Georgette Three Piece", "bn": "\u099C\u09B0\u09CD\u099C\u09C7\u099F \u09A5\u09CD\u09B0\u09BF-\u09AA\u09BF\u09B8", "cat": "three", "price": 2450, "sizes": ["M", "L", "XL"], "colors": ["#7A2540", "#0F4A3F"], "tint": "#F6E3E8", "den": "Deep maroon georgette set with a rose dupatta.", "dbn": "\u0997\u09CB\u09B2\u09BE\u09AA\u09BF \u0993\u09A1\u09BC\u09A8\u09BE\u09B8\u09B9 \u0997\u09BE\u09A2\u09BC \u09AE\u09C7\u09B0\u09C1\u09A8 \u099C\u09B0\u09CD\u099C\u09C7\u099F \u09B8\u09C7\u099F\u0964", "sku": "ST-TH-111", "status": "active", "img": "b3", "cost": 1350, "variants": [{ "sku": "ST-TH-111-M-1", "size": "M", "color": "#7A2540", "stock": 5 }, { "sku": "ST-TH-111-M-2", "size": "M", "color": "#0F4A3F", "stock": 0 }, { "sku": "ST-TH-111-L-1", "size": "L", "color": "#7A2540", "stock": 6 }, { "sku": "ST-TH-111-L-2", "size": "L", "color": "#0F4A3F", "stock": 4 }, { "sku": "ST-TH-111-XL-1", "size": "XL", "color": "#7A2540", "stock": 3 }, { "sku": "ST-TH-111-XL-2", "size": "XL", "color": "#0F4A3F", "stock": 2 }], "gallery": [], "video": "" }, { "id": "b4", "en": "Hijab & Khimar Set", "bn": "\u09B9\u09BF\u099C\u09BE\u09AC \u0993 \u0996\u09BF\u09AE\u09BE\u09B0 \u09B8\u09C7\u099F", "cat": "hijab", "price": 1250, "sizes": ["Free size"], "colors": ["#A34E72", "#4F8077", "#1B1A18"], "tint": "#F5E3EA", "den": "Soft plum khimar with a matching inner abaya.", "dbn": "\u09AE\u09CD\u09AF\u09BE\u099A\u09BF\u0982 \u0987\u09A8\u09BE\u09B0 \u0986\u09AC\u09BE\u09AF\u09BC\u09BE\u09B8\u09B9 \u09A8\u09B0\u09AE \u09AA\u09CD\u09B2\u09BE\u09AE \u09B0\u0999\u09C7\u09B0 \u0996\u09BF\u09AE\u09BE\u09B0\u0964", "sku": "ST-HI-112", "status": "active", "img": "b4", "cost": 690, "variants": [{ "sku": "ST-HI-112-Freesize-1", "size": "Free size", "color": "#A34E72", "stock": 10 }, { "sku": "ST-HI-112-Freesize-2", "size": "Free size", "color": "#4F8077", "stock": 10 }, { "sku": "ST-HI-112-Freesize-3", "size": "Free size", "color": "#1B1A18", "stock": 10 }], "gallery": [], "video": "" }, { "id": "b5", "en": "Floral Kurti", "bn": "\u09AB\u09CD\u09B2\u09CB\u09B0\u09BE\u09B2 \u0995\u09C1\u09B0\u09CD\u09A4\u09BF", "cat": "kurti", "price": 2100, "sale": 1850, "sizes": ["S", "M", "L", "XL"], "colors": ["#C8526A", "#0F4A3F"], "tint": "#FBE5E3", "den": "Rose-red kurti with a cream floral print.", "dbn": "\u0995\u09CD\u09B0\u09BF\u09AE \u09AB\u09C1\u09B2\u09C7\u09B2 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09C7\u09B0 \u0997\u09CB\u09B2\u09BE\u09AA\u09BF-\u09B2\u09BE\u09B2 \u0995\u09C1\u09B0\u09CD\u09A4\u09BF\u0964", "sku": "ST-KU-113", "status": "active", "img": "b5", "cost": 1020, "variants": [{ "sku": "ST-KU-113-S-1", "size": "S", "color": "#C8526A", "stock": 6 }, { "sku": "ST-KU-113-S-2", "size": "S", "color": "#0F4A3F", "stock": 2 }, { "sku": "ST-KU-113-M-1", "size": "M", "color": "#C8526A", "stock": 2 }, { "sku": "ST-KU-113-M-2", "size": "M", "color": "#0F4A3F", "stock": 10 }, { "sku": "ST-KU-113-L-1", "size": "L", "color": "#C8526A", "stock": 11 }, { "sku": "ST-KU-113-L-2", "size": "L", "color": "#0F4A3F", "stock": 2 }, { "sku": "ST-KU-113-XL-1", "size": "XL", "color": "#C8526A", "stock": 5 }, { "sku": "ST-KU-113-XL-2", "size": "XL", "color": "#0F4A3F", "stock": 3 }], "gallery": [], "video": "" }, { "id": "b6", "en": "Men's Classic Panjabi", "bn": "\u0995\u09CD\u09B2\u09BE\u09B8\u09BF\u0995 \u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF", "cat": "men", "price": 1450, "sizes": ["38", "40", "42", "44"], "colors": ["#1F4B3F", "#F1ECE2"], "tint": "#E3EDE7", "den": "Bottle-green panjabi with a band collar and gold-tone buttons.", "dbn": "\u09AC\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1 \u0995\u09B2\u09BE\u09B0 \u0986\u09B0 \u09B8\u09CB\u09A8\u09BE\u09B2\u09BF \u09AC\u09CB\u09A4\u09BE\u09AE\u09C7\u09B0 \u09AC\u09CB\u09A4\u09B2-\u09B8\u09AC\u09C1\u099C \u09AA\u09BE\u099E\u09CD\u099C\u09BE\u09AC\u09BF\u0964", "sku": "ST-ME-114", "status": "active", "img": "b6", "cost": 800, "variants": [{ "sku": "ST-ME-114-38-1", "size": "38", "color": "#1F4B3F", "stock": 2 }, { "sku": "ST-ME-114-38-2", "size": "38", "color": "#F1ECE2", "stock": 5 }, { "sku": "ST-ME-114-40-1", "size": "40", "color": "#1F4B3F", "stock": 11 }, { "sku": "ST-ME-114-40-2", "size": "40", "color": "#F1ECE2", "stock": 5 }, { "sku": "ST-ME-114-42-1", "size": "42", "color": "#1F4B3F", "stock": 6 }, { "sku": "ST-ME-114-42-2", "size": "42", "color": "#F1ECE2", "stock": 3 }, { "sku": "ST-ME-114-44-1", "size": "44", "color": "#1F4B3F", "stock": 9 }, { "sku": "ST-ME-114-44-2", "size": "44", "color": "#F1ECE2", "stock": 6 }], "gallery": [], "video": "" }, { "id": "b7", "en": "Kids Party Frock", "bn": "\u0995\u09BF\u09A1\u09B8 \u09AA\u09BE\u09B0\u09CD\u099F\u09BF \u09AB\u09CD\u09B0\u0995", "cat": "kids", "price": 950, "sizes": ["2-3Y", "4-5Y", "6-7Y"], "colors": ["#EBA3B6", "#F1B8A0"], "tint": "#FCE6EC", "den": "Pink frock with a tiered skirt for little ones.", "dbn": "\u099B\u09CB\u099F\u09CD\u099F \u09AE\u09A8\u09BF\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0998\u09C7\u09B0 \u09A6\u09C7\u0993\u09AF\u09BC\u09BE \u0997\u09CB\u09B2\u09BE\u09AA\u09BF \u09AB\u09CD\u09B0\u0995\u0964", "sku": "ST-KI-115", "status": "active", "img": "b7", "cost": 520, "variants": [{ "sku": "ST-KI-115-23Y-1", "size": "2-3Y", "color": "#EBA3B6", "stock": 8 }, { "sku": "ST-KI-115-23Y-2", "size": "2-3Y", "color": "#F1B8A0", "stock": 11 }, { "sku": "ST-KI-115-45Y-1", "size": "4-5Y", "color": "#EBA3B6", "stock": 0 }, { "sku": "ST-KI-115-45Y-2", "size": "4-5Y", "color": "#F1B8A0", "stock": 10 }, { "sku": "ST-KI-115-67Y-1", "size": "6-7Y", "color": "#EBA3B6", "stock": 10 }, { "sku": "ST-KI-115-67Y-2", "size": "6-7Y", "color": "#F1B8A0", "stock": 12 }], "gallery": [], "video": "" }, { "id": "x-hijab-teal", "en": "Teal Khimar Set", "bn": "\u099F\u09BF\u09B2 \u0996\u09BF\u09AE\u09BE\u09B0 \u09B8\u09C7\u099F", "cat": "hijab", "price": 1350, "sizes": ["Free size"], "colors": ["#4F8077", "#A34E72"], "tint": "#E2EEEB", "den": "Two-piece khimar set in a calm teal.", "dbn": "\u09B6\u09BE\u09A8\u09CD\u09A4 \u099F\u09BF\u09B2 \u09B0\u0999\u09C7\u09B0 \u09A6\u09C1\u0987 \u09AA\u09BF\u09B8\u09C7\u09B0 \u0996\u09BF\u09AE\u09BE\u09B0 \u09B8\u09C7\u099F\u0964", "sku": "ST-HI-116", "status": "active", "img": "x-hijab-teal", "cost": 740, "variants": [{ "sku": "ST-HI-116-Freesize-1", "size": "Free size", "color": "#4F8077", "stock": 12 }, { "sku": "ST-HI-116-Freesize-2", "size": "Free size", "color": "#A34E72", "stock": 10 }], "gallery": [], "video": "" }];

// server/store.ts
async function getKV(key, fallback) {
  const rows = await sql()`select value from kv where key = ${key}`;
  return rows.length ? rows[0].value : fallback;
}
async function kvVersion(key) {
  const rows = await sql()`select (extract(epoch from updated_at) * 1000)::bigint::text as v from kv where key = ${key}`;
  return rows.length ? Number(rows[0].v) : 0;
}
async function setKVChecked(key, value, expected) {
  return sql().begin(async (tx) => {
    const cur = await tx`select (extract(epoch from updated_at) * 1000)::bigint::text as v from kv where key = ${key} for update`;
    const now = cur.length ? Number(cur[0].v) : 0;
    if (expected !== void 0 && expected !== now) throw new HttpError(409, "Someone else changed this a moment ago. The latest version has been loaded \u2014 please make your change again.", "conflict");
    const r = await tx`insert into kv (key, value, updated_at) values (${key}, ${tx.json(value)}, clock_timestamp())
      on conflict (key) do update set value = excluded.value, updated_at = clock_timestamp() returning (extract(epoch from updated_at) * 1000)::bigint::text as v`;
    return Number(r[0].v);
  });
}
async function setKV(key, value) {
  await sql()`insert into kv (key, value, updated_at) values (${key}, ${asJson(value)}, now())
              on conflict (key) do update set value = excluded.value, updated_at = now()`;
}
var getCfg = () => getKV("cfg", structuredClone(DEFAULT_CFG));
var getCategories = () => getKV("categories", structuredClone(DEFAULT_CATEGORIES));
async function getSettings() {
  const raw = await getKV("settings", structuredClone(DEFAULT_SETTINGS));
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : settingsSchema.parse(DEFAULT_SETTINGS);
}
async function getSecrets() {
  const blob = await getKV("secrets", "");
  if (!blob) return {};
  try {
    return JSON.parse(decrypt(blob));
  } catch (e) {
    console.error("Could not read saved secrets (was APP_SECRET changed?)", e);
    return {};
  }
}
async function setSecrets(patch) {
  const blob = await getKV("secrets", "");
  let cur = {};
  if (blob) {
    try {
      cur = JSON.parse(decrypt(blob));
    } catch {
      throw new HttpError(500, "Saved keys cannot be read because APP_SECRET was changed. Put the old APP_SECRET back in Netlify and redeploy.", "config");
    }
  }
  const next = { ...cur, ...patch };
  for (const k of Object.keys(next)) if (next[k] === "") delete next[k];
  await setKV("secrets", encrypt(JSON.stringify(next)));
  return next;
}
async function loadProducts(opts = {}) {
  const db = sql();
  const prods = opts.activeOnly ? await db`select id, doc, (extract(epoch from updated_at) * 1000)::bigint::text as v from products where status = 'active' order by sort, id` : await db`select id, doc, (extract(epoch from updated_at) * 1000)::bigint::text as v from products order by sort, id`;
  if (!prods.length) return [];
  const vars = await db`select product_id, sku, size, color, stock from variants where product_id in ${db(prods.map((p) => p.id))} order by pos, sku`;
  const by = /* @__PURE__ */ new Map();
  for (const v of vars) {
    const l = by.get(v.product_id) || [];
    l.push({ sku: v.sku, size: v.size, color: v.color, stock: v.stock });
    by.set(v.product_id, l);
  }
  return prods.map((p) => ({ ...p.doc, id: p.id, variants: by.get(p.id) || [], ...opts.withVersion ? { _v: Number(p.v) } : {} }));
}
function publicProduct(p) {
  const { cost: _cost, ...rest } = p;
  return rest;
}
var seeded = null;
function ensureSeed() {
  if (!seeded) {
    seeded = (async () => {
      const db = sql();
      const done = await getKV("seeded", false);
      if (done) return;
      await db.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(726354002)`;
        const again = await tx`select value from kv where key = 'seeded'`;
        if (again.length) return;
        const [{ n }] = await tx`select count(*)::int as n from products`;
        if (n === 0 && env("SEED_DEMO_PRODUCTS", "1") !== "0") {
          let sort = 0;
          for (const p of DEMO_PRODUCTS) {
            const { variants, ...doc } = p;
            await tx`insert into products (id, sort, status, doc) values (${p.id}, ${sort++}, ${p.status}, ${tx.json(doc)})`;
            let pos = 0;
            for (const v of variants) await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${p.id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
          }
        }
        await tx`insert into kv (key, value) values ('seeded', 'true'::jsonb)`;
      });
    })().catch((e) => {
      seeded = null;
      throw e;
    });
  }
  return seeded;
}
async function publicBoot() {
  const [cfg, categories, products, s] = await Promise.all([getCfg(), getCategories(), loadProducts({ activeOnly: true }), getSettings()]);
  return {
    cfg,
    categories,
    products: products.map(publicProduct),
    settings: {
      store: s.store,
      pay: s.pay,
      lowStock: s.lowStock,
      meta: { pixel: s.meta.pixel, pixelOn: s.meta.pixelOn && !!s.meta.pixel, events: s.meta.events },
      site: { ...s.site, cart: { on: s.site.cart.on, days: s.site.cart.days, cool: s.site.cart.cool, max: s.site.cart.max, tpl: { bn: "", en: "" } } }
    },
    // only the counts customers are meant to see: shown products, above the minimum
    views: s.site.views.on ? await viewTotals((pid, t) => {
      const p = products.find((x) => x.id === pid);
      if (!p) return false;
      const ov = p.views || "";
      return ov === "show" || ov !== "hide" && s.site.views.show && t >= s.site.views.min;
    }) : {}
  };
}

// server/orders.ts
var REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newRef() {
  const b2 = crypto4.randomBytes(6);
  let r = "ST-";
  for (let i = 0; i < 6; i++) r += REF_CHARS[b2[i] % REF_CHARS.length];
  return r;
}
function couponDiscount(c, sub, now = Date.now()) {
  if (!c.active) return { ok: false, code: "cp_off" };
  if (c.expires && now > c.expires) return { ok: false, code: "cp_exp" };
  if (c.maxUses && (c.uses || 0) >= c.maxUses) return { ok: false, code: "cp_used" };
  if (sub < (c.min || 0)) return { ok: false, code: "cp_min", min: c.min };
  const disc = c.type === "percent" ? Math.round(sub * c.value / 100) : Math.min(c.value, sub);
  return { ok: true, disc };
}
function deliveryCharge(cfgDelivery, zone, sub) {
  const free = zone === "in" && sub >= cfgDelivery.free;
  return { free, del: free ? 0 : zone === "in" ? cfgDelivery.inside : cfgDelivery.outside };
}
async function createOrder(req, input) {
  await rateLimit(`order:ip:${clientIp(req)}`, 12, 10 * 60);
  const phone = normPhone(input.customer.phone);
  if (!phone) throw new HttpError(400, "Enter a valid Bangladeshi mobile number.", "e_phone");
  const wa = input.customer.wa ? normPhone(input.customer.wa) : "";
  if (input.customer.wa && !wa) throw new HttpError(400, "Enter a valid WhatsApp number.", "e_phone");
  await rateLimit(`order:ph:${phone}`, 8, 60 * 60);
  const [settings, cfg] = await Promise.all([getSettings(), getCfg()]);
  const pm = input.pay === "cod" ? settings.pay.cod : settings.pay[input.pay];
  if (!pm || !pm.on) throw new HttpError(400, "This payment method is not available.", "pay_off");
  if (input.pay !== "cod" && !input.trx) throw new HttpError(400, "Enter the transaction ID (TrxID).", "e_trx");
  const delivery = { inside: 80, outside: 150, free: 2e3, ...cfg.delivery || {} };
  const lines = /* @__PURE__ */ new Map();
  for (const it of input.items) {
    const k = `${it.pid}|${it.size}|${it.color.toLowerCase()}`;
    const cur = lines.get(k);
    if (cur) cur.qty = Math.min(10, cur.qty + it.qty);
    else lines.set(k, { ...it, color: it.color.toLowerCase() });
  }
  const db = sql();
  const order = await db.begin(async (tx) => {
    const pids = [...new Set([...lines.values()].map((l) => l.pid))];
    const prods = await tx`select id, doc from products where id in ${tx(pids)} and status = 'active'`;
    const pmap = new Map(prods.map((p) => [p.id, p.doc]));
    const vars = await tx`
      select sku, product_id, size, color, stock from variants where product_id in ${tx(pids)} order by sku for update`;
    const items = [];
    let sub = 0;
    for (const l of lines.values()) {
      const p = pmap.get(l.pid);
      if (!p) throw new HttpError(409, "A product in your bag is no longer available.", "stock_changed");
      const v = vars.find((x) => x.product_id === l.pid && x.size === l.size && x.color.toLowerCase() === l.color);
      if (!v || v.stock < l.qty) throw new HttpError(409, `${p.en}: not enough stock for this size/colour.`, "stock_changed");
      const unit = p.sale && p.sale < p.price ? p.sale : p.price;
      items.push({ pid: l.pid, en: p.en, bn: p.bn, sku: v.sku, size: v.size, color: v.color, qty: l.qty, unit });
      sub += unit * l.qty;
    }
    let disc = 0, couponCode = "";
    if (input.coupon) {
      const cr = await tx`select doc, uses from coupons where code = ${input.coupon} for update`;
      if (!cr.length) throw new HttpError(400, "This coupon code does not exist.", "cp_bad");
      const chk = couponDiscount({ ...cr[0].doc, uses: cr[0].uses }, sub);
      if (!chk.ok) throw new HttpError(400, "This coupon cannot be used for this order.", chk.code);
      disc = chk.disc;
      couponCode = input.coupon;
      await tx`update coupons set uses = uses + 1 where code = ${input.coupon}`;
    }
    const zone = isDhaka(input.customer.district) ? "in" : "out";
    const { del } = deliveryCharge(delivery, zone, sub);
    const now = Date.now();
    for (const it of items) {
      const r = await tx`update variants set stock = stock - ${it.qty} where sku = ${it.sku} and stock >= ${it.qty}`;
      if (r.count !== 1) throw new HttpError(409, `${it.en}: not enough stock.`, "stock_changed");
    }
    let ref = "";
    const doc = {
      id: "",
      ref: "",
      at: now,
      demo: false,
      source: "web",
      customer: { name: input.customer.name, phone, wa, district: input.customer.district, area: input.customer.area, po: input.customer.po || "", addr: input.customer.addr, note: input.customer.note || "" },
      zone,
      items,
      sub,
      disc,
      coupon: couponCode,
      del,
      total: sub - disc + del,
      pay: input.pay,
      trx: input.pay === "cod" ? "" : input.trx,
      payStatus: input.pay === "cod" ? "unpaid" : "verify",
      status: "received",
      history: [{ s: "received", at: now, by: "customer" }],
      courier: "",
      tracking: "",
      notes: "",
      stockOut: true
    };
    for (let i = 0; i < 6 && !ref; i++) {
      const cand = newRef();
      doc.ref = doc.id = cand;
      const r = await tx`insert into orders (ref, status, phone, doc) values (${cand}, 'received', ${phone}, ${tx.json(doc)}) on conflict (ref) do nothing`;
      if (r.count === 1) ref = cand;
    }
    if (!ref) throw new HttpError(500, "Could not create an order number. Please try again.", "server");
    for (const it of items) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${it.pid}, ${it.sku}, ${-it.qty}, ${"Order " + ref}, ${"customer"})`;
    if (settings.notif.order) await tx`insert into notifs (type, title, body, ref) values ('order', ${"New order " + ref}, ${`${doc.customer.name} \xB7 \u09F3${doc.total.toLocaleString("en-IN")} \xB7 ${doc.customer.district}`}, ${ref})`;
    if (settings.notif.stock) {
      const low = await tx`select sku, stock, product_id from variants where sku in ${tx(items.map((i) => i.sku))} and stock <= ${settings.lowStock}`;
      for (const v of low) {
        const p = pmap.get(v.product_id);
        await tx`insert into notifs (type, title, body, ref) values ('stock', ${(v.stock ? "Low stock: " : "Out of stock: ") + (p?.en || v.product_id)}, ${v.sku + " \xB7 " + v.stock + " left"}, ${v.product_id})`;
      }
    }
    return doc;
  });
  return order;
}
function publicOrderView(o) {
  return {
    ref: o.ref,
    at: o.at,
    items: o.items,
    sub: o.sub,
    disc: o.disc,
    coupon: o.coupon,
    del: o.del,
    total: o.total,
    pay: o.pay,
    zone: o.zone,
    payStatus: o.payStatus,
    status: o.status,
    customer: { name: o.customer.name, phone: o.customer.phone, addr: o.customer.addr, area: o.customer.area, district: o.customer.district }
  };
}
async function trackOrder(req, refRaw, phoneRaw) {
  await rateLimit(`track:ip:${clientIp(req)}`, 30, 10 * 60);
  const ref = String(refRaw || "").trim().toUpperCase().replace(/^ST(?=[A-Z0-9]{6}$)/, "ST-");
  const phone = normPhone(phoneRaw);
  if (!/^ST-[A-Z0-9]{6}$/.test(ref) || !phone) return null;
  const rows = await sql()`select doc from orders where ref = ${ref} and phone = ${phone}`;
  if (!rows.length) return null;
  const o = rows[0].doc;
  return { ref: o.ref, total: o.total, payStatus: o.payStatus, status: o.status, history: o.history.map((h) => ({ s: h.s, at: h.at })), courier: o.courier, tracking: o.tracking };
}
function allowedNext(status) {
  if (status === "cancelled" || status === "returned") return [];
  const i = FLOW.indexOf(status);
  const out = FLOW.filter((_, j) => j > i);
  out.push(status === "delivered" ? "returned" : "cancelled");
  return out;
}
async function changeStatus(admin, ref, next, note) {
  const settings = await getSettings();
  const result = await sql().begin(async (tx) => {
    const rows = await tx`select doc from orders where ref = ${ref} for update`;
    if (!rows.length) throw new HttpError(404, "Order not found.", "not_found");
    const o = rows[0].doc;
    if (!allowedNext(o.status).includes(next)) throw new HttpError(409, `An order that is ${o.status} cannot become ${next}.`, "bad_transition");
    const old = o.status;
    o.status = next;
    o.history.push({ s: next, at: Date.now(), by: admin.name, note: note || "" });
    const touched = [];
    if ((next === "cancelled" || next === "returned") && o.stockOut) {
      for (const it of o.items) {
        let r = await tx`update variants set stock = stock + ${it.qty} where sku = ${it.sku}`;
        if (r.count !== 1) r = await tx`update variants set stock = stock + ${it.qty} where sku = (select sku from variants where product_id = ${it.pid} and size = ${it.size} and lower(color) = lower(${it.color}) limit 1)`;
        if (r.count === 1) {
          touched.push(it.pid);
          await tx`insert into moves (product_id, sku, delta, why, by_name) values (${it.pid}, ${it.sku}, ${it.qty}, ${(next === "cancelled" ? "Cancelled " : "Returned ") + ref}, ${admin.name})`;
        }
      }
      o.stockOut = false;
    }
    await tx`update orders set status = ${next}, doc = ${tx.json(o)}, updated_at = now() where ref = ${ref}`;
    if (next === "cancelled" && settings.notif.cancel) await tx`insert into notifs (type, title, body, ref) values ('cancel', ${"Order cancelled " + ref}, ${o.customer.name + " \xB7 \u09F3" + o.total.toLocaleString("en-IN")}, ${ref})`;
    return { order: o, touched, old };
  });
  await audit(admin.name, "Order status changed", `${ref}: ${result.old} \u2192 ${next}${note ? ` ("${note}")` : ""}`);
  return { order: result.order, touched: [...new Set(result.touched)] };
}
async function patchOrder(admin, ref, patch) {
  const o = await sql().begin(async (tx) => {
    const rows = await tx`select doc from orders where ref = ${ref} for update`;
    if (!rows.length) throw new HttpError(404, "Order not found.", "not_found");
    const d = rows[0].doc;
    Object.assign(d, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== void 0)));
    await tx`update orders set doc = ${tx.json(d)}, updated_at = now() where ref = ${ref}`;
    return d;
  });
  const what = Object.keys(patch).filter((k) => patch[k] !== void 0).join(", ");
  if (what) await audit(admin.name, "Order updated", `${ref}: ${what}`);
  return o;
}

// server/webpush.ts
import crypto5 from "node:crypto";
var b64u = (b2) => Buffer.from(b2).toString("base64url");
var unb64u = (s) => Buffer.from(s, "base64url");
var hmac2 = (key, data) => crypto5.createHmac("sha256", key).update(data).digest();
function generateVapidKeys() {
  const { privateKey } = crypto5.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = privateKey.export({ format: "jwk" });
  const pub = Buffer.concat([Buffer.from([4]), unb64u(jwk.x), unb64u(jwk.y)]);
  return { publicKey: b64u(pub), privateKey: jwk.d };
}
function privateKeyObject(publicKeyB64u, privateKeyB64u) {
  const pub = unb64u(publicKeyB64u);
  return crypto5.createPrivateKey({ key: { kty: "EC", crv: "P-256", x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: privateKeyB64u }, format: "jwk" });
}
function vapidAuthHeader(endpoint, keys, subject, expSeconds = 12 * 3600) {
  const aud = new URL(endpoint).origin;
  const header = b64u(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64u(Buffer.from(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1e3) + expSeconds, sub: subject })));
  const data = `${header}.${payload}`;
  const sig = crypto5.sign("sha256", Buffer.from(data), { key: privateKeyObject(keys.publicKey, keys.privateKey), dsaEncoding: "ieee-p1363" });
  return `vapid t=${data}.${b64u(sig)}, k=${keys.publicKey}`;
}
function encryptPayload(plaintext, uaPublicB64u, authSecretB64u, opts = {}) {
  const uaPublic = unb64u(uaPublicB64u);
  const authSecret = unb64u(authSecretB64u);
  if (uaPublic.length !== 65 || uaPublic[0] !== 4) throw new Error("bad p256dh key");
  if (authSecret.length < 16) throw new Error("bad auth secret");
  const ecdh = crypto5.createECDH("prime256v1");
  if (opts.asPrivate) ecdh.setPrivateKey(unb64u(opts.asPrivate));
  else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const ecdhSecret = ecdh.computeSecret(uaPublic);
  const prkKey = hmac2(authSecret, ecdhSecret);
  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]);
  const ikm = hmac2(prkKey, Buffer.concat([keyInfo, Buffer.from([1])]));
  const salt = opts.salt ?? crypto5.randomBytes(16);
  const prk = hmac2(salt, ikm);
  const cek = hmac2(prk, Buffer.from("Content-Encoding: aes128gcm\0")).subarray(0, 16);
  const nonce = hmac2(prk, Buffer.from("Content-Encoding: nonce\0")).subarray(0, 12);
  const cipher = crypto5.createCipheriv("aes-128-gcm", cek, nonce);
  const padded = Buffer.concat([plaintext, Buffer.from([2])]);
  const ct = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4);
  rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, ct]);
}
async function sendPush(sub, payload, keys, subject) {
  try {
    const url = new URL(sub.endpoint);
    if (url.protocol !== "https:") return "gone";
    const body = encryptPayload(Buffer.from(JSON.stringify(payload)), sub.p256dh, sub.auth);
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        TTL: "86400",
        Urgency: "high",
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        Authorization: vapidAuthHeader(sub.endpoint, keys, subject)
      },
      body: new Uint8Array(body),
      signal: AbortSignal.timeout(6e3)
    });
    if (res.status === 404 || res.status === 410) return "gone";
    if (!res.ok) {
      console.warn("push failed", res.status, (await res.text()).slice(0, 200));
      return "error";
    }
    return "ok";
  } catch (e) {
    console.warn("push error", e);
    return "error";
  }
}

// server/notify.ts
async function getVapid() {
  const s = await getSecrets();
  if (s.vapidPublic && s.vapidPrivate) return { publicKey: s.vapidPublic, privateKey: s.vapidPrivate };
  const k = generateVapidKeys();
  await setSecrets({ vapidPublic: k.publicKey, vapidPrivate: k.privateKey });
  return k;
}
var withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r("timeout"), ms))]);
async function pushToAdmins(req, payload, area = "dashboard", onlyAdminId) {
  const rows = await sql()`
    select s.endpoint, s.p256dh, s.auth, a.role, a.id as admin_id from push_subs s join admins a on a.id = s.admin_id where a.active`;
  const targets = rows.filter((r) => can(r.role, area, "view") && (!onlyAdminId || r.admin_id === onlyAdminId));
  if (!targets.length) return { sent: 0, failed: 0 };
  const keys = await getVapid();
  const subject = env("VAPID_SUBJECT") || siteOrigin(req);
  let sent = 0, failed = 0;
  await Promise.all(targets.map(async (t) => {
    const r = await sendPush(t, payload, keys, subject.startsWith("http") || subject.startsWith("mailto:") ? subject : "mailto:" + subject);
    if (r === "ok") sent++;
    else failed++;
    if (r === "gone") await sql()`delete from push_subs where endpoint = ${t.endpoint}`;
  }));
  return { sent, failed };
}
async function telegram(text, override) {
  const token = override?.token ?? (await getSecrets()).telegramToken;
  const chat = override?.chat ?? (await getSettings()).notif.telegramChat;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(6e3)
    });
    return res.ok;
  } catch {
    return false;
  }
}
var taka = (n) => "\u09F3" + n.toLocaleString("en-IN");
async function announceOrder(req, o) {
  const settings = await getSettings();
  if (!settings.notif.order) return;
  const items = o.items.map((i) => `${i.en} (${i.size}) \xD7${i.qty}`).join(", ");
  const title = `\u{1F6CD}\uFE0F New order ${o.ref} \xB7 ${taka(o.total)}`;
  const body = `${o.customer.name} \xB7 ${o.customer.district} \xB7 ${items}`.slice(0, 180);
  const url = `/admin#order=${o.ref}`;
  await withTimeout(Promise.allSettled([
    pushToAdmins(req, { title, body, url, tag: o.ref }, "orders"),
    telegram(`${title}
${o.customer.name} \xB7 ${o.customer.phone}
${o.customer.addr}, ${o.customer.area}, ${o.customer.district}
${items}
Payment: ${o.pay.toUpperCase()}
${siteOrigin(req)}${url}`)
  ]), 7e3);
}

// server/meta.ts
var GRAPH_VERSION = "v25.0";
var norm = (s) => s.trim().toLowerCase();
async function capiPurchase(req, o, browser) {
  const s = await getSettings();
  const m = s.meta;
  if (!m.capiOn || !m.pixel || m.events.Purchase === false) return;
  const token = (await getSecrets()).metaToken;
  if (!token) return;
  const phone = "88" + o.customer.phone;
  const event = {
    event_name: "Purchase",
    event_time: Math.floor(o.at / 1e3),
    event_id: o.ref,
    // the browser Pixel uses the same ID, so Meta counts the purchase once
    action_source: "website",
    event_source_url: siteOrigin(req) + "/",
    user_data: {
      ph: [sha2562(phone)],
      external_id: [sha2562(phone)],
      fn: [sha2562(norm(o.customer.name.split(/\s+/)[0] || ""))],
      ct: [sha2562(norm(o.customer.district).replace(/\s+/g, ""))],
      country: [sha2562("bd")],
      client_ip_address: clientIp(req),
      client_user_agent: (req.headers.get("user-agent") || "").slice(0, 400),
      ...browser.fbp ? { fbp: browser.fbp } : {},
      ...browser.fbc ? { fbc: browser.fbc } : {}
    },
    custom_data: {
      currency: "BDT",
      value: o.total,
      content_type: "product",
      content_ids: [...new Set(o.items.map((i) => i.pid))],
      contents: o.items.map((i) => ({ id: i.pid, quantity: i.qty, item_price: i.unit })),
      num_items: o.items.reduce((a, i) => a + i.qty, 0),
      order_id: o.ref
    }
  };
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${m.pixel}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: token, ...m.testMode && m.test ? { test_event_code: m.test } : {} }),
      signal: AbortSignal.timeout(6e3)
    });
    if (!res.ok) console.warn("Meta CAPI error", res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.warn("Meta CAPI failed", e);
  }
}
function absImg(origin, ref, fallback) {
  if (!ref) return fallback;
  if (ref.startsWith("https://")) return ref;
  if (ref.startsWith("/m/")) return origin + ref;
  return fallback;
}
async function catalogFeed(req) {
  const origin = siteOrigin(req);
  const [products, cfg, cats] = await Promise.all([loadProducts({ activeOnly: true }), getCfg(), getCategories()]);
  const brand = cfg.brand && cfg.brand.name || "Shop";
  const site = (await getSettings()).site || {};
  const shareRef = site.brand && site.brand.shareImg ? absImg(origin, site.brand.shareImg, "") : "";
  const cover = shareRef || (brand === "Sitraya" ? origin + "/assets/brand/cover.jpg" : "");
  const catName = new Map(cats.map((c) => [c.id, c.en]));
  const items = products.map((p) => {
    const stock = p.variants.reduce((a, v) => a + v.stock, 0);
    const price = p.price, sale = p.sale && p.sale < p.price ? p.sale : 0;
    const extra = (p.gallery || []).map((g) => absImg(origin, g, "")).filter(Boolean).slice(0, 10);
    return `<item>
<g:id>${escHtml(p.id)}</g:id>
<g:title>${escHtml(p.en)}</g:title>
<g:description>${escHtml((p.den || p.en).slice(0, 4900))}</g:description>
<g:link>${escHtml(`${origin}/p/${encodeURIComponent(p.id)}`)}</g:link>
<g:image_link>${escHtml(absImg(origin, p.img, cover))}</g:image_link>
${extra.map((u) => `<g:additional_image_link>${escHtml(u)}</g:additional_image_link>`).join("\n")}
<g:availability>${stock > 0 ? "in stock" : "out of stock"}</g:availability>
<g:inventory>${stock}</g:inventory>
<g:condition>new</g:condition>
<g:price>${price}.00 BDT</g:price>
${sale ? `<g:sale_price>${sale}.00 BDT</g:sale_price>` : ""}
<g:brand>${escHtml(brand)}</g:brand>
<g:product_type>${escHtml(String(catName.get(p.cat) || p.cat))}</g:product_type>
<g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
<g:size>${escHtml(p.sizes.join(", "))}</g:size>
</item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>${escHtml(brand)}</title>
<link>${escHtml(origin)}</link>
<description>${escHtml(brand)} product catalogue</description>
${items.join("\n")}
</channel>
</rss>`;
}

// server/media.ts
var MAX_BYTES = 25e5;
function sniff(b2) {
  if (b2.length > 3 && b2[0] === 255 && b2[1] === 216 && b2[2] === 255) return "image/jpeg";
  if (b2.length > 8 && b2.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (b2.length > 12 && b2.toString("ascii", 0, 4) === "RIFF" && b2.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (b2.length > 6 && (b2.toString("ascii", 0, 6) === "GIF87a" || b2.toString("ascii", 0, 6) === "GIF89a")) return "image/gif";
  return null;
}
async function saveImage(dataUrl, by) {
  const m = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) throw new HttpError(400, "Upload a JPG, PNG, WebP or GIF image.", "bad_image");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > MAX_BYTES) throw new HttpError(413, "Image is too large (max 2.5 MB after resizing).", "too_large");
  const mime = sniff(bytes);
  if (!mime) throw new HttpError(400, "That file is not a real image.", "bad_image");
  const id = randomId("", 15).slice(0, 20);
  await sql()`insert into media (id, mime, bytes, size, created_by) values (${id}, ${mime}, ${bytes}, ${bytes.length}, ${by})`;
  return `/m/${id}`;
}
async function serveImage(id) {
  if (!/^[A-Za-z0-9]{8,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const rows = await sql()`select mime, bytes from media where id = ${id}`;
  if (!rows.length) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(rows[0].bytes), {
    headers: {
      "content-type": rows[0].mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox"
    }
  });
}

// server/routes.ts
var routes = [];
var on = (method, pattern, h) => routes.push({ method, re: new RegExp("^" + pattern + "$"), h });
async function route(req, pathname) {
  for (const r of routes) {
    if (r.method !== req.method && !(req.method === "HEAD" && r.method === "GET")) continue;
    const m = r.re.exec(pathname);
    if (m) return r.h({ req, url: new URL(req.url), params: m.slice(1).map(decodeURIComponent) });
  }
  return null;
}
on("GET", "/", async ({ req }) => {
  await ensureSeed();
  return renderPage(req, { kind: "home" });
});
on("GET", "/p/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  await ensureSeed();
  return renderPage(req, { kind: "product", id: params[0] });
});
on("GET", "/c/([a-z0-9-]{1,30})", async ({ req, params }) => {
  await ensureSeed();
  return renderPage(req, { kind: "category", id: params[0] });
});
on("GET", "/admin", async ({ req }) => {
  await ensureSeed();
  return renderPage(req, { kind: "admin" });
});
on("GET", "/m/([A-Za-z0-9]{8,40})", async ({ params }) => serveImage(params[0]));
on("GET", "/admin\\.webmanifest", async () => adminManifest());
on("GET", "/brand/icon\\.svg", async () => brandIcon());
on("GET", "/feeds/meta-catalog\\.xml", async ({ req }) => new Response(await catalogFeed(req), {
  headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=600", "x-content-type-options": "nosniff" }
}));
on("GET", "/api/boot", async () => {
  await ensureSeed();
  return json(await publicBoot());
});
on("POST", "/api/orders", async ({ req }) => {
  const input = orderInputSchema.parse(await readJson(req, 32 * 1024));
  const order = await createOrder(req, input);
  try {
    await convertCarts(order.customer.phone, input.sid || "", order.ref);
  } catch (e) {
    console.warn("cart convert", e);
  }
  await Promise.allSettled([announceOrder(req, order), capiPurchase(req, order, { fbp: input.fbp, fbc: input.fbc })]);
  return json({ order: publicOrderView(order) }, 201);
});
on("POST", "/api/view", async ({ req }) => recordView(req));
on("POST", "/api/cart", async ({ req }) => saveCart(req));
on("GET", "/api/cart/([a-z0-9]{8,40})", async ({ params }) => getCart(params[0]));
on("GET", "/api/admin/carts", async ({ req }) => adminCarts(req));
on("POST", "/api/admin/carts/([a-z0-9]{8,40})/reminded", async ({ req, params }) => adminCartReminded(req, params[0]));
on("PATCH", "/api/admin/carts/([a-z0-9]{8,40})", async ({ req, params }) => adminCartOptout(req, params[0]));
on("POST", "/api/track", async ({ req }) => {
  const b2 = external_exports.object({ ref: external_exports.string().max(20), phone: external_exports.string().max(30) }).parse(await readJson(req, 2048));
  const o = await trackOrder(req, b2.ref, b2.phone);
  return o ? json({ order: o }) : json({ error: "Order not found", code: "trk_nf" }, 404);
});
on("GET", "/api/coupons/([A-Za-z0-9]{1,16})", async ({ req, params }) => {
  await rateLimit(`coupon:ip:${clientIp(req)}`, 40, 10 * 60);
  const rows = await sql()`select doc, uses from coupons where code = ${params[0].toUpperCase()}`;
  const c = rows[0]?.doc;
  if (!c || !c.active || c.expires && Date.now() > c.expires || c.maxUses && rows[0].uses >= c.maxUses) return json({ error: "Coupon not found", code: "cp_bad" }, 404);
  return json({ coupon: { code: c.code, type: c.type, value: c.value, min: c.min } });
});
on("POST", "/api/subscribe", async ({ req }) => {
  await rateLimit(`sub:ip:${clientIp(req)}`, 10, 60 * 60);
  const b2 = external_exports.object({ email: external_exports.string().trim().toLowerCase().email().max(160), lang: external_exports.enum(["bn", "en"]).optional() }).parse(await readJson(req, 2048));
  await sql()`insert into subscribers (email, lang) values (${b2.email}, ${b2.lang || "bn"}) on conflict (email) do nothing`;
  return json({ ok: true });
});
var meOf = (a) => ({ id: a.id, name: a.name, email: a.email, role: a.role, isOwner: a.is_owner, mustChange: a.must_change });
on("POST", "/api/admin/login", async ({ req }) => {
  checkSameOrigin(req);
  const b2 = external_exports.object({ email: external_exports.string().max(200), password: external_exports.string().max(200) }).parse(await readJson(req, 2048));
  const { admin, cookie } = await login(req, b2.email, b2.password);
  return json({ me: meOf(admin) }, 200, { "set-cookie": cookie });
});
on("POST", "/api/admin/logout", async ({ req }) => {
  checkSameOrigin(req);
  const a = await getAdmin(req);
  const cookie = await destroySession(req);
  if (a) await audit(a.name, "Signed out", "");
  return json({ ok: true }, 200, { "set-cookie": cookie });
});
on("GET", "/api/admin/me", async ({ req }) => {
  const a = await getAdmin(req);
  return a ? json({ me: meOf(a) }) : json({ error: "Not signed in", code: "auth" }, 401);
});
on("POST", "/api/admin/password", async ({ req }) => {
  const a = await requireAdmin(req, "dashboard", "view", { allowMustChange: true });
  await rateLimit(`pw:${a.id}`, 10, 15 * 60);
  const b2 = external_exports.object({ current: external_exports.string().max(200), next: passwordSchema }).parse(await readJson(req, 2048));
  const [row] = await sql()`select pass_hash from admins where id = ${a.id}`;
  if (!await verifyPassword(b2.current, row.pass_hash)) throw new HttpError(400, "Your current password is not correct.", "bad_password");
  if (b2.next === b2.current) throw new HttpError(400, "Choose a new password that is different.", "same_password");
  await sql()`update admins set pass_hash = ${await hashPassword(b2.next)}, must_change = false where id = ${a.id}`;
  await sql()`delete from sessions where admin_id = ${a.id}`;
  const cookie = await createSession(req, a.id);
  await audit(a.name, "Password changed", "");
  return json({ ok: true }, 200, { "set-cookie": cookie });
});
on("GET", "/api/admin/data", async ({ req }) => {
  const a = await requireAdmin(req);
  await ensureSeed();
  const db = sql();
  const [cfg, categories, products, settings, secrets, vCfg, vCats, vSet] = await Promise.all([getCfg(), getCategories(), loadProducts({ withVersion: true }), getSettings(), getSecrets(), kvVersion("cfg"), kvVersion("categories"), kvVersion("settings")]);
  const seeOrders = can(a.role, "orders");
  const orders = seeOrders ? (await db`select doc from orders order by created_at desc limit 1000`).map((r) => r.doc) : [];
  const moves = can(a.role, "inventory") ? (await db`select at, product_id, sku, delta, why from moves order by at desc limit 300`).map((m) => ({ at: m.at.getTime(), pid: m.product_id, sku: m.sku, d: m.delta, why: m.why })) : [];
  const notifs = (await db`select id::text, at, type, title, body, ref, read from notifs order by at desc limit 150`).filter((n) => seeOrders || n.type === "stock" || n.type === "system").map((n) => ({ ...n, at: n.at.getTime() }));
  const log = can(a.role, "log") ? (await db`select at, who, action, detail from logs order by at desc limit 400`).map((l) => ({ ...l, at: l.at.getTime() })) : [];
  const coupons = can(a.role, "coupons") ? (await db`select doc, uses from coupons order by code`).map((c) => ({ ...c.doc, uses: c.uses })) : [];
  const admins = (await db`select id, name, email, role, active, is_owner from admins order by is_owner desc, created_at`).map((u) => ({ id: u.id, name: u.name, email: can(a.role, "users") || u.id === a.id ? u.email : "", role: u.role, active: u.active, isOwner: u.is_owner }));
  const vapid = await getVapid();
  const subs = await db`select endpoint from push_subs where admin_id = ${a.id}`;
  return json({
    v: 4,
    cfg,
    categories,
    // stock keepers see stock, but cost prices only go to people who manage products
    products: can(a.role, "products", "edit") ? products : can(a.role, "products") || can(a.role, "inventory") ? products.map(publicProduct) : [],
    orders,
    moves,
    notifs,
    log,
    coupons,
    admins,
    reviews: [],
    settings: {
      ...can(a.role, "settings") ? settings : { ...settings, notif: { ...settings.notif, telegramChat: "" }, meta: { ...settings.meta, test: "", pixel: "" } },
      hasMetaToken: !!secrets.metaToken,
      hasTelegramToken: !!secrets.telegramToken
    },
    me: meOf(a),
    versions: { cfg: vCfg, categories: vCats, settings: vSet },
    push: { publicKey: vapid.publicKey, endpoints: subs.map((s) => s.endpoint) },
    views: await viewTotals()
  });
});
on("GET", "/api/admin/poll", async ({ req, url }) => {
  const a = await requireAdmin(req);
  const since = Math.max(0, Number(url.searchParams.get("since") || 0));
  const seeOrders = can(a.role, "orders");
  const db = sql();
  const orders = seeOrders ? (await db`select doc from orders where updated_at > to_timestamp(${since / 1e3}) order by created_at desc limit 100`).map((r) => r.doc) : [];
  const notifs = (await db`select id::text, at, type, title, body, ref, read from notifs where at > to_timestamp(${since / 1e3}) order by at desc limit 50`).filter((n) => seeOrders || n.type === "stock").map((n) => ({ ...n, at: n.at.getTime() }));
  const stock = can(a.role, "products") || can(a.role, "inventory") ? await db`select sku, product_id, stock from variants` : [];
  return json({ now: Date.now(), orders, notifs, stock: stock.map((s) => [s.product_id, s.sku, s.stock]) });
});
on("PUT", "/api/admin/cfg", async ({ req }) => {
  const a = await requireAdmin(req, "site", "edit");
  const body = await readJson(req, 450 * 1024);
  const cfg = checkCfg(body.cfg);
  if (!can(a.role, "settings", "edit")) cfg.delivery = (await getCfg()).delivery;
  const version = await setKVChecked("cfg", cfg, typeof body.version === "number" ? body.version : void 0);
  await audit(a.name, "Website content updated", "");
  return json({ cfg, version });
});
on("PUT", "/api/admin/delivery", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  const d = external_exports.object({ inside: external_exports.coerce.number().int().min(0).max(1e5), outside: external_exports.coerce.number().int().min(0).max(1e5), free: external_exports.coerce.number().int().min(0).max(1e7) }).parse(await readJson(req, 1024));
  const cfg = await getCfg();
  cfg.delivery = d;
  await setKV("cfg", cfg);
  await audit(a.name, "Delivery charges changed", `inside \u09F3${d.inside}, outside \u09F3${d.outside}, free from \u09F3${d.free}`);
  return json({ delivery: d });
});
on("PUT", "/api/admin/categories", async ({ req }) => {
  const a = await requireAdmin(req, "products", "edit");
  const body = await readJson(req, 64 * 1024);
  const cats = categoriesSchema.parse(body.categories);
  const ids = new Set(cats.map((c) => c.id));
  if (ids.size !== cats.length) throw new HttpError(400, "Two categories have the same ID.", "invalid");
  const version = await setKVChecked("categories", cats, typeof body.version === "number" ? body.version : void 0);
  await audit(a.name, "Categories updated", "");
  return json({ categories: cats, version });
});
on("PUT", "/api/admin/settings", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  const body = await readJson(req, 64 * 1024);
  const s = settingsSchema.parse(body.settings);
  const version = await setKVChecked("settings", s, typeof body.version === "number" ? body.version : void 0);
  const sec = body.secrets || {};
  const patch = {};
  if (typeof sec.metaToken === "string" && sec.metaToken.trim()) patch.metaToken = external_exports.string().trim().min(20).max(600).regex(/^[A-Za-z0-9_-]+$/, "Meta token looks wrong").parse(sec.metaToken);
  if (sec.metaToken === null) patch.metaToken = "";
  if (typeof sec.telegramToken === "string" && sec.telegramToken.trim()) patch.telegramToken = external_exports.string().trim().regex(/^\d{5,15}:[A-Za-z0-9_-]{20,80}$/, "Telegram bot token looks wrong").parse(sec.telegramToken);
  if (sec.telegramToken === null) patch.telegramToken = "";
  const secrets = Object.keys(patch).length ? await setSecrets(patch) : await getSecrets();
  await audit(a.name, "Settings changed", Object.keys(patch).length ? "including saved keys" : "");
  return json({ settings: { ...s, hasMetaToken: !!secrets.metaToken, hasTelegramToken: !!secrets.telegramToken }, version });
});
async function productOut(id) {
  return (await loadProducts({ withVersion: true })).find((p) => p.id === id) || null;
}
on("POST", "/api/admin/products", async ({ req }) => {
  const a = await requireAdmin(req, "products", "edit");
  const body = await readJson(req, 128 * 1024);
  const p = productSchema.parse(body.product);
  const cats = await getCategories();
  if (!cats.some((c) => c.id === p.cat)) throw new HttpError(400, "Choose a category.", "invalid");
  const id = "p" + randomId("", 6).toLowerCase().slice(0, 8);
  const { variants, ...doc } = p;
  try {
    await sql().begin(async (tx) => {
      const [{ s }] = await tx`select coalesce(max(sort), 0) + 1 as s from products`;
      await tx`insert into products (id, sort, status, doc) values (${id}, ${s}, ${p.status}, ${tx.json({ ...doc, id })})`;
      let pos = 0;
      for (const v of variants) {
        await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
        if (v.stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${v.stock}, 'Opening stock', ${a.name})`;
      }
    });
  } catch (e) {
    if (e && e.code === "23505") throw new HttpError(409, "A variant SKU is already used by another product. Change the product SKU.", "dup_sku");
    throw e;
  }
  await audit(a.name, "Product created", `${p.en} (${p.sku})`);
  return json({ product: await productOut(id) }, 201);
});
on("PUT", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const id = params[0];
  const body = await readJson(req, 128 * 1024);
  const p = productSchema.parse(body.product);
  const baseline = external_exports.record(external_exports.string().max(40), external_exports.number().int().min(0)).default({}).parse(body.baseline || {});
  const cats = await getCategories();
  if (!cats.some((c) => c.id === p.cat)) throw new HttpError(400, "Choose a category.", "invalid");
  const { variants, ...doc } = p;
  try {
    await sql().begin(async (tx) => {
      const cur = await tx`select id, (extract(epoch from updated_at) * 1000)::bigint::text as v from products where id = ${id} for update`;
      if (!cur.length) throw new HttpError(404, "Product not found (maybe deleted).", "not_found");
      if (typeof body.version === "number" && body.version !== Number(cur[0].v)) throw new HttpError(409, "Someone else changed this product a moment ago. The latest version has been loaded \u2014 please make your change again.", "conflict");
      await tx`update products set status = ${p.status}, doc = ${tx.json({ ...doc, id })}, updated_at = clock_timestamp() where id = ${id}`;
      const existing = await tx`select sku, stock from variants where product_id = ${id} for update`;
      const ex = new Map(existing.map((v) => [v.sku, v.stock]));
      const keep = new Set(variants.map((v) => v.sku));
      for (const [sku, stock] of ex) if (!keep.has(sku)) {
        await tx`delete from variants where sku = ${sku}`;
        if (stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${sku}, ${-stock}, 'Variant removed', ${a.name})`;
      }
      let pos = 0;
      for (const v of variants) {
        if (ex.has(v.sku)) {
          const delta = baseline[v.sku] !== void 0 ? v.stock - baseline[v.sku] : v.stock - ex.get(v.sku);
          const next = Math.max(0, ex.get(v.sku) + delta);
          await tx`update variants set size = ${v.size}, color = ${v.color}, stock = ${next}, pos = ${pos++} where sku = ${v.sku}`;
          if (next !== ex.get(v.sku)) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${next - ex.get(v.sku)}, 'Edited in product form', ${a.name})`;
        } else {
          await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
          if (v.stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${v.stock}, 'New variant', ${a.name})`;
        }
      }
    });
  } catch (e) {
    if (e && e.code === "23505") throw new HttpError(409, "A variant SKU is already used by another product. Change the product SKU.", "dup_sku");
    throw e;
  }
  await audit(a.name, "Product updated", `${p.en} (${p.sku})`);
  return json({ product: await productOut(id) });
});
on("PATCH", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const b2 = external_exports.object({ status: external_exports.enum(["active", "draft", "archived"]).optional(), isNew: external_exports.union([external_exports.boolean(), external_exports.number()]).optional(), top: external_exports.union([external_exports.boolean(), external_exports.number()]).optional() }).parse(await readJson(req, 1024));
  const rows = await sql()`select doc from products where id = ${params[0]}`;
  if (!rows.length) throw new HttpError(404, "Product not found.", "not_found");
  const d = rows[0].doc;
  if (b2.status) d.status = b2.status;
  if (b2.isNew !== void 0) d.isNew = b2.isNew ? 1 : 0;
  if (b2.top !== void 0) d.top = b2.top ? 1 : 0;
  await sql()`update products set status = ${d.status}, doc = ${asJson(d)}, updated_at = clock_timestamp() where id = ${params[0]}`;
  await audit(a.name, "Product display changed", `${d.en}: ${Object.keys(b2).join(", ")}`);
  return json({ product: await productOut(params[0]) });
});
on("DELETE", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const rows = await sql()`delete from products where id = ${params[0]} returning doc`;
  if (!rows.length) throw new HttpError(404, "Product not found.", "not_found");
  await audit(a.name, "Product deleted", `${rows[0].doc.en} (${rows[0].doc.sku})`);
  return json({ ok: true });
});
on("POST", "/api/admin/stock", async ({ req }) => {
  const a = await requireAdmin(req, "inventory", "edit");
  const b2 = external_exports.object({ sku: external_exports.string().max(40), set: external_exports.number().int().min(0).max(1e6).optional(), delta: external_exports.number().int().min(-1e6).max(1e6).optional(), why: external_exports.string().max(80).optional() }).parse(await readJson(req, 1024));
  if (b2.set === void 0 && b2.delta === void 0) throw new HttpError(400, "Nothing to change.", "invalid");
  const settings = await getSettings();
  const out = await sql().begin(async (tx) => {
    const r = await tx`select product_id, stock from variants where sku = ${b2.sku} for update`;
    if (!r.length) throw new HttpError(404, "That variant no longer exists.", "not_found");
    const old = r[0].stock;
    const next = Math.max(0, b2.set !== void 0 ? b2.set : old + (b2.delta || 0));
    if (next === old) return { product_id: r[0].product_id, stock: old, d: 0 };
    await tx`update variants set stock = ${next} where sku = ${b2.sku}`;
    await tx`insert into moves (product_id, sku, delta, why, by_name) values (${r[0].product_id}, ${b2.sku}, ${next - old}, ${b2.why || (b2.set !== void 0 ? "Stock count set" : "Manual adjustment")}, ${a.name})`;
    if (next <= settings.lowStock && next < old && settings.notif.stock) await tx`insert into notifs (type, title, body, ref) values ('stock', ${(next ? "Low stock: " : "Out of stock: ") + b2.sku}, ${b2.sku + " \xB7 " + next + " left"}, ${r[0].product_id})`;
    return { product_id: r[0].product_id, stock: next, d: next - old };
  });
  if (out.d) await audit(a.name, "Stock adjusted", `${b2.sku}: ${out.d > 0 ? "+" : ""}${out.d} \u2192 ${out.stock}`);
  return json({ sku: b2.sku, stock: out.stock, product: await productOut(out.product_id) });
});
on("POST", "/api/admin/orders/(ST-[A-Z0-9]{6})/status", async ({ req, params }) => {
  const a = await requireAdmin(req, "orders", "edit");
  const b2 = statusChangeSchema.parse(await readJson(req, 2048));
  const { order, touched } = await changeStatus(a, params[0], b2.status, b2.note);
  const all = touched.length ? await loadProducts({ withVersion: true }) : [];
  return json({ order, products: all.filter((p) => touched.includes(p.id)), next: allowedNext(order.status) });
});
on("PATCH", "/api/admin/orders/(ST-[A-Z0-9]{6})", async ({ req, params }) => {
  const a = await requireAdmin(req, "orders", "edit");
  const order = await patchOrder(a, params[0], orderPatchSchema.parse(await readJson(req, 8 * 1024)));
  return json({ order });
});
on("PUT", "/api/admin/coupons/([A-Z0-9]{1,16})", async ({ req, params }) => {
  const a = await requireAdmin(req, "coupons", "edit");
  const body = await readJson(req, 4096);
  const c = couponSchema.parse(body.coupon);
  const old = params[0];
  await sql().begin(async (tx) => {
    if (old !== c.code) {
      const dup = await tx`select 1 from coupons where code = ${c.code}`;
      if (dup.length) throw new HttpError(409, "This code already exists.", "dup");
      const prev = await tx`delete from coupons where code = ${old} returning uses`;
      await tx`insert into coupons (code, doc, uses) values (${c.code}, ${tx.json(c)}, ${prev.length ? prev[0].uses : 0})`;
    } else {
      await tx`insert into coupons (code, doc, uses) values (${c.code}, ${tx.json(c)}, 0) on conflict (code) do update set doc = excluded.doc`;
    }
  });
  await audit(a.name, "Coupon saved", c.code);
  const [r] = await sql()`select uses from coupons where code = ${c.code}`;
  return json({ coupon: { ...c, uses: r.uses } });
});
on("DELETE", "/api/admin/coupons/([A-Z0-9]{1,16})", async ({ req, params }) => {
  const a = await requireAdmin(req, "coupons", "edit");
  await sql()`delete from coupons where code = ${params[0]}`;
  await audit(a.name, "Coupon deleted", params[0]);
  return json({ ok: true });
});
on("POST", "/api/admin/notifs/read", async ({ req }) => {
  await requireAdmin(req);
  const b2 = external_exports.object({ ids: external_exports.array(external_exports.string().regex(/^\d{1,18}$/)).max(500).optional(), all: external_exports.boolean().optional() }).parse(await readJson(req, 16 * 1024));
  if (b2.all) await sql()`update notifs set read = true where not read`;
  else if (b2.ids && b2.ids.length) await sql()`update notifs set read = true where id in ${sql()(b2.ids.map(Number))}`;
  return json({ ok: true });
});
on("POST", "/api/admin/push/subscribe", async ({ req }) => {
  const a = await requireAdmin(req);
  const b2 = external_exports.object({ endpoint: external_exports.string().url().max(1e3).startsWith("https://"), keys: external_exports.object({ p256dh: external_exports.string().regex(/^[A-Za-z0-9_-]{80,100}$/), auth: external_exports.string().regex(/^[A-Za-z0-9_-]{16,30}$/) }) }).parse(await readJson(req, 4096));
  await sql()`insert into push_subs (endpoint, admin_id, p256dh, auth, ua) values (${b2.endpoint}, ${a.id}, ${b2.keys.p256dh}, ${b2.keys.auth}, ${(req.headers.get("user-agent") || "").slice(0, 200)})
              on conflict (endpoint) do update set admin_id = excluded.admin_id, p256dh = excluded.p256dh, auth = excluded.auth`;
  await audit(a.name, "Phone/laptop notifications turned on", (req.headers.get("user-agent") || "").slice(0, 80));
  return json({ ok: true });
});
on("POST", "/api/admin/push/unsubscribe", async ({ req }) => {
  const a = await requireAdmin(req);
  const b2 = external_exports.object({ endpoint: external_exports.string().max(1e3) }).parse(await readJson(req, 4096));
  await sql()`delete from push_subs where endpoint = ${b2.endpoint} and admin_id = ${a.id}`;
  return json({ ok: true });
});
on("POST", "/api/admin/push/test", async ({ req }) => {
  const a = await requireAdmin(req);
  await rateLimit(`pushtest:${a.id}`, 10, 10 * 60);
  const r = await pushToAdmins(req, { title: "\u2705 Notifications are working", body: `${a.name}, new orders will appear like this.`, url: "/admin", tag: "test" }, "dashboard", a.id);
  return json(r);
});
on("POST", "/api/admin/telegram/test", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  await rateLimit(`tgtest:${a.id}`, 10, 10 * 60);
  const ok = await telegram(`\u2705 ${a.name}: Telegram order alerts are working.`);
  return ok ? json({ ok }) : json({ error: "Telegram did not accept the message. Check the bot token and chat ID, and send /start to your bot first.", code: "telegram" }, 400);
});
var tempPassword = () => randomToken(9).replace(/[-_]/g, "x");
on("POST", "/api/admin/users", async ({ req }) => {
  const a = await requireAdmin(req, "users", "edit");
  const b2 = external_exports.object({ name: external_exports.string().trim().min(1).max(60), email: external_exports.string().trim().toLowerCase().email().max(160), role: external_exports.enum(ROLES).refine((r2) => r2 !== "Super Admin", "Only the owner is Super Admin") }).parse(await readJson(req, 2048));
  const pw = tempPassword();
  const id = randomId("u");
  const r = await sql()`insert into admins (id, email, name, role, pass_hash, must_change) values (${id}, ${b2.email}, ${b2.name}, ${b2.role}, ${await hashPassword(pw)}, true) on conflict (email) do nothing`;
  if (r.count !== 1) throw new HttpError(409, "This email is already an admin.", "dup");
  await audit(a.name, "Admin added", `${b2.name} (${b2.role})`);
  return json({ user: { id, name: b2.name, email: b2.email, role: b2.role, active: true, isOwner: false }, tempPassword: pw }, 201);
});
on("PATCH", "/api/admin/users/([A-Za-z0-9]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "users", "edit");
  const b2 = external_exports.object({ role: external_exports.enum(ROLES).optional(), active: external_exports.boolean().optional(), resetPassword: external_exports.boolean().optional() }).parse(await readJson(req, 1024));
  const rows = await sql()`select id, name, is_owner from admins where id = ${params[0]}`;
  if (!rows.length) throw new HttpError(404, "Admin not found.", "not_found");
  const u = rows[0];
  if (u.is_owner) throw new HttpError(403, "The owner account cannot be changed here.", "owner");
  if (b2.role === "Super Admin") throw new HttpError(403, "Only the owner is Super Admin.", "owner");
  let pw;
  if (b2.role) await sql()`update admins set role = ${b2.role} where id = ${u.id}`;
  if (b2.active !== void 0) {
    await sql()`update admins set active = ${b2.active} where id = ${u.id}`;
    if (!b2.active) {
      await sql()`delete from sessions where admin_id = ${u.id}`;
      await sql()`delete from push_subs where admin_id = ${u.id}`;
    }
  }
  if (b2.resetPassword) {
    pw = tempPassword();
    await sql()`update admins set pass_hash = ${await hashPassword(pw)}, must_change = true where id = ${u.id}`;
    await sql()`delete from sessions where admin_id = ${u.id}`;
  }
  await audit(a.name, "Admin changed", `${u.name}: ${Object.keys(b2).join(", ")}`);
  return json({ ok: true, ...pw ? { tempPassword: pw } : {} });
});
on("POST", "/api/admin/media", async ({ req }) => {
  const a = await requireAdmin(req);
  if (!can(a.role, "products", "edit") && !can(a.role, "site", "edit")) throw new HttpError(403, "Your role cannot upload images.", "forbidden");
  await rateLimit(`upload:${a.id}`, 120, 60 * 60);
  const body = await readJson(req, 36e5);
  return json({ url: await saveImage(body.data, a.name) }, 201);
});

// server/app.ts
async function handle(req, ip) {
  setClientIp(req, ip);
  const url = new URL(req.url);
  let path = url.pathname;
  if (!path.startsWith("/") || path.includes("..") || path.length > 300) path = "/404";
  let res;
  try {
    await ensureSchema();
    res = await route(req, path) ?? (path.startsWith("/api/") ? json({ error: "Not found", code: "not_found" }, 404) : new Response("Page not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }));
  } catch (e) {
    res = errorResponse(e);
  }
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(securityHeaders(req))) if (!h.has(k)) h.set(k, v);
  return new Response(res.body, { status: res.status, headers: h });
}

// server/entry.ts
var entry_default = { fetch: (req, ip) => handle(req, ip) };
export {
  entry_default as default
};
