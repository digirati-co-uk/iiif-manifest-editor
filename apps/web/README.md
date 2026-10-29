## Getting Started

UI language values are loaded by locale from `src/i18n/additional-resources.ts`.
The eager registry contains only locale metadata and import functions. English
fallback stays synchronous; Dutch and the generated drafts each have a dynamic
import boundary containing their catalogs and wording/preset overlays.

The root layout preloads only the cookie-selected locale and sends serializable
data to `WebI18nProvider`. `useWebUiResources` / `useWebExhibitionResources` forward
the same initial data to child editors, preserving translated SSR and hydration.
Later language changes load through the shared public runtime and retain the
current interface until validation succeeds. Failed loads can be retried.

`src/i18n/coverage.json` gates the locale picker without loading message values.
After catalog changes run `pnpm i18n:coverage:write`; CI runs `pnpm i18n:coverage`
to reject stale metadata and validate all base/profile/exhibition layers.
The existing deployment locale/profile environment settings still constrain choices.
For an on-demand check, `pnpm i18n:payload` checks initial chunk membership and
produces compressed payload measurements. It is not an additional CI gate;
ordinary development continues using the existing server.

### Local performance measurements

Use a separate production output directory and port to leave the development server alone:

```sh
NEXT_DIST_DIR=.next-perf-local pnpm --filter web build
NEXT_DIST_DIR=.next-perf-local pnpm --filter web exec next start --port 3100
# In another terminal, with the production server running:
node scripts/measure-editor-startup.mjs http://localhost:3100 test-results/startup.json
PERF_NETWORK=slow4g node scripts/measure-editor-startup.mjs http://localhost:3100 test-results/startup-slow4g.json
```

The collector creates an isolated browser context and a local blank manifest. It measures the
homepage, the transition into the editor, and a direct editor reload, recording uncompressed
script sizes, navigation timings and long tasks. External analytics and example thumbnails are
excluded; browser caching is disabled. `slow4g` uses 150 ms latency and 1.6 Mbps downstream.

Rich-text editors, video playback and the IIIF browser use shared React lazy boundaries, so npm
and embedded applications benefit without Next-specific imports. The CDN facade retains one
integrity-checked classic script and defers initialization of these components within that
script; it does not introduce additional unchecked chunk requests. Web-only dialogs, tutorials
and shell utilities load when needed. Creating a project starts its editor download in parallel
with persistence and navigation, rather than waiting for the shell to generate an identifier.

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

To create [API routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) add an `api/` directory to the `app/` directory with a `route.ts` file. For individual endpoints, create a subfolder in the `api` directory, like `api/hello/route.ts` would map to [http://localhost:3000/api/hello](http://localhost:3000/api/hello).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn/foundations/about-nextjs) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_source=github.com&utm_medium=referral&utm_campaign=turborepo-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
