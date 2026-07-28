# Backgammon Roll Recall

Play matches against GNU Backgammon (further on only referred to as GNU), analyze your matches, extract your mistakes and learn from them.
You’ll face these critical moments repeatedly until you master them, ensuring you never make the same mistake again.

Before you start [Adjust the GNU Settings](#Adjust-the-GNU-Settings).

The basic process is as follows:

- [Play a Match in GNU](#Play-a-Match-in-GNU)
- [Analyze the Match with GNU](#Analyze-the-Match-with-GNU)
- [Export the Match from GNU](#Export-the-Match-from-GNU)
- [Extract Blunders in BG Roll Recall](#Extract-Bklunders-in-BG-Roll-Recall)
- [Digest Blunders in BG Roll Recall](#Face-the-Mistakes-in-BG-Roll-Recall)


### Play a Match in GNU

Click on New and select the options according to your match preferences. 
For tips and tricks how to play against GNU read the GNU User Manual.


### Analyze the Match with GNU

In the menu go to Analyze - Analyze Match or Session. 
It'll take a minute or two until GNU did it's calculations.


### Export the Match from GNU

After the match has been analyzed click on **Save**. 
You can leave the default name as it is but select HTML as file format.


### Extract Blunders in BG Roll Recall

Click the **Extract** button and select all the analysis files from which you want to extract the blunders. 
Multiple files can be selected at once. BG Roll Recall extracts the blunders only once.


### Digest Blunders in BG Roll Recall

Extracted mistakes are converted into question/answer situations.
A question contains up to five moves.
To answer a question just select a move from the available optinos by clicking on it.

Basic operation includes...
- Click on Roll Recall to toggle full screen mode.
- Click on the Ego-Bruising Scale to show/hide additional information like the Performance Rating, the Error Rate, the Question Level and the Times Asked.
- Click on the board to go to the next question.
- Click on an Option to answer the question.
- Click on the Recycle Bin to delete the question.
- Click on the Move Info to go to the next question.
- Click on the Recycle icon to show the answers without answering the question.

More information is shown...

<img width="455" height="87" alt="image" src="https://github.com/user-attachments/assets/9c5dfb75-440f-4890-b128-217ccd307989" />

The detailed information shown for each move is the same as in GNU.

<img width="444" height="120" alt="image" src="https://github.com/user-attachments/assets/193102b1-e4cb-4875-9dfa-5cd8a7c85f29" />

The Chances are the Winning Chances, but arranged a little bit differently.

- Win Match - Lose Match
- Win Gammon - Lose Gammon
- Win Backgammon - Lose Gammon

##### Blunder Store

The Blunder Store is used to show basic statistics and manage your blunders. 
Click on the Blunder Store heading to refresh the statistics.

- **Import** reads blunders stored as JSON file.
- **Extract** gets the blunders from a GNU Analysis file in HTML format.
- **Export** exports the blunders in the Blunder Store as JSON file.
- **Delete All** deletes all blunders in the Blunder Store.

##### Read Me

The Read Me section just shows the information you are reading now.

##### Settings

In the Settings you can adjust the equity values to your skills level.

- **Accepted Lost Equity** Mistakes with less lost equity are not extracted from the HTML analysis.
  If an option with less lost equity is selected it is counted as passed.
- **Doubtful Lost Equity** is used to indicate the severity of the mistake and shown in yellow color.
- **Pretty Bad Lost Equity** is used to indicate the severity of the mistake and shown in red color.
- **Very Bad Lost Equity** is used to indicate the severity of the mistake and shown in magenta color.

You can select a dark, light or system theme.

##### Tip of the Day

Shows useful stuff concerning Backgammon. Click on the Tip of the Day heading to show the next tip.

## Adjust the GNU Settings

The GNU Settings have to be adjusted only once.

###### GNU Player Settings

Use Player 1 in GNU for all matches. Fill in your Player name in the GNU Player Settings.

###### GNU Analysis Settings

Check all the checkboxes in the GNU Analysis Settings and the Analysis Level to Grandmaster. The Skills and Luck Thresholds define how much will be exported and later shown in BG Roll Recall.

###### GNU Export Settings

In the GNU Export Settings uncheck following two and check all other export settings. Set Show at Most 5 Moves to five.

- Show Evaluation Parameters
- Show Rollout Parameters

###### GNU Display Options

In the GNU Display Options uncheck the following setting:

- Match Equity as MWC

and check the following two setting:

- GWC as Percentage
- MWC as Percentage
