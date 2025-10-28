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
    const meetsSpecialRequirements = !event.specialRequirements || checkSpecialRequirements(event);
    return inAgeRange && isRepeatableOrNotCompleted && meetsSpecialRequirements;
  });
}

// Check if player meets special requirements for an event
function checkSpecialRequirements(event) {
  switch(event.id) {
    case "find_wife":
      return !gameState.selectedWife;
    case "wedding":
      return gameState.selectedWife && !gameState.isMarried;
    case "try_for_children":
      return gameState.isMarried;
    default:
      return true;
  }
}

// Calculate stat previews from selected events and penalties
// This function computes the total stat changes (effects and penalties) from currently selected events.
// It is called by updateStatsDisplay() to provide real-time previews of how stats will change
// before the user applies the events by clicking the "Age Up" button.
function calculateStatPreviews() {
  console.log('calculateStatPreviews called');
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

  console.log('Stat previews calculated:', totalEffects);
  return totalEffects;
}

// Calculate total penalties from selected events
// This function computes the cumulative penalties (negative effects) from selected events,
// taking into account multipliers based on the number of selected events and any special factors.
// Penalties are integrated into the stat previews to show the full impact of selections.
function calculateTotalPenalties() {
  const selectedEvents = getSelectedEvents();
  const Y = getMaxEvents();
  let totalPenalties = {
    innate: {},
    skills: {},
    possessions: {}
  };

  console.log('Calculating penalties for', selectedEvents.length, 'events');

  // Only apply penalties if more events are selected than allowed
  if (selectedEvents.length <= Y) {
    console.log('No penalties applied: only', selectedEvents.length, 'event(s) selected, max allowed:', Y);
    return totalPenalties;
  }

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

  console.log('Total penalties calculated:', totalPenalties);
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

  console.log('Selected events count:', selectedEvents.length);
  return selectedEvents;
}

// Get maximum number of events allowed before penalties based on age group
function getMaxEvents() {
  const ageGroup = getCurrentAgeGroup(gameState.age);
  return ageGroup.name === 'Teenager' ? 2 : 1;
}

// Compute final stats after applying preview changes
// This function calculates the final stats by applying the preview changes to the current stats.
// It is used to determine the death chance based on the stats after applying selected events.
function computeFinalStats(previews) {
  const finalStats = JSON.parse(JSON.stringify(gameState.stats)); // Deep copy

  for (const [category, stats] of Object.entries(previews)) {
    for (const [stat, change] of Object.entries(stats)) {
      if (finalStats[category] && finalStats[category][stat]) {
        const newValue = finalStats[category][stat].value + change;
        finalStats[category][stat].value = Math.max(
          finalStats[category][stat].min,
          Math.min(finalStats[category][stat].max, newValue)
        );
      }
    }
  }

  return finalStats;
}

// Generate penalty text for display
function generatePenaltyText(penalties) {
  const penaltyTexts = [];
  for (const [category, stats] of Object.entries(penalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        penaltyTexts.push(`-${value} ${stat}`);
      }
    }
  }
  return penaltyTexts.join(', ');
}

// Helper function to build HTML for one-time events
function buildOneTimeEventsHtml(events) {
  const selectedCount = getSelectedEvents().length;
  const Y = getMaxEvents();
  return events.map(event => {
    const isSelected = $('.event-checkbox[data-event-id="' + event.id + '"]:checked').length > 0;
    let displayText = `<span class="event-name">${event.name}</span>`;
    if (selectedCount > 0) {
      let colorClass = '';
      if (selectedCount <= Y) {
        colorClass = 'penalty-green';
      } else {
        colorClass = 'penalty-red';
      }
      displayText += ` <span class="penalty-multiplier ${colorClass}">(${selectedCount}/${Y})</span>`;
      if (selectedCount > Y) {
        const multiplier = selectedCount;
        const factor = event.specialFactor || 1;
        const finalMultiplier = multiplier * factor;
        const penaltyTexts = [];
        if (event.penalties) {
          for (const [category, stats] of Object.entries(event.penalties)) {
            for (const [stat, value] of Object.entries(stats)) {
              const multipliedValue = value * finalMultiplier;
              penaltyTexts.push(`-${multipliedValue} ${stat}`);
            }
          }
        }
        if (penaltyTexts.length > 0) {
          displayText += ` <span class="penalty-details">Penalties: ${penaltyTexts.join(', ')}</span>`;
        }
      }
    }
    return `
      <div class="event-item ${isSelected ? 'selected' : ''}">
        <label class="event-label">
          <input type="checkbox" class="event-checkbox" data-event-id="${event.id}" ${isSelected ? 'checked' : ''}>
          ${displayText}
        </label>
        <div class="event-description">${generateEventDescription(event)}</div>
      </div>
    `;
  }).join('');
}

