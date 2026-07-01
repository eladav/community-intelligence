# Product Spec — Issue #3: Create the basic flow with mock data

> **Status:** Approved for planning and implementation.
> **Issue:** https://github.com/eladav/community-intelligence/issues/3
> **Parent spec:** [docs/product-spec.md](../../product-spec.md)
>
> **Note to downstream planner, implementer, and reviewer:** You must read this spec in full before designing, building, or reviewing any part of this workstream. The product decisions here supersede any prior interpretation of the issue title. The implementation plan must derive directly from the goals, acceptance criteria, and UX recommendation documented below.

---

## 1. Problem Statement

The core product claim of Community Intelligence is that a user can stay current on Twitter/X in a few focused minutes without opening the native app or entering a doomscroll. Issue #3 is the first moment that claim becomes testable.

The specific product problem this issue must solve is: **we do not yet know whether the core consumption experience is informative without being attention-stealing.** The architecture, data model, and AI pipeline are all designed, but no one has lived through the flow. Building with mock data lets us reason about information hierarchy, content shape, and attention economics before committing to the real retrieval system.

This is a product evaluation milestone, not a technical one. The deliverable is an experience we can reason about, not a system that works with real data.

---

## 2. Background — Alignment with the Greater Vision

The full product vision is documented in `docs/product-spec.md`. The key constraints this issue must respect:

- **Once-daily, bounded delivery.** The product is not a live feed. Content arrives as a curated deck, once per day.
- **Relevance-first, anti-addictive.** No engagement-maximizing mechanics. No likes on X, no replies, no follower counts as incentive.
- **Signal without doomscrolling.** The user should feel confident they got what mattered — and then stop.
- **Swipe as the primary interaction.** Swiping gives an explicit, conscious signal that passive scrolling does not.
- **Read-only.** The app never posts, replies, or surfaces engagement mechanics. Tapping an item links out to X.

---

## 3. Personas

**Primary: The Informed Curator**
A founder, researcher, or engaged professional who follows specific people and topics on Twitter/X but has given up opening the app because the cost — time loss, distraction, emotional drag — outweighs the value. They want to know what happened today among the accounts and topics they care about, spend a few intentional minutes reviewing it, and move on. They are time-sensitive and relevance-sensitive. They trust a curated shortlist more than an open feed.

**Secondary: A small group of trusted friends (~12 people)**
Same profile as the primary. All are known, manually invited users. No anonymous or unknown audience.

---

## 4. Goals

1. Build a functioning basic flow using mock data so the team can reason about whether the experience feels calm, informative, and finite.
2. Validate that each item in the flow gives the user enough information to make a confident attention decision without encouraging compulsive engagement.
3. Establish the swipe-based consumption model as the primary interaction pattern.
4. Prove that absolute recency (date/time) and an attention-depth signal (skim / read / dive) are sufficient — without a daily cap or "why this matters" explanation — to guide intentional use.
5. Keep the experience aligned with the once-daily, anti-addictive philosophy of the parent spec.

---

## 5. Non-Goals

- Not a production data pipeline. Real tweet retrieval (Grok / xAI API) is out of scope for this issue.
- Not an infinite feed. The mock deck must have a clear end state.
- Not a ranking-system validation. Mock data may be handcrafted.
- Not a social network layer. No follower counts, likes-on-X, replies, or social sharing inside the app.
- Not a notification or push system.
- Not a settings or onboarding flow (handle/topic preferences are out of scope for this issue).
- Not a multi-user or auth milestone. Single-user or hardcoded-user context is acceptable.

---

## 6. Product Decision Summary

The following decisions were made during the Product Discovery discussion on this issue (see GitHub comments):

