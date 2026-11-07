/**
 * CaloTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * Persistent Browser Storage (localStorage)
 */

(function () {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEYS = {
    SETTINGS: 'calotrack_settings_v1',
    LOGS: 'calotrack_logs_v1',
    FAVORITES: 'calotrack_favorites_v1'
  };

  // --- Default Initial Data ---
  const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 140,
    carbsGoal: 210,
    fatGoal: 65,
    waterGoal: 8
  };

  const DEFAULT_FAVORITES = [
    { name: 'Banana (1 medium)', portion: '118g', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, category: 'snacks' },
    { name: 'Boiled Egg (2 large)', portion: '100g', calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6, category: 'breakfast' },
    { name: 'Chicken Breast', portion: '150g cooked', calories: 248, protein: 46.5, carbs: 0, fat: 5.4, category: 'lunch' },
    { name: 'White Rice (cooked)', portion: '1 cup (158g)', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, category: 'lunch' },
    { name: 'Greek Yogurt (0%)', portion: '170g', calories: 100, protein: 17.5, carbs: 6.1, fat: 0.4, category: 'breakfast' },
    { name: 'Almonds (handful)', portion: '30g', calories: 174, protein: 6.3, carbs: 6.1, fat: 15.0, category: 'snacks' },
    { name: 'Whey Protein Shake', portion: '1 scoop with water', calories: 125, protein: 24.0, carbs: 3.0, fat: 1.5, category: 'snacks' },
    { name: 'Avocado Toast', portion: '1 slice bread + 1/2 avo', calories: 190, protein: 5.0, carbs: 20.0, fat: 11.0, category: 'breakfast' },
    { name: 'Salmon Fillet', portion: '150g grilled', calories: 310, protein: 34.0, carbs: 0, fat: 18.0, category: 'dinner' },
    { name: 'Mixed Salad Bowl', portion: 'large with olive oil', calories: 140, protein: 2.5, carbs: 8.0, fat: 11.0, category: 'dinner' }
  ];

  // --- Application State ---
  let currentDate = getTodayDateString();
  let settings = loadSettings();
  let logs = loadLogs();
  let favorites = loadFavorites();

  // SVG Circumference for 80px radius circle: 2 * PI * 80 ≈ 502.65
  const CIRCLE_CIRCUMFERENCE = 502.65;

  // --- DOM Elements ---
  const elements = {
    // Header & Date Nav
    currentDateLabel: document.getElementById('current-date-label'),
    datePickerInput: document.getElementById('date-picker-input'),
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    todayBtn: document.getElementById('today-btn'),
    openSettingsBtn: document.getElementById('open-settings-btn'),

    // Summary Card & Gauge
    calorieStatusPill: document.getElementById('calorie-status-pill'),
    calorieProgressCircle: document.getElementById('calorie-progress-circle'),
    budgetHeading: document.getElementById('budget-heading'),
    remainingCalories: document.getElementById('remaining-calories'),
    targetCalories: document.getElementById('target-calories'),
    consumedCalories: document.getElementById('consumed-calories'),

    // Macros
    proteinConsumed: document.getElementById('protein-consumed'),
    proteinTarget: document.getElementById('protein-target'),
    proteinPct: document.getElementById('protein-pct'),
    proteinBar: document.getElementById('protein-bar'),

    carbsConsumed: document.getElementById('carbs-consumed'),
    carbsTarget: document.getElementById('carbs-target'),
    carbsPct: document.getElementById('carbs-pct'),
    carbsBar: document.getElementById('carbs-bar'),

    fatConsumed: document.getElementById('fat-consumed'),
    fatTarget: document.getElementById('fat-target'),
    fatPct: document.getElementById('fat-pct'),
    fatBar: document.getElementById('fat-bar'),

    // Water
    waterCounterLabel: document.getElementById('water-counter-label'),
    waterGlassesContainer: document.getElementById('water-glasses-container'),
    addWaterBtn: document.getElementById('add-water-btn'),
    removeWaterBtn: document.getElementById('remove-water-btn'),

    // 7-Day Trend
    weeklyAverageLabel: document.getElementById('weekly-average-label'),
    trendBarsWrapper: document.getElementById('trend-bars-wrapper'),

    // Meals & Favorites
    favoritesContainer: document.getElementById('favorites-chip-container'),
    quickCalorieModalBtn: document.getElementById('quick-calorie-modal-btn'),
    mealLists: {
      breakfast: document.getElementById('meal-list-breakfast'),
      lunch: document.getElementById('meal-list-lunch'),
      dinner: document.getElementById('meal-list-dinner'),
      snacks: document.getElementById('meal-list-snacks')
    },
    mealSubtotals: {
      breakfast: document.getElementById('subtotal-breakfast'),
      lunch: document.getElementById('subtotal-lunch'),
      dinner: document.getElementById('subtotal-dinner'),
      snacks: document.getElementById('subtotal-snacks')
    },

    // Food Modal
    foodModal: document.getElementById('food-modal'),
    closeFoodModalBtn: document.getElementById('close-food-modal'),
    cancelFoodBtn: document.getElementById('cancel-food-btn'),
    foodForm: document.getElementById('food-form'),
    foodModalTitle: document.getElementById('food-modal-title'),
    foodEditId: document.getElementById('food-edit-id'),
    foodNameInput: document.getElementById('food-name-input'),
    foodCategorySelect: document.getElementById('food-category-select'),
    foodPortionInput: document.getElementById('food-portion-input'),
    foodCaloriesInput: document.getElementById('food-calories-input'),
    foodProteinInput: document.getElementById('food-protein-input'),
    foodCarbsInput: document.getElementById('food-carbs-input'),
    foodFatInput: document.getElementById('food-fat-input'),
    saveAsFavoriteCheckbox: document.getElementById('save-as-favorite-checkbox'),

    // Quick Calorie Modal
    quickCalorieModal: document.getElementById('quick-calorie-modal'),
    closeQuickModalBtn: document.getElementById('close-quick-modal'),
    cancelQuickBtn: document.getElementById('cancel-quick-btn'),
    quickCalorieForm: document.getElementById('quick-calorie-form'),
    quickCalInput: document.getElementById('quick-cal-input'),
    quickCalName: document.getElementById('quick-cal-name'),
    quickCalCategory: document.getElementById('quick-cal-category'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsModalBtn: document.getElementById('close-settings-modal'),
    cancelSettingsBtn: document.getElementById('cancel-settings-btn'),
    settingsForm: document.getElementById('settings-form'),
    settingsCalorieGoal: document.getElementById('settings-calorie-goal'),
    settingsProteinGoal: document.getElementById('settings-protein-goal'),
    settingsCarbsGoal: document.getElementById('settings-carbs-goal'),
    settingsFatGoal: document.getElementById('settings-fat-goal'),
    settingsWaterGoal: document.getElementById('settings-water-goal'),
    exportDataBtn: document.getElementById('export-data-btn'),
    importFileInput: document.getElementById('import-file-input'),
    clearAllDataBtn: document.getElementById('clear-all-data-btn'),

    // Toast
    toast: document.getElementById('toast')
  };

  // --- Storage Helper Functions ---
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.error('Error loading settings', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(newSettings) {
    settings = { ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  function loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading logs', e);
      return {};
    }
  }

  function saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving logs', e);
      showToast('Error saving data to browser storage!');
    }
  }

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [...DEFAULT_FAVORITES];
    } catch (e) {
      console.error('Error loading favorites', e);
      return [...DEFAULT_FAVORITES];
    }
  }

  function saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }

  // --- Date Utility Functions ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateToString(today);
  }

  function formatDateToString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateString(str) {
    const parts = str.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function getReadableDate(dateStr) {
    const target = parseDateString(dateStr);
    const today = parseDateString(getTodayDateString());

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formatted = target.toLocaleDateString(undefined, options);

    if (diffDays === 0) return `Today, ${formatted}`;
    if (diffDays === -1) return `Yesterday, ${formatted}`;
    if (diffDays === 1) return `Tomorrow, ${formatted}`;
    return formatted;
  }

  function changeDay(offset) {
    const current = parseDateString(currentDate);
    current.setDate(current.getDate() + offset);
    currentDate = formatDateToString(current);
    renderAll();
  }

  // Ensure day record exists in memory
  function getDayData(dateStr) {
    if (!logs[dateStr]) {
      logs[dateStr] = {
        water: 0,
        items: []
      };
    }
    return logs[dateStr];
  }

  // --- Rendering UI ---
  function renderAll() {
    renderDateNav();
    renderDaySummary();
    renderWaterTracker();
    renderMeals();
    renderFavorites();
    renderTrendChart();
  }

  // Date Navigation
  function renderDateNav() {
    elements.currentDateLabel.textContent = getReadableDate(currentDate);
    elements.datePickerInput.value = currentDate;
  }

  // Day Calorie & Macro Calculations
  function renderDaySummary() {
    const dayData = getDayData(currentDate);
    const items = dayData.items || [];

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    items.forEach(item => {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    const goal = settings.calorieGoal || 2000;
    const remaining = goal - totalCalories;

    // Numbers display
    elements.targetCalories.textContent = formatNumber(goal);
    elements.consumedCalories.textContent = formatNumber(totalCalories);

    if (remaining >= 0) {
      elements.budgetHeading.textContent = 'Remaining';
      elements.remainingCalories.textContent = formatNumber(remaining);
      elements.calorieStatusPill.textContent = 'On Track';
      elements.calorieStatusPill.className = 'status-pill status-normal';
      elements.calorieProgressCircle.style.stroke = '#4f46e5';
    } else {
      elements.budgetHeading.textContent = 'Exceeded by';
      elements.remainingCalories.textContent = formatNumber(Math.abs(remaining));
      elements.calorieStatusPill.textContent = 'Over Budget';
      elements.calorieStatusPill.className = 'status-pill status-warning';
      elements.calorieProgressCircle.style.stroke = '#ef4444';
    }

    // Circular Progress Fill
    const pct = Math.min(100, Math.max(0, (totalCalories / goal) * 100));
    const offset = CIRCLE_CIRCUMFERENCE - (pct / 100) * CIRCLE_CIRCUMFERENCE;
    elements.calorieProgressCircle.style.strokeDashoffset = offset;

    // Macro breakdown
    renderMacro(
      elements.proteinConsumed,
      elements.proteinTarget,
      elements.proteinPct,
      elements.proteinBar,
      totalProtein,
      settings.proteinGoal
    );

    renderMacro(
      elements.carbsConsumed,
      elements.carbsTarget,
      elements.carbsPct,
      elements.carbsBar,
      totalCarbs,
      settings.carbsGoal
    );

    renderMacro(
      elements.fatConsumed,
      elements.fatTarget,
      elements.fatPct,
      elements.fatBar,
      totalFat,
      settings.fatGoal
    );
  }

  function renderMacro(consumedEl, targetEl, pctEl, barEl, consumed, target) {
    const c = Math.round(consumed * 10) / 10;
    const t = Math.max(1, target || 1);
    const percentage = Math.round((c / t) * 100);

    consumedEl.textContent = `${c}g`;
    targetEl.textContent = `${t}g`;
    pctEl.textContent = `${percentage}%`;

    const barWidth = Math.min(100, percentage);
    barEl.style.width = `${barWidth}%`;
  }

  // Water Tracker
  function renderWaterTracker() {
    const dayData = getDayData(currentDate);
    const count = dayData.water || 0;
    const goal = settings.waterGoal || 8;
    const ml = count * 250;

    elements.waterCounterLabel.textContent = `${count} / ${goal} glasses (${ml} ml)`;
    elements.waterGlassesContainer.innerHTML = '';

    for (let i = 1; i <= goal; i++) {
      const glassBtn = document.createElement('button');
      glassBtn.className = `water-cup-item ${i <= count ? 'filled' : ''}`;
      glassBtn.title = `Glass ${i} (250ml)`;
      glassBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${i <= count ? '#0284c7' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      `;
      glassBtn.addEventListener('click', () => {
        // Toggle or set to this index
        if (dayData.water === i) {
          dayData.water = i - 1;
        } else {
          dayData.water = i;
        }
        saveLogs();
        renderWaterTracker();
      });
      elements.waterGlassesContainer.appendChild(glassBtn);
    }
  }

  // Meals List & Subtotals
  function renderMeals() {
    const dayData = getDayData(currentDate);
    const items = dayData.items || [];

    const categories = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const categorized = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    items.forEach(item => {
      const cat = (item.category || 'snacks').toLowerCase();
      if (categorized[cat]) {
        categorized[cat].push(item);
      } else {
        categorized.snacks.push(item);
      }
    });

    categories.forEach(cat => {
      const listEl = elements.mealLists[cat];
      const subtotalEl = elements.mealSubtotals[cat];
      const catItems = categorized[cat];

      let subtotal = 0;
      listEl.innerHTML = '';

      if (catItems.length === 0) {
        listEl.innerHTML = '<div class="empty-meal-hint">No items logged yet for this meal.</div>';
      } else {
        catItems.forEach(item => {
          subtotal += Number(item.calories) || 0;
          const row = document.createElement('div');
          row.className = 'food-item-row';
          row.innerHTML = `
            <div class="food-details">
              <div>
                <span class="food-title">${escapeHTML(item.name)}</span>
                ${item.portion ? `<span class="food-portion">(${escapeHTML(item.portion)})</span>` : ''}
              </div>
              <div class="food-macros-tag">
                <span class="macro-tag-item macro-p">P: ${item.protein ? item.protein + 'g' : '0g'}</span>
                <span>•</span>
                <span class="macro-tag-item macro-c">C: ${item.carbs ? item.carbs + 'g' : '0g'}</span>
                <span>•</span>
                <span class="macro-tag-item macro-f">F: ${item.fat ? item.fat + 'g' : '0g'}</span>
              </div>
            </div>
            <div class="food-item-right">
              <span class="food-calories-badge">
                ${formatNumber(item.calories)} <span class="food-calories-unit">kcal</span>
              </span>
              <button class="item-delete-btn" title="Delete item" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `;

          // Delete action
          const deleteBtn = row.querySelector('.item-delete-btn');
          deleteBtn.addEventListener('click', () => {
            deleteFoodItem(item.id);
          });

          listEl.appendChild(row);
        });
      }

      subtotalEl.textContent = `${formatNumber(subtotal)} kcal`;
    });
  }

  // Favorites & Quick Log Chips
  function renderFavorites() {
    elements.favoritesContainer.innerHTML = '';

    favorites.forEach(fav => {
      const chip = document.createElement('button');
      chip.className = 'fav-chip';
      chip.type = 'button';
      chip.innerHTML = `
        <span>${escapeHTML(fav.name)}</span>
        <span class="fav-chip-kcal">+${fav.calories} kcal</span>
      `;
      chip.addEventListener('click', () => {
        addFavoriteToCurrentDay(fav);
      });
      elements.favoritesContainer.appendChild(chip);
    });
  }

  function addFavoriteToCurrentDay(fav) {
    const dayData = getDayData(currentDate);
    const newItem = {
      id: generateId(),
      name: fav.name,
      portion: fav.portion || '',
      calories: Number(fav.calories) || 0,
      protein: Number(fav.protein) || 0,
      carbs: Number(fav.carbs) || 0,
      fat: Number(fav.fat) || 0,
      category: fav.category || 'snacks',
      timestamp: new Date().toISOString()
    };

    dayData.items.push(newItem);
    saveLogs();
    renderAll();
    showToast(`Logged "${fav.name}" (+${fav.calories} kcal) to ${capitalize(newItem.category)}!`);
  }

  // 7-Day Trend Chart
  function renderTrendChart() {
    elements.trendBarsWrapper.innerHTML = '';

    const current = parseDateString(currentDate);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysData = [];

    let totalCals7Days = 0;
    let maxCaloriesInView = settings.calorieGoal * 1.15; // default headroom

    // Gather last 7 days ending at currentDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(current);
      d.setDate(d.getDate() - i);
      const dStr = formatDateToString(d);
      const dayRecord = logs[dStr] || { items: [] };

      let dayCalories = 0;
      (dayRecord.items || []).forEach(item => {
        dayCalories += Number(item.calories) || 0;
      });

      if (dayCalories > maxCaloriesInView) {
        maxCaloriesInView = dayCalories * 1.1;
      }

      totalCals7Days += dayCalories;
      daysData.push({
        dateStr: dStr,
        dayOfWeek: dayLabels[d.getDay()],
        calories: dayCalories,
        isCurrent: dStr === currentDate
      });
    }

    const avg = Math.round(totalCals7Days / 7);
    elements.weeklyAverageLabel.textContent = `7-Day Avg: ${formatNumber(avg)} kcal`;

    daysData.forEach(day => {
      const col = document.createElement('div');
      col.className = 'trend-day-col';
      col.title = `${day.dateStr}: ${formatNumber(day.calories)} kcal`;

      const heightPct = Math.max(4, Math.min(100, (day.calories / maxCaloriesInView) * 100));
      const isOver = day.calories > settings.calorieGoal;

      col.innerHTML = `
        <span class="trend-bar-value">${formatNumber(day.calories)}</span>
        <div class="trend-bar-track">
          <div class="trend-bar-fill ${isOver ? 'over-target' : ''} ${day.isCurrent ? 'is-active-day' : ''}" style="height: ${heightPct}%;"></div>
        </div>
        <span class="trend-day-label ${day.isCurrent ? 'active-label' : ''}">${day.dayOfWeek}</span>
      `;

      col.addEventListener('click', () => {
        currentDate = day.dateStr;
        renderAll();
      });

      elements.trendBarsWrapper.appendChild(col);
    });
  }

  // --- Food Entry Functions ---
  function deleteFoodItem(id) {
    const dayData = getDayData(currentDate);
    const index = dayData.items.findIndex(item => item.id === id);
    if (index !== -1) {
      const removed = dayData.items.splice(index, 1)[0];
      saveLogs();
      renderAll();
      showToast(`Removed "${removed.name}"`);
    }
  }

  function openFoodModal(category = 'breakfast') {
    elements.foodForm.reset();
    elements.foodEditId.value = '';
    elements.foodModalTitle.textContent = 'Add Food Entry';
    elements.foodCategorySelect.value = category;
    elements.saveAsFavoriteCheckbox.checked = false;
    openModal(elements.foodModal);
    setTimeout(() => elements.foodNameInput.focus(), 50);
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = elements.foodNameInput.value.trim();
    const category = elements.foodCategorySelect.value;
    const portion = elements.foodPortionInput.value.trim();
    const calories = Math.max(0, parseFloat(elements.foodCaloriesInput.value) || 0);
    const protein = Math.max(0, parseFloat(elements.foodProteinInput.value) || 0);
    const carbs = Math.max(0, parseFloat(elements.foodCarbsInput.value) || 0);
    const fat = Math.max(0, parseFloat(elements.foodFatInput.value) || 0);
    const saveFavorite = elements.saveAsFavoriteCheckbox.checked;

    if (!name) {
      showToast('Please enter a food name');
      return;
    }

    const dayData = getDayData(currentDate);
    const newItem = {
      id: generateId(),
      name,
      category,
      portion,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      timestamp: new Date().toISOString()
    };

    dayData.items.push(newItem);
    saveLogs();

    if (saveFavorite) {
      // Check if not already in favorites
      const exists = favorites.some(f => f.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        favorites.push({
          name: newItem.name,
          portion: newItem.portion,
          calories: newItem.calories,
          protein: newItem.protein,
          carbs: newItem.carbs,
          fat: newItem.fat,
          category: newItem.category
        });
        saveFavorites();
      }
    }

    closeModal(elements.foodModal);
    renderAll();
    showToast(`Logged "${newItem.name}" (${newItem.calories} kcal)`);
  }

  // --- Quick Calorie Adder ---
  function openQuickCalModal() {
    elements.quickCalorieForm.reset();
    elements.quickCalCategory.value = 'snacks';
    openModal(elements.quickCalorieModal);
    setTimeout(() => elements.quickCalInput.focus(), 50);
  }

  function handleQuickCalSubmit(e) {
    e.preventDefault();
    const cals = parseInt(elements.quickCalInput.value, 10);
    if (!cals || cals <= 0) return;

    const desc = elements.quickCalName.value.trim() || 'Quick Calorie Entry';
    const cat = elements.quickCalCategory.value || 'snacks';

    const dayData = getDayData(currentDate);
    dayData.items.push({
      id: generateId(),
      name: desc,
      portion: '',
      calories: cals,
      protein: 0,
      carbs: 0,
      fat: 0,
      category: cat,
      timestamp: new Date().toISOString()
    });

    saveLogs();
    closeModal(elements.quickCalorieModal);
    renderAll();
    showToast(`Added ${cals} kcal to ${capitalize(cat)}`);
  }

  // --- Settings & Data Management ---
  function openSettingsModal() {
    elements.settingsCalorieGoal.value = settings.calorieGoal;
    elements.settingsProteinGoal.value = settings.proteinGoal;
    elements.settingsCarbsGoal.value = settings.carbsGoal;
    elements.settingsFatGoal.value = settings.fatGoal;
    elements.settingsWaterGoal.value = settings.waterGoal;
    openModal(elements.settingsModal);
  }

  function handleSettingsSubmit(e) {
    e.preventDefault();
    const newSettings = {
      calorieGoal: Math.max(500, parseInt(elements.settingsCalorieGoal.value, 10) || 2000),
      proteinGoal: Math.max(0, parseInt(elements.settingsProteinGoal.value, 10) || 140),
      carbsGoal: Math.max(0, parseInt(elements.settingsCarbsGoal.value, 10) || 210),
      fatGoal: Math.max(0, parseInt(elements.settingsFatGoal.value, 10) || 65),
      waterGoal: Math.max(1, parseInt(elements.settingsWaterGoal.value, 10) || 8)
    };

    saveSettings(newSettings);
    closeModal(elements.settingsModal);
    renderAll();
    showToast('Goals updated successfully!');
  }

  function exportBackupJSON() {
    const backupData = {
      app: 'CaloTrack',
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings,
      favorites,
      logs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calotrack_backup_${currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded');
  }

  function importBackupJSON(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.settings && data.logs) {
          saveSettings(data.settings);
          logs = data.logs || {};
          saveLogs();
          if (Array.isArray(data.favorites)) {
            favorites = data.favorites;
            saveFavorites();
          }
          renderAll();
          closeModal(elements.settingsModal);
          showToast('Backup restored successfully!');
        } else {
          showToast('Invalid backup file format');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing JSON backup file');
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    const confirmed = window.confirm(
      'Are you sure you want to reset all CaloTrack data? This will erase all logged meals, water history, and custom targets from your browser.'
    );
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);

    settings = { ...DEFAULT_SETTINGS };
    logs = {};
    favorites = [...DEFAULT_FAVORITES];

    closeModal(elements.settingsModal);
    renderAll();
    showToast('All data has been reset to defaults');
  }

  // --- Modal Helpers ---
  function openModal(modalEl) {
    modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
  }

  // --- Toast System ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('active');
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('active');
    }, 2800);
  }

  // --- Helper Functions ---
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function formatNumber(num) {
    return Number(num || 0).toLocaleString();
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Listeners Initialization ---
  function initEvents() {
    // Date Navigation
    elements.prevDayBtn.addEventListener('click', () => changeDay(-1));
    elements.nextDayBtn.addEventListener('click', () => changeDay(1));
    elements.todayBtn.addEventListener('click', () => {
      currentDate = getTodayDateString();
      renderAll();
    });

    elements.datePickerInput.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        renderAll();
      }
    });

    // Add Food category buttons
    document.querySelectorAll('.open-add-food-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') || 'breakfast';
        openFoodModal(cat);
      });
    });

    // Food Modal Events
    elements.closeFoodModalBtn.addEventListener('click', () => closeModal(elements.foodModal));
    elements.cancelFoodBtn.addEventListener('click', () => closeModal(elements.foodModal));
    elements.foodForm.addEventListener('submit', handleFoodFormSubmit);

    // Quick Calorie Modal Events
    elements.quickCalorieModalBtn.addEventListener('click', openQuickCalModal);
    elements.closeQuickModalBtn.addEventListener('click', () => closeModal(elements.quickCalorieModal));
    elements.cancelQuickBtn.addEventListener('click', () => closeModal(elements.quickCalorieModal));
    elements.quickCalorieForm.addEventListener('submit', handleQuickCalSubmit);

    // Quick Preset buttons inside Quick Calorie Modal
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-add');
        elements.quickCalInput.value = val;
      });
    });

    // Water Quick Actions
    elements.addWaterBtn.addEventListener('click', () => {
      const dayData = getDayData(currentDate);
      dayData.water = (dayData.water || 0) + 1;
      saveLogs();
      renderWaterTracker();
      showToast('+1 glass of water logged (250 ml)');
    });

    elements.removeWaterBtn.addEventListener('click', () => {
      const dayData = getDayData(currentDate);
      if ((dayData.water || 0) > 0) {
        dayData.water--;
        saveLogs();
        renderWaterTracker();
      }
    });

    // Settings Modal Events
    elements.openSettingsBtn.addEventListener('click', openSettingsModal);
    elements.closeSettingsModalBtn.addEventListener('click', () => closeModal(elements.settingsModal));
    elements.cancelSettingsBtn.addEventListener('click', () => closeModal(elements.settingsModal));
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);

    elements.exportDataBtn.addEventListener('click', exportBackupJSON);
    elements.importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importBackupJSON(e.target.files[0]);
        e.target.value = '';
      }
    });
    elements.clearAllDataBtn.addEventListener('click', clearAllData);

    // Close modals on overlay backdrop click
    [elements.foodModal, elements.quickCalorieModal, elements.settingsModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Keyboard escape to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(elements.foodModal);
        closeModal(elements.quickCalorieModal);
        closeModal(elements.settingsModal);
      }
    });
  }

  // --- Initial Launch ---
  initEvents();
  renderAll();

})();

