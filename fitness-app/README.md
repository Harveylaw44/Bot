# FitTrack

A minimal, MyFitnessPal-style fitness tracker. React + localStorage only, mobile-first, dark mode, fully offline after first load.

## Tabs

- **Today** — calories left, protein/carbs/fat progress, Quick Add (Meal, Cardio, Weight-in, Photo), today's log, 7-day chart.
- **Meals** — 5 one-tap meal presets, today's totals, recently added.
- **Weight** — log weight in kg, trend chart, last 10 entries.
- **Photos** — camera upload, dated 2-column gallery.
- **Gym** — today's workout, mark complete, next 7 days.
- **Settings** — backup/restore all data as a JSON file.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

All data lives in the browser's `localStorage` — nothing is sent to a server.
