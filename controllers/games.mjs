/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initGamesController(db) {
  // check guess against word
  const checkWord = async (request, response) => {
    try {
      // check if guess is even a word DB query
      const { guess } = request.body;
      const isWord = await db.AllWord.findOne({ where: { word: `${guess}` } });
      if (!isWord) {
        response.send({ isWord: false }); // send to client that guess is not a word
      } else {
        // query the word for this game
        const game = await db.Game.findByPk(1);
        const word = game.gameState.words[game.gameState.currentWord];
        const tally = game.gameState.tally[game.gameState.currentWord];

        // set default color of letters to be displayed
        const letterCheck = ['in-position', 'in-position', 'in-position', 'in-position', 'in-position'];

        // send to client if guess is correct
        if (word === guess) {
          response.send({ isWord: true, won: true, color: letterCheck });
        }
        // determine whether letters are 'in-word', 'in-position', 'not-in-word'
        else {
          const wordSplit = word.split('');
          const guessSplit = guess.split('');
          for (let i = 0; i < guessSplit.length; i += 1) {
            if (guessSplit[i] !== wordSplit[i]) {
              if (guessSplit[i] in tally && tally[guessSplit[i]] > 0) {
                letterCheck[i] = 'in-word';
                tally[guessSplit[i]] -= 1;
              } else { letterCheck[i] = 'not-in-word'; }
            }
          }
          response.send({ isWord: true, won: false, color: letterCheck });
        }
      }
    } catch (error) {
      response.status(500).send(error);
    }
  };
  return {
    checkWord,
  };
}
