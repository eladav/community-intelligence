# Agent Plan

Parent workstream: eladav/community-intelligence:issue:3
Packet: packet-1-boundary-contract

Status: Draft

## Objective
Define Shared Schema and Pipeline Boundary Contract

Define the `DeckItem` interface in `src/types/deck.ts`. Establish the boundary contract that incoming items must adhere to. Create the foundational types for the pipeline.

## Acceptance Criteria
- src/types/deck.ts exports DeckItem interface
- Contains id, type, contentSummary, timestamp, depthLabel, sourceUrl

## Likely Files
- src/types/deck.ts

## Dependencies

## Notes
- This is a packet planning PR targeting `agent/eladav-community-intelligence/issue-3`.
- Implementation must not begin until the `agent-plan-approved` label is present.
