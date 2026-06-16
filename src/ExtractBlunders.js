

//! Position ID & Match ID

//! <span class="positionid">Position ID: <tt>72xBKAB9AAAAAA</tt> Match ID: <tt>cAmrAAAAAAAE</tt><br/>
const rgxPositionMatchID = new RegExp('^<span class="positionid">Position ID: <tt>(.+)</tt> Match ID: <tt>(.+)</tt><br/>');
function ExtractPositionMatchID(sLine)
{
    if (sLine.match(rgxPositionMatchID))
    {
        const mPositionMatchID = sLine.match(rgxPositionMatchID);
        const positionID = mPositionMatchID[1];
        const matchID = mPositionMatchID[2];
        return { positionID, matchID };
    }
}


const rgxComment = /^<!-- /;
const rgxEnd = /^<!-- End /;
function ReadHTML(file)
{

    let bHaveScore = false;
    let bHaveGameNumber = false;
    let bInHeader = false;
    let bInBoard = false;
    let bInMoveAnalysis = false;
    let bInCubeAnalysis = false;
    let iPossibleMoves = 0;
    let iPossibleCubes = 0;
    let iWorseMoves = -1;
    let dActualCheckerLostEquity = 0.0;
    let dActualCubeLostEquity = 0.0;

    // temp blunder info
    let positionID = null;
    let matchID = null;


    // let blunder = new Blunder();

    const lines = file.split('\n');
    for (let i = 0; i < lines.length; i++)
    {
        var sLine = lines[i];
        if (sLine != null)
        {
            if (sLine == "") continue;

            if (sLine.match(rgxComment))
            {
                if (!bInHeader && !bInMoveAnalysis && !bInCubeAnalysis)
                {
                    if (sLine == "<!-- Header -->") {
                        console.log("Found header");
                        // blunder = new Blunder();
                        bInHeader = true;
                    }
                    if (sLine == "<!--  Board -->") {
                        bInBoard = true;
                    }
                    if (sLine == "<!-- Move Analysis -->")
                    {
                        bInMoveAnalysis = true;
                        iPossibleMoves = 0;
                        iWorseMoves = -1;
                        dActualCheckerLostEquity = 0.0;
                    }
                    if (sLine == "<!-- Cube Analysis -->")
                    {
                        bInCubeAnalysis = true;
                        iPossibleCubes = 0;
                        dActualCubeLostEquity = 0.0;
                    }
                    if (sLine == "<!-- Game Statistics -->") break;
                }
                else if (sLine.match(rgxEnd))
                {
                    bInHeader = false;
                    bInBoard = false;
                    bInCubeAnalysis = false;

                    if (bInMoveAnalysis)
                    {
                        // AddPlayerOnRoll(iMasterSlot);
                        // AddCheckerER(iMasterSlot, dActualCheckerLostEquity, iPossibleMoves > 1);
                        // AddCubeER(iMasterSlot, 0.0, false);  // Add a fake ER just to make sure
                        // AddOverallER(iMasterSlot);

                        readMatchID(matchID);

                        if ( matchInfo.PlayerOnRoll === 1 && matchInfo.FirstDice !== 0 && matchInfo.SecondDice !== 0) {
                            const blunder = new Blunder({ positionID, matchID });
                            blunderStore.addBlunder(blunder).then((id) => {
                                console.log('Blunder added with ID:', positionID, ':', matchID);
                                blunder.show();
                            }).catch((error) => {
                                console.error('Failed to add blunder', error);
                            });
                        }

                        bInMoveAnalysis = false;
                    }
                    continue;
                }
            }

            if (!bInHeader && !bInMoveAnalysis && !bInCubeAnalysis)
            {
            }

            if (bInBoard)
            {
                const ids = ExtractPositionMatchID(sLine);
                if (ids)
                {
                    positionID = ids.positionID;
                    matchID = ids.matchID;
                }
            }

            if (bInMoveAnalysis)
            {
                // ExtractBlunderJoker(sLine);
                // if (DetectActualMove(sLine))
                // {
                //     if (bActualMove || iWorseMoves > -1) iWorseMoves++;
                // };

                // if (iWorseMoves <= nudWorseMovesToShow.Value && iPossibleMoves <= 5) // Limit the shown worse moves
                // {
                //     ExtractMoveMove(sLine);
                //     ExtractEvaluation(sLine);

                //     double dCheckerLostEquity = ExtractMoveEquity(sLine);
                //     if (!double.IsNaN(dCheckerLostEquity))
                //     {
                //         iPossibleMoves++;
                //         if (!double.IsNegativeInfinity(dCheckerLostEquity))
                //         {
                //             dActualCheckerLostEquity += dCheckerLostEquity;
                //         }
                //     }
                // }
            }
        }
    }
}




async function openAnalysisFile() {
    try {
        // Open the native system file picker
        const [fileHandle] = await window.showOpenFilePicker();
        
        // Get the file object from the system handle
        const file = await fileHandle.getFile();
        const contents = await file.text();
        
        // console.log("File content:", contents);
        ReadHTML(contents);
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
        id: '7LYBAB6zdwAAAA:UgmvAAAAAAAE',
        positionID: '7LYBAB6zdwAAAA',
        matchID: 'UgmvAAAAAAAE',
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