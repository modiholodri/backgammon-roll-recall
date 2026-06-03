// default colors
const wonForeColor = 'rgba(0, 255, 0, 1)';
const wonBackColor = 'rgba(0, 255, 0, 0.3)';

const lostForeColor = 'rgba(255, 0, 255, 1)';
const lostBackColor = 'rgba(255, 0, 255, 0.3)';

const neutralForeColor = 'rgba(54, 162, 255, 1)';
const neutralBackColor = 'rgba(54, 162, 255, 0.3)';

const highColor = 'rgba(0, 255, 0, 1)';
const lowColor = 'rgba(255, 0, 255, 1)';

const expectedColor = 'rgba(255, 255, 0, 0.7)';

const playerLineColor = 'rgba(255, 255, 0, 1)';
const middleLineColor = 'rgba(0, 255, 255, 1)';

const chartColor = 'rgba(255, 255, 0, 0.7)';
const gridColor = { color: 'rgba(255, 255, 0, 0.3)' };

Chart.defaults.color = 'white';  // default text color
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.0)';  // don't show the default grid
Chart.defaults.plugins.legend.labels.color = chartColor;
Chart.defaults.scale.title.font = { size: 16, weight: 'bold' };
Chart.defaults.scale.title.color = chartColor;
Chart.defaults.layout.padding.top = 7;


let boardChart;

// If the Ranking chart already exists, destroy it before creating a new one
function destroyBoardChart(message) {
    if (boardChart) {
        boardChart.destroy();
        boardChart = null;
    }
    document.getElementById('boardChartCanvas').height = 0;
    document.getElementById('boardChartMessage').innerText = message;
}

// Dynamically adjust canvas height based on the number of players
function optimizeChartCanvasHeight(boardChartCanvas, numberOfPlayers) {
    const heightPerPlayer = 20; // Height per player in pixels
    const additionalHeight = 120;
    const minHeight = additionalHeight + heightPerPlayer; // Minimum height for the canvas
    document.getElementById(boardChartCanvas).height = Math.max(numberOfPlayers * heightPerPlayer + additionalHeight, minHeight);
}


function wholeNumbersOnly(value) {
    return Number.isInteger(value) ? value.toLocaleString() : null;
}


// Function to create or update the Matches chart
function updateMatchesPlayedChart(matchListSummary) {
    const ctx = document.getElementById('boardChartCanvas').getContext('2d');

    // Extract data for the chart
    let matchesPlayedRankingList =  document.getElementById('rankingListSelection').value === 'matchesPlayed';
    
    const players = matchesPlayedRankingList ?
                    Object.keys(matchListSummary).sort((a, b) => matchListSummary[b].matchesPlayed - matchListSummary[a].matchesPlayed || matchListSummary[b].matchesWon - matchListSummary[a].matchesWon) :
                    Object.keys(matchListSummary).sort((a, b) => (matchListSummary[b].matchesWon/matchListSummary[b].matchesPlayed)-(matchListSummary[a].matchesWon/matchListSummary[a].matchesPlayed));
    
    if (players.length < 1) return;
    
    const matchesWon = matchesPlayedRankingList ?
                        players.map(player => matchListSummary[player].matchesWon):
                        players.map(player => 100*matchListSummary[player].matchesWon/matchListSummary[player].matchesPlayed);
    
    const matchesLost = matchesPlayedRankingList ?
                        players.map(player => matchListSummary[player].matchesLost):
                        players.map(player => 100*matchListSummary[player].matchesLost/matchListSummary[player].matchesPlayed);

    const chartTitle = matchesPlayedRankingList ? 'Matches Played' : '% Matches Won';

    const yourName = document.getElementById('yourName').value.trim();
    const playerValue = matchesPlayedRankingList ? 0 : 100*matchListSummary[yourName]?.matchesWon/matchListSummary[yourName]?.matchesPlayed;

    setRememberedHiddenStates();
    destroyBoardChart('');
    optimizeChartCanvasHeight('boardChartCanvas', players.length);

    // Create the chart if it doesn't exist
    boardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: players, // Player names
            datasets: [
                {
                    label: 'Won',
                    hidden: hiddenStates[0],
                    data: matchesWon,
                    backgroundColor: wonBackColor,
                    borderColor: wonForeColor,
                    borderWidth: 1
                },
                {
                    label: 'Lost',
                    hidden: hiddenStates[1],
                    data: matchesLost,
                    backgroundColor: lostBackColor,
                    borderColor: lostForeColor,
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y', // Set the chart to horizontal
            responsive: true,
            maintainAspectRatio: false, // Allow the chart to resize freely
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const rank = context[0].dataIndex + 1;
                            return ` #${rank} ${context[0].label}`;
                        },
                        label: function(context) {
                            if (matchesPlayedRankingList) { // show the real matches won/lost   
                                const totalMatches = context.chart.data.datasets
                                    .reduce((sum, ds) => sum + Number(ds.data[context.dataIndex] || 0), 0);
                                return [` ${totalMatches} matches`, ` ${context.dataset.label} ${context.raw}`];
                            }
                            return [` ${context.dataset.label} ${context.raw.toFixed(1)}%`, ` of matches`];
                        }
                    }
                },
                legend: { position: 'bottom' },
                ...(matchesPlayedRankingList ? {} : {
                    annotation: {
                        annotations: {
                            fiftyPercentLine: {
                                type: 'line',
                                xMin: 50, // Y-axis value where the line starts
                                xMax: 50, // Y-axis value where the line ends
                                borderColor: middleLineColor,
                                borderDash: [5, 5],
                                borderWidth: 2,
                            },
                            playerValueLine: {
                                type: 'line',
                                display: playerValue,
                                xMin: playerValue, // Y-axis value where the line starts
                                xMax: playerValue, // Y-axis value where the line ends
                                borderColor: playerLineColor,
                                borderDash: [5, 5],
                                borderWidth: 2,
                            }
                        }
                    }
                })                    
            },
            scales: {
                x: {
                    title: {
                        text: chartTitle + getSelectedTimeInterval(),
                        display: true,
                    },
                    beginAtZero: true,
                    stacked: true,
                    position: 'top',
                    ticks: {
                        color: chartColor,
                        callback: wholeNumbersOnly,
                    },                            
                    grid: gridColor,
                },
                x2: {
                    position: 'bottom',
                    ticks: {
                        color: chartColor,
                        callback: wholeNumbersOnly,
                    },                            
                    afterDataLimits(scale) {
                        const xScale = scale.chart.scales.x;
                        if (xScale) {
                            scale.min = xScale.min;
                            scale.max = xScale.max;
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: { autoSkip: false } // show all the names
                }
            }
        }
    });
}