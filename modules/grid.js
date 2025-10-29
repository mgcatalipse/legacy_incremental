/**
 * Grid Management Module
 * Handles all panel resizing, collapsing, and grid layout functionality
 */

// Grid state management
const gridState = {
  storedLeftFr: 20,
  storedCenterFr: 50,
  storedRightFr: 30,
  isDragging: false,
  currentSeparator: null
};

/**
 * Initialize grid resizing functionality
 */
function initGridResizing() {
  const separatorLeft = $('.separator-left')[0];
  const separatorRight = $('.separator-right')[0];

  if (separatorLeft && separatorRight) {
    separatorLeft.addEventListener('mousedown', startDrag);
    separatorRight.addEventListener('mousedown', startDrag);
  }
}

/**
 * Start dragging a separator
 */
function startDrag(e) {
  e.preventDefault();
  gridState.isDragging = true;
  gridState.currentSeparator = e.currentTarget.classList.contains('separator-left') ? 'left' : 'right';
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

/**
 * Handle mouse movement during drag
 */
function onDrag(e) {
  if (!gridState.isDragging) return;

  const container = $('.human-content')[0];
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const totalWidth = containerRect.width - CONSTANTS.UI.GRID_TOTAL_WIDTH_SUBTRACT;

  if (gridState.currentSeparator === 'left') {
    handleLeftSeparatorDrag(e, containerRect, totalWidth, container);
  } else if (gridState.currentSeparator === 'right') {
    handleRightSeparatorDrag(e, containerRect, totalWidth, container);
  }
}

/**
 * Handle left separator drag
 */
function handleLeftSeparatorDrag(e, containerRect, totalWidth, container) {
  let leftFr = ((e.clientX - containerRect.left) / totalWidth) * 100;
  leftFr = clamp(leftFr, CONSTANTS.UI.PANEL_MIN_FR, CONSTANTS.UI.PANEL_MAX_FR);
  
  let centerFr = 100 - leftFr - gridState.storedRightFr;
  let rightFr = gridState.storedRightFr;

  // Ensure minimum center panel size
  if (centerFr < CONSTANTS.UI.PANEL_MIN_FR) {
    centerFr = CONSTANTS.UI.PANEL_MIN_FR;
    rightFr = 100 - leftFr - centerFr;
    rightFr = Math.max(CONSTANTS.UI.PANEL_MIN_FR, rightFr);
  }

  updateGridTemplate(leftFr, centerFr, rightFr, container);
}

/**
 * Handle right separator drag
 */
function handleRightSeparatorDrag(e, containerRect, totalWidth, container) {
  let rightFr = ((containerRect.right - e.clientX) / totalWidth) * 100;
  rightFr = clamp(rightFr, CONSTANTS.UI.PANEL_MIN_FR, CONSTANTS.UI.PANEL_MAX_FR);
  
  let centerFr = 100 - gridState.storedLeftFr - rightFr;
  let leftFr = gridState.storedLeftFr;

  // Ensure minimum center panel size
  if (centerFr < CONSTANTS.UI.PANEL_MIN_FR) {
    centerFr = CONSTANTS.UI.PANEL_MIN_FR;
    leftFr = 100 - centerFr - rightFr;
    leftFr = Math.max(CONSTANTS.UI.PANEL_MIN_FR, leftFr);
  }

  updateGridTemplate(leftFr, centerFr, rightFr, container);
}

/**
 * Update grid template columns
 */
function updateGridTemplate(leftFr, centerFr, rightFr, container) {
  container.style.gridTemplateColumns = `${leftFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${centerFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${rightFr}fr`;
  
  // Update stored values
  gridState.storedLeftFr = leftFr;
  gridState.storedCenterFr = centerFr;
  gridState.storedRightFr = rightFr;
}

/**
 * Stop dragging
 */
function stopDrag() {
  gridState.isDragging = false;
  gridState.currentSeparator = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

/**
 * Collapse a panel side
 */
function collapsePanel(side) {
  const container = $('.human-content')[0];
  if (!container) return;

  // Store current fr values before collapsing
  const currentGrid = container.style.gridTemplateColumns || '20fr 40px 50fr 40px 30fr';
  const parts = currentGrid.split(' ');
  if (parts.length === 5) {
    gridState.storedLeftFr = parseFloat(parts[0]);
    gridState.storedCenterFr = parseFloat(parts[2]);
    gridState.storedRightFr = parseFloat(parts[4]);
  }

  if (side === 'left') {
    $('.left-panel').hide();
    $('.separator-left').addClass('deactivated');
    
    // Remove event listeners when collapsing
    const separatorLeft = $('.separator-left')[0];
    if (separatorLeft) {
      separatorLeft.removeEventListener('mousedown', startDrag);
    }
    
    $('#expand-left').show();
    $('#collapse-left').hide();
  } else if (side === 'right') {
    $('.right-panel').hide();
    $('.separator-right').addClass('deactivated');
    
    // Remove event listeners when collapsing
    const separatorRight = $('.separator-right')[0];
    if (separatorRight) {
      separatorRight.removeEventListener('mousedown', startDrag);
    }
    
    $('#expand-right').show();
    $('#collapse-right').hide();
  }

  updateGridAfterCollapse(side, 'collapse');
}

/**
 * Expand a panel side
 */
function expandPanel(side) {
  if (side === 'left') {
    $('.left-panel').show();
    $('.separator-left').removeClass('deactivated');
    
    // Re-add event listeners when expanding
    const separatorLeft = $('.separator-left')[0];
    if (separatorLeft) {
      separatorLeft.addEventListener('mousedown', startDrag);
    }
    
    $('#expand-left').hide();
    $('#collapse-left').show();
  } else if (side === 'right') {
    $('.right-panel').show();
    $('.separator-right').removeClass('deactivated');
    
    // Re-add event listeners when expanding
    const separatorRight = $('.separator-right')[0];
    if (separatorRight) {
      separatorRight.addEventListener('mousedown', startDrag);
    }
    
    $('#expand-right').hide();
    $('#collapse-right').show();
  }

  updateGridAfterCollapse(side, 'expand');
}

/**
 * Update grid after collapse/expand
 */
function updateGridAfterCollapse(side, action) {
  const container = $('.human-content')[0];
  if (!container) return;

  if (side === 'left' && action === 'collapse') {
    // Collapse left panel, redistribute space to center and right
    const newCenterFr = gridState.storedCenterFr + (gridState.storedLeftFr / 2);
    const newRightFr = gridState.storedRightFr + (gridState.storedLeftFr / 2);
    container.style.gridTemplateColumns = `0px ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${newCenterFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${newRightFr}fr`;
  } else if (side === 'left' && action === 'expand') {
    // Expand left panel, restore stored fr values
    container.style.gridTemplateColumns = `${gridState.storedLeftFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${gridState.storedCenterFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${gridState.storedRightFr}fr`;
  } else if (side === 'right' && action === 'collapse') {
    // Collapse right panel, redistribute space to left and center
    const newLeftFr = gridState.storedLeftFr + (gridState.storedRightFr / 2);
    const newCenterFr = gridState.storedCenterFr + (gridState.storedRightFr / 2);
    container.style.gridTemplateColumns = `${newLeftFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${newCenterFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px 0px`;
  } else if (side === 'right' && action === 'expand') {
    // Expand right panel, restore stored fr values
    container.style.gridTemplateColumns = `${gridState.storedLeftFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${gridState.storedCenterFr}fr ${CONSTANTS.UI.SEPARATOR_WIDTH}px ${gridState.storedRightFr}fr`;
  }
}

/**
 * Initialize collapse/expand functionality
 */
function initPanelCollapse() {
  $('#collapse-left').click(() => collapsePanel('left'));
  $('#expand-left').click(() => expandPanel('left'));
  $('#collapse-right').click(() => collapsePanel('right'));
  $('#expand-right').click(() => expandPanel('right'));
}

/**
 * Initialize all grid functionality
 */
function initGrid() {
  initGridResizing();
  initPanelCollapse();
}