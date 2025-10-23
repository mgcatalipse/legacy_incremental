// Generate dynamic description for events
function generateEventDescription(event) {
  let description = event.description;

  // Replace bonus placeholders with actual values
  for (const [category, stats] of Object.entries(event.effects)) {
    for (const [stat, value] of Object.entries(stats)) {
      const placeholder = `{bonus}`;
      const actualValue = Math.abs(value);
      description = description.replace(placeholder, actualValue);
    }
  }

  // Add penalty information if penalties exist
  if (event.penalties) {
    const penaltyTexts = [];
    for (const [category, stats] of Object.entries(event.penalties)) {
      for (const [stat, value] of Object.entries(stats)) {
        if (value !== 0) {
          const sign = value > 0 ? '+' : '';
          penaltyTexts.push(`${sign}${value} ${stat}`);
        }
      }
    }

    if (penaltyTexts.length > 0) {
      description += ` (Cost: ${penaltyTexts.join(', ')})`;
    }
  }

  // Add note about when effects are applied
  const isSelected = $('.event-checkbox[data-event-id="' + event.id + '"]:checked').length > 0;
  if (isSelected) {
    description += ' [Will apply on next age-up]';
  } else {
    description += ' [Select to apply on next age-up]';
  }

  return description;
}

// Get available events based on current age (including completed repeatable events)
function getAvailableEvents() {
  return LIFE_EVENTS.filter(event => {
    const inAgeRange = gameState.age >= event.ageRange.min && gameState.age <= event.ageRange.max;
    const isRepeatableOrNotCompleted = event.repeatable || !gameState.completedEvents.has(event.id);
    return inAgeRange && isRepeatableOrNotCompleted;
  });
}

// Calculate stat previews from selected events and penalties
// This function computes the total stat changes (effects and penalties) from currently selected events.
// It is called by updateStatsDisplay() to provide real-time previews of how stats will change
// before the user applies the events by clicking the "Age Up" button.
function calculateStatPreviews() {
  const selectedEvents = getSelectedEvents();
  const totalPenalties = calculateTotalPenalties();

  let totalEffects = {
    innate: {},
    skills: {},
    possessions: {}
  };

  // Sum all effects from selected events
  selectedEvents.forEach(event => {
    for (const [category, stats] of Object.entries(event.effects)) {
      for (const [stat, value] of Object.entries(stats)) {
        if (!totalEffects[category][stat]) {
          totalEffects[category][stat] = 0;
        }
        totalEffects[category][stat] += value;
      }
    }
  });

  // Add penalties
  for (const [category, stats] of Object.entries(totalPenalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (!totalEffects[category][stat]) {
        totalEffects[category][stat] = 0;
      }
      totalEffects[category][stat] += value;
    }
  }

  return totalEffects;
}

// Calculate total penalties from selected events
// This function computes the cumulative penalties (negative effects) from selected events,
// taking into account multipliers based on the number of selected events and any special factors.
// Penalties are integrated into the stat previews to show the full impact of selections.
function calculateTotalPenalties() {
  const selectedEvents = getSelectedEvents();
  let totalPenalties = {
    innate: {},
    skills: {},
    possessions: {}
  };

  selectedEvents.forEach(event => {
    const multiplier = selectedEvents.length; // Multiply by number of selected events

    // Apply special factor if exists
    const factor = event.specialFactor || 1;
    const finalMultiplier = multiplier * factor;

    // Sum penalties
    if (event.penalties) {
      for (const [category, stats] of Object.entries(event.penalties)) {
        for (const [stat, value] of Object.entries(stats)) {
          if (!totalPenalties[category][stat]) {
            totalPenalties[category][stat] = 0;
          }
          totalPenalties[category][stat] += value * finalMultiplier;
        }
      }
    }
  });

  return totalPenalties;
}

// Get currently selected events
// This function retrieves the list of events that are currently checked by the user.
// It is used by calculateStatPreviews() and calculateTotalPenalties() to determine
// which effects and penalties to include in the preview calculations.
function getSelectedEvents() {
  const selectedCheckboxes = $('.event-checkbox:checked');
  const selectedEvents = [];

  selectedCheckboxes.each(function() {
    const eventId = $(this).data('event-id');
    const event = LIFE_EVENTS.find(e => e.id === eventId);
    if (event) {
      selectedEvents.push(event);
    }
  });

  return selectedEvents;
}

// Generate penalty text for display
function generatePenaltyText(penalties) {
  const penaltyTexts = [];
  for (const [category, stats] of Object.entries(penalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        penaltyTexts.push(`${sign}${value} ${stat}`);
      }
    }
  }
  return penaltyTexts.join(', ');
}

