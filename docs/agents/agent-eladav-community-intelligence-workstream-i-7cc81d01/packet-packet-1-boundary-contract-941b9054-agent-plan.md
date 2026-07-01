# Agent Plan

Parent workstream: eladav/community-intelligence:issue:3
Packet: packet-1-boundary-contract

Status: Draft

## Objective
Define the explicit boundary contract and shared data schema between the Mock Data Provider (producer) and the UI Swipe Deck Component (consumer) for the basic application flow.

## Context
Based on `docs/product-spec.md`, the UI will display a daily digest of tweets using a Tinder-style swipe interface. For this MVP step (Issue #3), we are implementing the UI flow populated by mock data before connecting real backend services.

## Pipeline Boundary Contract
To comply with the `Pipeline Boundary Contract Invariant` overlay:

1. **Producer Stage:** Mock Data Provider (A static service generating synthetic application data).
2. **Consumer Stage:** UI Swipe Deck Component (The React Native view rendering the items).
3. **Boundary Values:** The contract centers around two entities defined in the spec:
   - `DeckItem`: `{ id, user_id, tweet_id, deck_date, rank, source, reason_for_selection, status }`
   - `Tweet`: `{ tweet_id, author_handle, text, text_is_verbatim, url, estimated_likes, context, etc. }`
   The producer will output an array of `DeckItem` objects populated with associated `Tweet` objects (or references).
4. **Handling Path:**
   - **Acceptance:** The UI component will directly accept these values, strictly typed to the `Tweet` and `DeckItem` schema.
   - **Normalization:** Any missing optional fields (e.g., `estimated_likes`, `media_description`) will be normalized into default empty visual states (e.g., hidden engagement counts).
   - **Rejection:** Items missing critical fields like `tweet_id` or `text` will be visibly rejected by the UI.
5. **Regression Test:** Add a component test verifying that at least one fully populated mock `DeckItem` and one sparsely populated `DeckItem` (missing optional fields) cross the boundary and render successfully without crashing.
6. **Diagnostic Path:** If an invalid item is passed to the UI, the component must log the dropped record and its reason to the console (development mode) and/or render a fallback "Data Error" card to make the failure visible to the operator.

## Implementation Steps
1. **Initialize Project:** Create the React Native (v0.76) project if not already present.
2. **Define Schema:** Implement TypeScript interfaces for `Tweet` and `DeckItem` in `src/types/deck.ts` exactly mirroring the `product-spec.md`.
3. **Implement Producer:** Create `src/services/mockProvider.ts` to output a static array of valid `DeckItem`s and `Tweet`s (covering various sources: handle, interest).
4. **Implement Consumer:** Create `src/components/SwipeDeck.tsx` to accept the mock array and render the cards (showing author handle, recency, text, and `reason_for_selection`).
5. **Implement Handling Paths:** Ensure `SwipeDeck.tsx` implements the visual normalization for missing optional fields and visible rejection diagnostics (console logs / error cards).
6. **Implement Tests:** Write tests in `src/components/__tests__/SwipeDeck.test.tsx` providing representative values to prove the boundary works.

## Acceptance Criteria
- `src/types/deck.ts` exports `DeckItem` and `Tweet` interfaces matching the spec.
- Mock data provider supplies correct schema data.
- UI component accepts and renders the mock data.
- Fallback UI or console warning logs rejected/invalid items.
- Regression test proves boundary contract logic.

## Risks
- Schema drift if the mock provider does not perfectly replicate the shape of actual Supabase Edge function responses later. Explicit shared schema mitigates this.

## Assumptions
- App will be built in React Native.
- This is a local mock implementation; no real network calls or Supabase integration are permitted in this packet.

## Non-Goals
- Real Grok API integration.
- Supabase integration.
- Perfect production UI polish (focus is on flow, data binding, and boundary contracts).
