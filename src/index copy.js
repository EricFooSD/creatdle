/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import './styles.scss';

// THIS IS BACKUP OF INDEX.JS

/*
 * ========================================================
 *                 GLOBAL VARIABLE
 * ========================================================
 */

let currentGuess = '';

/*
 * ========================================================
 *                 DOM HELPER FUNCTIONS
 * ========================================================
 */

const getElement = (id) => document.getElementById(id);
const createRowInBoard = (number, parent) => {
  const newRow = document.createElement('div');
  newRow.classList.add('row');
  newRow.setAttribute('id', `row${number}`);
  newRow.classList.add('justify-content-center');
  parent.appendChild(newRow);

  for (let i = 0; i < 5; i += 1) {
    const letterTile = document.createElement('div');
    letterTile.setAttribute('id', `R${number}L${i}`);
    letterTile.classList.add('tile');
    letterTile.classList.add('flex');
    letterTile.innerHTML = '';
    newRow.appendChild(letterTile);
  }
};
/*
 * ========================================================
 *                  DOM FUNCTIONS
 * ========================================================
 */

const createWordBoard = () => {
  // div for main game board
  const gameBoard = document.createElement('div');
  gameBoard.classList.add('container');
  gameBoard.setAttribute('id', 'game-board-container');
  document.body.appendChild(gameBoard);
  // create each row in game board
  createRowInBoard(0, gameBoard);
  createRowInBoard(1, gameBoard);
  createRowInBoard(2, gameBoard);
  createRowInBoard(3, gameBoard);
  createRowInBoard(4, gameBoard);
  createRowInBoard(5, gameBoard);

  // hidden input field to track the letters being typed
  const input = document.createElement('input');
  input.setAttribute('id', 'input');
  input.setAttribute('type', 'text');
  input.setAttribute('maxlength', '5');
  input.setAttribute('class', 'form-control input-hidden');
  document.body.appendChild(input);

  input.addEventListener('input', () => {
    const currentGuess = sessionStorage.getItem('guessNumber');
    const array = input.value.split('');
    console.log('array', array);
    for (let i = 0; i < 5; i += 1) {
      if (!array[i]) getElement(`R${currentGuess}L${i}`).innerHTML = '';
      else getElement(`R${currentGuess}L${i}`).innerHTML = `${array[i]}`;
    }
  });
};

const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  properties: {
    value: '',
    capsLock: false,
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    // Setup main elements
    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();
    const keyLayout = [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
      'done', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace',
    ];

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => `<i class="material-icons">${icon_name}</i>`;

    keyLayout.forEach((key) => {
      const keyElement = document.createElement('button');
      const insertLineBreak = ['backspace', 'p', 'l'].indexOf(key) !== -1;

      // Add attributes/classes
      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');

      switch (key) {
        case 'backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('backspace');

          keyElement.addEventListener('click', () => {
            this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
            this._triggerEvent('oninput');
          });

          break;

        case 'done':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('check_circle');

          keyElement.addEventListener('click', () => {
            // this.close();
            this._triggerEvent('onclose');
          });

          break;

        default:
          keyElement.textContent = key.toUpperCase();

          keyElement.addEventListener('click', () => {
            this.properties.value += key;
            this._triggerEvent('oninput');
          });

          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    return fragment;
  },

  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] === 'function') {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },
};

/*
 * ========================================================
 *                  GAME FUNCTIONS
 * ========================================================
 */

const startGame = () => {
  createWordBoard();

  axios.post('/loadCurrentGame')
    .then((response) => {
      console.log(response.data);
      const current = response.data;
      for (let i = 0; i < current.guessSplit.length; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          const letter = getElement(`R${i}L${j}`);
          letter.classList.add(`${current.color[i][j]}`);
          letter.innerHTML = `${(current.guessSplit[i][j]).toUpperCase()}`;
        }
      }
      sessionStorage.setItem('guessNumber', `${current.color.length}`);
    })
    .catch((error) => { console.log(error); });
};

startGame();

window.addEventListener('DOMContentLoaded', () => {
  Keyboard.init();
  Keyboard.open(currentGuess, (currentValue) => {
    if (currentGuess.length > 6) { currentGuess = currentValue; }
    console.log('currentGuess', currentGuess);
  },
  () => {
    axios
      .post('/checkGame', { guess: getElement('input').value })
      .then((response) => {
        console.log(response.data);
        const check = response.data;
        if (check.isWord) {
          for (let i = 0; i < 5; i += 1) {
            const letter = getElement(`R${check.guessNum}L${i}`);
            letter.classList.add(`${check.color[i]}`);
            letter.innerHTML = `${(check.split[i]).toUpperCase()}`;
          }
          sessionStorage.setItem('guessNumber', `${check.guessNum + 1}`);
          getElement('input').value = '';
        }
      })
      .catch((error) => { console.log(error); });
  });
});