| Decision | Resolution |
|---|---|
| Primary interaction | **Swipe, not scroll.** Swiping produces a conscious, explicit signal. A scroll leaves no signal and enables passive consumption. |
| Attention guidance model | **Skim / Read / Dive depth labels.** The product should communicate the intended time investment for each item, not just relevance. A deep engagement is fine if it is an intentional choice. |
| Daily cap | **No hard cap.** The healthier constraint is content curation quality plus UX design. The experience should end naturally when the curated content is exhausted, not at an arbitrary number. |
| Recency format | **Absolute timestamps.** Show the actual date and time of the content, not relative strings like "2 hours ago." |
| "Why this matters" explanation | **Deferred.** Dropped from the first pass. The item content, recency, and depth signal should be sufficient for the user to make an attention decision. |
| Content type flexibility | **Mixed types allowed.** Mock items can represent tweets, ideas, conversations, or longer artifacts (e.g., research paper summaries). The interaction model is consistent regardless of content type. |
| Long engagement posture | **Long engagement is a positive signal if intentional.** A user spending an hour on a single research paper is a success, not a failure. The goal is not to minimize time spent; it is to ensure time spent is chosen. |
| Handle vs. interest source label | **Deferred.** The "from people you follow" vs. "suggested for your interests" distinction is not required in the first mock flow. |

---

## 7. User Stories

1. As a user, I can open the app and immediately see today's curated intelligence deck so that I know what to review.
2. As a user, I can see an absolute timestamp for each item so that I know how recent it is and whether it is still relevant.
3. As a user, I can see a depth label (Skim / Read / Dive) on each item so that I can decide how much attention to give it before engaging.
4. As a user, I can swipe right on an item I want to act on and swipe left on an item I want to skip, so that I am making a conscious decision rather than passively scrolling.
5. As a user, I can see a clear end state when I have reviewed all items in the deck, so that I know I am done and do not feel compelled to seek more content.
6. As a user, I can tap an item to open the source content (tweet, article, conversation) so that I can go deeper when I choose to.
7. As a user, I encounter mock items of mixed depth — short tweets, idea snippets, and longer artifacts — so that I can test whether the interaction model works across content types.

---

## 8. Success Criteria

The mock flow succeeds if a user can:

1. Review the entire deck in a single short session without losing track of their place.
2. Make a confident skim/read/dive decision on each item based only on the content and the UI signals provided.
3. Reach a clear end state and feel that they are "caught up," not that they missed something or should keep checking.
4. Experience nothing that resembles a social feed: no popularity ranking by likes, no infinite scroll affordance, no prompts to share or reply.

The flow fails if a user feels uncertain about when to stop, is tempted to re-read the deck, or cannot tell the difference in expected attention between a short tweet and a long research item.

---

## 9. Acceptance Criteria

- [ ] The app presents a bounded set of mock intelligence items in the primary flow.
- [ ] The primary interaction is swipe-based (swipe right = engage / save, swipe left = skip).
- [ ] Each item displays an absolute timestamp (not a relative string).
- [ ] Each item displays a depth label: **Skim**, **Read**, or **Dive**.
- [ ] The mock item set includes varied content types: at least one short tweet-length item, one medium-length idea or conversation item, and one longer artifact (e.g., a research paper or thread summary).
- [ ] The flow has an explicit end state. When all items are reviewed, the user sees a "caught up" or equivalent message. There is no pull-to-refresh or auto-reload.
- [ ] The experience contains no in-app engagement mechanics: no likes, no replies, no follower counts, no share actions.
- [ ] Tapping an item links out to the source URL (deep link or browser). This is the only path from the app into the source platform.
- [ ] The visual design does not imply infinite scroll (e.g., no visible list that extends below the viewport without a clear boundary).
- [ ] The depth labels are determined by the mock data (or a simple LLM call on mock content) — not user input or manual tagging in the UI.

---

## 10. Assumptions

- Mock data is sufficient to evaluate the core product experience. Real content retrieval is not required to reason about information hierarchy and interaction model.
- The attention depth labels (Skim / Read / Dive) will eventually be produced by the AI curation pipeline. For this issue, they may be hardcoded in mock data or derived from a simple heuristic.
- The swipe interaction model can be validated with a prototype-quality implementation.
- Users reviewing the mock flow are the same people (founder + small trusted group) who will use the production app.
- Absolute timestamps remain meaningful even when content is mocked — the dates should be realistic (recent) to make the recency signal credible.

---

## 11. Constraints

