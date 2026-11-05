# VITAgent — Surgical Superintelligence

A small, dependency-free website for the VITAgent research initiative.

## Pages

- `/`: the initiative and its projects.
- `/bench/`: SurgAgent, with placeholders for the agent environment, key takeaways and the existing trajectory viewer.
- `/evolve/`: a minimal SurgAgent Evolve project page.

No paper numbers, experiment results, dataset files or viewer trajectories are bundled.

## Preview and check

```sh
python3 scripts/check_site.py
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:4173/`. There are no runtime dependencies or build steps.

## Update content

Edit the page HTML and `site/assets/style.css`. Add approved **public** paper, code, data and viewer URLs in `site/assets/config.js`; null values retain the placeholders. The existing viewer remains separately hosted and versioned. Do not link a private repository as a public code release.

## Publish on GitHub Pages

Target: the VITAgent organization website repository, `VITAgent.github.io` (or the matching name of the final organization).

1. Create a public repository containing only this website.
2. Enable Pages with **GitHub Actions** as the source.
3. Push `main`, or run the **Pages** workflow manually.

The workflow checks internal links and uploads **only `site/`**, excluding scripts, documentation and any sibling research repositories. Relative links also support a project-site subpath during a temporary preview.

Code and data infrastructure live in the separate private `SurgAgent` repository. Ownership and licensing of future research assets remain with their original projects; this website does not grant a data or code license.
