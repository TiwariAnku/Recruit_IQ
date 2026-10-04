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

## Interview feedback system
- **Feedback** page (sidebar): *Pending* list of completed interviews + *History* of every submitted scorecard.
- Structured scorecard (5 criteria rated 1-5, strengths, concerns, confidential HR notes, recommendation, next step). Drafts auto-save.
- Submitting updates the interview, the candidate status (via "next step") and the Activity Log.
- History is stored permanently in `server/data/feedback.json` (append-only) and mirrored in the browser, so nothing is lost if the server is offline; unsynced items upload automatically later.
- Filter/search the history and export it as CSV.

## Open Positions & real AI analysis
- **Open Positions** page: add / edit / hold / close / delete positions with required and preferred skills, experience range, openings, owner and priority. Saved in the browser (`recruitiq.positions.v1`).
- Every resume is matched against the requirements of ITS position by reading the real resume text: a required skill that is not written in the resume is reported as "Not mentioned in the resume", with the matching sentence shown as evidence for skills that are found.
- Match = 70% required skills + 15% preferred skills + 15% experience fit (30% experience when no preferred skills are set).
- Uploads are assigned to the best-fitting OPEN position automatically; demo resumes carry real text so their analysis is real too.
- Feedback is connected everywhere: Dashboard, Resumes table + drawer (Feedback tab), Interviews, Action Center, Handover, Manager Overview, Sidebar badge, Notifications. Choosing "Select candidate" creates an "Approve offer" task for the manager.
