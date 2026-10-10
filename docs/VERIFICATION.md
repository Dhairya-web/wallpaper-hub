# Verification

This file distinguishes repository checks from product claims. Checked on 10 October 2026.

## Checks in this publication pass

- Selected source files copied with SHA-256 comparisons.
- Original source, configuration and historical release packages kept unchanged.
- Website modules included as files, with no nested Git repository dependency.
- Pattern-based credential and private Windows-path scans found no matches in the curated text files or text entries inside the three ZIP packages. This is not a guarantee that every possible secret format can be detected.
- Source validator passed: 3 enabled of 5 configured themes, 10 trails and 10 enabled-theme assets.
- Automated configuration/package and Trail V2 suites: **41 passed, 0 failed**. Historical package integrity checks passed.
- Headless Chrome smoke checks: all six website routes loaded at 1440px and 390px widths, with no page errors, broken loaded images, HTTP errors or horizontal overflow detected. Desktop and mobile homepage screenshots were visually inspected.
- The standalone wallpaper page also loaded without a page error. These are short browser checks, not real wallpaper-host acceptance tests.

## Not established by this pass

- Fresh testing inside Lively Wallpaper or Wallpaper Engine.
- New measurements of memory, CPU, GPU usage or frame rate.
- Long-duration stability or compatibility with every phone, browser and display.
- Commercial readiness, rights clearance or paid-client outcomes.

The repository's automated workflow checks the source and existing packages. A successful workflow is not a substitute for these separate gates.
