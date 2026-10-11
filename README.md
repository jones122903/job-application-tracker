# Job Application Tracker

A beginner-friendly MERN application for tracking job applications from submission through interview, offer or rejection. The React interface calls an Express REST API, which stores applications in MongoDB through Mongoose.

Repository: [jones122903/job-application-tracker](https://github.com/jones122903/job-application-tracker)

## Features

- Add and list applications with company, role, application date, status, job link and notes.
- Edit applications using PATCH, with Cancel and preservation of the saved date.
- Change status between Applied, Interview, Offer and Rejected.
- Delete an application after confirmation.
- Combine case-insensitive company/role search with status filtering on the frontend.
- Show total applications and counts for every status from all loaded applications, regardless of filters.
- Validate required fields, dates, statuses and optional job URLs; display backend validation messages.
- Provide loading, Retry, empty, no-match, success and error states.
- Preserve form values after failed saves and prevent duplicate submissions using a request guard and disabled controls.
- Support mobile and desktop layouts, labelled inputs, visible focus and keyboard navigation.

## Technologies and structure

The MERN stack consists of MongoDB, Express, React and Node.js. Mongoose handles database models, and MongoDB Atlas hosts the database. The frontend uses Vite, JavaScript, functional components, React hooks, fetch and plain CSS. Supporting tools include dotenv, CORS, ESLint, Node's test runner and Postman.

```text
job-application-tracker/
├── README.md
├── .gitignore
├── client/
│   ├── .gitkeep
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles.css
│       ├── constants.js
│       ├── api/applications.js
│       └── components/
└── server/
    ├── .env.example
    ├── package.json
    ├── package-lock.json
    ├── src/
    │   ├── server.js
    │   ├── app.js
    │   ├── config/
    │   ├── models/
    │   ├── routes/
    │   ├── controllers/
    │   └── middleware/
    ├── scripts/check.js
    ├── test/applications.test.js
    └── postman/applications.postman_collection.json
```

The backend connects to MongoDB before starting Express. Requests pass through routes and validation, then controllers and the Mongoose model. The frontend fetch helper handles JSON errors and DELETE's empty response.

## Prerequisites

- Node.js **20.19 or later within 20.x, or 22.12 or later** with npm. These requirements were confirmed from installed Vite 7.3.7 and its React plugin (`^20.19.0 || >=22.12.0`), and Mongoose 9.11.1/MongoDB driver 7.7.0 (`>=20.19.0`). Node 22.17.1 was used for the recorded checks.
- Git and Git Bash on Windows.
- A MongoDB Atlas account and cluster, or a running local MongoDB server.
- A browser; Postman is optional for API checks.

Check your installation in Git Bash:

```bash
node --version
npm --version
git --version
```

## Fresh clone and dependency setup

The following commands are for **Git Bash on Windows**. Run the clone commands from the parent folder where you want the project:

```bash
git clone https://github.com/jones122903/job-application-tracker.git
cd job-application-tracker

cd server
npm install
cp .env.example .env

cd ../client
npm install
cp .env.example .env

cd ..
```

Both packages are installed separately; there is no root installation step. The frontend root is `client/`, with its own `client/package.json`.

For the existing checkout, open Git Bash and use `cd "/d/Job Application Tracker"`. Copy environment examples only if the corresponding local `.env` does not already exist.

## MongoDB Atlas setup

1. Create an Atlas project and cluster.
2. Create a **database user**, separate from your Atlas account, with read/write access to the application database.
3. Add your current public IP to the project's IP access list.
4. Use the cluster's connection options to obtain the Node.js application connection string.
5. In `server/.env`, replace the username, password and host placeholders and use `job_application_tracker` as the database name. Percent-encode special characters in the username/password when placing them in the URI.
6. Ensure the cluster is available and your network permits the connection before starting the backend.

See [MongoDB's Atlas connection requirements](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) for database-user and network-access details.

All examples below contain placeholders only. Real connection credentials belong exclusively in your local backend `.env`.

## Environment variables

### Backend: server/.env

```dotenv
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster_host>/job_application_tracker?appName=Cluster0
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Purpose |
|---|---|
| MONGODB_URI | Required MongoDB connection string, including local-only credentials when using Atlas. |
| PORT | Express port; defaults to 5000. |
| CLIENT_ORIGIN | Allowed frontend CORS origin; defaults to http://localhost:5173. |

For a local MongoDB server, use `MONGODB_URI=mongodb://127.0.0.1:27017/job_application_tracker`.

### Frontend: client/.env

```dotenv
VITE_API_BASE_URL=http://localhost:5000
```

`VITE_API_BASE_URL` is the backend origin, without `/api/applications`; the fetch helper appends that path. It defaults to `http://localhost:5000`.

**Vite environment values prefixed with VITE_ are public and included in the browser application.** Never put MongoDB credentials, passwords or other secrets in frontend files. Local `.env` files stay out of Git; `.env.example` files document configuration.

Restart the relevant development server after changing environment variables. Rebuild the frontend after changing values intended for its production build.

## Run the application

Open **two Git Bash terminals**, each at the repository root.

Terminal 1: backend

```bash
cd server
npm run dev
```

The backend uses Node's built-in watch mode. Expect `MongoDB connected` and `Server listening on http://localhost:5000`. You can also use `npm start` from `server/` to run without watching.

Terminal 2: frontend

```bash
cd client
npm run dev
```

Open **http://localhost:5173/**. Vite uses port 5173 with strict port checking; if occupied, stop the other process using it instead of silently switching ports. Keep the frontend origin consistent with `CLIENT_ORIGIN`.

If loading fails, check that the backend is running, Atlas access is configured and the API URL is correct, then select **Retry loading**.

## Application fields

| Field | Rules/default |
|---|---|
| company | Required nonblank string; trimmed. |
| role | Required nonblank string; trimmed. |
| applicationDate | Defaults to today/current time when omitted on creation. Supplied values must be valid YYYY-MM-DD dates; responses contain ISO dates. |
| status | Applied, Interview, Offer or Rejected; defaults to Applied. |
| jobLink | Optional string; HTTP/HTTPS URL when nonempty, or an empty string. |
| notes | Optional string; may be empty. |

The frontend defaults new applications to today's local date and Applied. Editing preserves the date portion of the saved ISO value. Saved records also include `_id`, `createdAt` and `updatedAt`.

## API endpoints

Base URL: `http://localhost:5000`. Send POST/PATCH bodies as JSON with `Content-Type: application/json`.

| Method | Endpoint | Successful response |
|---|---|---|
| POST | /api/applications | 201 with the created application. |
| GET | /api/applications | 200 with an array, newest first; [] when empty. |
| GET | /api/applications/:id | 200 with the application. |
| PATCH | /api/applications/:id | 200 with the updated application. |
| DELETE | /api/applications/:id | 204 with no body; do not parse it as JSON. |

PATCH accepts supported fields only and must contain at least one field. A status-only update is valid:

```json
{
  "status": "Interview"
}
```

Validation failures and invalid IDs return 400. Missing records or routes return 404. Oversized JSON bodies return 413; unexpected server failures return a generic 500 response. Error responses contain `message` and may include an `errors` array. Do not send database metadata or unsupported fields as updates.

## Checks and testing

From the repository root, run backend checks and tests:

```bash
cd server
npm run check
npm test
cd ..
```

`npm run check` checks JavaScript syntax, parses the Postman collection, prints installed versions and runs `npm audit` (which requires network access). `npm test` uses Node's test runner.

Frontend lint and production build:

```bash
cd client
npm run lint
npm run build
cd ..
```

The build creates `client/dist/`; producing this build does not deploy the application.

### Recorded verification

- **15 backend tests passed**, using substituted database methods. They verify model defaults, HTTP responses, CRUD behavior, validation, error handling and startup failures without reading/writing a real MongoDB database.
- **Frontend lint and production build passed.**
- **Manual browser testing by the project author** verified real MongoDB persistence, editing and Cancel, status updates, deletion and confirmation, combined search/filter behavior and global counts, validation, loading and Retry, failed-save recovery, duplicate submission prevention, responsive layouts and keyboard navigation.

Browser interactions were tested manually; no automated browser tests are claimed. The manual checks against the real backend complement the automated tests that substitute database methods.

### Postman

Import `server/postman/applications.postman_collection.json`. With the backend running, keep `baseUrl` set to `http://localhost:5000` and run the numbered requests in order. The create request saves `applicationId` for subsequent requests; the collection covers CRUD and invalid input and deletes its created record.

## AI-tool usage

I used **CodeZero in VS Code with Codex** to assist with five specific tasks:

1. Backend scaffolding: organizing Express startup, routes, controllers and environment configuration.
2. Model, validation and CRUD: building the Mongoose schema, field validation and the five API endpoints.
3. Tests and Postman collection: drafting backend tests with substituted database methods and a collection for API verification.
4. React frontend and API integration: creating functional components, hooks and fetch helpers for loading and mutations.
5. Frontend feedback and responsive styling: implementing loading/error/success states, retry, request guards, labelled inputs and mobile/desktop CSS.

I reviewed the generated changes, checked the implementation and manually tested the application against the real backend and MongoDB.

## Limitations

This project has no authentication or user-specific data isolation. It is intended as a **local assessment demo**. Search, filters and summary counts operate on the full list loaded into the frontend; pagination is not implemented. No deployment is claimed.
