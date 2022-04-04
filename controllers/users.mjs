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
  // check is user is loggedin
  // **** NOT USED *******
  const checkLogin = async (request, response) => {
    console.log('request.cookies', request.cookies);
    let output = {
      isloggedIn: false,
    };
    if (request.cookies.loggedInHash && request.cookies.userID) {
    // get the hased value that should be inside the cookie
      const hash = getHash(request.cookies.userID);
      console.log('hash', hash);

      // test the value of the cookie
      if (request.cookies.loggedInHash === hash) {
        try {
          // run the DB query
          const user = await db.User.findByPk(request.cookies.userID);
          output = {
            isloggedIn: true,
            userID: user.id,
            username: user.name,
          };
          console.log('output', output);
        } catch (error) {
          response.status(500).send(error);
        }
      }
    }
    response.send(output);
  };
  // login
  // **** NOT USED *******
  const login = async (request, response) => {
    console.log('login attempted');
    try {
      // run the DB query
      const user = await db.User.findAll({
        where: {
          name: request.body.name,
        },
      });
      if (user != null) {
        const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
        shaObj.update(request.body.password);
        const hashedPassword = shaObj.getHash('HEX');
        console.log('hashedPassword', hashedPassword);

        if (user[0].dataValues.password === hashedPassword) {
          response.cookie('loggedInHash', getHash(user[0].dataValues.id));
          response.cookie('userID', `${user[0].dataValues.id}`);
          return response.send('LOGGED_IN');
        }
        response.send('login failed');
      }
    }
    catch (error) {
      response.status(500).send(error);
    }
  };

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
    checkLogin,
    login,
    createGuestID,
  };
}
