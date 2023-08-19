/* eslint-disable max-len */
/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */
export default function initGamesController(db) {
  // .....................................
  // Checking Game States
  // .....................................

  /**
 * @desc checking if unique code entered is valid and create game board
 * @param request unique code entered by user
 * @param request user ID
 */
  const checkCodeAndCreate = async (request, response) => {
    try {
      // check if any wordle in Wordle DB has the unique code user entered
      const { enteredCode } = request.body;
      const { user } = request.body;
      const wordle = await db.Wordle.findOne({ where: { code: `${enteredCode}` } });

      // base response object where unique code cannot be found in Wordle DB
      let responseObj = {
        availCode: false,
      };
      // if there is a corresponding Wordle in Wordle DB, check if user already has an existing game in Games DB
      if (wordle) {
        const existingGame = await db.Game.findOne({ where: { playerId: `${user}`, wordleId: `${wordle.id}` } });
        // if there is no existing game, create game for user in Games DB
        // else, there is an existing game, send existing game ID to frontend
        if (!existingGame) {
          // define new game
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
          // create new game in Games DB
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
      response.send(responseObj);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  /**
 * @desc using game ID pull data about game from DB
 * @param request game ID
 */
  const checkCurrentGameState = async (request, response) => {
    const { gameId } = request.body;
    try {
      // get data on existing game play
      const game = await db.Game.findByPk(gameId);

      // get info on Wordle
      const wordle = await db.Wordle.findByPk(game.wordleId);

      // define all current guesses and color code of the guesses
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

  // .....................................
  // Gameplay Function
  // .....................................

  /**
 * @desc to be run when user enters their guess
 * @param request user's 5 letter guess
 */
  const checkGuess = async (request, response) => {
    try {
      // check if guess is a real word from allWords DB
      const { guess } = request.body;

      const words = await db.AllWord.findOne({ where: { id: 1 } });

      // define base response object
      let responseObj = {
        isWord: true,
        won: false,
        color: [],
        guessNum: '',
        split: [],
      };

      // if users guess is not a real word, change response object
      if (!words.all.includes(guess)) {
        responseObj.isWord = false;
      }
      // else, users guess is valid, check the guess against answer
      else {
        const { gameId } = request.body;
        // query to get info on this game and answers
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

        // case where guess is correct, update game in game DB
        if (word === guess) {
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

        // case where guess is wrong, update color codes for words
        else {
          // do a tally of the letters in users guess
          for (let j = 0; j < guessSplit.length; j += 1) {
            if (guessSplit[j] === wordSplit[j]) {
              tally[guessSplit[j]] -= 1;
            }
          }
          // compare to users guess tally vs answer tally and update color
          for (let i = 0; i < guessSplit.length; i += 1) {
            if (guessSplit[i] !== wordSplit[i]) {
              if (guessSplit[i] in tally && tally[guessSplit[i]] > 0) {
                letterCheck[i] = 'in-word';
                tally[guessSplit[i]] -= 1;
              } else { letterCheck[i] = 'not-in-word'; }
            }
          }

          // update game DB with new info
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

  /**
 * @desc for user to move on to the next word in the wordle
 * @param request game ID
 */
  const goToNextWord = async (request, response) => {
    try {
      const { gameId } = request.body;
      // get info about game from DB
      const game = await db.Game.findByPk(gameId);

      const numOfWords = game.gameState.words.length;
      // move game to the next word
      let newWordNum = Number(game.gameState.currentWord) + 1;
      // if user is already at the last word, go back to the first word
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

      // get wordle info for display
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

  /**
 * @desc when user has used up all 6 guesses, to allow them to reset and try again
 * @param request game ID
 */
  const resetGame = async (request, response) => {
    try {
      const { gameId } = request.body;
      // get info about game from DB
      const game = await db.Game.findByPk(gameId);

      // reset guesses and color
      await game.update({
        gameState: {
          words: game.gameState.words,
          tally: game.gameState.tally,
          currentWord: game.gameState.currentWord,
          guesses: [],
          color: [],
        },
      });

      // get wordle info for display
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
    resetGame,
  };
}
