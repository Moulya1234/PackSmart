import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "packsmart-v1";
const CATEGORIES = [
  "Clothing",
  "Toiletries",
  "Documents",
  "Electronics",
  "Medicine & first aid",
  "Accessories",
  "Activity gear",
  "Essentials",
];

const DESTINATIONS = [
  { city: "Goa", country: "India", image: "photo-1512343879784-a960bf40e7f2", label: "Coastal calm" },
  { city: "Kyoto", country: "Japan", image: "photo-1493976040374-85c8e12f0c0e", label: "Culture & craft" },
  { city: "Lisbon", country: "Portugal", image: "photo-1555881400-74d7acaacd8b", label: "City break" },
  { city: "Bali", country: "Indonesia", image: "photo-1537996194471-e657df975ab4", label: "Island days" },
];

const ACTIVITY_OPTIONS = ["Swimming", "Hiking", "Sightseeing", "Formal meetings", "Camping", "Cycling"];
const PURPOSES = ["Vacation", "Business", "Adventure", "Beach holiday", "Family trip", "College / study", "Backpacking"];
const STYLES = ["Minimalist", "Standard", "Fully prepared"];
const LUGGAGE = ["Backpack", "Cabin bag", "Checked suitcase"];
const WEATHER = ["Warm", "Cold", "Rainy", "Mixed", "Unknown"];

const iconPaths = {
  compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  cloud: <><path d="M20 16.2A4.8 4.8 0 0 0 18 7h-1.3A7 7 0 1 0 5 17h13a3 3 0 0 0 2-0.8Z"/></>,
  bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m4 4v7m6-7v7"/></>,
  edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l0 5Z"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/></>,
  print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h.01"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L5.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1L9 7.4h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z"/></>,
  chevron: <><path d="m9 18 6-6-6-6"/></>,
  back: <><path d="M19 12H5m7 7-7-7 7-7"/></>,
  heart: <><path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8a4.5 4.5 0 0 1 8.8-1.4 4.5 4.5 0 0 1 8.8 1.4Z"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
};

function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name] || iconPaths.compass}</svg>;
}

function localDateOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayCount(start, end) {
  if (!start || !end) return 1;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

function prettyDate(date, options = { month: "short", day: "numeric" }) {
  if (!date) return "Choose dates";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en", options);
}

function tripImage(destination) {
  const match = DESTINATIONS.find((place) => `${place.city}, ${place.country}`.toLowerCase() === (destination || "").toLowerCase() || place.city.toLowerCase() === (destination || "").toLowerCase());
  return match?.image || "photo-1488646953014-85cb44e25828";
}

function setFallbackImage(event) {
  const image = event.currentTarget;
  if (image.dataset.fallback) return;
  image.dataset.fallback = "true";
  image.src = "/destination-fallback.svg";
}

function makeItem(name, category, quantity = 1, note = "") {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name, category, quantity, note, packed: false, custom: false };
}

function generatePackingList(trip, personalEssentials = []) {
  const days = dayCount(trip.departure, trip.returnDate);
  let styleFactor = trip.packingStyle === "Minimalist" ? 0.7 : trip.packingStyle === "Fully prepared" ? 1.2 : 1;
  if (trip.luggage === "Backpack") styleFactor *= 0.9;
  if (trip.luggage === "Checked suitcase") styleFactor *= 1.1;
  const q = (value) => Math.max(1, Math.ceil(value * styleFactor));
  const list = [];
  const add = (name, category, quantity = 1, note = "") => {
    if (!list.some((item) => item.name.toLowerCase() === name.toLowerCase())) list.push(makeItem(name, category, quantity, note));
  };

  add("Tops", "Clothing", q(Math.ceil(days * 0.8)), "Plan a few easy-to-layer outfits");
  add("Bottoms", "Clothing", q(Math.ceil(days / 2)));
  add("Underwear", "Clothing", q(days));
  add("Socks", "Clothing", q(Math.ceil(days * 0.8)));
  add("Sleepwear", "Clothing", 1);
  add("Comfortable walking shoes", "Clothing", 1);
  if (trip.purpose === "Backpacking") {
    add("Quick-dry travel clothes", "Clothing", q(2));
    add("Laundry detergent sheets", "Essentials", 1);
  }
  if (["Warm", "Mixed"].includes(trip.weather) || trip.purpose === "Beach holiday") add("Light layers", "Clothing", 1, "Evenings and air-conditioned spaces");
  if (trip.weather === "Cold") add("Warm jacket", "Clothing", 1);
  if (trip.weather === "Rainy" || trip.weather === "Mixed") add("Rain jacket or compact umbrella", "Clothing", 1);
  if (trip.activities?.includes("Swimming") || trip.purpose === "Beach holiday") add("Swimwear", "Activity gear", 2);
  if (trip.purpose === "Business" || trip.activities?.includes("Formal meetings")) {
    add("Smart outfit", "Clothing", 2, "For meetings or dinner");
    add("Belt or accessories for formalwear", "Accessories", 1);
  }
  if (trip.purpose === "College / study") {
    add("Student ID & enrollment details", "Documents", 1);
    add("Notebook & stationery", "Essentials", 1);
  }
  if (trip.luggage === "Backpack") add("Packable day bag", "Accessories", 1);
  if (trip.luggage === "Checked suitcase") add("Packing cubes", "Accessories", 1);

  add("Toothbrush & toothpaste", "Toiletries", 1);
  add("Skincare & daily toiletries", "Toiletries", 1);
  add("Sunscreen", "Toiletries", 1, "Especially for long days outside");
  add("Passport or photo ID", "Documents", 1);
  add("Tickets & booking details", "Documents", 1);
  add("Wallet & payment cards", "Documents", 1);
  add("Phone & charger", "Electronics", 1);
  add("Power bank", "Electronics", 1);
  add("Travel adapter", "Electronics", 1);
  add("Personal medication", "Medicine & first aid", 1);
  add("Basic first-aid kit", "Medicine & first aid", 1);
  add("Sunglasses", "Accessories", 1);
  add("Day bag", "Accessories", 1);
  add("Reusable water bottle", "Essentials", 1);
  add("Travel laundry bag", "Essentials", 1);

  if (trip.activities?.includes("Hiking")) {
    add("Hiking shoes", "Activity gear", 1);
    add("Quick-dry layers", "Activity gear", 1);
    add("Trail snacks", "Activity gear", 1);
  }
  if (trip.activities?.includes("Camping")) {
    add("Headlamp", "Activity gear", 1);
    add("Insect repellent", "Activity gear", 1);
    add("Compact towel", "Activity gear", 1);
  }
  if (trip.activities?.includes("Cycling")) add("Cycling gloves & gear", "Activity gear", 1);
  if (trip.activities?.includes("Sightseeing")) add("Comfortable day shoes", "Activity gear", 1);
  personalEssentials.forEach((name) => add(name, "Essentials", 1, "Personal essential"));
  if (trip.specialRequirements?.trim()) {
    trip.specialRequirements.split(/[,\n]/).map((value) => value.trim()).filter(Boolean).forEach((name) => add(name, "Essentials", 1, "Added from your trip notes"));
  }
  return list;
}

