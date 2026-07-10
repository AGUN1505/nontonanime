---
source: Official docs
library: Next.js
package: next
topic: swc-failed-to-load
fetched: 2026-07-10T12:00:00Z
official_docs: https://nextjs.org/docs/messages/failed-loading-swc
---

## Fixes for SWC Failed to Load on Windows

When Next.js fails to load the SWC binary for `win32/x64` on Windows:

### 1. Install Microsoft Visual C++ Redistributable
SWC binaries require the MSVC runtime. Download and install the latest Microsoft Visual C++ Redistributable:
https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist

### 2. Clear Node Modules and Package Manager Lockfile
Incorrect lockfile configurations might exclude the required optional platform dependencies.
- Remove `node_modules` and package lockfiles (`package-lock.json` or `yarn.lock`).
- Reinstall dependencies:
  ```bash
  npm install
  ```

### 3. Avoid Restricting Optional Dependencies
Ensure you aren't running package installation with flags that skip optional dependencies, such as `--no-optional` or config settings like `omit=optional`.

### 4. Opt-out of SWC (Fallback)
If you cannot install the C++ runtime, force Next.js to use Babel instead by creating a `.babelrc` file in your project root:
```json
{
  "presets": ["next/babel"]
}
```
*Note: Opting out of SWC will disable Next.js compiler performance optimizations.*
