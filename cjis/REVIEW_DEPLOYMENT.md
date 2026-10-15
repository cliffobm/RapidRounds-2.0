# Colleague review preview

The user authorized a shareable review website on 2026-10-15. Deployment targets the new `rapidrounds-cjis-review` Vercel project under `benjamin-cliffords-projects`, separate from the existing `rapid-rounds` project. The environment is Preview; no production domain is promoted or changed.

The review project has no application credentials configured. Bundled practice is available at `/quiz` through the Practice navigation item. Authentication, database-backed persistence, billing and AI services are not configured for this review. Legacy questions remain drafts and do not produce competency scores.

## Deployment preparation

- Pinned Next.js and eslint-config-next to 15.5.28, and React/React DOM to 19.1.10, before publishing the old 15.5.3 application. These stay within the existing release series.
- Aligned the package engine, GitHub Actions and review hosting with Node 22, matching the locally tested runtime.
- Executed the adapter tests: 8 passed. Executed the registry, isolation and practice UI tests: 19 passed.
- The full migrated test suite's previously reported legacy failures remain unresolved; this is a development review, not a scored or production release.
- Vercel's protected preview can be shared through a temporary review link. Its expiration must be reported with the link. Do not commit the share token.

Security references: [Next.js September 2026 release](https://nextjs.org/blog/september-2026-security-release), [Next.js npm release versions](https://www.npmjs.com/package/next?activeTab=versions).
