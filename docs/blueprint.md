# **App Name**: Troop Titans

## Core Features:

- Secure Authentication: Role-based authentication with username/password and session/token creation, tailored for 'Admin' and 'Participant' roles.
- Role-Based Authorization: Protect routes based on user roles, ensuring 'Participants' only access permitted features like troop download links and submission forms.
- Participant Dashboard: Display troop-specific download link and a submission form with file upload for participants. No access to leaderboard or admin pages.
- Submission Handling: Store submissions with team_id, troop_id, numerical answer, image path, and submission time.
- Admin Panel: Admin-exclusive dashboard to manage users, view submissions, and enter scores.
- Score Management: Enable admins to enter and update scores for all teams across multiple rounds, calculating total scores automatically.
- Automated Leaderboard Generation: Dynamically generate a leaderboard based on total scores, accessible only to admins. This feature calculates total scores based on scores in each round and sorts them from highest to lowest total score.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a sense of trust and authority suitable for a team competition platform.
- Background color: Light gray (#E8EAF6) for a clean and professional look, maintaining focus on content.
- Accent color: Yellow (#FFEB3B) to highlight important elements like download links and submission buttons, grabbing attention effectively.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines to give a modern, technical vibe and 'Inter' (sans-serif) for body text for clear and accessible information.
- Use icons representing team dynamics, competition, and achievements for visual engagement.
- Ensure a clear, role-based layout separating admin and participant dashboards for ease of use and navigation. Prioritize essential information.
- Use subtle transitions when displaying leaderboard updates or score submissions.