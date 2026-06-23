let blunders = typeof blunderStore !== 'undefined' && typeof blunderStore.getAllBlunders === 'function'
    ? blunderStore.getAllBlunders()
    : [];

let currentBlunder = -1; // start before first so showNext moves to 0

function showNextBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) return;

    currentBlunder = (currentBlunder + 1) % blunders.length;
    const blunder = blunders[currentBlunder];
    if (!blunder || typeof blunder.show !== 'function') return;
    blunder.show();
}

function showNextBlunderFromStore() {
    if (typeof blunderStore === 'undefined' || typeof blunderStore.getAllBlunders !== 'function') return;

    blunders = blunderStore.getAllBlunders();
    showNextBlunder();
}

