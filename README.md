# Unsaid — What colleges don't tell you.

A premium anonymous platform where students share real placement experiences, interview questions, and campus insights.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design system |
| Animations | Framer Motion |
| Auth | Clerk (OTP) |
| Database | PostgreSQL + Prisma ORM |
| Rate Limiting | Redis (ioredis) |
| Fonts | Syne (display) + DM Sans (body) |

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo>
cd unsaid
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/unsaid"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get Clerk keys at [dashboard.clerk.com](https://dashboard.clerk.com)

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed colleges & companies
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
unsaid/
├── app/
│   ├── api/
│   │   ├── posts/route.ts         # GET feed + POST new post
│   │   ├── comments/route.ts      # GET + POST comments
│   │   ├── likes/route.ts         # POST toggle like
│   │   ├── report/route.ts        # POST report
│   │   ├── colleges/route.ts      # GET all colleges
│   │   └── profile/route.ts       # GET user profile tabs
│   ├── feed/[slug]/page.tsx       # College-specific feed
│   ├── profile/page.tsx           # User profile page
│   ├── layout.tsx                 # Root layout + Clerk
│   ├── page.tsx                   # Global feed homepage
│   └── globals.css                # Design system + tokens
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx             # Sticky glassmorphism nav
│   │   └── FeedSelector.tsx       # Instagram-style dropdown
│   ├── feed/
│   │   ├── Feed.tsx               # Infinite scroll feed
│   │   └── EmptyState.tsx         # Empty state UI
│   ├── post/
│   │   ├── PostCard.tsx           # Post card with actions
│   │   ├── PostSkeleton.tsx       # Loading skeleton
│   │   ├── CreatePostModal.tsx    # Create post form
│   │   └── ReportModal.tsx        # Report reason modal
│   └── auth/
│       └── GuestModal.tsx         # 5-min guest mode prompt
│
├── hooks/
│   ├── useFeed.ts                 # Feed fetch + state
│   ├── useInfiniteScroll.ts       # IntersectionObserver
│   └── useGuestMode.ts            # localStorage timer
│
├── lib/
│   ├── db.ts                      # Prisma singleton
│   ├── redis.ts                   # Redis + rate limit helpers
│   ├── moderation.ts              # EN/HI/MR bad word filter
│   ├── scoring.ts                 # Ranking algorithm + anon names
│   └── utils.ts                   # cn(), formatCount(), color maps
│
├── types/
│   └── index.ts                   # Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma              # Full DB schema
│   └── seed.ts                    # Seed data
│
├── middleware.ts                  # Clerk auth middleware
└── .env.example                   # Environment template
```

---

## Features

### Anonymous Identity
- Every user gets a unique `Anonymous_XXXX` handle (e.g. `Shadow_4721`)
- Clerk handles auth — identity is never surfaced in the UI
- Handle is generated once on first post/comment and persists

### Feed System
- **Global feed** — all posts, ranked by score
- **College feeds** — PCCOE, MIT, VIT, COEP (extensible)
- Instagram-style animated dropdown switcher
- Infinite scroll with IntersectionObserver

### Ranking Algorithm
```
score = (upvotes × 3 + comments × 2) × recency_factor
recency_factor = 0.5^(age_hours / 24)  // halves every 24h
```
Posts decay naturally; fresh content surfaces automatically.

### Rate Limiting (Redis)
| Action | Limit | Cooldown |
|--------|-------|----------|
| Create post | 2/day | 5 minutes |
| Comment | 30/day | 30 seconds |

### Content Moderation
- Normalizes text before scanning
- Multi-language bad word list: English + Hindi + Marathi
- Masks words (e.g. `f***`) instead of blocking outright
- Rejects content with high severity (3+ bad words)
- Auto-hides posts with 5+ reports

### Guest Mode
- Visitors browse freely for 5 minutes (tracked via `localStorage`)
- After timer expires → blurred backdrop + sign-in prompt
- "Continue for 2 more minutes" escape hatch

### Post Cards
- Company + role + college badge
- Result tag: Selected / Rejected / Pending / Waitlisted
- Difficulty tag: Easy → Very Hard
- Upvote toggle with optimistic update
- Report button (appears on hover)
- Read more / collapse for long content
- `timeago.js` relative timestamps

---

## Extending

### Add a new college
```sql
INSERT INTO colleges (name, slug) VALUES ('VJTI Mumbai', 'vjti');
```
Then add it to `FeedSelector.tsx` and `CreatePostModal.tsx`.

### Add a new feed filter
Edit `FEEDS` array in `components/layout/FeedSelector.tsx`.

### Adjust rate limits
Edit values in `app/api/posts/route.ts` and `app/api/comments/route.ts`.

### Add more bad words
Edit the arrays in `lib/moderation.ts`.

---

## Deployment

### Vercel (recommended)
```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard.

### Database
- Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for hosted Postgres
- Use [Upstash](https://upstash.com) for serverless Redis

### Clerk Setup
1. Create app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable **Email OTP** as sign-in method
3. Copy publishable key + secret key to env

---

## License

MIT
