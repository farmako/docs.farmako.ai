// Builds the static docs site into dist/.
//
//   dist/
//     index.html, favicon.svg          site shell (from site/)
//     CNAME                            custom domain for GitHub Pages
//     scalar/standalone.js             Scalar API Reference, vendored from node_modules
//     <api>/openapi.json|yaml          bundled spec, one folder per API in redocly.yaml
//     <api>/postman_collection.json    generated Postman collection, for partners who use Postman
//
// Usage: npm run build

import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const bin = (name) => join(root, 'node_modules', '.bin', name)
const run = (cmd, args) => execFileSync(bin(cmd), args, { cwd: root, stdio: 'inherit' })

const DOMAIN = 'docs.farmako.ai'

// API name -> spec root, read from redocly.yaml so there is one list of APIs.
const apis = [...readFileSync(join(root, 'redocly.yaml'), 'utf8').matchAll(/^  ([\w-]+):\n    root: (.+)$/gm)]
  .map(([, name, spec]) => ({ name, spec: spec.trim() }))
if (apis.length === 0) throw new Error('No APIs found in redocly.yaml')

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

cpSync(join(root, 'site'), dist, { recursive: true })
writeFileSync(join(dist, 'CNAME'), `${DOMAIN}\n`)
// Pages would otherwise run the output through Jekyll.
writeFileSync(join(dist, '.nojekyll'), '')

const scalar = join(root, 'node_modules/@scalar/api-reference/dist/browser/standalone.js')
mkdirSync(join(dist, 'scalar'), { recursive: true })
cpSync(scalar, join(dist, 'scalar/standalone.js'))

for (const { name, spec } of apis) {
  const out = join(dist, name)
  mkdirSync(out, { recursive: true })
  run('redocly', ['bundle', name, '--output', join(out, 'openapi.json')])
  run('redocly', ['bundle', name, '--output', join(out, 'openapi.yaml')])
  run('openapi2postmanv2', [
    '--spec', join(out, 'openapi.json'),
    '--output', join(out, 'postman_collection.json'),
    '--pretty',
    '--options', 'folderStrategy=Tags,requestNameSource=Fallback',
  ])
  console.log(`built ${name} from ${spec}`)
}

console.log(`\nSite written to ${dist}`)
