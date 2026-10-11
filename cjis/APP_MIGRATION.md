# Application source migration

Source: private `cliffobm/RapidRounds`, commit `9094ae6ddc97ec2c99e4d26fe88d11f661ad20fe`.
Target: `cliffobm/RapidRounds-2.0`, `feature/cjis-foundation`, starting at `45d5481e88ee465397db48385c1631794ec63367`.
Main at inspection: `fc73715d70427b457fc3dd4258a7d54fee8fbb9f`.

Copied application routes, components, libraries, stores, types, bundled data/content and question banks, adaptive/qbank packages, original unit and browser tests, and the build/test configuration and lockfile. The quiz's imported example was retained to preserve the existing route before CJIS integration.

Excluded environment files, SQL/migrations, deployment configuration and workflows, database setup scripts, archives, OneDrive nested copies, EliteBook conflict duplicates, reports, generated files, and unrelated documentation. No source-repository files or synced project sources were changed.

Migration adjustments: removed embedded legacy connection defaults, blocked database fetches without explicit development configuration, excluded browser/Node tests from Vitest discovery, retained compiler enforcement, removed the unauthenticated admin sample endpoint, made protected middleware fail closed, and used app metadata for role authorization. Database-dependent features remain unverified until a dedicated development database is configured and its schema/auth reviewed. No database was connected or changed.

Legacy Next.js ESLint integration is skipped during builds because its `next lint` command and ESLint 9 configuration require modernization. Type checks are independent and are not bypassed. Test and build outcomes will be recorded after execution.
