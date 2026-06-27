# Community Intelligence — Product Spec (v1 / MVP)

> Status: **Feasibility-validated draft, ready for implementation.** Owner: @eladav.
> The core technical risk (can Grok reliably retrieve tweets within budget?) has been researched and confirmed — see Section 9.

## 1. Problem & Purpose

I (and a small group of friends) want to **stay current on Twitter/X without using Twitter**. Opening the app costs time and mental health ("Twitter cancer"). But there's real value in there: the "talk of the day," and signal from people/topics we care about.

**Community Intelligence** is a lightweight personal app that fetches recent tweets for the accounts and topics you care about, uses an AI agent to pick the small subset *you'd* actually find worth your time, and serves them as a capped, once-a-day, swipeable deck. You get the signal; you skip the doomscroll.

**Success looks like:** "I spent 3 minutes, I didn't miss anything that mattered to me today, and I never opened Twitter."

### Non-goals (v1)
- Not a Twitter client. No posting, replying, liking-on-X, DMs, infinite scroll. **The app is strictly read-only** (also a ToS requirement — see Section 9.5).
- Not a public/social product. No multi-tenant scale, no growth loops, no moderation pipeline.
- Not a news aggregator beyond X.
- **Not a social/community feed.** Despite the repo name, v1 is a purely single-user personal digest — no shared "what the group liked" layer.
- No engagement-maximizing mechanics. The product is explicitly anti-addictive.

## 2. Users & Scale

- **Audience:** me + a handful of trusted friends (~dozens of users max).
- **Trust model:** all users are known/trusted. Auth is minimal (manually seeded magic-link users).
- **Implication:** optimize for simplicity and low cost, not scale.

## 3. Core Decisions (LOCKED & VALIDATED)

| Decision | Choice | Status |
|---|---|---|
| Tweet data source (v1) | **xAI API `x_search` tool** via the `/v1/responses` (Responses) API, model **`grok-4.1-fast`** | ✅ Validated. Not a REST timeline endpoint — it's an LLM with server-side access to X's search index. |
| Data-source architecture | **Pluggable `TweetSource` provider** | X API can be added later, but the Grok path is fully sufficient for v1. |
| Who to follow | **Manually curated handle list** (≤20 handles per API call) + free-text topics | ✅ Native support via `allowed_x_handles` + `from_date`/`to_date`. |
| Retrieval + ranking | **Single combined Grok call** — preferences go in the system prompt; one request does fetch + filter + rank | ✅ Major simplification. No separate ranker model needed. |
| Ranking philosophy | **Relevance-first**, driven by user's natural-language preferences; engagement a weak tiebreaker | ✅ Grok reads approx. like/repost counts (rounded/stale but fine as a tiebreaker). |
| Delivery | **Once-daily batch digest** (nightly cron), capped at N cards | ✅ Cheap and matches the anti-addiction goal. |
| Swipe behavior | **Training signal only** (read-only app; tap = link out to X) | ✅ No in-app engagement (also ToS-aligned). |
| Platform | **React Native, iOS**, RN 0.76 | Matches existing stack. |
| Scope | **Personal tool** (me + ~12 friends) | — |
| Budget | **< $50/mo**; actual projected **~$4.20/mo data + $0 hosting** | ✅ Massive headroom. |

## 4. Product Flow

### 4.1 Onboarding (one-time, editable later)
1. **Handles** — user curates a list of `@handles` (no follow-graph import).
2. **Topics** — free-text interests, e.g. `ai, woodworking, wine, finance`.
3. **Preference prompt** — free-text: *"What do you want to see, and what do you want to avoid?"* (e.g. "technical deep dives into Node/TypeScript; ignore generic tech-bro hustle culture"). This is the ranker's primary steering signal and is injected directly into the Grok system prompt.
4. **Daily cap** — cards/day (default 20, range ~10–40).

