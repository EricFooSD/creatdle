import { resolve } from 'path';
import db from './models/index.mjs';
import initGamesController from './controllers/games.mjs';
import initUsersController from './controllers/users.mjs';
import initWordlesController from './controllers/wordles.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);
  const UsersController = initUsersController(db);
  const WordlesController = initWordlesController(db);

  // special JS page. Include the webpack index.html file
  app.get('/home', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });
  // create a new game
  app.post('/games', GamesController.create);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
  // check logged in status
  app.get('/loginStatus', UsersController.checkLogin);
  // user log in
  app.post('/login', UsersController.login);
}
