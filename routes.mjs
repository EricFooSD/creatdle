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
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  // check on current game state
  app.post('/checkCurrentGame', GamesController.checkCurrentGameState);

  // check user's guess
  app.post('/checkGuess', GamesController.checkGuess);

  // check word
  app.post('/checkCodeAndCreate', GamesController.checkCodeAndCreate);

  // generate Guest cookie
  app.post('/createGuestID', UsersController.createGuestID);

  // generate check word submission
  app.post('/checkWordsAndCreate', WordlesController.checkWordsAndCreate);

  // move game to next word
  app.post('/goToNextWord', GamesController.goToNextWord);

  // allow user to try wordle again
  app.post('/resetGame', GamesController.resetGame);
}
