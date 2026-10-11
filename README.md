# PackSmart — Pack light. Travel ready.

PackSmart is a travel packing planner built on the existing Create React App and React 18 stack. It adapts a checklist to a trip’s destination, dates, purpose, manually chosen weather, activities, packing style, luggage, and personal essentials. It runs entirely in the browser; trips and checklist progress persist in local storage.

## Run the application

From the project root:

```cmd
npm install
npm start
```

Open http://localhost:3000. `npm run build` creates a production build. Run the interaction tests with `npm test -- --watchAll=false --runInBand`.

## Included experiences

- Editorial landing page with destination inspiration, product preview, features, and clear plan-trip actions.
- Six-step trip wizard for destination, dates/duration, travel purpose, weather/temperature and activities, packing preferences, and review.
- Smart checklist recommendations across eight categories, with quantities based on trip length, weather, purpose, activities, packing style, and luggage type.
- Dashboard with live countdown and checklist progress, category progress, contextual tip, trip details, search, filters, sorting, add/edit/delete, undo, bulk pack/unpack, and reset confirmation.
- Multiple trips with switching, edits that refresh suggestions while preserving packed/custom entries, saved progress, and confirmed deletion.
- Personal essentials, light/dark theme, default luggage/style, units, CSV export, print styles, responsive navigation, keyboard search shortcut (`/`), and reduced-motion support.

## Weather, storage, and imagery

Weather and expected temperature are manually selected and labelled as such. There is no live API requirement or secret to configure; recommendations continue to work offline. The app stores data on the current device in browser local storage; there is no account or backend sync. Destination photos load from Unsplash, with a bundled local SVG fallback for image elements.

A realistic Goa sample trip is supplied on first launch so the dashboard is immediately useful. It is editable and can be removed. Use Preferences → Restore demo data to reset the local demo.
