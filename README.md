# VITAgent: Surgical Intelligence

A small, dependency-free website for the VITAgent research initiative.

## Pages

- `/`: initiative overview, research map, project relationships, news, and team.
- `/explorer/`: the dedicated viewer/demo destination, currently **Under construction**.
- `/blog/`: paper companions and research notes.
- `/blog/how-to-train-a-surgeon/`: a reading companion to [arXiv:2611.11437](https://arxiv.org/abs/2611.11437), grounded in the public v1 preprint.
- `/bench/`, `/gym/`, `/wiki/`, `/agent/`, `/evolve/`: stable project pages, linked to relevant sections of the companion and to Explorer.

The top navigation changes pages. The home page's side navigation locates sections,
using a dot-matrix indicator for the current section. On smaller screens it becomes
a collapsible “On this page” navigation.

Explorer is intentionally a construction notice: no demo, source dataset frames,
or research trajectories are bundled. The separate viewer can be linked when it
is ready. Recursive improvement is labeled as ongoing research, beyond the results
in the current preprint.

## Preview and check

```sh
python3 scripts/check_site.py
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:4173/`. There are no runtime dependencies or build steps.

## Update content

- **Team**: edit `site/assets/team.js` only. Add institutions once, then list people with their `affiliations` (the first is the primary one, highlighted). Each institution gets its own dot marker and appears in the filter row automatically. Photos are optional (`photo: "assets/team/name.webp"`, square, at least 160px); without one the page shows a dot-matrix monogram.
- **Links and news**: `site/assets/config.js`. A resource appears once it has a public `https://` URL. News can reference a resource with `resource` and `label`.

## Design constraints

The rules behind the look are at the top of `site/assets/style.css`. In short:

- Pixels mean signal only: the dot-matrix wordmark and monograms, data, the scope viewport. No pixel body text, mascots or shadows.
- Colour 85/10/5: lamp white and cool greys, drape teal as the one brand colour, signal red only for "live" and "new".
- Geist for text, Geist Mono only for data inside expressive visuals.
- 4px spacing base; hierarchy through space and type. Lines stay inside controls and visuals.
- One continuous motion (the vital trace). The scope image resolves once on load and on hover. Reduced motion is respected.
- No dataset frames on the site: the scope image is procedural.

## Publish on GitHub Pages

Target: the VITAgent organization website repository, `VITAgent.github.io` (or the matching name of the final organization).

1. Create a public repository containing only this website.
2. Enable Pages with **GitHub Actions** as the source.
3. Push `main`, or run the **Pages** workflow manually.

The workflow checks internal links and uploads **only `site/`**, excluding scripts, documentation and any sibling research repositories. Relative links also support a project-site subpath during a temporary preview.

Code and data infrastructure live in the separate private `SurgAgent` repository. Ownership and licensing of future research assets remain with their original projects; this website does not grant a data or code license.
