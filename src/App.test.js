import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

function click(name, options) {
  fireEvent.click(screen.getByRole("button", options || { name }));
}

function createAdventureTrip() {
  click(/plan my trip/i);
  fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Reykjavik, Iceland" } });
  click("Continue");
  click("Continue");
  click("Adventure");
  click("Continue");
  click("Cold");
  click("Hiking");
  click("Continue");
  click("Minimalist");
  click("Backpack");
  click("Continue");
  click(/generate my packing list/i);
}

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); localStorage.clear(); });

test("creates a trip from wizard choices and generates relevant packing suggestions", () => {
  render(<App />);
  createAdventureTrip();
  expect(screen.getByRole("heading", { name: "Reykjavik, Iceland" })).toBeInTheDocument();
  expect(screen.getByText("Hiking shoes")).toBeInTheDocument();
  expect(screen.getByText("Warm jacket")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /of packing items packed/i })).toBeInTheDocument();
});

test("adds a custom item, updates progress when checked, and restores saved data after refresh", () => {
  const view = render(<App />);
  createAdventureTrip();
  click(/add item/i);
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Item name"), { target: { value: "Camera battery" } });
  click(/add to list/i);
  const checkbox = screen.getByRole("checkbox", { name: /camera battery/i });
  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();

  view.unmount();
  render(<App />);
  click("My planner", { name: "My planner" });
  expect(screen.getByRole("checkbox", { name: /camera battery/i })).toBeChecked();
  expect(screen.getByRole("heading", { name: "Reykjavik, Iceland" })).toBeInTheDocument();
});

test("prevents advancing without a destination", () => {
  render(<App />);
  click(/plan my trip/i);
  click("Continue");
  expect(screen.getByRole("alert")).toHaveTextContent("Add a destination to continue.");
});
