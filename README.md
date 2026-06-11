# Backgammon Roll Recall

Play games against GNU Backgammon, extract your mistakes and learn from them.

Welcome to BG Roll Recall, your ultimate companion for improving your backgammon skills! This innovative app allows you to analyze your matches by providing detailed insights into your Performance Rating (PR), Equity, Wining Chances, Blunders, Jokers Anti-Jokers and other information.

But that’s not all! BG Roll Recall identifies all the blunders made during your matches and gives you the opportunity to correct them. You’ll face these critical moments repeatedly until you master them, ensuring you never make the same mistake twice.

Elevate your game and become a backgammon master with BG Roll Recall!


### Contents

[Basic Process](#Basic-Process)
[Main Views](#Main-Views)
[BG Roll Recall Modes](#Double-Vision-Modes)
[Adjust the GNU Settings](#Adjust-the-GNU-Settings)
[Glossary](#Glossary)


## Basic Process

BG Roll Recall is used together with GNU Backgammon (further on only referred to as GNU) to play and analyze the matches.

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

Note: For the chart to make sense, both players have to be anlysed.


### Export the Match from GNU

After the match has been analyzed click on **Save**. You can leave the default name as it is but select HTML as file format. If matches are not kept, the default name can be reused. BG Roll Recall extracts the blunders only once.

Note: Create a special folder called Matches and save your metches all the time in there. Copy the html-images folder in the Matches folder so that you can look at the output in a normal webbrowser.


### Load the Match in BG Roll Recall

Click the **Load** button. If it is the first match for the day and it has been save under the default name from GNU, select the first HTML file of the match with only the base name and without the \_002, \_003, \_004 ending.


### Face the Mistakes in BG Roll Recall

Learning is done in the Board view. Only the mistake categories selected in the **Chart** view are extracted.


## Main Views

[Performance Rating View](#Performance-Rating-View)
[Cube Decision View](#Cube-Decision-View)


On the chances are the Match Winning Chances, same as in GNU, but arranged a little bit differently.

- Win Match - Lose Match
- Win Gammon - Lose Gammon
- Win Backgammon - Lose Gammon


### Performance Rating View

The **Performance Rating** view has 4 sections showing different performance rating statistics.

[Player Performance Rating](#Player-Performance-Rating)
[Checker Play Performance Rating](#Checker-Play-Performance-Rating)
[Cube Play Performance Rating](#Cube-Play-Performance-Rating)
[This Position Performance Rating](#This-Position-Performance-Rating)


The performance rating information shown is basically the same for all 4 sections and just summed up differently.

- Section  ->  GNU Error Rating in Clear Text
- ET EMG / Dec  ->  Sum of Lost Equity / Decisions Made
- ER mEMG / PR  ->  GNU Error Rate / Extreme Gammon Performance Rating

ET means Error Total. ER means Error Rate. EMG means Equivalent to Money Game. mEMG is the normalized Equivalent to Money Game, i.e. the total error EMG divided by the number of decisions and multiplied with 1000.

This section shows the performance since BG Roll Recall has been started.


###### Player Performance Rating

The performance of the player, including Checker Play Performance and Cube Play Performance.


###### Checker Play Performance Rating

The performance only concerned with **Checker Play**.


###### Cube Play Performance Rating

The performance only concerned with **Cube Play**.


###### This Position Performance Rating

The performance only concerned with that blunder/mistake. In **Analyzing** mode it is only concerned with the single selected blunder. In **Digesting** / **Scrutinizing** mode it is the includes the answers of each time the question has been asked.


### Cube Decision View

The **Cube Decision** view shows the basic information about the the Cube Decision analysis from GNU.


### Digesting Mode

Face past extracted mistakes. During Digesting mode only information during the Match is available. Extracted mistakes are converted into question/answer situations.

If the mistake was Checker Play related, it contains up to five moves, including the best move until the worst move (the one taken during the match). Worse moves are not included than the one taken during the match are not included.

To answer a question just select a move from the available choices by clicking on it with the mouse. Alternatively you can click the corresponding number.

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

[Accept a Double](#Accept-a-Double)
[Anti-Joker](#Anti-Joker)
[Blunder](#Blunder)
[Checker Play](#Checker-Play)
[Cube Action](#Cube-Action)
[Cube Play](#Cube-Play)
[Cube Decision](#Cube-Decision)
[Cubeless Equity](#Cubeless-Equity)
[Cubeful Equity](#Cubeful-Equity)
[Double](#Double)
[Double, take](#Double,-take)
[Double, pass](#Double,-pass)
[EMG Equity](#EMG-Equity)
[Equity](#Equity)
[Error Rate](#Error-Rate)
[FIBS Rating](#FIBS-Rating)
[Game Winning Chances](#Game-Winning-Chances)
[Joker](#Joker)
[Match Equity](#Match-Equity)
[Match Winning Chances](#Match-Winning-Chances)
[MWC](#MWC)
[Money Play](#Money-Play)
[No double](#No-double)
[Pass](#Pass)
[Pip Count](#Pip-Count)
[Rating](#Rating)
[Refuse a Double](#Refuse-a-Double)
[Take](#Take)
[Too Good to Double](#Too-Good-to-Double)


###### Accept a Double

To agree to continue playing a game at twice the previous stakes after the opponent offers a double.

###### Anti-Joker

A very bad roll; the opposite of a joker.

###### Blunder

A large checker play or cube error, especially one made out of recklessness or inattention.

###### Checker Play

1. The movement of the checkers according to numbers on the dice.
2. The art or skill of moving the checkers.

###### Cube Action

All of the cube decisions associated with a given position, namely: (a) whether the player on roll should double, and (b) whether his opponent should accept the double, refuse the double, or possibly beaver.

###### Cube Play

1. The act of offering a double, or the act of accepting or refusing the opponent's double.
2. The art or skill of making cube decisions.

###### Cube Decision

The choice of whether or not to offer a double, or the choice of whether to accept, or refuse a double that has been offered.

###### Cubeless Equity

The value of a position if the game is played without a doubling cube. This is a value between -3 and +3 and is equal to P(W) + P(Wg) + P(Wbg) - P(L) - P(Lg) - P(Lbg), where P(W) is the probability of winning the game, P(Wg) is the probability of winning a gammon (or backgammon), P(Wbg) is the probability of winning a backgammon, P(L) is the probability of losing the game, P(Lg) is the probability of losing a gammon (or backgammon), P(Lbg) is the probability of losing a backgammon.

###### Cubeful Equity

In money play with the doubling cube, the absolute value of a position to one of the players compared to the initial stake being played for.  See: Equity. Cubeful equity considers the current value of the cube, cube ownership, and the potential for future doubles. In match play, cubeful equity corresponds to the probability of winning the match from the current position. 

###### Double

An offer made by one player to his opponent during the course of the game (on that player's turn, but before he has rolled the dice) to continue the game at twice the current stakes. The opponent may refuse the double, in which case he resigns the game and loses the current (undoubled) stakes. Otherwise, he must accept the double and the game continues at double the previous stakes. A player who accepts a double becomes owner of the cube and only he may make the next double in the same game.

###### Double, take

The equity GNU estimates you will have if you double, and your opponent accepts.

###### Double, pass

The equity GNU estimates you will have if you double, and your opponent accepts.

###### EMG Equity

Equivalent-to-money-game equity.

###### Equity

The value of a position to one of the players. Equity is the sum of the values of the possible outcomes from a given position with each value multiplied by its probability of occurrence. It is the same as the fair settlement value of the position. Your equity is the negative of your opponent's equity.

###### Error Rate

A measure of the average equity lost per move due to errors in play. The lost equity can be measured either in match-winning chances or EMG equity.

###### FIBS Rating

A number associated with each player based on that player's record of performance against other rated players. Every player starts with a rating of 1500. Your rating goes up when you win and down when you lose. The size of the change depends on whether the favorite wins (less change) or underdog wins (greater change).

###### Game Winning Chances

The probability of winning the current game if it is played to conclusion without a doubling cube; also called cubeless probability of winning.

###### Joker

An exceptionally good roll, especially a roll that reverses the likely outcome of the game; a roll much luckier than average.

###### Match Equity

1. A player's probability of winning a match from a given score.
2. The value of a position in the context of the current match score and cube level, usually given in terms of match winning chances.

###### Match Winning Chances (MWC)

A player's probability of winning a match.

###### Money Play

The normal style of competition in backgammon in which games are played individually and the participants bet on the result. At the end of each game, the loser pays the winner the agreed initial stake multiplied by the value of the doubling cube and further multiplied by 2 for a gammon or 3 for a backgammon (2).

###### No double

The equity GNU estimates you will have if you didn't double.

###### Pass

Refuse a double.h

###### Pip Count

The total number of points (or pips (2)) that a player must move his checkers to bring them home and bear them off. 

###### Rating

A number associated with each player based on that player's record of performance against other rated players. When you win a match, points are added to your rating; when you lose, points are deducted from your rating. The size of the adjustment depends on the strength of your opponent—the higher the rating of your opponent, the more points you receive. Over time, your rating will tend to be higher than players weaker than yourself, and lower than players stronger than yourself.

###### Refuse a Double

To resign the game at the current stakes after the opponent offers a double rather than continue play at twice the stakes.

###### Take

Accept a Double.

###### Too Good (to Double)

A position which you should not double, even though your opponent has a clear drop, because your equity is higher by playing on for a gammon.


