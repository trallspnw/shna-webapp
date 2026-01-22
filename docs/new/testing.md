# CMS API Testing (Unit + Integration)

This document describes how to run and extend tests for CMS API endpoints using the new `apps/cms/tests/int` structure.

## Run tests

Unit tests (CMS only):

```bash
pnpm -C apps/cms test:core
```

Integration tests (CMS only):

```bash
pnpm -C apps/cms test:int
```

Run just subscriptions integration tests:

```bash
pnpm -C apps/cms test:int -- tests/int/subscriptions
```

## Integration environment

Integration tests run against a real Payload instance connected to the database specified by `DATABASE_URL`.

Key mechanics:

- Payload is initialized once per test file via `getPayload({ config })` in `tests/int/_support/testEnv.ts`.
- Tests call endpoint handlers directly (no browser or HTTP server).
- State reset is explicit and deterministic:
  - `tests/int/_support/seed.ts` deletes test data by email / slug / reftag before each test.
- Factories are deterministic and live in `tests/int/_support/factories.ts`.

## Adding a new API integration suite

1. Create a folder under `apps/cms/tests/int/<api-name>`.
2. Add one file per endpoint action (example: `subscribe.int.test.ts`).
3. Reuse helpers in `tests/int/_support`.
4. Keep tests structured as Arrange / Act / Assert.

If you need new helpers, add them to `tests/int/_support` to keep the structure consistent across APIs.