// Helper function to build HTML for repeatable events
function buildRepeatableEventsHtml(events) {
  const selectedCount = getSelectedEvents().length;
  const Y = getMaxEvents();
  return events.map(event => {
    const isSelected = $('.event-checkbox[data-event-id="' + event.id + '"]:checked').length > 0;
    const isPreserved = gameState.preservedSelections.has(event.id);
    let displayText = `<span class="event-name">${event.name}</span><span class="repeatable-badge">Repeatable</span>`;
    if (selectedCount > 0) {
      let colorClass = '';
      if (selectedCount <= Y) {
        colorClass = 'penalty-green';
      } else {
        colorClass = 'penalty-red';
      }
      displayText += ` <span class="penalty-multiplier ${colorClass}">(${selectedCount}/${Y})</span>`;
      if (selectedCount > Y) {
        const multiplier = selectedCount;
        const factor = event.specialFactor || 1;
        const finalMultiplier = multiplier * factor;
        const penaltyTexts = [];
        if (event.penalties) {
          for (const [category, stats] of Object.entries(event.penalties)) {
            for (const [stat, value] of Object.entries(stats)) {
              const multipliedValue = value * finalMultiplier;
              penaltyTexts.push(`-${multipliedValue} ${stat}`);
            }
          }
        }
        if (penaltyTexts.length > 0) {
          displayText += ` <span class="penalty-details">Penalties: ${penaltyTexts.join(', ')}</span>`;
        }
      }
    }
    return `
      <div class="event-item repeatable ${isSelected ? 'selected' : ''}">
        <label class="event-label">
          <input type="checkbox" class="event-checkbox" data-event-id="${event.id}" ${(isSelected || isPreserved) ? 'checked' : ''}>
          ${displayText}
        </label>
        <div class="event-description">${generateEventDescription(event)}</div>
      </div>
    `;
  }).join('');
}

// Helper function to build selection summary HTML
function buildSelectionSummaryHtml() {
  const selectedEvents = getSelectedEvents();
  if (selectedEvents.length === 0) return '';

  const totalEffects = calculateStatPreviews();

  // Calculate total penalties with breakdown
  const numEvents = selectedEvents.length;
  const Y = getMaxEvents();
  let totalPenalties = { innate: {}, skills: {}, possessions: {} };
  let breakdown = { innate: {}, skills: {}, possessions: {} };

  if (numEvents > Y) {
    selectedEvents.forEach(event => {
      const multiplier = numEvents;
      const factor = event.specialFactor || 1;
      if (event.penalties) {
        for (const [category, stats] of Object.entries(event.penalties)) {
          for (const [stat, value] of Object.entries(stats)) {
            if (!totalPenalties[category][stat]) totalPenalties[category][stat] = 0;
            totalPenalties[category][stat] += value * multiplier * factor;
            if (!breakdown[category][stat]) breakdown[category][stat] = [];
            breakdown[category][stat].push(`${value} * ${multiplier} * ${factor}`);
          }
        }
      }
    });
  }

  let summaryHtml = '<div class="selection-summary"><h4>Selected for Next Age-Up:</h4>';

  // Show total effects
  const effectTexts = [];
  for (const [category, stats] of Object.entries(totalEffects)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        effectTexts.push(`${value} ${stat}`);
      }
    }
  }

  if (effectTexts.length > 0) {
    summaryHtml += `<div class="summary-effects">Effects: ${effectTexts.join(', ')}</div>`;
  }

  // Show total penalties with breakdown
  const penaltyTexts = [];
  for (const [category, stats] of Object.entries(totalPenalties)) {
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== 0) {
        const calc = breakdown[category][stat].join(' + ');
        penaltyTexts.push(`-${Math.abs(value)} ${stat} (${calc} = ${value})`);
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
    $('.center-panel').empty().append(`
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

  // Clear preserved selections after rendering
  gameState.preservedSelections.clear();
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