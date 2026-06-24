let blunders = [];
let currentBlunder = -1; // start before first so showNext moves to 0

function loadBlunders(result, callback) {
    if (result && typeof result.then === 'function') {
        result.then(data => {
            blunders = Array.isArray(data) ? data : [];
            if (typeof callback === 'function') callback();
        }).catch(() => {
            blunders = [];
        });
    } else {
        blunders = Array.isArray(result) ? result : [];
        if (typeof callback === 'function') callback();
    }
}

if (typeof blunderStore !== 'undefined' && typeof blunderStore.getAllBlunders === 'function') {
    loadBlunders(blunderStore.getAllBlunders());
}

function showNextBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) {
        console.log('No blunders available');
        return;
    }

    currentBlunder = (currentBlunder + 1) % blunders.length;

    const blunder = new Blunder(blunders[currentBlunder]);
    console.log('Showing blunder:', currentBlunder, blunder);
    
    if (typeof blunder.show === 'function') {
        blunder.show.call(blunder);
    } else {
        console.log('Blunder.show is not a function:', typeof blunder.show);
    }
}

function showNextBlunderFromStore() {
    if (typeof blunderStore === 'undefined' || typeof blunderStore.getAllBlunders !== 'function') return;

    loadBlunders(blunderStore.getAllBlunders(), showNextBlunder);
}

