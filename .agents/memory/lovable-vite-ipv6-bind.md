---
name: Lovable tanstack-config IPv6 bind + Replit preview host failure
description: The main app's dev server (via @lovable.dev/vite-tanstack-config) fails to start with EAFNOSUPPORT because it binds host "::", and after fixing that it still rejects the Replit preview proxy host until allowedHosts is set.
---

Symptom: `npm run dev` (vite dev) crashes with `Error: listen EAFNOSUPPORT: address family not supported :::8080` — happens even for a plain `node -e "net.createServer().listen(p,'::')"`, confirming it's a kernel-level limitation of this container (`/proc/sys/net/ipv6` doesn't exist), not an app bug. After that fix, the Replit preview pane may show `Blocked request. This host ("...replit.dev") is not allowed.`

**Why:** `@lovable.dev/vite-tanstack-config`'s `defineConfig` hardcodes `server.host: "::"` in both its sandbox and non-sandbox branches. Since neither `LOVABLE_SANDBOX` nor `DEV_SERVER__PROJECT_PATH` env vars are set in this Replit container, it takes the non-sandbox branch: `mergeConfig({server:{host:"::",port:8080}}, config)` — here `config` is the *second* (overriding) argument, so a `vite.server.host` override from the app's own `vite.config.ts` **does** win. The preview pane is served through a Replit `*.replit.dev` proxy host, which Vite does not allow by default, so `allowedHosts` must also be set.

**How to apply:** in the project's `vite.config.ts`, pass an explicit override through the `vite` option:
```ts
export default defineConfig({
  ...,
  vite: {
    server: { host: "0.0.0.0", port: 5000, strictPort: true, allowedHosts: true },
  },
});
```
This forces IPv4 + the required webview port 5000, bypasses the hardcoded `::` bind, and allows the Replit proxy host. Then configure the "Start application" workflow as `npm run dev` with `waitForPort: 5000`, `outputType: "webview"`.
