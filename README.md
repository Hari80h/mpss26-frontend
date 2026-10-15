# EventSphere — Professional PWA Sales Demo
**Digital Experience & Networking Layer for Professional Events**  
*Showcasing: India Tech Summit 2026 (Event ID: ITS26)*

---

## Executive Overview
EventSphere is the modern digital experience layer placed on top of an existing registration system. Attendees are already registered in the external portal; EventSphere powers on-site engagement: credential verification, mutual QR badge scanning, privacy-first contact sharing, session participation (session-scoped Q&A & polls), sponsor lead capture, product interest tracking, and real-time organizer intelligence.

---

## Tech Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS (Custom enterprise palette, 1px crisp borders, safe-area support)
- **PWA Features:** Web App Manifest (`manifest.json`), standalone display mode, splash screen with EventSphere wordmark, fixed safe-area bottom navigation, 44px+ touch targets, native tap states, dismissible Add-to-Home-Screen banner
- **Icons:** Lucide React
- **State & Persistence:** Centralized Reactive Mock Store synchronized across roles via `localStorage` with offline synchronization demo queue

---

## Brand Palette & Design Principles
- `#F6F4F0` — Warm canvas background
- `#FFFFFF` — Surface cards
- `#EFEEEA` — Soft backgrounds & phone backdrop
- `#181818` — Primary typography & accents
- `#6B6B6B` — Secondary metadata
- `#DEDCD7` — 1px crisp borders
- `#B51F32` — Primary CTA, active states, LIVE badge, scanner target
- `#2F7D58` — Verified check-in, privacy lock, synced status

> **Design Guardrails:** Strictly no glassmorphism, no neon, no AI sparkles, no blobs, and no generic dashboard tropes. Designed as a credible, premium B2B event technology application.

---

## 3 Core Roles in 1 Centralized Store
Switch effortlessly using the fixed top **Demo Bar**:

### 1. Delegate (Aarav Sharma — Senior PM, Google)
- **Primary Access:** Interactive WhatsApp invitation simulation card with prefilled access (`ITS26` · `+91 9876543210`) → "Verifying registration…" → "Access confirmed ✓"
- **Home:** Personalized greeting, ITS26 LIVE card, happening NOW keynote shortcut, curated recommendations with match percentages, companies to explore, upcoming sessions
- **People:** Recommended, All, Connected, and Pending tabs; search by name/company/interest; 1-tap connect flow
- **SCAN:** Camera viewfinder with animated laser line; instant simulation buttons; consent-respected contact reveal (hidden fields show "Not shared"); duplicate protection; **My QR** toggle with signed token reference payload
- **Schedule:** Day tabs, bookmarking, and Session Detail with Overview, Speaker info, session-scoped moderated Q&A (with upvoting), and 1-vote-per-person live Poll
- **Profile:** Identity, contact sharing preset manager (`Open` | `Connections Only` | `Private`), and multi-format export (**CSV**, **vCard**, **Add to Phone**)

### 2. Exhibitor (Microsoft — Booth B-14, Hall B)
- **Home:** 4 key metrics (Visits 312, Leads 248, Enquiries 48, Connections 96), quick scan and lead buttons (strictly no activity feed)
- **SCAN:** Rapid badge scanner capturing attendee leads with qualification statuses (`New`, `Interested`, `Qualified`, `Contacted`, `Follow-up`), interest tags, and conversation notes
- **Leads:** Filterable status tabs, detailed attendee breakdown respecting delegate consent, and CSV export
- **Products:** 4 solutions (Azure AI, Microsoft Fabric, Copilot, Security Suite) with views, enquiries, [Enquire] trigger, and [View Interested Visitors] modal
- **More:** Booth profile, team credentials, lead export, and event guidelines

### 3. Organizer (Desktop Web Console)
- **Overview:** 6 key metrics with 3-second readability (2,438 Registered, 1,120 Checked In, 86 Exhibitors, 42 Speakers, QR Scans, Connections) and live Exhibitor Leads leaderboard
- **Attendees:** Roster table with 1-click check-in toggle, attendee engagement drawer, CSV import modal with column mapping, and walk-in registration
- **Exhibitors:** Booth performance tracking table
- **Sessions:** Stage console with live Q&A moderation (`Select for Stage`, `Mark Answered`, `Archive`) and Poll management
- **Analytics:** Clean SVG/CSS charts for registrations, check-in conversion, hourly scan volume, and session utilization
- **Reports:** Client-ready one-page executive event report with dynamic metrics and browser-native PDF print formatting (`@media print`)

---

## 13-Step Sales Demo Script
1. Click **WhatsApp Entry** in the top bar to preview the WhatsApp invitation message.
2. Click **[Open EventSphere]** → view the prefilled `ITS26` access screen → tap **Continue** → observe verification and transition to Delegate Home.
3. Explore the Delegate Home screen and review the live Opening Keynote card.
4. Go to **People** and tap **Connect** on Riya Mehta (Product Lead, Google Cloud).
5. Tap **SCAN**, click **Simulate Scan (Sneha Iyer)**, verify the instant connection, and check the signed QR reference on **My QR**.
6. Tap **Schedule**, select the **Opening Keynote**, submit a Q&A question, and cast a vote in the live AI adoption Poll (verify 1-vote constraint).
7. Switch to **Exhibitor** via the Demo Bar.
8. Tap **SCAN** on Microsoft Booth B-14, simulate scanning **Aarav Sharma**, and save the lead as *Qualified* with notes.
9. Tap **Products**, open **Azure AI Platform**, tap **Enquire About This Product**, and inspect the updated **Interested Visitors** list.
10. Switch to **Organizer** via the Demo Bar.
11. Observe the **Overview** metrics reflecting the newly recorded connection, scan, and Microsoft lead count.
12. View the **Analytics** charts and the **Sessions** live Q&A moderator console.
13. Go to **Reports**, tap **Regenerate Report**, and test **Download PDF / Print**.

---

## Local Development & Running
```bash
# Navigate to project
cd /Users/harigupta/Downloads/eventsphere

# Install dependencies (already installed)
npm install

# Run production build
npm run build

# Start server
npm run start
```
The server runs on `http://localhost:3000`.
# eventsphere
# event-sphere