### 4.2 Daily batch (nightly cron, e.g. 03:00)
For each user, in a **single Grok `/v1/responses` call per handle-batch + one per topics**:
1. **Retrieve + rank in one shot.** Provide the `x_search` tool (`allowed_x_handles`, `from_date`/`to_date`), and put the user's preference prompt + `disinterests` exclusions + a summary of recent swipes into the system prompt. Ask Grok to return the top matches as **structured JSON** (Structured Outputs / `response_format`), each with a one-sentence `reason_for_selection` and a `context` string.
   - Handles are capped at **20 per call**, so ~30 handles = 2 calls; topics = 1 call → **~3 calls per user per day.**
2. **Resolve true Tweet IDs/URLs.** **Do NOT trust LLM-generated IDs (it hallucinates them).** Instruct the model to emit inline citation markers (`[1]`) inside the JSON text fields, then parse the real URL from the response's top-level `citations[]` array and extract the canonical Tweet ID from it.
3. **Backfill to the daily cap (DECISION).** The cap N is a **target, not a maximum.** Prefer high-relevance tweets from the user's **handles**; if those run short, fill the remaining slots with the best **interest/topic** tweets so the user always gets a full deck of N. Each `DeckItem` is tagged with its `source` (`handle` vs `interest`) so the UI can distinguish "from people you follow" vs "suggested for your interests." Only fall below N if even interest matches are scarce.
4. **Enrich the winning tweets (server-side, two sub-steps).**
   - **Verbatim text:** fetch X's **oEmbed** endpoint (`publish.twitter.com/oembed`, no auth) per Tweet ID and parse the verbatim text from the `<p>` of the returned blockquote → set `text_is_verbatim=true`. **Swap `x.com`→`twitter.com`** in the URL or it 404s. On 429 / protected / deleted, fall back to the LLM text with `text_is_verbatim=false`. **Throttle ~1 req/sec** (oEmbed rate-limits aggressively).
   - **Link unfurl:** if `embedded_url` is set, fetch the destination's OpenGraph tags (`og:title`/`og:image`/`og:description`) for a rich card.
5. **Normalize, dedupe (UPSERT on Tweet ID), and persist** the prepared deck for the day.

