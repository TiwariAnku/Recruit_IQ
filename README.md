# RecruitIQ — MERN project

## Run the frontend prototype
```
cd client
npm install
npm run dev      # http://localhost:5173
```
## Backend – resume upload & storage
```
cd server
npm install
cp .env.example .env
npm run dev      # http://localhost:5000/api/health
```
All shared state lives in `client/src/context/StoreContext.jsx`; seed data in `client/src/data/mockData.js`.

## UI stack
Tailwind CSS (v3) only – theme tokens live in `client/tailwind.config.js`; shared primitives in `client/src/components/ui.jsx`.
Topbar includes search, quick upload, a notification panel (derived from live actions, interviews and activity) and a user menu.

## Resume upload
"Upload Resume" opens the system file explorer (PDF, DOC, DOCX, PNG, JPG – max 10 MB, multiple allowed).
Files are saved by the Express server into `server/uploads/resumes/` and listed again after a refresh.
Click any resume name (or View) to preview it; PDFs/images show inline, Word files can be opened/downloaded.
Run both: `cd server && npm install && npm run dev`, then `cd client && npm run dev`.
If the server is not running, uploads still work for the current session only (a notice is shown).
