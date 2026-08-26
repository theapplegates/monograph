---
title: "API Versioning Without Making Everyone Angry"
excerpt: "Versioning is a communication problem first. The technical shape only works when consumers can predict what changes and when."
category: "Engineering"
date: 2026-07-06
author:
  name: "Evan Brooks"
  role: "Security and reliability"
cover:
  src: "./cover.jpg"
  alt: "Purple and blue abstract light streaks"
  creditName: "Credits to Wolfgang Vrede via Unsplash"
  creditUrl: "https://unsplash.com/photos/abstract-purple-and-blue-light-streaks-with-a-glass-orb-7HRu1KzpLjg"
featured: false
---
<picture>
  <source
    type="image/jxl"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_596/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 596w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_960/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 960w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_1245/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 1245w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_1365/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 1365w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_1440/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 1440w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1440px"
  />
  <source
    type="image/avif"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_596/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 596w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_960/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 960w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_1245/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 1245w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_1365/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 1365w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_1440/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 1440w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1440px"
  />
  <img
    src="https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_800/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_596/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 596w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_960/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 960w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_1245/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 1245w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_1365/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 1365w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_1440/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 1440w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1440px"
    alt=""
    loading="lazy"
    width="1440"
    height="810"
  />
</picture>

<picture>
  <source
    type="image/jxl"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_480/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 480w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_1490/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 1490w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_2140/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 2140w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_2599/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 2599w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_jxl/c_scale,w_2800/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.jxl 2800w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 2800px"
  />
  <source
    type="image/avif"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_480/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 480w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_1490/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 1490w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_2140/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 2140w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_2599/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 2599w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_avif/c_scale,w_2800/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.avif 2800w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 2800px"
  />
  <img
    src="https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_800/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp"
    srcset="
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_480/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 480w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_1490/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 1490w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_2140/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 2140w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_2599/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 2599w,
    https://res.cloudinary.com/paulapplegate-com/image/upload/q_auto,f_webp/c_scale,w_2800/v1787714831/breakpoints/vzwuvo8hve2ohsxjcbkp.webp 2800w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 2800px"
    alt=""
    loading="lazy"
    width="2800"
    height="1573"
  />
</picture>
 
API versioning fails when it surprises people. A perfectly designed URL scheme cannot save a platform that changes behavior without warning, deprecates too aggressively, or leaves old versions alive with no support story.

The goal is not to avoid breaking changes forever. It is to make change survivable.

## Context

Public API consumers need predictable change windows, stable contracts, and clear migration paths. The existing informal approach works while consumers are close to the team, but becomes brittle as integrations grow.

## Decision

Use additive changes by default, reserve breaking changes for explicit version boundaries, and publish deprecation signals in documentation, response headers, and account communication.

## Alternatives

- Keep a single evergreen API and avoid explicit versions.
- Version every endpoint independently.
- Use date-based global versions for all behavior.

## Consequences

Consumers get a clearer contract, but the platform team must maintain version usage metrics and migration examples.

## Define what versioning protects

Does a version protect response shape, validation rules, authentication behavior, pagination, error codes, or all of the above? Write it down. Consumers need to know whether a field can appear, disappear, or change meaning.

Ambiguity turns every deploy into a compatibility risk.

## Make deprecation observable

Deprecation notices should show up in docs, dashboards, headers, and account communication. If a customer only learns about a breaking change when their integration fails, the process did not work.

Track usage by version and endpoint. That data tells you who needs help and whether a migration is realistic.

## Prefer additive change

Add fields, add endpoints, and add opt-in behavior before replacing existing contracts. When removal is necessary, provide migration examples that match real client code.

Developers forgive change more easily when the path forward is concrete.
