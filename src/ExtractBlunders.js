
async function openAnalysisFile() {
    try {
        // Open the native system file picker
        const [fileHandle] = await window.showOpenFilePicker();
        
        // Get the file object from the system handle
        const file = await fileHandle.getFile();
        const contents = await file.text();
        
        console.log("File content:", contents);
    } catch (err) {
        console.error("User cancelled or file access failed:", err);
    }
}


// add a sample blunder to the store for testing purposes
function addSampleBlunder() {
    const move1 = new Move(1, '18/13', '42.2 8.3 0.2', '57.8 14.4 0.4', '-0.156', '');
    const move2 = new Move(2, '13/8', '42.0 9.4 0.3', '58.0 15.8 0.6', '-0.160', '(-0.030)');
    const move3 = new Move(3, '6/1*', '41.0 8.8 0.2', '59.0 15.7 0.8', '-0.179', '(-0.060)');
    const move4 = new Move(4, '24/21 18/16', '41.0 8.3 0.3', '59.0 16.8 0.6', '-0.181', '(-0.090)');
    const move5 = new Move(5, '13/10 6/4', '40.1 9.2 0.4', '59.9 20.4 1.5', '-0.197', '(-0.120)');
    
    const sampleBlunder = new Blunder({
        // 7LYBAB6zdwAAAA:UgmvAAAAAAAE
        id: '7LYBAB6zdwAAAA:UgmvAAAAAAAE',
        positionId: '7LYBAB6zdwAAAA',
        matchId: 'UgmvAAAAAAAE',
        // positionId: 'bg4AAP4vgEABAA',
        // matchId: 'UYmmAAAAAAAE',
        // positionId: '4HPGESDgc/BBIA',
        // matchId: 'cIkpAAAAAAAE',
        alert: 'Alert: bad move ( -0.025)',
        moves: [move1, move2, move3, move4, move5],
    });
    
    blunderStore.addBlunder(sampleBlunder).then((id) => {
        console.log('Sample blunder added with ID:', id);
    }).catch((error) => {
        console.error('Failed to add sample blunder', error);
    });

    sampleBlunder.show();
}