# VITAgent interface guideline

Status: **v0.2. Chapters 1 and 2 confirmed (2026-11-05); 3.4 product card confirmed; the rest is a draft.** Each chapter ends with the decisions to confirm. Nothing here is built yet; the current site will be brought in line once a chapter is confirmed.

The guideline has two layers, built in order:

1. **Elements**: a closed set of building blocks, each with fixed styling and fixed interaction states.
2. **Composition**: rules for combining elements into sections and pages.

If something on a page cannot be described with the elements in chapter 3, it does not go on the page until the element set is extended here first.

---

## 1. Principles

**P1. Hierarchy comes from type and space, not chrome.**
To separate or group things, reach for tools in this order and stop at the first that works:

1. Space (proximity). Related things sit close, unrelated things far apart.
2. Type: size, then weight.
3. Tone: ink versus muted text.
4. Surface: a slightly raised background behind a group.
5. A line. Last resort, and only where chapter 2.5 allows it.

This follows the law of proximity (closeness alone is read as grouping) and the common design-system advice to use borders sparingly and prefer spacing or background contrast, because every extra divider adds clutter and weakens the ones that matter.

**P2. Every mark carries information.**
No decorative separators, no eyebrow labels above headings, no small labels that repeat what the content already says, no numbering unless the reader acts on the order. If deleting a mark loses nothing, delete it.

Test before adding any meta line or caption: does it state a fact that is not already visible from the name, the sentence or the structure? A category under a product name ("Environment"), a caption under a region ("evaluation on top of the Gym") or a label on a relation the layout already shows ("evaluates") fails the test. A venue ("NeurIPS 2026") or a role ("Team lead") passes.

**P3. Two registers: quiet and expressive.**
Text, lists and controls are *quiet*: fast, small, consistent. The three visuals (dot-matrix display, vital trace, system diagram) are *expressive*: they carry the identity and are allowed motion. At most one expressive visual per screenful.

**P4. One element, one look, everywhere.**
A link looks and behaves like a link on every page. An unavailable resource is shown the same way everywhere.

**P5. Calm, precise, alive.**
Clinical instrument, not toy and not marketing page. Life is shown by one live signal, not by decoration.

**Decisions to confirm**
- [ ] P1 order of tools, with lines as last resort
- [ ] P2 no eyebrows, small labels or decorative numbering
- [ ] P3 at most one expressive visual per screenful

---

## 2. Foundations

### 2.1 Type roles

One family (Geist). Five roles only. A component uses at most three of them.

| Role | Size / line | Weight | Colour | Used for |
|---|---|---|---|---|
| Display | dot-matrix | n/a | ink | wordmark and section titles (48px tall); the text stays for screen readers |
| Title | 40 / 48 | 500 | ink | section titles, page titles |
| Heading | 20 / 28 | 500 | ink | names of things: artifacts, people, news items |
| Body | 17 / 28 | 400 | ink | sentences |
| Meta | 15 / 24 | 400 | muted | facts that support a heading: role, date, venue |

- Mono (Geist Mono) appears only *inside* expressive visuals, where it is data on an instrument. Not in lists, not for dates, not for tags.
- No all caps, no letter-spacing tricks, no sizes below 15px for anything a reader needs. The only exception is the legal fine print in the footer (13px).
- Section titles are real titles (40px, ink), not small grey labels in a side column.

### 2.2 Space

Base unit 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

| Relationship | Gap |
|---|---|
| Inside one element (name to meta) | 4 to 8 |
| Between elements in a group (two artifacts) | 32 to 48 |
| Section title to its content | 32 |
| Between sections | 128 (desktop), 96 (mobile) |

The jump from 48 to 128 is what separates sections. No line is needed.

### 2.3 Colour roles

| Role | Light | Dark | Use |
|---|---|---|---|
| surface | #f3f5f5 | #101516 | page |
| surface-raised | #ffffff | #161d1f | grouping a set (P1 step 4) |
| ink | #1c2426 | #e6ecec | primary text |
| muted | #5f6b6e | #93a1a4 | meta text only |
| brand (drape teal) | #0e6b65 | #3fb1a6 | interactive and selected things |
| signal | #d93a46 | #ff5c66 | live only: trace head, newest item, and VITA (life) in the wordmark; in the hero the shared A alternates between signal red and ink, the overlap of vita and agent |

Colour is never the only carrier of meaning: affiliations use shapes, status uses words.

