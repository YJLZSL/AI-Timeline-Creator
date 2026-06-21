# Storyloom Sidecar Binaries

This directory holds the Tauri sidecar binary for the Node.js backend.

## Compiling the Sidecar

The sidecar is compiled from `dist-server/server/sidecar-entry.js` using `pkg`:

```bash
npm run build:sidecar
```

This runs:
1. `tsc -p tsconfig.server.json` — compiles TypeScript to `dist-server/`
2. `npx pkg dist-server/server/sidecar-entry.js -o src-tauri/sidecars/storyloom-sidecar` — bundles Node.js runtime and code into a single binary

## Platform-specific Binaries

Tauri expects platform-specific binary names:
- Windows: `storyloom-sidecar.exe`
- macOS: `storyloom-sidecar`
- Linux: `storyloom-sidecar`

`pkg` will append the target triple automatically. Rename or copy the output to match Tauri's expected naming.

## Native Modules

`better-sqlite3` is a native Node.js module. `pkg` bundles the JavaScript but **not** the `.node` native binary. You must manually copy the compiled `.node` file next to the sidecar binary:

```bash
# After pkg, copy the native module
cp node_modules/better-sqlite3/build/Release/better_sqlite3.node src-tauri/sidecars/
```

Alternatively, configure `pkg` in `package.json` with `assets` to include the `.node` file automatically.

## Development

In development, use the Node.js script directly (no compilation needed):

```bash
npm run dev:sidecar
```

This runs `scripts/start-sidecar.js`, which spawns the TypeScript source with `tsx`.
