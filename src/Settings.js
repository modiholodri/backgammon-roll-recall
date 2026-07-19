// load the settings once the DOM is ready
document.addEventListener('DOMContentLoaded', loadSettings);

// Save settings to localStorage before the page is unloaded
window.addEventListener('beforeunload', saveSettings);

// load the toggle settings of a specific toggle element
function loadToggleSetting(elementName, defaultState = 'expanded') {
    const toggleState = localStorage.getItem(elementName + 'State') || defaultState;
    const element = document.getElementById(elementName);
    toggleState === 'expanded' ? element.classList.add('show') : element.classList.remove('show');
}

function loadCheckedSetting(elementName, defaultValue) {
    const checked = localStorage.getItem(elementName) || defaultValue;
    document.getElementById(elementName).checked = checked === 'true';
}

function loadValueSetting(elementName, defaultValue) {
    document.getElementById(elementName).value = localStorage.getItem(elementName) || defaultValue;
}

// save the settings of a toggle element to localStorage
function saveToggleSetting(elementName) {
    const matchReportFormCollapsed = document.getElementById(elementName).classList.contains('show') ? 'expanded' : 'collapsed';
    localStorage.setItem(elementName + 'State', matchReportFormCollapsed);
}

// save the value of a specific element to localStorage
function saveValueSetting(elementName) {
    const elementValue = document.getElementById(elementName).value;
    localStorage.setItem(elementName, elementValue);
}

// save the value of a specific element to localStorage
function saveCheckedSetting(elementName) {
    const checked = document.getElementById(elementName).checked;
    localStorage.setItem(elementName, checked);
}

// Load settings from localStorage
function loadSettings() {
    // Theme Selection
    loadValueSetting('themeSelection', 'system-theme');
    loadValueSetting('acceptedLostEquity', '0.011');
    loadValueSetting('doubtfulLostEquity', '0.030');
    loadValueSetting('prettyBadLostEquity', '0.060');
    loadValueSetting('veryBadLostEquity', '0.120');
    themeSelectionChanged();
}

// Save settings to localStorage
function saveSettings() {
    // Settings
    saveValueSetting('themeSelection'); 
    saveValueSetting('acceptedLostEquity'); 
    saveValueSetting('doubtfulLostEquity'); 
    saveValueSetting('prettyBadLostEquity'); 
    saveValueSetting('veryBadLostEquity'); 
}