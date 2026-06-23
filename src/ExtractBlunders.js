let actualMove = false;
const nudWorseMovesToShow = 0;


// temp blunder info
let positionID = null;
let matchID = null;
let alert = "";
let moves = [];
let level = 0;
let actualLostEquity = 0.000;

function ResetTempBlunderInfo()
{
    positionID = null;
    matchID = null;
    alert = "";
    moves = [];
    level = 0;
    actualLostEquity = 0.000;
}

// temp move info
let rank = 0;
let move = '';
let equity = '';
let lostEquity = '';
let chances = '';

function ResetTempMoveInfo()
{
    rank = 0;
    move = '';
    equity = '';
    lostEquity = '';
    chances = '';
}



//* Position ID & Match ID

//! <span class="positionid">Position ID: <tt>72xBKAB9AAAAAA</tt> Match ID: <tt>cAmrAAAAAAAE</tt><br/>
const rgxPositionMatchID = new RegExp('^<span class="positionid">Position ID: <tt>(.+)</tt> Match ID: <tt>(.+)</tt><br/>');
function ExtractPositionMatchID(sLine)
{
    if (sLine.match(rgxPositionMatchID))
    {
        const mPositionMatchID = sLine.match(rgxPositionMatchID);
        positionID = mPositionMatchID[1];
        matchID = mPositionMatchID[2];
    }
}


//* Detect Actual Move 

//! <td class="movenumber">&bull; </td>
//! <td class="movenumber">&nbsp;</td>
const rgxUsedMove = new RegExp('^<td class="movenumber">&bull;');
const rgxNotUsedMove = new RegExp('^<td class="movenumber">&nbsp;');

function DetectActualMove(sLine)
{
    // Change the color for the used move
    if (sLine.match(rgxUsedMove))
    {
        actualMove = true;
        return true; // A new move has been detected
    }

    // Change the color for not used moves
    if (sLine.match(rgxNotUsedMove))
    {
        actualMove = false;
        return true; // A new move has been detected
    }
    return false; // No new move has been detected
}


//** Move Move

//! <td class="movemove">8/3 7/3</td>
const rgxMoveMove = new RegExp('^<td class="movemove');

function ExtractMoveMove(sLine)
{
    if (sLine.match(rgxMoveMove))
    {
        move = Middle(sLine, 21, 5);

        if (actualMove) console.log("  Actual Move: " + move);
        else             console.log("   Other Move : " + move);
    }
}

//* Move Equity

//! <td class="moveequity">+0.035</td>
//! <td class="moveequity">+0.030 (-0.006)</td>
const rgxMoveEquity = new RegExp('^<td class="moveequity');

function ExtractMoveEquity(sLine)
{
    if (sLine.match(rgxMoveEquity))
    {
        const sMoveEquity = Middle(sLine, 23, 5);
        [equity, lostEquity] = sMoveEquity.split(' ');
        if ( lostEquity === undefined ) lostEquity = '';
        
        if ( actualMove ) {
            actualLostEquity = Number(lostEquity.match(rgxLostEquity));
        }
        console.log("   " + sMoveEquity);
    }
}



//* Move Chances

//! <td colspan = "3" > &nbsp;</td>
//! <td> 42.8   7.7   0.0 -  57.2   5.0   0.1</td>
const rgxBeforeMoveChances = new RegExp('^<td colspan="3">&');
let bMoveChancesNext = false;
function ExtractMoveChances(sLine)
{
    if (bMoveChancesNext)
    {
        chances = Middle(sLine, 4, 5);
        console.log("   " + chances);
        actualMove = false;
        bMoveChancesNext = false;
        moves.push(new Move(moves.length + 1, move, chances, equity, lostEquity));
        ResetTempMoveInfo();
    }
    if (rgxBeforeMoveChances.test(sLine))
    {
        bMoveChancesNext = true;
    }
}


//* Parse the HTML file

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
                        ResetTempBlunderInfo();
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
                        readMatchID(matchID);

                        if ( actualLostEquity > 0.0 && matchInfo.PlayerOnRoll === 1 && matchInfo.FirstDice !== 0 && matchInfo.SecondDice !== 0 ) {
                            const blunder = new Blunder({ positionID, matchID, moves });
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
                ExtractPositionMatchID(sLine);
            }

            if (bInMoveAnalysis)
            {
                // ExtractBlunderJoker(sLine);
                if (DetectActualMove(sLine))
                {
                    if (actualMove || iWorseMoves > -1) iWorseMoves++;
                };

                if (iWorseMoves <= nudWorseMovesToShow && iPossibleMoves <= 5) // Limit the shown worse moves
                {
                    ExtractMoveMove(sLine);
                    ExtractMoveChances(sLine);
                    ExtractMoveEquity(sLine);
                }
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

function Middle(sLine, startFromBeginning, endFromEnd)
{
    if (typeof sLine !== 'string') return '';
    const beginIndex = Math.max(0, startFromBeginning);
    const endIndex = Math.max(beginIndex, sLine.length - Math.max(0, endFromEnd));
    return sLine.substring(beginIndex, endIndex);
}