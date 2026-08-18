/**
 * خطّاف استيراد صغير: يسمح لسكربتات Node باستيراد وحدات المشروع بمساراتها
 * بلا لاحقة (`./env`) تماماً كما يكتبها Vite وTypeScript.
 *   node --import ./scripts/ts-resolve.mjs scripts/<script>.mjs
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const suffix of ['.ts', '.tsx', '/index.ts']) {
        const candidate = new URL(specifier + suffix, context.parentURL)
        if (existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true }
      }
    }
    return nextResolve(specifier, context)
  },
})
