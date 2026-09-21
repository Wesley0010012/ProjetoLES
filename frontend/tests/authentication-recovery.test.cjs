const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function setup() {
  const storage = () => {
    const values = new Map();
    return {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
  };
  let cookie = "";
  const document = {
    get cookie() {
      return cookie;
    },
    set cookie(value) {
      cookie = value.includes("Max-Age=0") ? "" : value;
    },
  };
  const context = vm.createContext({
    sessionStorage: storage(),
    localStorage: storage(),
    document,
    Headers,
    Response,
    fetch: null,
  });
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    const output = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const requireModule = (id) =>
      id === "@/main/connectors/runtime-environment"
        ? { apiUrl: () => "http://api.test" }
        : load(path.resolve(path.dirname(file), `${id}.ts`));
    vm.runInContext(`(function(require,module,exports){${output}\n})`, context)(
      requireModule,
      module,
      module.exports,
    );
    return module.exports;
  }
  const http = load(path.resolve(__dirname, "../data/http/authenticated-fetch.ts"));
  const auth = load(path.resolve(__dirname, "../data/http/get-authentication-token.ts"));
  const session = (token, type = "USER") =>
    JSON.stringify({
      token,
      type,
      userId: type === "USER" ? 1 : 2,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    });
  return { context, http, auth, session };
}

test("replaces a rejected token in every storage and retries only once", async () => {
  const { context, http, session } = setup();
  for (const storage of [context.sessionStorage, context.localStorage]) {
    storage.setItem("libra.authentication", session("old"));
    storage.setItem("libra.authentication.USER", session("old"));
    storage.setItem("libra.authentication.OPERATOR", session("operator", "OPERATOR"));
  }
  context.document.cookie = `libra.authentication=${encodeURIComponent(session("old"))}`;
  const tokens = [];
  let renewals = 0;
  context.fetch = async (url, init) => {
    if (url.endsWith("/auth/demo-session")) {
      renewals++;
      return Response.json(JSON.parse(session("new")));
    }
    tokens.push(init.headers.get("Authorization"));
    return new Response(null, { status: 401 });
  };
  assert.equal(
    (await http.authenticatedFetch("http://api.test/customer/cart", {}, "USER")).status,
    401,
  );
  assert.deepEqual(tokens, ["Bearer old", "Bearer new"]);
  assert.equal(renewals, 1);
  assert.equal(context.document.cookie, "");
  assert.equal(context.localStorage.getItem("libra.authentication.USER"), null);
  assert.equal(
    JSON.parse(context.localStorage.getItem("libra.authentication.OPERATOR")).token,
    "operator",
  );
});

test("a late rejection preserves an already renewed session", async () => {
  const { context, auth, session } = setup();
  context.sessionStorage.setItem("libra.authentication.USER", session("new"));
  context.localStorage.setItem("libra.authentication", session("old"));
  auth.invalidateAuthenticationToken("old");
  assert.equal(await auth.getAuthenticationToken("USER"), "new");
  assert.equal(context.localStorage.getItem("libra.authentication"), null);
});
