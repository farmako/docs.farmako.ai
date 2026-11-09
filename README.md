# docs.farmako.ai

Public API documentation for Farmako partners, published at **https://docs.farmako.ai**.

The docs are generated from [OpenAPI](https://spec.openapis.org/oas/v3.1.0) files in this repo and
rendered with [Scalar](https://github.com/scalar/scalar) (MIT). Every push to `master` rebuilds and
redeploys the site; there is nothing to host or pay for.

## What's published

| Path | What |
| --- | --- |
| `/` | API reference with a "Test Request" console and code samples |
| `/medicine-delivery/openapi.json`, `.yaml` | Bundled OpenAPI document, for generating clients |
| `/medicine-delivery/postman_collection.json` | Postman collection generated from the spec, for partners who use Postman, Insomnia or Bruno |

## Repo layout

```
openapi/medicine-delivery.yaml   The Medicine Delivery (B2B) API. Edit this.
site/                            Page shell: index.html (Scalar config) and favicon
scripts/build.mjs                Builds dist/: bundles specs, vendors Scalar, generates the Postman collection
redocly.yaml                     List of APIs + lint rules
.github/workflows/docs.yml       CI: lint + build on PRs, deploy to Pages on master
```

## Editing the docs

1. Edit `openapi/medicine-delivery.yaml`. Descriptions are Markdown.
2. Check it: `npm ci && npm run lint`
3. Preview it: `npm run preview` and open http://localhost:3000
4. Open a PR. CI lints and builds it; merging to `master` deploys it.

Keep examples synthetic: no real customer names, phone numbers, addresses, order IDs or API keys.
This site and repo are public.

### Adding another public API

Add an entry under `apis:` in `redocly.yaml`. The build creates `dist/<name>/` for it. To show it on the
site, switch `url` in `site/index.html` to Scalar's `sources: [{ title, url }, ...]` list.

## Deployment

`.github/workflows/docs.yml` deploys `dist/` with GitHub's official Pages actions. One-time setup:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Pages → Custom domain:** `docs.farmako.ai`, then tick **Enforce HTTPS** once the
   certificate is issued.
3. **DNS:** a `CNAME` record `docs.farmako.ai → farmako.github.io`. If the zone is on Cloudflare,
   set it to *DNS only* (grey cloud) so GitHub can issue the certificate.
4. Optional: verify `farmako.ai` under the organisation's **Settings → Pages** to stop anyone else
   claiming the subdomain.

## Pinned tools

All versions are pinned in `package.json` / `package-lock.json`. Update them deliberately and
check the preview before merging.

| Tool | Licence | Used for |
| --- | --- | --- |
| `@scalar/api-reference` | MIT | Rendering the reference (vendored into `dist/scalar/`, no CDN at runtime) |
| `@redocly/cli` | MIT | Linting and bundling specs |
| `openapi-to-postmanv2` | Apache-2.0 | Generating the Postman collection |

Scalar's hosted AI assistant, MCP features and telemetry are switched off in `site/index.html`.
"Test Request" calls go straight from the reader's browser to the API, without a proxy.
