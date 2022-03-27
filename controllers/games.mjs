/*
 * ========================================================
 *                  HELPER Functions
 * ========================================================
 */

/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initGamesController(db) {
  // load current status of game
  const loadCurrentGameState = async (request, response) => {
    try {
      const game = await db.Game.findByPk(1);

      // query the word for this game
      const guessArray = [];
      game.gameState.guesses.forEach((element) => {
        guessArray.push(element.split(''));
      });
      const colorArray = [...game.gameState.color];

      response.send({ guessSplit: guessArray, color: colorArray });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // check guess against word
  const checkGame = async (request, response) => {
    try {
      // check if guess is even a word DB query
      const { guess } = request.body;
      const isWord = await db.AllWord.findOne({ where: { word: `${guess}` } });

      // define base response object
      let responseObj = {
        isWord: true,
        won: false,
        color: [],
        guessNum: '',
        split: [],
      };

      if (!isWord) {
        // change response object
        responseObj.isWord = false;
      } else {
        // query the word for this game
        const game = await db.Game.findByPk(1);

        // define variables
        const word = game.gameState.words[game.gameState.currentWord];
        const tally = game.gameState.tally[game.gameState.currentWord];
        const guessArray = [...game.gameState.guesses];
        const colorArray = [...game.gameState.color];
        const wordSplit = word.split('');
        const guessSplit = guess.split('');

        // set default color of letters to be displayed
        const letterCheck = ['in-position', 'in-position', 'in-position', 'in-position', 'in-position'];

        // case where guess is correct
        if (word === guess) {
          //
          // update game with new info
          await game.update({
            gameState: {
              words: game.gameState.words,
              tally: game.gameState.tally,
              currentWord: `${game.gameState.currentWord}`,
              guesses: [...guessArray, guess],
              color: [...colorArray, letterCheck],
            },
          });

          // change response object
          responseObj = {
            isWord: true,
            won: true,
            color: letterCheck,
            guessNum: guessArray.length,
            split: guessSplit,
          };
        }
        // determine whether letters are 'in-word', 'in-position', 'not-in-word'
        else {
          for (let i = 0; i < guessSplit.length; i += 1) {
            if (guessSplit[i] !== wordSplit[i]) {
              if (guessSplit[i] in tally && tally[guessSplit[i]] > 0) {
                letterCheck[i] = 'in-word';
                tally[guessSplit[i]] -= 1;
              } else { letterCheck[i] = 'not-in-word'; }
            }
          }

          // update game with new info
          await game.update({
            gameState: {
              words: game.gameState.words,
              tally: game.gameState.tally,
              currentWord: `${game.gameState.currentWord}`,
              guesses: [...guessArray, guess],
              color: [...colorArray, letterCheck],
            },
          });

          // change response object
          responseObj = {
            isWord: true,
            won: false,
            color: letterCheck,
            guessNum: guessArray.length,
            split: guessSplit,
          };
        }
      }
      response.send(responseObj);
    } catch (error) {
      response.status(500).send(error);
    }
  };
  return {
    checkGame,
    loadCurrentGameState,
  };
}
