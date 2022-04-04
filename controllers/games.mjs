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
  const checkCurrentGameState = async (request, response) => {
    const { gameId } = request.body;
    try {
      const game = await db.Game.findByPk(gameId);

      const wordle = await db.Wordle.findByPk(game.wordleId);

      // query the word for this game
      const guessArray = [];
      game.gameState.guesses.forEach((element) => {
        guessArray.push(element.split(''));
      });
      const colorArray = [...game.gameState.color];

      response.send(
        {
          name: wordle.name,
          desc: wordle.description,
          guessSplit: guessArray,
          color: colorArray,
        },
      );
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // check guess against word
  const checkGuess = async (request, response) => {
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
        const { gameId } = request.body;
        // query the word for this game
        const game = await db.Game.findByPk(gameId);

        // define variables
        const word = game.gameState.words[game.gameState.currentWord];
        const tally = { ...game.gameState.tally[game.gameState.currentWord] };
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

        // find all the letters that are 'in-position' first and remove from tally
        // we should always consider the in-position words first
        else {
          for (let j = 0; j < guessSplit.length; j += 1) {
            if (guessSplit[j] === wordSplit[j]) {
              tally[guessSplit[j]] -= 1;
            }
          }
          // compare to see if the letters are 'in-word' against updated tally.
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

  // check unique code
  const checkCodeAndCreate = async (request, response) => {
    try {
      // check if code is in Wordle DB
      const { enteredCode } = request.body;
      const { user } = request.body;
      const wordle = await db.Wordle.findOne({ where: { code: `${enteredCode}` } });

      // define base response object
      let responseObj = {
        availCode: false,
      };
      if (wordle) {
        const existingGame = await db.Game.findOne({ where: { playerId: `${user}`, wordleId: `${wordle.id}` } });
        if (!existingGame) {
          // define the new game to be created
          const newGame = {
            wordleId: wordle.id,
            gameState: {
              words: wordle.words.words,
              tally: wordle.words.tally,
              currentWord: 0,
              guesses: [],
              color: [],
            },
            playerId: user,
          };
          // create game in DB
          const game = await db.Game.create(newGame);
          responseObj = {
            availCode: true,
            gameId: game.id,
          };
        } else {
          responseObj = {
            availCode: true,
            gameId: existingGame.id,
          };
        }
      }
      // send info back to client
      response.send(responseObj);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // check guess against word
  const goToNextWord = async (request, response) => {
    try {
      const { gameId } = request.body;
      // query the word for this game
      const game = await db.Game.findByPk(gameId);

      // define variables
      const numOfWords = game.gameState.words.length;
      let newWordNum = Number(game.gameState.currentWord) + 1;
      if (newWordNum == numOfWords) { newWordNum = 0; }

      // update game with new info
      await game.update({
        gameState: {
          words: game.gameState.words,
          tally: game.gameState.tally,
          currentWord: newWordNum,
          guesses: [],
          color: [],
        },
      });

      const wordle = await db.Wordle.findByPk(game.wordleId);

      response.send(
        {
          name: wordle.name,
          desc: wordle.description,
          game,
        },
      );
    } catch (error) {
      response.status(500).send(error);
    }
  };

  return {
    checkGuess,
    checkCurrentGameState,
    checkCodeAndCreate,
    goToNextWord,
  };
}
