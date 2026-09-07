# zlaprade7.github.io

My personal site, and the live demo of the dashboard that runs my room.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no
bundler. It is served straight off GitHub Pages, so what is in this repo is what
is on the site.

## What is here

| | |
| --- | --- |
| `index.html` | Homepage. A 3D olive wreath around the name, drawn with Three.js, with a flat SVG twin that takes over when WebGL or the CDN is not available |
| `projects/*.html` | Six case studies, each written Problem, Plan, Trials and Errors, Result |
| `demo/index.html` | **The MonCoeur dashboard**, running on synthetic data. See below |
| `learnFrench/` | An offline French vocabulary PWA, installable on iOS |
| `resume.html`, `resume.pdf` | CV, in both forms |
| `style.css`, `main.js` | Shared by every page |

## MonCoeur, the dashboard

**`demo/index.html` is the real dashboard**, not a screenshot or a mockup of
one. It is the same file that runs on the Raspberry Pi in my room as
`templates/dashboard.html`, published here unchanged.

It works out which one it is by asking `/api/brief` for real data. On the Pi it
gets an answer and shows the room. Here nothing answers, so it falls back to
synthetic data and says so in a banner. Nothing about the demo is a separate
code path pretending to be the live one, which is the only way a demo stays
honest as the real thing changes.

The Pi drives an 800x480 wall panel and my phone from that one file:

- **Wall**, landscape and 5:4 or wider. One screen, never scrolls, big type, no
  water buttons, because that panel has no touchscreen and a control nothing can
  press reads as broken. It declares itself with `?wall=1` rather than guessing
  from screen size, which got it wrong on the real panel.
- **Phone**, portrait. Scrolls, has the water buttons and a settings drawer.
  This is where things get edited.

What it shows: a fourteen day agenda merged from Google Calendar and my own
homework, hydration against a target that moves with activity and heat, sleep
and readiness from an Oura ring, room temperature and humidity from an SHT40,
weather, the lights, and a photo mode that turns the wall into a frame.

A single Flic button on the desk is the only physical control: one press for
lights, two for a glass of water, hold to switch the wall between the dashboard
and photos.

The project was called JARVIS until it was rebuilt. `projects/jarvis.html` is a
redirect stub that exists only so old links keep working.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The dashboard demo is at
`http://localhost:8000/demo/`.

Two things need the network: the Google Fonts stylesheet and the Three.js build
on the homepage. Both fail to something readable rather than to a blank page.

## Fonts

Two stacks, because there are two products in here and they are deliberately
not the same:

| | serif | data | UI |
| --- | --- | --- | --- |
| the site | Source Serif 4 | Spline Sans Mono | Archivo |
| the dashboard | Literata | JetBrains Mono | Outfit |

## Contact

[zacklaprade@gmail.com](mailto:zacklaprade@gmail.com) ·
[github.com/zlaprade7](https://github.com/zlaprade7) ·
[linkedin.com/in/zack-laprade](https://linkedin.com/in/zack-laprade)
