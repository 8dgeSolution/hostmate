# Stay Portal

Stay Portal is a single Next.js application for short-term rental hosts to manage guest instructions and publish a unique guest page for each property.

## Included

- Host sign-up and sign-in with email and password
- Multi-property dashboard for each host
- Property editor for address, WiFi, check-in/out, quiet hours, house rules, lockbox, parking, and extra notes
- Leaflet maps for property, lockbox, and parking markers
- Public property page at `/property/[slug]`
- Prisma schema ready for PostgreSQL
- Demo seed data for one host and one property

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Prisma ORM with PostgreSQL
- Auth.js / NextAuth credentials authentication
- Leaflet and React Leaflet

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example file and set a strong secret:

```bash
copy .env.example .env
```

Optional production image storage settings:

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="stay-portal"
UPLOAD_MAX_IMAGE_SIZE_MB="5"
```

3. Create your PostgreSQL database and sync the schema:

```bash
npm run db:push
```

Use `npm run db:migrate` when you want Prisma migration files as well.

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

## Demo login

- Email: `demo@stayportal.app`
- Password: `DemoPass123!`

## Notes

- Google login can be added later by adding another Auth.js provider.
- Production uploads require Cloudinary. In development, uploads still fall back to local files in `public/uploads` if Cloudinary is not configured.
- Cloudinary uploads are grouped by user and property path for easier cleanup and auditing.
- If Leaflet marker icons do not load in a locked-down environment, move the marker assets into local public files and update the icon paths.