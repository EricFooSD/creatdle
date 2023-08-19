/* eslint-disable no-await-in-loop */
/*
 * ========================================================
 *                  HELPER Functions
 * ========================================================
 */

/**
 * @desc function to generate a random 6 digit unique
 * @return string of 6
 */
const generateCode = () => {
  let text = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i += 1) {
    text += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return text;
};

/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initWordlesController(db) {
  /**
 * @desc to check if words user has entered are valid and create Wordle in DB
 * @param request information about the Wordle that user wants to create
 */
  const checkWordsAndCreate = async (request, response) => {
    try {
      // make a array of the words that user wants in their wordle
      const { createArray } = request.body;
      const acceptedArray = [];
      const rejectedArray = [];
      let responseObj = {
        accept: true,
      };

      const words = await db.AllWord.findOne({ where: { id: 1 } });

      // loop to compare if each word is a legitimate word
      // compare from master words list in AllWords DB
      for (let i = 0; i < createArray.length; i += 1) {
        if (words.all.includes(createArray[i])) {
          acceptedArray.push(createArray[i]);
        } else {
          responseObj.accept = false;
          rejectedArray.push(createArray[i]);
        }
      }
      responseObj.rejected = rejectedArray;
      // if all words can be accepted, create Wordle in DB
      if (responseObj.accept) {
        // create a tally of letters for each word
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

        // define the new wordle to be created in Wordle DB
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

  return {
    checkWordsAndCreate,
  };
}
