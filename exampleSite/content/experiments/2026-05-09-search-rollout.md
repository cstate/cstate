---
title: Search relevance rollout experiment
date: 2026-05-09 09:00:00
recordType: experiment
recordKind: experiment
state: active
severity: notice
pin: true
affected:
  - API
summary: Testing a search relevance update with a limited traffic slice.
---

## What changed?

We are testing a search relevance update with a limited share of API traffic.

## Why are we running it?

The goal is to improve result ordering while keeping response times stable.

## What should people watch for?

Users may see slightly different search ordering during the test. This is not an outage and does not change the overall service health.