### 2.4 Grid

12 columns, max width 1152px, single left edge for all text. No label-left / content-right two-column sections.

### 2.5 Lines

Allowed:
- inside expressive visuals (instrument frames, diagram edges);
- as the boundary of a control (button, filter chip, input).

Not allowed: between sections, between list rows, under the nav, around content blocks.

### 2.6 Surfaces

The raised surface is reserved for **product cards** (3.4). Nothing else on a page sits on a white panel: not monograms, not readouts, not placeholders. This keeps the surface meaning one thing: an independent product you can open.

**Decisions to confirm**
- [ ] five type roles and sizes; mono only inside visuals
- [ ] spacing scale and the 48 / 128 rhythm
- [ ] colour roles
- [ ] single left edge, no side-label columns
- [ ] line policy

---

## 3. Elements

Every element lists its anatomy and its states. States use the same treatment everywhere (3.9).

### 3.1 Text link
Brand colour, no underline at rest, underline on hover. Used inside sentences and for resource links.

### 3.2 Button
- Primary: filled brand, surface-coloured text. One per section at most.
- Secondary: text link styling with a trailing space, no border.
Buttons trigger actions on this page (switch, filter). Anything that goes somewhere is a link.

### 3.3 Resource set
The links that belong to a project: Paper, Code, Trajectories.
- Available resources are text links.
- Unavailable resources are **not shown**. Instead the set reads as one Meta line, for example "Code and paper coming soon".
No greyed-out labels, no "Soon" tags.

### 3.4 Product card (confirmed)
Each artifact is an independent product and is shown as one card.
- Raised surface, 8px radius, no border. All cards in a set have equal height.
- Emblem: a 15×15 dot-matrix screen with the product's own scene (Bench: bars, Gym: an agent walking between tools, Wiki: an open book being read, Agent: a tool call orbiting a core, Evolve: a double helix). Still at rest; animates while the card is hovered or focused.
- Heading (name) · Meta only when it adds a fact, such as the venue · Body (one sentence) · Resource set at the bottom.
- The whole card opens the product's own page. Every product has a page.
- The current paper's card spans two columns, with a larger emblem beside the text.

### 3.5 Person
Monogram or photo (48px, no tile behind it) · Heading (name) · Meta (role) · affiliation marks (shape only, name on hover).

### 3.6 News item
Meta (date, written "Nov 2026") · Body (one sentence, may contain links). The newest item carries the live signal dot.

### 3.7 Filter
A row of chips. Chip = optional mark + label + count in muted. Exactly one selected. Selected chip: ink border and ink text; others: line border, muted text.

### 3.8 Expressive visuals
- **Dot-matrix display**: shows the pathway (Understand, Solve, Evolve). Its own caption names the current step; no separate numbered step list.
- **Vital trace**: beside two dictionary entries that explain the name. Headword large (*vīta*, *agent*), part of speech in muted italics, definition in body text.
- **System map**: products are tinted regions with a fine dot texture; the Gym is a room outlined by a dense dotted line; relations are dotted lines with packets stepping along them. No background dot field. SurgWiki sits inside SurgAgentGym; SurgAgent exchanges actions and observations with the Gym; SurgKnow-Bench sits on top of the Gym as its evaluation layer; trajectories flow to SurgAgentEvolve, which yields the next SurgAgent. Placed below the product cards; hovering a card highlights its region.

### 3.9 Interaction states

| State | Treatment |
|---|---|
| Rest | as specified per element |
| Hover | text links underline; entities lift to surface-raised; chips darken border |
| Focus (keyboard) | 2px brand outline, 3px offset, on every interactive element |
| Pressed | 0.98 scale for 70ms on buttons and chips only |
| Selected | ink border and ink text (filters), ink text (steps) |
| Unavailable | not rendered (see 3.3) |
| Live | signal colour, blinking 1.2s, stepped |

Targets at least 24px on desktop and 44px on touch. Links are real links; buttons are real buttons.

**Decisions to confirm**
- [ ] hide unavailable resources and replace them with one sentence
- [ ] the dot-matrix display replaces the numbered step list
- [ ] state table

---

## 4. Motion

Two speeds, after Carbon's productive / expressive split:

