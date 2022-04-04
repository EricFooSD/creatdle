/* eslint-disable no-await-in-loop */
/*
 * ========================================================
 *                  HELPER Functions
 * ========================================================
 */

// to generate a 6 digit unique code
const generateCode = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initWordlesController(db) {
  // check is words are valid and create wordle
  const checkWordsAndCreate = async (request, response) => {
    try {
      // make a array of the words that user wants to put into the wordle
      const { createArray } = request.body;
      const acceptedArray = [];
      const rejectedArray = [];
      let responseObj = {
        accept: true,
      };

      for (let i = 0; i < createArray.length; i += 1) {
        // check if each word is in allWords DB
        const isWord = await db.AllWord.findOne({ where: { word: `${createArray[i]}` } });
        if (!isWord) {
        // change response object
          responseObj.accept = false;
          rejectedArray.push(createArray[i]);
        } else {
          acceptedArray.push(createArray[i]);
        }
      }
      responseObj.rejected = rejectedArray;
      // if set of words can be accepted, create Wordle in DB
      if (responseObj.accept) {
        const tally = [];
        acceptedArray.forEach((element) => {
          const letterTally = {};
          const letters = element.split('');
          for (let i = 0; i < letters.length; i += 1) {
            const letter = letters[i];
            if (letter in letterTally) {
              letterTally[letter] += 1;
            }
            else {
              letterTally[letter] = 1;
            }
          }
          tally.push(letterTally);
        });

        const { creator } = request.body;

        const newWordle = {
          name: request.body.wordleName,
          description: request.body.wordleDesc,
          words: {
            words: acceptedArray,
            tally,
          },
          code: generateCode(),
          creatorId: creator,
        };
        // create Wordle in DB
        const wordle = await db.Wordle.create(newWordle);

        responseObj = {
          accept: true,
          wordleID: wordle.id,
          code: wordle.code,
        };
      }
      response.send(responseObj);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    checkWordsAndCreate,
  };
}
