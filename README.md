
# SHNA Web Application

This is a purpose built application for the Seminary Hill Natural Area (SHNA). It is a full stack web application comprising of a full CMS (Payload CMS) and a static frontend. This is intended to meet the needs of small organizations requiring a website with basic content management, payments, emails, and member management. It is designed to be hosted with minimal infrastructure cost. While it's purpose built for SHNA, many other small organizations have similar needs, so it was built in a way to easily adapt to other organizations.

## Requirements

* Node.js 22
* pnpm 10
* Docker
* Cloudflare with R2 bucket
* Brevo email provider account
* Stripe account

## Running locally

* Copy `.env.example` to `.env`. Included values may be kept. Populate missing values. `STRIPE_WEBHOOK_SECRET` may be left empty to to start. This value will be generated below.
* Install dependencies with `pnpm i`.
* Start the database in docker with `pnpm db`.
* [Optional] Restore the database from a prod backup if needed. This can be done with `pg_dump` and `pg_restore`.
* [Optional] If working with payments, start Stripe webhook forwarding with `pnpm stripe:forward`. Note the webhook secret and add it to `.env`.
* Start the CMS application with `pnpm cms:dotenv`.
* Confirm the backend is available at `http://localhost:3000`. Go to `/admin` and add the first admin account if needed.
* The CMS backend uses a live server. Code changes will render without rebuild or refresh.
* Build the static frontend with `pnpm site:dotenv`.
* Confirm the static frontend is available at `http://localhost:3001`.

## Testing

All API handlers have unit tests. Run them with `pnpm test`. Add to these as needed and run them before merging changes. They run as part of automated deployments. If there are failures, changes would be reverted.

## Deployment

On code change, GitHub Actions pulls the repo, installs dependencies, and runs tests. If there are no failures, the CMS application is deployed to Fly.io. Once the CMS backend is deployed, the static build is ran and deployed to Cloudflare. A full deployment or a static only deployment may be triggered manually via GitHub Actions.

## Content Updates

Saved changes in the CMS will be made available immediately on the CMS backend application. But this version of the site is intended for admin use only. The frontend must be rebuilt and deployed once content changes are ready. This can be done via the GitHub static only workflow.

## Additional Information

This project in its current state is implemented to meet requirements for WGU D424. This software is unlicensed and is not currently intended for distribution.