| Token | Duration | Easing | Used for |
|---|---|---|---|
| quick | 100ms | cubic-bezier(0.2, 0, 0.38, 0.9) | colour, opacity, hover, press |
| move | 240ms | cubic-bezier(0.2, 0, 0.38, 0.9) | expanding, filtering |
| reveal | 400ms | cubic-bezier(0, 0, 0.3, 1) | one-time reveals (monogram boot) |
| loop | stepped, ~15fps | steps | expressive visuals only |

- Only `transform` and `opacity` animate (and colour for hover).
- Autoplaying motion exists only in expressive visuals, and pauses when off-screen.
- `prefers-reduced-motion`: visuals render a still frame; the loop advances only on user input.

**Decisions to confirm**
- [ ] the four motion tokens
- [ ] autoplay only inside expressive visuals

---

## 5. Composition

### 5.1 Section
Title, optional one-sentence lead, one module. Nothing else.

### 5.2 Home page
1. **Nav**: wordmark left, section links right. No border; it gains a raised surface only once the page scrolls.
2. **Concept**: wordmark, claim ("Surgical Intelligence"), one sentence; dot-matrix display cycling Understand, Solve, Evolve; vital trace with the *vīta* and *agent* entries.
3. **Pathway**: the research motivation as three questions, in order. A gauge from general model to surgical competence shows how far we are; each question has one sentence, the products that answer it and its status. Numbers are allowed here because the order is the point.
4. **News**: up to five items.
5. **Artifacts**: product cards, then the system map.
6. **Team**: filter, then people.

### 5.3 Project page
Title, one sentence, resource set, then sections that each hold one module (figure, takeaways, viewer).

**Decisions to confirm**
- [ ] section anatomy
- [ ] home page order
- [ ] nav without border, raised on scroll

---

## 6. Gap to the current site

### November 2026 site structure

The primary navigation is Home, Explorer, Blog, and the public GitHub organization.
The home page has a separate side rail for section location, with a 3×3 dot-matrix
marker; its selected cross and underlined label identify the current section. On
smaller screens this becomes a collapsible text navigation.
Home introduces the initiative and maps its research; product pages remain stable
destinations. Explorer is a separate viewer/demo destination and currently reads
“Under construction”. Blog holds paper companions, with section links back to the
relevant projects. Shared concepts connect across these pages rather than becoming
duplicate project descriptions.

The existing large animated dot-matrix VITAgent wordmark stays in the hero.
The headline beneath it is plain Geist text, with the research directions on a
second line at Heading size. The navigation also retains its wordmark. Paper
announcements and article listings are unboxed text groups using Heading, Body,
Meta, and text links. Reading navigation is a wrapping list of text links. Article
headings use plain text for readability; article paragraphs have a 68ch measure.
An under-construction notice is plain text with a status word and useful links,
without a faux viewer or invented data. These extend the existing text/link
elements; no new decorative surfaces or visuals are introduced.

What changes once the chapters above are confirmed:

| Now | Violates | Becomes |
|---|---|---|
| hairlines between sections, news rows, artifact rows, under nav | 2.5 | space only (2.2) |
| small grey section labels in a left column | 2.1, 2.4 | 40px titles on the left edge |
| numbered steps 01 to 04 with progress bars | P2, 3.8 | caption inside the dot-matrix display |
| mono dates and tags ("2026.11", "Soon", "v1, v2") | 2.1 | Meta text ("Nov 2026") |
| greyed "Code (soon)" links | 3.3 | hidden, one sentence instead |
| teal bar on the featured artifact | P1 | raised surface |
| `vita` label in mono red | 2.1 | readout kept, set as Meta and Heading |

## Sources

- Law of proximity: [Interaction Design Foundation](https://ixdf.org/literature/topics/law-of-proximity)
- Fewer borders, spacing scale, three levels of emphasis: [Refactoring UI summary](https://cdn.jsdelivr.net/npm/claude-code-skills@0.5.0/data/skills/ux-ui-design-system/references/refactoring-ui.md)
- When to use dividers, and the risk of overusing them: [Material Design 1, Dividers](https://m1.material.io/components/dividers.html)
- Productive and expressive motion, duration and easing tokens: [Carbon, Motion](https://carbondesignsystem.com/elements/motion/overview/)
- Interaction, focus, target size and animation rules: [Vercel Web Interface Guidelines, summary](https://dev.to/sivarampg/web-interface-guidelines-checklist-for-llms-vibe-coders-19j9)
- Type scale and productive vs expressive type: [Carbon, Typography](https://carbondesignsystem.com/elements/typography/overview/)