// Helper function to build HTML for one-time events
function buildOneTimeEventsHtml(events) {
  return events.map(event => {
    const costInfo = event.penalties ? generatePenaltyText(event.penalties) : '';
    const isSelected = $('.event-checkbox[data-event-id="' + event.id + '"]:checked').length > 0;
    return `
      <div class="event-item ${isSelected ? 'selected' : ''}">
        <label class="event-label">
          <input type="checkbox" class="event-checkbox" data-event-id="${event.id}" ${isSelected ? 'checked' : ''}>
          <span class="event-name">${event.name}</span>
        </label>
        <div class="event-description">${generateEventDescription(event)}</div>
        ${costInfo ? `<div class="event-cost">Cost: ${costInfo}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Helper function to build HTML for repeatable events
function buildRepeatableEventsHtml(events) {
  return events.map(event => {
    const costInfo = event.penalties ? generatePenaltyText(event.penalties) : '';
    const isSelected = $('.event-checkbox[data-event-id="' + event.id + '"]:checked').length > 0;
    return `
      <div class="event-item repeatable ${isSelected ? 'selected' : ''}">
        <label class="event-label">
          <input type="checkbox" class="event-checkbox" data-event-id="${event.id}" ${isSelected ? 'checked' : ''}>
          <span class="event-name">${event.name}</span>
          <span class="repeatable-badge">Repeatable</span>
        </label>
        <div class="event-description">${generateEventDescription(event)}</div>
        ${costInfo ? `<div class="event-cost">Cost per use: ${costInfo}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Helper function to build selection summary HTML
function buildSelectionSummaryHtml() {
  const selectedEvents = getSelectedEvents();
  if (selectedEvents.length === 0) return '';

  const totalEffects = calculateStatPreviews();
  const totalPenalties = calculateTotalPenalties();

  let summaryHtml = '<div class="selection-summary"><h4>Selected for Next Age-Up:</h4>';

  // Show total effects
  const effectTexts = [];
  for (const [category, stats] of Object.entries(totalEffects)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        effectTexts.push(`${sign}${value} ${stat}`);
      }
    }
  }

  if (effectTexts.length > 0) {
    summaryHtml += `<div class="summary-effects">Effects: ${effectTexts.join(', ')}</div>`;
  }

  // Show total penalties
  const penaltyTexts = [];
  for (const [category, stats] of Object.entries(totalPenalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        penaltyTexts.push(`${sign}${value} ${stat}`);
      }
    }
  }

  if (penaltyTexts.length > 0) {
    summaryHtml += `<div class="summary-costs">Total Cost: ${penaltyTexts.join(', ')}</div>`;
  }

  summaryHtml += '</div>';
  return summaryHtml;
}

// Update the events list in the UI
// This function rebuilds the events list based on available events and selected checkboxes.
// It includes a selection summary showing the total effects and penalties from selected events,
// providing users with a clear preview of what will happen on the next age-up.
// It is called by the event listener in script.js when checkboxes change.
function updateEventsList() {
  const availableEvents = getAvailableEvents();
  const eventsContainer = $('#events-list');

  if (eventsContainer.length === 0) {
    // Create events container if it doesn't exist
    $('.right-side').empty().append(`
      <div id="events-container">
        <h3>Life Events</h3>
        <div id="events-list"></div>
      </div>
    `);
  }

  const eventsList = $('#events-list');
  eventsList.empty();

  if (availableEvents.length === 0) {
    eventsList.append('<p>No events available for your current age.</p>');
    return;
  }

  // Group events by repeatable status
  const oneTimeEvents = availableEvents.filter(e => !e.repeatable);
  const repeatableEvents = availableEvents.filter(e => e.repeatable);

  // Add one-time events
  if (oneTimeEvents.length > 0) {
    eventsList.append(buildOneTimeEventsHtml(oneTimeEvents));
  }

  // Add separator if both types exist
  if (oneTimeEvents.length > 0 && repeatableEvents.length > 0) {
    eventsList.append('<hr class="event-separator">');
  }

  // Add summary of selected events
  eventsList.append(buildSelectionSummaryHtml());

  // Add repeatable events
  if (repeatableEvents.length > 0) {
    eventsList.append(buildRepeatableEventsHtml(repeatableEvents));
  }
}

// Invert effects for removal
function invertEffects(effects) {
  const inverted = {
    innate: {},
    skills: {},
    possessions: {}
  };

  for (const [category, stats] of Object.entries(effects)) {
    for (const [stat, value] of Object.entries(stats)) {
      inverted[category][stat] = -value;
    }
  }

  return inverted;
}

// No export, functions are global