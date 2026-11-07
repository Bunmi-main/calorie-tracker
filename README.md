# CaloTrack - Vanilla Calorie & Macro Tracker

A lightweight, responsive, and modern Calorie & Macronutrient Tracker built entirely with pure HTML, CSS, and Vanilla JavaScript. Runs directly in the browser with local persistence and zero backend requirements.

## Features

- **Daily Calorie & Macro Budget**:
  - Circular SVG progress ring tracking remaining / exceeded calories.
  - Real-time progress bars for Protein, Carbohydrates, and Fats.
  - Dynamic status indicators ("On Track" vs "Over Budget").

- **Meal-by-Meal Categorization**:
  - Organized breakdown for Breakfast, Lunch, Dinner, and Snacks.
  - Calorie subtotals and macro distribution per meal.
  - Detailed food logging (portion size, calories, protein, carbs, fat).

- **Quick Log & Favorites Library**:
  - Built-in frequent food presets (Bananas, Boiled Eggs, Chicken Breast, Yogurt, Rice, Protein Shakes, etc.).
  - 1-click logging to today's active meal.
  - "+ Quick Calories" entry dialog with preset increment buttons (+100, +200, +300, +500 kcal).
  - Ability to save any custom entry to your personal favorites library.

- **Hydration Tracker**:
  - Interactive water tracker (8 × 250ml glasses / 2000ml target).
  - Click individual glasses or use quick +1 / -1 buttons.

- **7-Day Trend Analytics & Calendar Navigation**:
  - Multi-day date navigation (previous, next, today, or custom date picker).
  - 7-day comparative bar chart with daily averages and interactive date jumping.

- **Persistent Browser Storage & Data Management**:
  - All logs, settings, and favorites are stored locally in the browser (`localStorage`).
  - **Export JSON**: Download a backup of all your logs and targets.
  - **Import JSON**: Restore your data across browsers or devices anytime.
  - **Reset Data**: Reset targets and history back to defaults.

## Tech Stack

- **HTML5**: Semantic structure and accessible modal dialogues.
- **Pure CSS**: 100% custom styling, fully responsive, zero frameworks (no Tailwind), and zero CSS variables.
- **Vanilla JavaScript**: Pure ES6+ client-side application logic and `localStorage` persistence.

## Getting Started

No build tools or server setup required. Simply clone the repository and open `index.html` in your browser:

```bash
git clone https://github.com/Bunmi-main/calorie-tracker.git
cd calorie-tracker
```

Open `index.html` directly in Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

## License

MIT License.
