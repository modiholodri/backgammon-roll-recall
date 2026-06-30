let actualMove = false;

// temp blunder info
let positionID = null;
let matchID = null;
let moves = [];
let actualLostEquity = 0.000;

function ResetTempBlunderInfo()
{
    positionID = null;
    matchID = null;
    moves = [];
    actualLostEquity = 0.000;
}

// temp move info
let move = '';
let equity = '';
let lostEquity = '';
let chances = '';

function ResetTempMoveInfo()
{
    move = '';
    equity = '';
    lostEquity = '';
    chances = '';
}


//* Position ID & Match ID

//! <span class="positionid">Position ID: <tt>72xBKAB9AAAAAA</tt> Match ID: <tt>cAmrAAAAAAAE</tt><br/>
const rgxPositionMatchID = new RegExp('^<span class="positionid">Position ID: <tt>(.+)</tt> Match ID: <tt>(.+)</tt><br/>');
function ExtractPositionMatchID(line)
{
    if (line.match(rgxPositionMatchID))
    {
        const mPositionMatchID = line.match(rgxPositionMatchID);
        positionID = mPositionMatchID[1];
        matchID = mPositionMatchID[2];
    }
}


//* Detect Actual Move 

//! <td class="movenumber">&bull; </td>
//! <td class="movenumber">&nbsp;</td>
const rgxUsedMove = new RegExp('^<td class="movenumber">&bull;');
const rgxNotUsedMove = new RegExp('^<td class="movenumber">&nbsp;');

function DetectActualMove(line)
{
    if (line.match(rgxUsedMove))
    {
        actualMove = true;
    }

    if (line.match(rgxNotUsedMove))
    {
        actualMove = false;
    }
}


//** Move Move

//! <td class="movemove">8/3 7/3</td>
const rgxMoveMove = new RegExp('^<td class="movemove');

function ExtractMoveMove(line)
{
    if (line.match(rgxMoveMove))
    {
        move = Middle(line, 21, 5);

        if (actualMove) console.log("  Actual Move: " + move);
        else            console.log("   Other Move: " + move);
    }
}

//* Move Equity

//! <td class="moveequity">+0.035</td>
//! <td class="moveequity">+0.030 (-0.006)</td>
const rgxMoveEquity = new RegExp('^<td class="moveequity');

function ExtractMoveEquity(line)
{
    if (line.match(rgxMoveEquity))
    {
        const sMoveEquity = Middle(line, 23, 5);
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
let moveChancesNext = false;
function ExtractMoveChances(line)
{
    if (moveChancesNext)
    {
        chances = Middle(line, 4, 5);
        console.log("   " + chances);
        actualMove = false;
        moveChancesNext = false;
        if (moves.length < 5) {
            moves.push(new Move(move, chances, equity, lostEquity));
        }
        ResetTempMoveInfo();
    }
    if (rgxBeforeMoveChances.test(line))
    {
        moveChancesNext = true;
    }
}


//* Parse the HTML file

const rgxComment = /^<!-- /;
const rgxEnd = /^<!-- End /;
function ReadHTML(file)
{
    let addedBlunders = 0;

    let inHeader = false;
    let inBoard = false;
    let inMoveAnalysis = false;
    let inCubeAnalysis = false;

    const acceptedLostEquityElement = document.getElementById('acceptedLostEquity');
    const acceptedLostEquity = Number(acceptedLostEquityElement.value);

    const lines = file.split('\n');
    for (let i = 0; i < lines.length; i++)
    {
        let line = lines[i];
        if (line != null)
        {
            if (line == "") continue;

            if (line.match(rgxComment))
            {
                if (!inHeader && !inMoveAnalysis && !inCubeAnalysis)
                {
                    if (line == "<!-- Header -->") {
                        console.log("Found header");
                        ResetTempBlunderInfo();
                        inHeader = true;
                    }
                    if (line == "<!--  Board -->") {
                        inBoard = true;
                    }
                    if (line == "<!-- Move Analysis -->") {
                        inMoveAnalysis = true;
                    }
                    if (line == "<!-- Cube Analysis -->") {
                        inCubeAnalysis = true;
                    }
                    if (line == "<!-- Game Statistics -->") break;
                }
                else if (line.match(rgxEnd))
                {
                    inHeader = false;
                    inBoard = false;
                    inCubeAnalysis = false;

                    if (inMoveAnalysis)
                    {
                        readMatchID(matchID);

                        if ( actualLostEquity > acceptedLostEquity && matchInfo.PlayerOnRoll === 1 && matchInfo.FirstDice !== 0 && matchInfo.SecondDice !== 0 ) {
                            addedBlunders++;
                            const blunder = new Blunder({ positionID, matchID, moves });
                            blunderStore.addBlunder(blunder).then((id) => {
                                console.log('Blunder added with ID:', positionID, ':', matchID);
                            }).catch((error) => {
                                console.error('Failed to add blunder', error);
                            });
                        }

                        inMoveAnalysis = false;
                    }
                    continue;
                }
            }

            if (inBoard)
            {
                ExtractPositionMatchID(line);
            }

            if (inMoveAnalysis)
            {
                DetectActualMove(line);
                ExtractMoveMove(line);
                ExtractMoveChances(line);
                ExtractMoveEquity(line);
            }
        }
    }
    alert("Finished parsing HTML analysis file. Added " + addedBlunders + " blunders to the Blunder Store.");
}


async function extractBlunders() {
    try {
        // Open the native system file picker
        const [fileHandle] = await window.showOpenFilePicker();
        
        // Get the file object from the system handle
        const file = await fileHandle.getFile();
        const contents = await file.text();
        
        ReadHTML(contents);
    } catch (err) {
        console.error("User cancelled or file access failed:", err);
    }
}

function Middle(line, startFromBeginning, endFromEnd)
{
    if (typeof line !== 'string') return '';
    const beginIndex = Math.max(0, startFromBeginning);
    const endIndex = Math.max(beginIndex, line.length - Math.max(0, endFromEnd));
    return line.substring(beginIndex, endIndex);
}