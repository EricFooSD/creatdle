import jsSHA from 'jssha';

/*
 * ========================================================
 *                  User Functions
 * ========================================================
 */

const getRandomNum = () => (Math.random() * 1000);

const SALT = 'Login Key';

const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });

  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;

  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);

  return shaObj.getHash('HEX');
};

/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initUsersController(db) {
  // check
  const createGuestID = async (request, response) => {
    const guestID = getHash(getRandomNum());
    try {
      const user = await db.Game.findOne({ where: { playerId: guestID } });
      if (!user) {
        console.log(guestID);
        response.send({ guestID });
      }
    }
    catch (error) {
      response.status(500).send(error);
    }
  };

  return {
    createGuestID,
  };
}
