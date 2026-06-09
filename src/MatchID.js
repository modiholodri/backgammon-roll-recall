if (typeof matchInfo === 'undefined') var matchInfo = {};
    
function readMatchID(sMatchID) {
    const baDecodedBytes = atob(sMatchID);
    if (baDecodedBytes.length !== 9) return null;

    //! Cube
    //! Bit 1-4 contains the 2-logarithm of the cube value.For example, a 8-cube is encoded as 0011 binary(or 3), since 2 to the power of 3 is 8.
    //! The maximum value of the cube in with this encoding is 2 to the power of 15, i.e., a 32768-cube.
    const iEncodedCube = getValue(baDecodedBytes, 1, 4);
    if (iEncodedCube === 0) matchInfo.Cube = 64;
    else matchInfo.Cube = Math.pow(2, iEncodedCube);

    //! Bit 5-6 contains the cube owner. 00 if player 0 owns the cube, 01 if player 1 owns the cube, or 11 for a centered cube.
    matchInfo.CubeOwner = getValue(baDecodedBytes, 5, 6);

    //! Bit 7 is the player on roll or the player who did roll (0 and 1 for player 0 and 1, respectively).
    matchInfo.PlayerOnRoll = getValue(baDecodedBytes, 7);

    //! Bit 8 is the Crawford flag: 1 if this game is the Crawford game, 0 otherwise.
    matchInfo.CrawfordGame = getValue(baDecodedBytes, 8);

    //! Bit 9-11 is the game state: 000 for no game started, 001 for playing a game, 010 if the game is over, 011 if the game was resigned, or 100 if the game was ended by dropping a cube.
    matchInfo.GameState = getValue(baDecodedBytes, 9, 11);

    //! Bit 12 indicates whose turn it is. For example, suppose player 0 is on roll then bit 7 above will be 0. Player 0 now decides to double, this will make bit 12 equal to 1, 
    //! since it is now player 1's turn to decide whether she takes or passes the cube.
    matchInfo.PlayersTurn = getValue(baDecodedBytes, 12);

    //! Bit 13 indicates whether an doubled is being offered. 0 if no double is being offered and 1 if a double is being offered.
    matchInfo.DoubleOffered = getValue(baDecodedBytes, 13);

    //! Bit 14-15 indicates whether an resignation was offered. 00 for no resignation, 01 for resign of a single game, 10 for resign of a gammon, or 11 for resign of a backgammon. 
    //! The player offering the resignation is the inverse of bit 12, e.g., if player 0 resigns a gammon then bit 12 will be 1 (as it is now player 1 now has to decide whether to accept or reject the resignation) 
    //! and bit 13-14 will be 10 for resign of a gammon.
    matchInfo.ResignationOffered = getValue(baDecodedBytes, 14, 15);

    //! Bit 16-18 and bit 19-21 is the first and second die, respectively. 0 if the dice has not yet be rolled, otherwise the binary encoding of the dice, e.g., if 5-2 was rolled bit 16-21 will be 101-010.
    matchInfo.FirstDice = getValue(baDecodedBytes, 16, 18);
    matchInfo.SecondDice = getValue(baDecodedBytes, 19, 21);

    //! Bit 22 to 36 is the match length. The maximum value for the match length is 32767. A match score of zero indicates that the game is a money game.
    matchInfo.MatchLength = getValue(baDecodedBytes, 22, 36);

    //! Bit 37-51 and bit 52-66 is the score for player 0 and player 1 respectively.The maximum value of the match score is 32767.
    matchInfo.Player0Score = getValue(baDecodedBytes, 37, 51);
    matchInfo.Player1Score = getValue(baDecodedBytes, 52, 66);
}

function getBit(baDecodedBytes, iBitPosition)
{
    // 01234567 89012345 67890123
    iBitPosition -= 1;  // Make it match the GNU Backgammon MatchID description
    let iBytePosition = Math.floor(iBitPosition / 8);
    let bBitMask = 1;
    bBitMask <<= iBitPosition % 8;
    let bByte;
    if (typeof baDecodedBytes === 'string') {
        bByte = baDecodedBytes.charCodeAt(iBytePosition);
    } else {
        bByte = baDecodedBytes[iBytePosition];
    }
    bByte &= bBitMask;
    return bByte != 0 ? 1 : 0;
}

function getValue(baDecodedBytes, iIndex)
{
    return getBit(baDecodedBytes, iIndex);
}

function getValue(baDecodedBytes, iFromIndex, iToIndex)
{
    let iValue = 0;
    let iShift = 0;
    for (let iIndex = iFromIndex; iIndex < iToIndex; iIndex++, iShift++)
    {
        iValue += getBit(baDecodedBytes, iIndex) << iShift;
    }
    iValue += getBit(baDecodedBytes, iToIndex) << iShift;
    return iValue;
}
