# Backgammon Roll Recall

Play games against GNU Backgammon, extract your mistakes and learn from them.

Welcome to BG Roll Recall, your ultimate companion for improving your backgammon skills! This innovative app allows you to learn from your analyzed matches by providing insights into your Performance Rating (PR), Equity and Wining Chances of your Blunders and other information.

But that’s not all! BG Roll Recall identifies all the blunders made during your matches and gives you the opportunity to correct them. You’ll face these critical moments repeatedly until you master them, ensuring you never make the same mistake twice.

Elevate your game and become a backgammon master with BG Roll Recall!


### Contents

[Basic Process](#Basic-Process)
[Main Views](#Main-Views)
[BG Roll Recall Modes](#Double-Vision-Modes)
[Adjust the GNU Settings](#Adjust-the-GNU-Settings)
[Glossary](#Glossary)


## Basic Process

BG Roll Recall is used together with GNU Backgammon (further on only referred to as GNU) to play, analyze and learn from your matches.

The basic process is as follows:

- Adjust the GNU Backgammon Settings (only once).
- [Play a Match in GNU](#Play-a-Match-in-GNU)
- [Analyze the Match with GNU](#Analyze-the-Match-with-GNU)
- [Export the Match from GNU](#Export-the-Match-from-GNU)
- [Load the Match in BG Roll Recall](#Load-the-Match-in-Double-Vision)
- [Checkout the Match in BG Roll Recall](#Checkout-the-Match-in-Double-Vision)
- [Extract Mistakes in BG Roll Recall](#Extract-Mistakes-in-Double-Vision)
- [Face the Mistakes in BG Roll Recall](#Face-the-Mistakes-in-Double-Vision)
- Start the next cycle from step two.


### Play a Match in GNU

Click on New and select the options according to your match preferences. For tips and tricks how to play against GNU read the GNU User Manual.


### Analyze the Match with GNU

In the menu go to Analyze - Analyze Match or Session. It'll take a minute or two until GNU did it's calculations. Have a look at the summary.


### Export the Match from GNU

After the match has been analyzed click on **Save**. You can leave the default name as it is but select HTML as file format. BG Roll Recall extracts the blunders only once.


### Load the Match in BG Roll Recall

Click the **Extract** button and select all the analysis files from which you want to extract the blunders. Multiple files can be selected at once.


## Main View

On the chances are the Match Winning Chances, same as in GNU, but arranged a little bit differently.

- Win Match - Lose Match
- Win Gammon - Lose Gammon
- Win Backgammon - Lose Gammon

### Digesting Mode

Face past extracted mistakes. Extracted mistakes are converted into question/answer situations.

If the mistake was Checker Play related, it contains up to five moves, including the best move until the worst move (the one taken during the match).

To answer a question just select a move from the available choices by clicking on it.

If a question is answer right, the next question will be asked.

## Adjust the GNU Settings

The GNU Settings have to be adjusted only once.

[GNU Player Settings](#GNU-Player-Settings)
[GNU Analysis Settings](#GNU-Analysis-Settings)
[GNU Export Settings](#GNU-Export-Settings)
[GNU Display Options](#GNU-Display-Options)


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


## Glossary

[Blunder](#Blunder)
[Equity](#Equity)
[Error Rate](#Error-Rate)


###### Blunder

A large checker play or cube error, especially one made out of recklessness or inattention.

###### Equity

The value of a position to one of the players. Equity is the sum of the values of the possible outcomes from a given position with each value multiplied by its probability of occurrence. It is the same as the fair settlement value of the position. Your equity is the negative of your opponent's equity.

###### Error Rate

A measure of the average equity lost per move due to errors in play. The lost equity can be measured either in match-winning chances or EMG equity.