function makeDemoTrip() {
  const trip = {
    id: "demo-goa",
    destination: "Goa, India",
    departure: localDateOffset(12),
    returnDate: localDateOffset(16),
    purpose: "Beach holiday",
    weather: "Warm",
    activities: ["Swimming", "Sightseeing"],
    packingStyle: "Standard",
    luggage: "Cabin bag",
    specialRequirements: "",
    demo: true,
    createdAt: new Date().toISOString(),
  };
  trip.items = generatePackingList(trip).map((item, index) => ({ ...item, packed: index < 9 }));
  return trip;
}

function readStore() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) return JSON.parse(value);
  } catch (error) {
    console.warn("PackSmart storage was unavailable; starting with the demo trip.", error);
  }
  return {
    trips: [makeDemoTrip()],
    activeTripId: "demo-goa",
    settings: { theme: "light", packingStyle: "Standard", luggage: "Cabin bag", units: "Metric", essentials: ["Reusable tote bag"] },
  };
}

function App() {
  const [store, setStore] = useState(readStore);
  const [view, setView] = useState("home");
  const [wizardTripId, setWizardTripId] = useState(null);
  const [wizardDestination, setWizardDestination] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const activeTrip = store.trips.find((trip) => trip.id === store.activeTripId) || null;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (error) { console.warn("Could not save PackSmart data.", error); }
  }, [store]);

  useEffect(() => {
    document.documentElement.dataset.theme = store.settings.theme;
  }, [store.settings.theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(message, actionLabel, action) { setToast({ message, actionLabel, action }); }
  function updateSettings(next) { setStore((current) => ({ ...current, settings: { ...current.settings, ...next } })); }
  function openWizard(trip = null, destination = "") { setWizardTripId(trip?.id || null); setWizardDestination(destination); setView("wizard"); }

  function saveTrip(form, id) {
    const details = { ...form, id: id || `trip-${Date.now()}`, demo: false, createdAt: id ? (store.trips.find((trip) => trip.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString() };
    const generated = generatePackingList(details, store.settings.essentials);
    let items = generated;
    if (id) {
      const old = store.trips.find((trip) => trip.id === id);
      const oldByName = new Map((old?.items || []).map((item) => [`${item.category}|${item.name.toLowerCase()}`, item]));
      items = generated.map((item) => ({ ...item, packed: oldByName.get(`${item.category}|${item.name.toLowerCase()}`)?.packed || false }));
      const generatedKeys = new Set(items.map((item) => `${item.category}|${item.name.toLowerCase()}`));
      (old?.items || []).filter((item) => item.custom && !generatedKeys.has(`${item.category}|${item.name.toLowerCase()}`)).forEach((item) => items.push(item));
    }
    const trip = { ...details, items };
    setStore((current) => ({ ...current, trips: id ? current.trips.map((item) => item.id === id ? trip : item) : [trip, ...current.trips], activeTripId: trip.id }));
    setWizardTripId(null);
    setWizardDestination("");
    setView("dashboard");
    notify(id ? "Trip details updated and suggestions refreshed." : "Your packing plan is ready.");
  }

  function updateTrip(tripId, updater) {
    setStore((current) => ({ ...current, trips: current.trips.map((trip) => trip.id === tripId ? updater(trip) : trip) }));
  }

  function selectTrip(trip) {
    setStore((current) => ({ ...current, activeTripId: trip.id }));
    setView("dashboard");
  }

  function deleteTrip(tripId) {
    const target = store.trips.find((trip) => trip.id === tripId);
    setStore((current) => {
      const trips = current.trips.filter((trip) => trip.id !== tripId);
      return { ...current, trips, activeTripId: current.activeTripId === tripId ? (trips[0]?.id || null) : current.activeTripId };
    });
    setModal(null);
    if (store.trips.length <= 1) setView("home");
    notify(`${target?.destination || "Trip"} removed.`);
  }

  function resetDemo() {
    const fresh = { trips: [makeDemoTrip()], activeTripId: "demo-goa", settings: { theme: "light", packingStyle: "Standard", luggage: "Cabin bag", units: "Metric", essentials: [] } };
    setStore(fresh);
    setModal(null);
    setView("dashboard");
    notify("Demo data restored.");
  }

  let content;
  if (view === "home") content = <LandingPage onPlan={(destination) => openWizard(null, destination || "")} onDashboard={() => setView("dashboard")} hasTrips={store.trips.length > 0} />;
  else if (view === "wizard") content = <TripWizard key={wizardTripId || wizardDestination || "new"} initialTrip={store.trips.find((trip) => trip.id === wizardTripId)} initialDestination={wizardDestination} settings={store.settings} onCancel={() => setView(activeTrip ? "dashboard" : "home")} onSave={saveTrip} />;
  else if (view === "trips") content = <TripsPage trips={store.trips} activeTripId={store.activeTripId} onNew={() => openWizard()} onSelect={selectTrip} onEdit={(trip) => openWizard(trip)} onDelete={(trip) => setModal({ title: "Delete this trip?", message: `“${trip.destination}” and its packing progress will be removed from this device.`, confirmLabel: "Delete trip", danger: true, onConfirm: () => deleteTrip(trip.id) })} />;
  else if (view === "settings") content = <SettingsPage settings={store.settings} onChange={updateSettings} onReset={() => setModal({ title: "Restore demo data?", message: "This replaces your saved trips and preferences on this device with the sample Goa trip.", confirmLabel: "Restore demo", onConfirm: resetDemo })} />;
  else content = activeTrip ? <Dashboard trip={activeTrip} trips={store.trips} onUpdate={(updater) => updateTrip(activeTrip.id, updater)} onPlan={() => openWizard()} onEdit={() => openWizard(activeTrip)} onSwitch={selectTrip} onDelete={() => setModal({ title: "Delete this trip?", message: `“${activeTrip.destination}” and its packing progress will be removed from this device.`, confirmLabel: "Delete trip", danger: true, onConfirm: () => deleteTrip(activeTrip.id) })} onNotify={notify} /> : <EmptyTrips onCreate={() => openWizard()} />;

  return <div className="app-shell">
    <Navbar view={view} onNavigate={setView} onPlan={() => openWizard()} tripCount={store.trips.length} />
    <main>{content}</main>
    {view !== "home" && view !== "wizard" && <Footer onHome={() => setView("home")} />}
    {modal && <ConfirmDialog modal={modal} onClose={() => setModal(null)} />}
    {toast && <div className="toast-message" role="status"><span>{toast.message}</span>{toast.action && <button className="toast-action" onClick={() => { toast.action(); setToast(null); }}>{toast.actionLabel || "Undo"}</button>}<button className="toast-close" aria-label="Dismiss notification" onClick={() => setToast(null)}><Icon name="close" size={15} /></button></div>}
  </div>;
}

function Navbar({ view, onNavigate, onPlan, tripCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [{ id: "home", label: "Discover" }, { id: "dashboard", label: "My planner" }, { id: "trips", label: `Trips${tripCount ? ` · ${tripCount}` : ""}` }, { id: "settings", label: "Preferences" }];
  return <header className="site-header">
    <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); onNavigate("home"); }} aria-label="PackSmart home"><span className="brand-symbol"><Icon name="compass" size={20} /></span><span>pack<span>smart</span></span></a>
    <button className="mobile-menu-button icon-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? "close" : "menu"} size={20} /></button>
    <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
      {links.map((link) => <button key={link.id} className={`nav-link ${view === link.id ? "active" : ""}`} onClick={() => { onNavigate(link.id); setMenuOpen(false); }}>{link.label}</button>)}
    </nav>
    <button className="button button-dark nav-cta" onClick={() => { onPlan(); setMenuOpen(false); }}><Icon name="plus" size={16} /> Plan a trip</button>
  </header>;
}

function Footer({ onHome }) {
  return <footer className="site-footer"><button className="brand brand-small footer-brand" onClick={onHome} aria-label="Back to PackSmart home"><span className="brand-symbol"><Icon name="compass" size={17} /></span><span>pack<span>smart</span></span></button><span>Thoughtful packing. Better days away.</span><span>Made for the journey ahead.</span></footer>;
}

function LandingPage({ onPlan, onDashboard, hasTrips }) {
  return <div className="landing-page">
    <section className="landing-hero page-wrap">
      <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> YOUR TRIP, THOUGHTFULLY PACKED</span><h1>Pack light.<br /><em>Travel ready.</em></h1><p className="hero-lede">A packing plan that knows where you’re going, what you’ll do, and what makes a trip feel like yours.</p><div className="hero-actions"><button className="button button-teal button-large" onClick={() => onPlan()}>Plan my trip <Icon name="arrow" size={18} /></button><button className="button button-text" onClick={() => document.getElementById("destination-inspiration")?.scrollIntoView({ behavior: "smooth" })}>Explore destinations <Icon name="arrow" size={16} /></button></div><div className="hero-proof"><div className="avatar-stack"><span>R</span><span>A</span><span>M</span></div><p><strong>A little less last-minute.</strong><br />A lot more ready to go.</p></div></div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85" onError={setFallbackImage} alt="Sunlit tropical shoreline" /><div className="hero-image-wash" /><div className="hero-location"><span className="location-pin"><Icon name="pin" size={15} /></span><div><strong>Somewhere sunny</strong><small>Ready when you are</small></div></div><div className="hero-list-preview"><div className="preview-top"><span className="preview-kicker">YOUR NEXT ADVENTURE</span><span className="preview-weather"><Icon name="sun" size={15} /> 28°</span></div><strong>Goa, India</strong><span className="preview-date">4 days · Beach holiday</span><div className="preview-progress-row"><span>Essentials packed</span><b>8 of 12</b></div><div className="mini-progress"><i style={{ width: "67%" }} /></div><div className="preview-checks"><span><Icon name="check" size={13} /> Passport</span><span><Icon name="check" size={13} /> Sunscreen</span><span className="preview-open">View plan <Icon name="arrow" size={13} /></span></div></div></div>
    </section>
    <section className="trust-strip"><div className="page-wrap trust-inner"><span>MADE FOR THE WAY YOU TRAVEL</span><i /><span>Less overpacking</span><i /><span>Fewer forgotten essentials</span><i /><span>More room for the good stuff</span></div></section>
    <section className="landing-section page-wrap"><div className="section-heading"><div><span className="eyebrow">THE PACKSMART DIFFERENCE</span><h2>Good trips start <em>before</em> you go.</h2></div><p>From beach days to boardrooms, get a list that fits the trip you’re actually taking.</p></div><div className="feature-row"><Feature icon="compass" number="01" title="Made for this trip" text="Destination, dates, weather and plans shape every suggestion." /><Feature icon="check" number="02" title="Your list, your rules" text="Adjust quantities, add the personal must-haves, and check things off as you go." /><Feature icon="bag" number="03" title="Ready at a glance" text="See what’s packed, what’s left, and what deserves a last look." /></div></section>
    <section className="destination-section" id="destination-inspiration"><div className="page-wrap"><div className="section-heading"><div><span className="eyebrow">A LITTLE INSPIRATION</span><h2>Where to next?</h2></div><button className="button button-text" onClick={() => onPlan()}>Build your own plan <Icon name="arrow" size={16} /></button></div><div className="destination-grid">{DESTINATIONS.map((destination) => <button key={destination.city} className="destination-card" onClick={() => onPlan(`${destination.city}, ${destination.country}`)}><img src={`https://images.unsplash.com/${destination.image}?auto=format&fit=crop&w=720&q=82`} onError={setFallbackImage} alt={`${destination.city}, ${destination.country}`} loading="lazy" /><span className="destination-shade" /><span className="destination-label">{destination.label}</span><strong>{destination.city}</strong><small>{destination.country}</small><span className="destination-arrow"><Icon name="arrow" size={17} /></span></button>)}</div></div></section>
    <section className="how-section page-wrap"><div className="how-title"><span className="eyebrow">THREE STEPS TO READY</span><h2>Less list-making.<br /><em>More looking forward.</em></h2><button className="button button-dark" onClick={onPlan}>Start planning <Icon name="arrow" size={16} /></button></div><div className="steps-list"><div className="step-row"><span>01</span><div><strong>Tell us about the trip</strong><p>Where, when, and what you’re excited to do.</p></div></div><div className="step-row"><span>02</span><div><strong>Get your personal packing plan</strong><p>Useful suggestions, tailored to your days away.</p></div></div><div className="step-row"><span>03</span><div><strong>Pack at your own pace</strong><p>Check off essentials and leave with confidence.</p></div></div></div></section>
    <section className="final-cta page-wrap"><div className="final-cta-photo" /><div><span className="eyebrow">YOUR NEXT CHAPTER IS OUT THERE</span><h2>Go well prepared.<br /><em>Come back with stories.</em></h2></div><button className="button button-ivory button-large" onClick={hasTrips ? onDashboard : onPlan}>{hasTrips ? "Open my planner" : "Plan your first trip"}<Icon name="arrow" size={18} /></button></section>
  </div>;
}

function Feature({ icon, number, title, text }) {
  return <article className="feature-item"><div className="feature-icon"><Icon name={icon} size={21} /></div><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p></article>;
}

function TripWizard({ initialTrip, initialDestination, settings, onCancel, onSave }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState("");
  const [form, setForm] = useState(() => initialTrip ? { ...initialTrip, activities: [...(initialTrip.activities || [])] } : {
    destination: initialDestination || "", departure: localDateOffset(14), returnDate: localDateOffset(18), purpose: "Vacation", weather: "Unknown", temperature: "", activities: [],
    packingStyle: settings.packingStyle || "Standard", luggage: settings.luggage || "Cabin bag", temperatureUnit: settings.units === "Imperial" ? "°F" : "°C", specialRequirements: "",
  });
  const steps = ["Destination", "Dates", "Purpose", "Conditions", "Preferences", "Review"];
  const duration = dayCount(form.departure, form.returnDate);
  function change(key, value) { setForm((current) => ({ ...current, [key]: value })); setErrors(""); }
  function toggleActivity(activity) { change("activities", form.activities.includes(activity) ? form.activities.filter((item) => item !== activity) : [...form.activities, activity]); }
  function validate() {
    if (step === 0 && !form.destination.trim()) return "Add a destination to continue.";
    if (step === 1) {
      if (!form.departure || !form.returnDate) return "Choose both travel dates.";
      if (form.returnDate < form.departure) return "Your return date needs to be after your departure.";
    }
    return "";
  }
  function next() { const error = validate(); if (error) { setErrors(error); return; } setStep((current) => Math.min(5, current + 1)); if (process.env.NODE_ENV !== "test") window.scrollTo({ top: 0, behavior: "smooth" }); }
  function chooseDestination(place) { change("destination", `${place.city}, ${place.country}`); }

  return <div className="wizard-page page-wrap"><button className="back-link" onClick={onCancel}><Icon name="back" size={16} /> Back to planner</button><div className="wizard-heading"><span className="eyebrow">A BETTER WAY TO GET READY</span><h1>{initialTrip ? "Refine your trip." : "Let’s plan your trip."}</h1><p>A few thoughtful details are all we need to make your list yours.</p></div>
    <div className="wizard-progress" aria-label={`Step ${step + 1} of ${steps.length}`}><div className="wizard-progress-track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><div className="wizard-step-labels">{steps.map((label, index) => <span key={label} className={index <= step ? "current" : ""}><i>{index < step ? <Icon name="check" size={12} /> : index + 1}</i>{label}</span>)}</div></div>
    <section className="wizard-card">
      {step === 0 && <div className="wizard-content"><span className="step-overline">STEP 01 · WHERE ARE YOU HEADED?</span><h2>Every good trip has a place.</h2><p>We’ll use your destination to make the recommendations feel more relevant.</p><label className="field-label" htmlFor="destination">Destination</label><div className="input-with-icon"><Icon name="pin" size={18} /><input id="destination" autoFocus value={form.destination} onChange={(event) => change("destination", event.target.value)} placeholder="Try Goa, India" /></div><div className="suggestion-row"><span>POPULAR PICKS</span>{DESTINATIONS.map((place) => <button key={place.city} className="suggestion-chip" onClick={() => chooseDestination(place)}>{place.city}</button>)}</div></div>}
      {step === 1 && <div className="wizard-content"><span className="step-overline">STEP 02 · WHEN ARE YOU GOING?</span><h2>Make space for the days away.</h2><p>Your dates help us suggest useful quantities without overpacking.</p><div className="field-grid"><div><label className="field-label" htmlFor="departure">Departure</label><div className="input-with-icon"><Icon name="calendar" size={18} /><input id="departure" type="date" min={initialTrip ? undefined : localDateOffset(0)} value={form.departure} onChange={(event) => change("departure", event.target.value)} /></div></div><div><label className="field-label" htmlFor="returnDate">Return</label><div className="input-with-icon"><Icon name="calendar" size={18} /><input id="returnDate" type="date" min={form.departure} value={form.returnDate} onChange={(event) => change("returnDate", event.target.value)} /></div></div></div><div className="duration-note"><Icon name="calendar" size={18} /><span>Your trip is <strong>{duration} {duration === 1 ? "day" : "days"}</strong> long.</span></div></div>}
      {step === 2 && <div className="wizard-content"><span className="step-overline">STEP 03 · WHAT KIND OF TRIP?</span><h2>Pick the pace you have in mind.</h2><p>We’ll tailor a few details to what this trip is for.</p><ChoiceGrid options={PURPOSES} value={form.purpose} onChange={(value) => change("purpose", value)} /></div>}
      {step === 3 && <div className="wizard-content"><span className="step-overline">STEP 04 · WEATHER & ACTIVITIES</span><h2>What’s on the itinerary?</h2><p>Choose your expected conditions and anything you’re planning to do. You can change these later.</p><label className="field-label">Expected conditions <span className="quiet-label">MANUAL ESTIMATE</span></label><ChoiceGrid options={WEATHER} value={form.weather} onChange={(value) => change("weather", value)} compact /><div className="temperature-field"><label className="field-label" htmlFor="temperature">Expected temperature <span className="quiet-label">OPTIONAL · {form.temperatureUnit || "°C"}</span></label><input className="plain-input" id="temperature" type="number" min={form.temperatureUnit === "°F" ? "-22" : "-30"} max={form.temperatureUnit === "°F" ? "131" : "55"} value={form.temperature || ""} onChange={(event) => change("temperature", event.target.value)} placeholder={form.temperatureUnit === "°F" ? "e.g. 82" : "e.g. 28"} /></div><label className="field-label activities-label">Activities</label><div className="chip-grid">{ACTIVITY_OPTIONS.map((activity) => <button key={activity} className={`select-chip ${form.activities.includes(activity) ? "selected" : ""}`} aria-pressed={form.activities.includes(activity)} onClick={() => toggleActivity(activity)}>{form.activities.includes(activity) && <Icon name="check" size={14} />}{activity}</button>)}</div><p className="field-hint"><Icon name="sun" size={15} /> No live forecast needed. Your choices work offline.</p></div>}
      {step === 4 && <div className="wizard-content"><span className="step-overline">STEP 05 · YOUR PACKING STYLE</span><h2>Pack the way you travel.</h2><p>We’ll adjust the suggested quantities and extras to suit you.</p><label className="field-label">Packing style</label><ChoiceGrid options={STYLES} value={form.packingStyle} onChange={(value) => change("packingStyle", value)} /><label className="field-label">Luggage</label><ChoiceGrid options={LUGGAGE} value={form.luggage} onChange={(value) => change("luggage", value)} compact /><label className="field-label" htmlFor="special">Anything else to remember?</label><textarea id="special" className="textarea" rows="3" value={form.specialRequirements} onChange={(event) => change("specialRequirements", event.target.value)} placeholder="Separate items with commas, e.g. camera, knitting, contact lenses" /><p className="field-hint">Your personal essentials from Preferences are added automatically.</p></div>}
      {step === 5 && <div className="wizard-content review-content"><span className="step-overline">STEP 06 · A QUICK LOOK</span><h2>Does this feel like your trip?</h2><p>Review your details before we put your packing plan together.</p><div className="review-trip"><img src={`https://images.unsplash.com/${tripImage(form.destination)}?auto=format&fit=crop&w=720&q=80`} onError={setFallbackImage} alt="Trip destination preview" /><div><span className="review-purpose">{form.purpose}</span><h3>{form.destination}</h3><p><Icon name="calendar" size={15} /> {prettyDate(form.departure, { month: "long", day: "numeric" })} — {prettyDate(form.returnDate, { month: "long", day: "numeric" })} <span>· {duration} days</span></p></div><button className="text-action" onClick={() => setStep(0)}>Edit details</button></div><div className="review-details"><div><span>CONDITIONS</span><strong><Icon name={form.weather === "Warm" ? "sun" : "cloud"} size={15} /> {form.weather}{form.temperature ? ` · ${form.temperature}${form.temperatureUnit || "°C"}` : ""} · manual</strong></div><div><span>ACTIVITIES</span><strong>{form.activities.length ? form.activities.join(", ") : "Easy-going days"}</strong></div><div><span>PACKING STYLE</span><strong>{form.packingStyle} · {form.luggage}</strong></div></div><div className="review-note"><Icon name="check" size={17} /><span>Your checklist will include practical suggestions you can edit or remove anytime.</span></div></div>}
      {errors && <p className="form-error" role="alert">{errors}</p>}
      <div className="wizard-actions">{step > 0 ? <button className="button button-outline" onClick={() => { setStep((current) => current - 1); setErrors(""); }}><Icon name="back" size={16} /> Back</button> : <button className="button button-outline" onClick={onCancel}>Cancel</button>}{step < 5 ? <button className="button button-dark" onClick={next}>Continue <Icon name="arrow" size={16} /></button> : <button className="button button-teal" onClick={() => onSave(form, initialTrip?.id)}>{initialTrip ? "Save trip updates" : "Generate my packing list"} <Icon name="arrow" size={16} /></button>}</div>
    </section><p className="wizard-privacy">Your trips stay in this browser on this device.</p>
  </div>;
}

function ChoiceGrid({ options, value, onChange, compact = false }) {
  return <div className={`choice-grid ${compact ? "compact" : ""}`}>{options.map((option) => <button key={option} className={`choice-card ${value === option ? "selected" : ""}`} aria-pressed={value === option} onClick={() => onChange(option)}><span className="choice-radio">{value === option && <i />}</span><span>{option}</span></button>)}</div>;
}

function Dashboard({ trip, trips, onUpdate, onPlan, onEdit, onSwitch, onDelete, onNotify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All items");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sort, setSort] = useState("category");
  const [itemDialog, setItemDialog] = useState(null);
  const [mobileTripMenu, setMobileTripMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const searchInputRef = useRef(null);
  const packed = trip.items.filter((item) => item.packed).length;
  const total = trip.items.length;
  const percent = total ? Math.round((packed / total) * 100) : 0;
  const remaining = total - packed;
  const departureDate = new Date(`${trip.departure}T12:00:00`);
  const daysUntil = Math.max(0, Math.ceil((departureDate - new Date()) / 86400000));
  useEffect(() => { if (percent < 100) setCelebrationDismissed(false); }, [percent]);
  useEffect(() => {
    function focusSearch(event) {
      const tag = event.target?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT" && !event.target?.isContentEditable && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault(); searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const filteredItems = useMemo(() => trip.items.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.note || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filter === "All items" || (filter === "Packed" ? item.packed : !item.packed);
    const matchesCategory = categoryFilter === "All categories" || item.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "status" ? Number(a.packed) - Number(b.packed) : CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)), [trip.items, query, filter, categoryFilter, sort]);

  const grouped = CATEGORIES.map((category) => ({ category, items: filteredItems.filter((item) => item.category === category) })).filter((group) => group.items.length > 0);
  function updateItem(itemId, changes) { onUpdate((current) => ({ ...current, items: current.items.map((item) => item.id === itemId ? { ...item, ...changes } : item) })); }
  function addOrEditItem(item) {
    if (itemDialog?.item) updateItem(itemDialog.item.id, { ...item, id: itemDialog.item.id });
    else if (trip.items.some((existing) => existing.name.toLowerCase() === item.name.toLowerCase())) {
      onNotify("That item is already on this list.");
      return;
    } else onUpdate((current) => ({ ...current, items: [...current.items, { ...item, id: `custom-${Date.now()}`, packed: false, custom: true }] }));
    setItemDialog(null);
    onNotify(itemDialog?.item ? "Item updated." : "Item added to your list.");
  }
  function removeItem(item) {
    onUpdate((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }));
    onNotify(`${item.name} removed.`, "Undo", () => onUpdate((current) => ({ ...current, items: [...current.items, item] })));
  }
  function markCategory(category, value) {
    onUpdate((current) => ({ ...current, items: current.items.map((item) => item.category === category ? { ...item, packed: value } : item) }));
    onNotify(`${category} marked ${value ? "packed" : "unpacked"}.`);
  }
  function exportCsv() {
    const rows = [["Item", "Quantity", "Category", "Packed", "Note"], ...trip.items.map((item) => [item.name, item.quantity, item.category, item.packed ? "Yes" : "No", item.note || ""])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `packsmart-${trip.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`; anchor.click(); URL.revokeObjectURL(url);
    onNotify("Packing list downloaded as CSV.");
  }

  return <div className="dashboard-page page-wrap">
    <div className="dashboard-topline"><div><span className="eyebrow">YOUR TRAVEL DESK</span><h1>Good planning, <em>great travelling.</em></h1></div><div className="trip-switch-wrap"><button className="trip-switch" onClick={() => setMobileTripMenu((open) => !open)}><span className="switch-thumb"><Icon name="pin" size={14} /></span><span><small>ACTIVE TRIP</small><strong>{trip.destination}</strong></span><Icon name="chevron" size={15} /></button>{mobileTripMenu && <div className="trip-switch-menu">{trips.map((entry) => <button key={entry.id} onClick={() => { onSwitch(entry); setMobileTripMenu(false); }} className={entry.id === trip.id ? "selected" : ""}>{entry.destination}<small>{prettyDate(entry.departure)}</small></button>)}<button className="menu-new-trip" onClick={onPlan}><Icon name="plus" size={15} /> Add another trip</button></div>}</div></div>
    <section className="trip-hero"><div className="trip-hero-photo" style={{ backgroundImage: `url(https://images.unsplash.com/${tripImage(trip.destination)}?auto=format&fit=crop&w=1500&q=85)` }} /><div className="trip-hero-overlay" /><div className="trip-hero-content"><span className="trip-hero-pill"><Icon name={trip.weather === "Warm" ? "sun" : "cloud"} size={14} /> {trip.weather}{trip.temperature ? ` · ${trip.temperature}${trip.temperatureUnit || "°C"}` : ""} · {trip.purpose}</span><h2>{trip.destination}</h2><p><Icon name="calendar" size={15} /> {prettyDate(trip.departure, { month: "long", day: "numeric" })} – {prettyDate(trip.returnDate, { month: "long", day: "numeric" })} <i /> {dayCount(trip.departure, trip.returnDate)} days</p></div><div className="trip-hero-countdown"><span>{daysUntil === 0 ? "TODAY’S THE DAY" : "COUNTDOWN"}</span><strong>{daysUntil === 0 ? "Go" : String(daysUntil).padStart(2, "0")}</strong><small>{daysUntil === 1 ? "day to go" : daysUntil === 0 ? "have a lovely trip" : "days to go"}</small></div><button className="trip-edit-button" aria-label="Edit trip" onClick={onEdit}><Icon name="edit" size={16} /> <span>Edit trip</span></button></section>
    {trip.demo && <div className="demo-note"><span>DEMO TRIP</span><p>Go ahead—check things off, add your own items, or plan a trip of your own.</p><button onClick={onPlan}>Create your trip <Icon name="arrow" size={14} /></button></div>}
    <div className="dashboard-section-head"><div><span className="eyebrow">THE PACKING PLAN</span><h2>Everything, <em>in its place.</em></h2></div><div className="dashboard-actions"><button className="button button-outline button-small" onClick={exportCsv}><Icon name="download" size={15} /> Export list</button><button className="button button-outline button-small print-action" onClick={() => window.print()}><Icon name="print" size={15} /> Print</button><button className="button button-dark button-small" onClick={() => setItemDialog({ item: null })}><Icon name="plus" size={15} /> Add item</button></div></div>
    <div className="dashboard-grid">
      <section className="checklist-panel"><div className="checklist-toolbar"><div className="search-box"><Icon name="search" size={17} /><input ref={searchInputRef} aria-label="Search packing items" placeholder="Search your list" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>/</kbd></div><div className="toolbar-selects"><label><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All items</option><option>Packed</option><option>Remaining</option></select></label><label><span className="sr-only">Sort items</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="category">By category</option><option value="name">By name</option><option value="status">By status</option></select></label></div></div>
        <div className="category-filter-row"><button className={categoryFilter === "All categories" ? "active" : ""} onClick={() => setCategoryFilter("All categories")}>All categories</button>{CATEGORIES.filter((category) => trip.items.some((item) => item.category === category)).map((category) => <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(categoryFilter === category ? "All categories" : category)}>{category}</button>)}</div>
        {grouped.length ? <div className="checklist-groups">{grouped.map((group) => {
          const categoryItems = trip.items.filter((item) => item.category === group.category);
          const categoryPacked = categoryItems.filter((item) => item.packed).length;
          const allPacked = categoryItems.length > 0 && categoryPacked === categoryItems.length;
          return <section className="checklist-category" key={group.category}><div className="category-heading"><div><h3>{group.category}</h3><span>{categoryPacked} of {categoryItems.length} packed</span></div><button className="category-bulk" onClick={() => markCategory(group.category, !allPacked)}>{allPacked ? "Unpack all" : "Pack all"}</button></div><div className="category-items">{group.items.map((item) => <PackingItem key={item.id} item={item} onToggle={() => updateItem(item.id, { packed: !item.packed })} onEdit={() => setItemDialog({ item })} onRemove={() => removeItem(item)} />)}</div></section>;
        })}</div> : <div className="filtered-empty"><span className="empty-search-icon"><Icon name="search" size={21} /></span><h3>No items found</h3><p>Try another search or change your filters.</p><button className="button button-outline button-small" onClick={() => { setQuery(""); setFilter("All items"); setCategoryFilter("All categories"); }}>Clear filters</button></div>}
        <div className="checklist-bottom"><span>{remaining === 0 ? "Every item is packed. Enjoy the anticipation." : `${remaining} ${remaining === 1 ? "item" : "items"} still to pack`}</span><button className="text-action subtle" onClick={() => setConfirmReset(true)}>Reset checklist</button></div>
      </section>
      <aside className="dashboard-aside"><section className={`progress-card ${percent === 100 ? "complete" : ""}`}><div className="aside-card-top"><span className="eyebrow">PACKING PROGRESS</span><button className="icon-button" aria-label="Edit packing preferences" onClick={onEdit}><Icon name="edit" size={16} /></button></div><div className="progress-ring-wrap"><ProgressRing percent={percent} /><div className="progress-ring-copy"><strong>{percent}<small>%</small></strong><span>{percent === 100 ? "all ready" : "packed"}</span></div></div><h3>{percent === 100 ? "All set to go." : "You’re getting there."}</h3><p>{percent === 100 ? "The hard part is done. Make room for the memories." : `${packed} of ${total} items packed, ${remaining} to go.`}</p><div className="progress-card-foot"><span><Icon name="bag" size={15} /> {trip.luggage}</span><span>{dayCount(trip.departure, trip.returnDate)} days away</span></div></section>
        <section className="packing-tip"><span className="tip-kicker"><Icon name="sun" size={14} /> A THOUGHTFUL REMINDER</span><p>{trip.weather === "Rainy" ? "Keep a light rain layer near the top of your bag for an easy reach." : trip.purpose === "Business" ? "Keep your meeting essentials together so they’re easy to find on arrival." : trip.activities?.includes("Swimming") || trip.purpose === "Beach holiday" ? "Put swimwear and sun protection where you can reach them on day one." : "Keep your travel documents and daily essentials in your personal item."}</p></section>
        <section className="trip-details-card"><div className="detail-title"><h3>Trip details</h3><button className="text-action" onClick={onEdit}>Edit</button></div><DetailRow icon="calendar" label="Dates" value={`${prettyDate(trip.departure)} – ${prettyDate(trip.returnDate)}`} /><DetailRow icon="cloud" label="Conditions" value={`${trip.weather}${trip.temperature ? ` · ${trip.temperature}${trip.temperatureUnit || "°C"}` : ""} · manual`} /><DetailRow icon="compass" label="Activities" value={trip.activities?.length ? trip.activities.join(", ") : "No activities added"} /><DetailRow icon="bag" label="Packing style" value={`${trip.packingStyle} · ${trip.luggage}`} /></section>
        <button className="delete-trip-link" onClick={onDelete}><Icon name="trash" size={14} /> Remove this trip</button>
      </aside>
    </div>
    {percent === 100 && !celebrationDismissed && <div className="complete-banner" role="status"><div className="complete-seal"><Icon name="check" size={19} /></div><div><strong>All packed. Let the countdown begin.</strong><p>Everything on this list is checked off. Have a wonderful trip.</p></div><button aria-label="Dismiss celebration" className="icon-button" onClick={() => setCelebrationDismissed(true)}><Icon name="close" size={16} /></button></div>}
    {itemDialog && <ItemDialog item={itemDialog.item} onSave={addOrEditItem} onClose={() => setItemDialog(null)} />}
    {confirmReset && <ConfirmDialog modal={{ title: "Reset this packing list?", message: "All items will be marked as unpacked. Your custom items will stay on the list.", confirmLabel: "Reset checklist", onConfirm: () => { onUpdate((current) => ({ ...current, items: current.items.map((item) => ({ ...item, packed: false })) })); setConfirmReset(false); onNotify("Checklist reset. Start fresh whenever you’re ready."); } }} onClose={() => setConfirmReset(false)} />}
  </div>;
}

function ProgressRing({ percent }) {
  const radius = 57; const circumference = 2 * Math.PI * radius; const offset = circumference * (1 - percent / 100);
  return <svg className="progress-ring" viewBox="0 0 140 140" role="img" aria-label={`${percent}% of packing items packed`}><circle className="ring-track" cx="70" cy="70" r={radius} /><circle className="ring-value" cx="70" cy="70" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} /></svg>;
}

function PackingItem({ item, onToggle, onEdit, onRemove }) {
  return <div className={`packing-item ${item.packed ? "is-packed" : ""}`}><label className="packing-item-main"><input type="checkbox" checked={item.packed} onChange={onToggle} /><span className="custom-checkbox"><Icon name="check" size={13} /></span><span className="packing-item-copy"><strong>{item.name}</strong>{item.note && <small>{item.note}</small>}</span></label><span className="item-quantity">× {item.quantity}</span><div className="item-actions"><button className="icon-button" aria-label={`Edit ${item.name}`} onClick={onEdit}><Icon name="edit" size={15} /></button><button className="icon-button danger-hover" aria-label={`Remove ${item.name}`} onClick={onRemove}><Icon name="trash" size={15} /></button></div></div>;
}

function DetailRow({ icon, label, value }) {
  return <div className="detail-row"><span className="detail-icon"><Icon name={icon} size={15} /></span><span className="detail-label">{label}</span><strong>{value}</strong></div>;
}

function TripsPage({ trips, activeTripId, onNew, onSelect, onEdit, onDelete }) {
  return <div className="page-wrap trips-page"><div className="page-title-row"><div><span className="eyebrow">ALL THE PLACES YOU’RE GOING</span><h1>My <em>trips.</em></h1><p>Your plans, packing progress, and all the little details in one place.</p></div><button className="button button-dark" onClick={onNew}><Icon name="plus" size={16} /> Plan another trip</button></div>{trips.length ? <div className="trips-grid">{trips.map((trip) => { const total = trip.items.length; const packed = trip.items.filter((item) => item.packed).length; const percent = total ? Math.round(packed / total * 100) : 0; return <article className="saved-trip-card" key={trip.id}><button className="saved-trip-image" onClick={() => onSelect(trip)} aria-label={`Open ${trip.destination}`} style={{ backgroundImage: `url(https://images.unsplash.com/${tripImage(trip.destination)}?auto=format&fit=crop&w=900&q=82)` }}><span>{trip.id === activeTripId ? "ACTIVE PLAN" : trip.demo ? "SAMPLE TRIP" : "SAVED TRIP"}</span><span className="saved-trip-open"><Icon name="arrow" size={16} /></span></button><div className="saved-trip-body"><div className="saved-trip-date"><Icon name="calendar" size={14} /> {prettyDate(trip.departure, { month: "long", day: "numeric" })} – {prettyDate(trip.returnDate, { month: "long", day: "numeric" })}</div><h2>{trip.destination}</h2><p>{trip.purpose} · {dayCount(trip.departure, trip.returnDate)} days</p><div className="saved-trip-progress"><div><span>{packed} of {total} packed</span><strong>{percent}%</strong></div><div className="mini-progress"><i style={{ width: `${percent}%` }} /></div></div><div className="saved-trip-actions"><button className="button button-outline button-small" onClick={() => onEdit(trip)}><Icon name="edit" size={14} /> Edit trip</button><button className="icon-button danger-hover" aria-label={`Delete ${trip.destination}`} onClick={() => onDelete(trip)}><Icon name="trash" size={16} /></button></div></div></article>; })}</div> : <EmptyTrips onCreate={onNew} />}</div>;
}

function EmptyTrips({ onCreate }) {
  return <div className="empty-trips page-wrap"><span className="empty-compass"><Icon name="compass" size={27} /></span><span className="eyebrow">A BLANK MAP, FULL OF POSSIBILITIES</span><h1>Your next trip starts <em>here.</em></h1><p>Tell us where you’re going. We’ll help with the list, so you can focus on looking forward to it.</p><button className="button button-teal button-large" onClick={onCreate}>Plan my first trip <Icon name="arrow" size={17} /></button></div>;
}

function SettingsPage({ settings, onChange, onReset }) {
  const [essentialsText, setEssentialsText] = useState(settings.essentials.join("\n"));
  const [saved, setSaved] = useState(false);
  function saveEssentials() { onChange({ essentials: essentialsText.split(/[,\n]/).map((item) => item.trim()).filter(Boolean) }); setSaved(true); window.setTimeout(() => setSaved(false), 2400); }
  return <div className="page-wrap settings-page"><div className="page-title-row"><div><span className="eyebrow">MAKE IT FEEL LIKE YOURS</span><h1>Your <em>preferences.</em></h1><p>Small defaults that make every packing plan a little more personal.</p></div></div><div className="settings-layout"><div className="settings-main"><section className="settings-card"><div className="settings-card-heading"><div className="settings-icon"><Icon name="bag" size={19} /></div><div><h2>Starting defaults</h2><p>Used when you create a new trip. You can still change them each time.</p></div></div><label className="settings-field"><span>Usual packing style</span><select value={settings.packingStyle} onChange={(event) => onChange({ packingStyle: event.target.value })}>{STYLES.map((style) => <option key={style}>{style}</option>)}</select></label><label className="settings-field"><span>Default luggage</span><select value={settings.luggage} onChange={(event) => onChange({ luggage: event.target.value })}>{LUGGAGE.map((bag) => <option key={bag}>{bag}</option>)}</select></label><label className="settings-field"><span>Preferred units</span><select value={settings.units} onChange={(event) => onChange({ units: event.target.value })}><option>Metric</option><option>Imperial</option></select></label></section><section className="settings-card"><div className="settings-card-heading"><div className="settings-icon sage"><Icon name="heart" size={19} /></div><div><h2>Personal essentials</h2><p>These are added to every new packing list. One item per line or separate with commas.</p></div></div><label className="sr-only" htmlFor="essentials">Personal essentials</label><textarea id="essentials" rows="5" className="textarea" value={essentialsText} onChange={(event) => setEssentialsText(event.target.value)} placeholder={'Contact lenses\nA book for the flight\nReusable tote'} /><div className="settings-save-row"><span>{saved ? "Preferences saved." : "Stored only in this browser."}</span><button className="button button-dark button-small" onClick={saveEssentials}>{saved ? <Icon name="check" size={15} /> : <Icon name="check" size={15} />} Save essentials</button></div></section></div><aside className="settings-side"><section className="settings-card theme-card"><span className="eyebrow">THE LOOK</span><div className="theme-preview"><div className={`theme-swatch ${settings.theme === "light" ? "chosen" : ""}`}><span className="swatch-light" /><span>Light</span></div><div className={`theme-swatch dark ${settings.theme === "dark" ? "chosen" : ""}`}><span className="swatch-dark" /><span>Dark</span></div></div><div className="settings-field theme-select"><span>Color theme</span><select value={settings.theme} onChange={(event) => onChange({ theme: event.target.value })}><option value="light">Light, warm ivory</option><option value="dark">Dark, midnight</option></select></div><p className="field-hint">Your choice is remembered on this device.</p></section><section className="settings-card data-card"><span className="eyebrow">YOUR DATA</span><h2>Start with a clean slate.</h2><p>Restore the sample Goa trip and default preferences. This replaces saved data on this device.</p><button className="button button-outline button-small" onClick={onReset}><Icon name="back" size={15} /> Restore demo data</button></section></aside></div></div>;
}

function ItemDialog({ item, onSave, onClose }) {
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [category, setCategory] = useState(item?.category || "Essentials");
  const [note, setNote] = useState(item?.note || "");
  const [error, setError] = useState("");
  useEffect(() => { function closeOnEscape(event) { if (event.key === "Escape") onClose(); } window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  function submit(event) { event.preventDefault(); if (!name.trim()) { setError("Give your item a name first."); return; } onSave({ name: name.trim(), quantity: Math.max(1, Number(quantity) || 1), category, note: note.trim() }); }
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="item-dialog-title"><div className="dialog-head"><div><span className="eyebrow">YOUR CHECKLIST</span><h2 id="item-dialog-title">{item ? "Edit item" : "Add an item"}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></button></div><form onSubmit={submit}><label className="field-label" htmlFor="itemName">Item name</label><input className="plain-input" id="itemName" autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Camera" /><div className="field-grid dialog-field-grid"><div><label className="field-label" htmlFor="itemQuantity">Quantity</label><input className="plain-input" id="itemQuantity" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div><label className="field-label" htmlFor="itemCategory">Category</label><select className="plain-input" id="itemCategory" value={category} onChange={(event) => setCategory(event.target.value)}>{CATEGORIES.map((entry) => <option key={entry}>{entry}</option>)}</select></div></div><label className="field-label" htmlFor="itemNote">Note <span className="quiet-label">OPTIONAL</span></label><input className="plain-input" id="itemNote" value={note} onChange={(event) => setNote(event.target.value)} placeholder="A helpful reminder" />{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit">{item ? "Save changes" : "Add to list"} <Icon name="arrow" size={15} /></button></div></form></section></div>;
}

function ConfirmDialog({ modal, onClose }) {
  useEffect(() => { function closeOnEscape(event) { if (event.key === "Escape") onClose(); } window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="dialog-card confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><div className="dialog-head"><div><span className="eyebrow">A QUICK CHECK</span><h2 id="confirm-title">{modal.title}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></button></div><p>{modal.message}</p><div className="dialog-actions"><button className="button button-outline" onClick={onClose}>Keep it</button><button className={`button ${modal.danger ? "button-danger" : "button-dark"}`} onClick={modal.onConfirm}>{modal.confirmLabel || "Confirm"}</button></div></section></div>;
}

export default App;
