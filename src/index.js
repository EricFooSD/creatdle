import './styles.scss';

//
//           DOM Functions
// .....................................

const startGame = () => {

};

const createWordBoard = () => {
  const gameBoard = document.createElement('div');
  gameBoard.setAttribute('id', 'game-board-container');
  document.body.appendChild(gameBoard);
};

createWordBoard();
