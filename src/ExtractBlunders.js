// add a sample blunder to the store for testing purposes
function addSampleBlunder() {
    const move1 = new Move(1, '13/7*', '47.9 13.4 0.6', '52.1 14.5 0.9', '-0.042', '');
    const move2 = new Move(2, '8/7* 6/1*', '47.9 13.4 0.6', '52.4 15.7 1.1', '-0.048', '(-0.006)');
    
    const sampleBlunder = createBlunderObject({
        positionId: '4HPhASjgc/ABMA',
        matchId: 'cImpAAAAAAAE',
        alert: 'Alert: doubtful move ( -0.057)',
        moves: [move1, move2],
    });
    
    blunderStore.addBlunder(sampleBlunder).then((id) => {
        console.log('Sample blunder added with ID:', id);
    }).catch((error) => {
        console.error('Failed to add sample blunder', error);
    });

    showBlunder(sampleBlunder);
}