### 4.3 Consumption (Tinder-style)
- User opens app → today's deck as a card stack.
- **Swipe right = like, swipe left = dislike** → stored as training signal only.
- **Tap = open the original tweet on X** (deep link / URL). This is the only sanctioned trip to Twitter; the app itself never embeds engagement actions.
- **Cards with media** show the text `media_description` (no raw image — X doesn't expose the asset URL); **link cards** show the unfurled OG title/image; **non-verbatim cards** are prefixed **"AI Summary:"** so friends know it's a paraphrase, not a direct quote.
- Deck exhausted → "You're caught up. See you tomorrow." No refill (anti-addiction).

### 4.4 Feedback loop — learning what to avoid (DECISION)
- **Dislikes drive a persistent `disinterests` list.** When a user swipes left, an LLM step extracts the key themes/keywords from that tweet and appends them to the user's `disinterests` on their profile. These are injected into every future curation prompt as explicit exclusions.
- **Dislikes are weighted more heavily than likes.** Likes are noisy (people like generously); a dislike is a strong, specific "never show me this again" signal.
- Likes feed a lighter-weight rolling summary of positive preferences, also injected into the prompt.
- **Verification is a build-time requirement (Section 9):** confirm the loop actually closes — that adding a keyword to `disinterests` measurably suppresses that content on the next run. No ML pipeline; this is entirely prompt-context driven.

## 5. The Curation Call (retrieval + ranking, combined)

One Grok request does everything. Sketch of the prompt contract:

- **System prompt:** role = curation agent; the user's preference prompt; the persistent `disinterests` exclusion list; recent swipe summary; a strict **"quote tweet text verbatim, never paraphrase"** rule (pending verbatim research — Section 9); output rules (JSON schema, inline `[n]` citations, atomic tweets, populate `context`, target N).
- **Tool:** `x_search` with `allowed_x_handles` (≤20), `from_date`, `to_date`, and `enable_image_understanding: true` (lets the model describe images into `media_description`). Topic-only calls omit the handle filter.
- **Output (Structured Outputs):** array of selected tweets, each: `author`, `text_with_citation`, `estimated_likes`, `reason_for_selection`, `context`, `embedded_url` (resolved external link, if any), `has_media` + `media_description` (text description — raw media URLs are NOT available from X), `quoted_tweet` (author + text of a quoted post, if any).
- **Engagement** is a weak tiebreaker only; explicitly down-weight ragebait/outrage. Reserve a small **"Talk of the Day"** slot from the topic call so genuinely big moments aren't missed.
- **Backfill:** prefer handle matches; if short of N, top up with the best interest/topic matches tagged as `interest` so the deck reaches the target without padding it with junk (see 4.2 step 3).

## 6. Data Model (sketch)

```
User       { id, email, name, timezone, daily_cap, preference_prompt,
             disinterests: string[], created_at }
Handle     { id, user_id, handle }
Topic      { id, user_id, text }
Tweet      { tweet_id (PK, parsed from citation URL), author_handle,
             text, text_is_verbatim,             # text from oEmbed; false => LLM summary
             url,                                 # tweet permalink (from citations[])
             embedded_url?,                       # resolved external link in the tweet
             og?: { title?, image?, description? },     # unfurled from embedded_url
             has_media, media_description?,       # raw media URLs NOT available; text desc only
             quoted_tweet?: { author, text },
             posted_at?, estimated_likes?, context, raw_json }
DeckItem   { id, user_id, tweet_id, deck_date, rank,
             source: handle|interest,            # for "from people you follow" vs "suggested"
             reason_for_selection, status: pending|liked|disliked }
Swipe      { id, user_id, tweet_id, direction: like|dislike, created_at }
```

Notes:
- `tweet_id` comes **only** from parsing `citations[].url`, never from the LLM JSON body. It is the primary key; daily batch does an **UPSERT** to dedupe the same tweet arriving from a handle query and a topic query.
- `estimated_likes` is approximate (rounded/stale) — use only as a tiebreaker.
- Tweets are stored **atomically**; thread/reply context lives in the `context` string, not a reconstructed tree.
- `disinterests` grows from disliked tweets (keyword/theme extraction) and is injected as exclusions into every curation prompt.
- `text` is the **verbatim** tweet text from oEmbed when `text_is_verbatim=true`; otherwise it's the LLM summary and the UI prefixes "AI Summary:".
- **Raw image/video URLs are not obtainable** from `x_search`; we store a text `media_description` instead (via `enable_image_understanding`). `og` is unfurled from `embedded_url`.

## 7. Architecture (proposed — all confirmed feasible)

- **Client:** React Native (iOS), RN 0.76. Card-stack swipe UI. REST/HTTPS to backend.
- **Backend / hosting: Supabase (Free Tier), $0/mo.**
  - **DB:** managed Postgres (users, prefs, decks, swipes).
  - **Compute:** Supabase Edge Functions (TypeScript) make the xAI API calls, then **enrich** each winning tweet — an **oEmbed fetch** (verbatim text) and an **OG-tag unfurl** (rich link cards), both throttled ~1 req/sec.
  - **Scheduler:** `pg_cron` triggers the nightly batch Edge Function.
  - **Auth:** Supabase **Magic Links (email OTP)**. Disable open signups; manually seed the ~12 friends' emails. Passwordless, secure by default.
- **`TweetSource` interface (pluggable layer):**
  ```ts
  interface TweetSource {
    // returns raw curated results + the citations array for ID resolution
    curate(opts: { handles?: string[]; topics?: string[];
                   since: Date; until: Date;
                   preferencePrompt: string; swipeSummary: string;
                   limit: number }): Promise<CuratedResult>;
  }
  ```
  - v1 impl: `GrokTweetSource` (`/v1/responses` + `x_search`, `grok-4.1-fast`).
  - future impl: `XApiTweetSource` (official X API) — same interface.

## 8. Cost Model (projected ~$4.20/mo — vs. < $50 cap)

Pricing basis (`grok-4.1-fast`): ~$0.20 / 1M input tokens, ~$0.50 / 1M output tokens, plus tool/source invocation ~$2.50 / 1K calls.

For **12 users, ~30 handles + ~5 topics each, once daily** (~3 calls/user/day → ~1,080 calls/mo, ~1M in / ~2M out tokens):
- Tokens: **< $1.50/mo**
- Tool invocations (~1,080): **~$2.70/mo**
- **Total data: ~$4.20/mo. Hosting: $0 (Supabase free).**

No rate limits threaten a ~36-call nightly cron. Headroom is large enough to raise the daily cap or add users freely.

Enrichment costs: `enable_image_understanding` adds modest image-token cost on media tweets (monitor). **oEmbed + OG unfurling are free** (plain HTTP). The oEmbed throttle (~1 req/sec per winning tweet) adds wall-clock time to the nightly batch — e.g. ~12 users × 20 cards ≈ 240 sequential calls ≈ a few minutes — not dollars.

## 9. Validated Findings (research complete)

1. **Grok retrieval — CONFIRMED.** Use `/v1/responses` + server-side `x_search` tool (NOT a REST timeline). `allowed_x_handles` (≤20/call) + `from_date`/`to_date` for handles; topic search supported. Text/author highly accurate. **Tweet IDs/URLs: take from the `citations[]` array, never from LLM output** (it hallucinates numeric IDs). Engagement counts available but approximate.
2. **Cost/limits — CONFIRMED.** ~$4.20/mo at target scale; no blocking rate limits. Comfortably under budget.
3. **Ranking — CONFIRMED simpler than planned.** `grok-4.1-fast` (2M context) does retrieval + filtering + ranking in one call by putting preferences in the system prompt. No second model needed.
4. **Data handling — CONFIRMED.** Treat tweets atomically; store reply/thread context as a `context` string. Dedupe via `UPSERT` on the citation-derived Tweet ID.
5. **Compliance — LOW RISK.** Using the official, sanctioned `x_search` tool (no scraping; avoids the $200/mo X API tier). A private, authenticated, read-only, once-daily app for ~12 friends behaves like a personal RSS reader. Keep it strictly read-only and link out to X for any engagement. Do not redistribute at commercial scale.
6. **Backend/auth — CONFIRMED.** Supabase free tier: Postgres + Edge Functions + `pg_cron` + Magic Links (seed users manually, disable open signup).

7. **Links & media — RESOLVED.** Embedded external URLs ARE retrievable (the LLM resolves `t.co`; extract into `embedded_url`). Quote-tweets ARE retrievable (author + text). **Raw image/video URLs are NOT** — use `enable_image_understanding: true` to get a text `media_description` + `has_media` flag instead. `citations[]` covers only the tweet permalink, not embedded links. For rich link cards, **unfurl OG tags** from `embedded_url` in a Supabase Edge Function (safe, standard web behavior).
8. **Verbatim text — RESOLVED (don't trust the LLM; use oEmbed).** `x_search`/LLM text is NOT byte-accurate (drops emojis, fixes typos, truncates) — use it only for ranking/filtering. For display, fetch the official **oEmbed** endpoint (`publish.twitter.com/oembed`, no auth) per winning Tweet ID and parse the verbatim `<p>` text. **Must swap `x.com`→`twitter.com`** in the URL or it 404s. Throttle ~1 req/sec (aggressive rate limiting). On 429 / protected / deleted, fall back to LLM text with `text_is_verbatim=false` and prefix the card "AI Summary:".

### Remaining items to nail down during build (low risk)
- Exact prompt + JSON schema tuning for consistent, high-quality selections.
- Robust parser mapping inline `[n]` markers → `citations[]` URLs → Tweet IDs (handle missing/duplicate citations gracefully).
- **Dislike → `disinterests` keyword extraction**, and **verifying the suppression loop actually works** (added keywords measurably reduce that content next run).
- Backfill tuning: relevance bar for `interest` tweets so backfill never becomes filler.
- **oEmbed at scale:** confirm the ~1 req/sec throttle holds from Supabase's egress IP across ~240 nightly calls; add caching (oEmbed result keyed by Tweet ID) so re-surfaced tweets aren't re-fetched.
- "Talk of the Day" slot sizing and labeling.

## 10. Future / Deferred (explicitly out of v1)
- `XApiTweetSource` for reliable timelines + hard engagement numbers (only if ever needed).
- Auto-import of the real follow graph.
- Read-later / saved list and daily recap/export.
- On-demand refresh / top-up.
- Tunable relevance-vs-engagement slider.
- Web client.
- **Push notifications + per-user-timezone delivery** (deferred from v1; a single daily "deck ready" nudge at the user's local morning).

## 11. Appendix — xAI API reference

**Endpoint:** `POST https://api.x.ai/v1/responses` · **Model:** `grok-4.1-fast` · Auth: `Bearer $XAI_API_KEY`

Example request (handles + topic, structured output, inline citations):
```bash
curl https://api.x.ai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{
    "model": "grok-4.1-fast",
    "input": [
      {"role": "system", "content": "You are a curation agent. Search X and return a JSON array of the top tweets matching the user preferences. Include inline citations like [1] in the text field."},
      {"role": "user", "content": "Find recent posts from @emidiopepe or general talk about terroir-driven natural wines."}
    ],
    "tools": [
      {"type": "x_search", "x_search": {
        "allowed_x_handles": ["emidiopepe"],
        "from_date": "2026-06-25",
        "to_date": "2026-06-27"
      }}
    ],
    "response_format": {"type": "json_schema", "json_schema": {
      "name": "tweet_curation",
      "schema": {"type": "object", "properties": {
        "tweets": {"type": "array", "items": {"type": "object", "properties": {
          "author": {"type": "string"},
          "text_with_citation": {"type": "string"},
          "estimated_likes": {"type": "integer"}
        }, "required": ["author", "text_with_citation", "estimated_likes"]}}
      }, "required": ["tweets"]}
    }}
  }'
```

Example response (note the top-level `citations` array — source of truth for URLs/IDs):
```json
{
  "output": [
    {"type": "message", "content": [
      {"type": "output_text", "text": "{\"tweets\": [{\"author\": \"@emidiopepe\", \"text_with_citation\": \"Bottling the new vintage today. [1]\", \"estimated_likes\": 450}]}"}
    ]}
  ],
  "citations": [
    {"type": "url_citation", "url": "https://x.com/emidiopepe/status/1806345678910111213", "title": "1"}
  ]
}
```
Parse the Tweet ID from `citations[].url` (`.../status/<id>`) and map inline `[1]` → `citations` entry titled `"1"`.

**Image descriptions:** add `"enable_image_understanding": true` inside the `x_search` tool params so the model can populate `media_description` (raw media URLs are not exposed by X).

**Verbatim text via oEmbed** (no auth; note the required `x.com`→`twitter.com` swap):
```bash
curl "https://publish.twitter.com/oembed?url=https://twitter.com/user/status/1806345678910111213&omit_script=true"
```
Returns `{ author_name, author_url, html }`. Parse the text between `<p>…</p>` in `html` for the guaranteed-verbatim tweet text. On 429 / protected / deleted, keep the LLM text and set `text_is_verbatim=false` (card shows "AI Summary:"). Throttle ~1 req/sec; cache by Tweet ID.
