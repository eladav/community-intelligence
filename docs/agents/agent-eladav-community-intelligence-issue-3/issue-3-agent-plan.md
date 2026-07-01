# Agent Plan — Issue #3: Create the basic flow with mock data

> **Status**: Ready for implementation pass.
> **Issue**: https://github.com/eladav/community-intelligence/issues/3

## Objective
Implement the initial React Native consumption flow using mock data to evaluate the product's UX (calm, informative, swipe-first, bounded). This is a product evaluation milestone, not a technical data-pipeline milestone.

## Context Used
- Issue #3 Product Spec (`docs/agents/agent-eladav-community-intelligence-issue-3/issue-3-product-spec.md`)
- Parent Product Spec (`docs/product-spec.md`)

## Affected Areas
- **Data Layer:** `src/data/mockDeck.ts`, `src/types/deck.ts`
- **UI Components:** `src/components/SwipeCard.tsx`, `src/components/CaughtUp.tsx`
- **Screens:** `src/screens/DeckScreen.tsx`
- **Tests:** `__tests__/PipelineBoundary.test.tsx`

## Pipeline Contracts (Learning Overlays)
Per the pipeline boundary contract invariants, this flow introduces a data boundary between the mock data provider and the UI consumption layer.

1. **Upstream Stage (Producer):** `MockDataProvider`
2. **Downstream Stage (Consumer):** `DeckScreen` / `SwipeCard`
3. **Values Crossing the Boundary:**
   - `id` (string)
   - `type` (enum: `"tweet" | "idea" | "artifact"`)
   - `contentSummary` (string)
   - `timestamp` (string, absolute ISO 8601)
   - `depthLabel` (enum: `"Skim" | "Read" | "Dive"`)
   - `sourceUrl` (string)
4. **Validation & Rejection:** The UI layer (`DeckScreen`) must validate incoming items against the shared `DeckItem` schema. If an upstream item contains an invalid `depthLabel` or missing required fields, the UI must NOT silently drop it. It must display a visible diagnostic (e.g., an "Invalid Content" card) and log the rejected payload to the console so operators see the failure.
5. **Regression Test:** Add a test proving that a mock item with a representative boundary value (e.g., `depthLabel: "Dive"`) successfully crosses into the UI component and renders the correct badge.
6. **Diagnostic Path:** Unmapped `type`s or `depthLabel`s must trigger a visible UI fallback card displaying the raw unsupported value.

## Implementation Steps

1. **Shared Schema Definition:**
   - Define the `DeckItem` TypeScript interface in `src/types/deck.ts`.
2. **Mock Data Provider:**
   - Create `src/data/mockDeck.ts` returning a hardcoded array of `DeckItem`s.
   - Include at least one short tweet, one medium idea, and one longer artifact. Ensure depth labels ("Skim", "Read", "Dive") are represented.
3. **Card UI Component:**
   - Implement `SwipeCard.tsx` displaying the `contentSummary`.
   - Add a fixed depth label badge (`depthLabel`).
   - Add a visible absolute timestamp (`timestamp`).
   - Add a small source type indicator (`type`).
4. **Deck Screen & Gestures:**
   - Implement `DeckScreen.tsx` using a swipeable card stack (e.g., using `react-native-reanimated` or a dedicated swipe-deck library).
   - Swipe Right = dismiss/flag relevant (no backend save).
   - Swipe Left = dismiss/skip.
   - Tap = `Linking.openURL(sourceUrl)`.
5. **End State Screen:**
   - Implement `CaughtUp.tsx` that appears when the stack is empty. Do not include reload, refresh, or pull-to-refresh actions.
6. **Testing:**
   - Implement `__tests__/PipelineBoundary.test.tsx` to verify the pipeline contract for `depthLabel` propagation and the diagnostic path for invalid payloads.

## Verification
- Local build runs on iOS simulator.
- Swipe gestures work smoothly in both directions.
- External links open successfully on tap.
- The "Caught Up" state is reached and does not allow reloading.
- Invalid data payloads are caught and visually rejected.

## Non-Goals
- No integration with Grok or real X/Twitter data.
- No user authentication or backend setup (Supabase).
- No saving of swipe analytics.

## Assumptions & Risks
- Assuming React Native 0.76 environment is either set up or will be initialized by the implementer.
- The swipe gesture implementation can be basic for this mock flow, as long as it provides explicit left/right signaling.