- **Anti-addiction by design.** The UI must not introduce any pattern that encourages re-consumption, compulsive checking, or social comparison. If a design decision would feel at home in a social feed app, it is the wrong decision.
- **React Native (iOS), RN 0.76.** Matches the committed platform from the parent spec.
- **Read-only.** No write actions to any external service, including X.
- **No open signup.** Even in mock mode, if auth is present, it must be manually seeded.
- **Alignment with parent spec.** Any product decision made in this issue that conflicts with `docs/product-spec.md` must be explicitly flagged and resolved before proceeding to implementation.

---

## 12. Dependencies

- `docs/product-spec.md` — the authoritative source for all architectural and product decisions outside the scope of this issue. Must be read before planning.
- The swipe card component and navigation structure established here will be extended in subsequent issues to consume real data. Design for extensibility, but do not implement the real data pipeline.
- The depth label model (Skim / Read / Dive) will eventually be produced by the Grok curation call. The interface for receiving this label should be defined clearly in the data shape used by mock items so it slots in naturally when real data arrives.

---

## 13. Open Questions

The following questions were explicitly deferred or left open after the Product Discovery discussion. They do not block this issue but should be resolved before or during planning:

1. **Swipe action mapping:** Should swipe right/left map to a binary engage/skip, or should the swipe direction map to depth intent (e.g., right = read, hard right = dive, left = skip)? The parent spec uses right = like, left = dislike; this issue may want richer gesture semantics.
2. **Dive behavior:** Does tapping "Dive" open a deeper in-app view of the item, or does it immediately open the source URL? The parent spec says tap = link out, but a pre-dive summary view may be worth testing.
3. **Depth label source for mock:** Should depth labels be hardcoded in the mock dataset, derived from a simple word count heuristic, or generated by a lightweight LLM call on the mock content? The answer affects how realistic the depth signal feels in testing.
4. **End-state screen copy and design:** What does "caught up" look like? A simple message, a summary of what was reviewed, or something else? This is a product decision with emotional resonance.
5. **Timestamp granularity:** Should the absolute timestamp show date only (e.g., "Jun 30"), date and time (e.g., "Jun 30, 14:23"), or vary by recency (date for older, time for today)?

---

## 14. UI/UX Recommendation

**Recommended approach: Swipe-first card stack with a fixed depth label and absolute timestamp.**

Each card in the deck should present:
1. **Content summary** — the tweet text, idea excerpt, or artifact title/summary. Keep it short enough to read without scrolling the card itself.
2. **Absolute timestamp** — visible without tapping. Small but legible.
3. **Depth label** — a clear, non-numeric indicator: **Skim**, **Read**, or **Dive**. This should be visually distinct (e.g., a badge or chip) but not dominate the card.
4. **Source type indicator** (optional for mock) — a small icon or label indicating whether this is a tweet, an idea, or a conversation artifact.

**Interaction model:**
- Swipe right = flag as relevant / save for engagement.
- Swipe left = dismiss.
- Tap = open source URL.
- No pull-to-refresh. No visible card count or progress bar that implies more is always coming.

**End state:** A dedicated "Caught up" screen with no further action options. Do not show a deck count or "only N items left" — that framing creates urgency. Show the end state only when the deck is exhausted.

**Anti-patterns to avoid:**
- Visible like/repost counts on cards (invites social comparison).
- A list view that shows all items at once (enables compulsive scanning).
- Any animation or micro-interaction that rewards rapid swiping (slot machine pattern).
- A "load more" or "refresh" button after the deck is done.

The card stack is strongly preferred over a list view for this first evaluation. A list makes it easier to scan for "interesting" items, which defeats the curation-first philosophy. The stack forces one-at-a-time attention, which is the behavior the product is trying to cultivate.

---

## 15. Future / Deferred

The following are explicitly out of scope for this issue and deferred to later workstreams:

- Real data retrieval via Grok / xAI API.
- Handle and topic preference onboarding.
- The dislike → `disinterests` feedback loop.
- Push notifications for daily deck availability.
- "From people you follow" vs. "suggested for your interests" source labels.
- Web client.
- Multiple users and auth flows beyond a single hardcoded test user.
