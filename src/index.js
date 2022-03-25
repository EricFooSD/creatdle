/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import './styles.scss';
/*
 * ========================================================
 *                  HELPER FUNCTIONS
 * ========================================================
 */

const getElement = (id) => document.getElementById(`${id}`);

/*
 * ========================================================
 *                  DOM FUNCTIONS
 * ========================================================
 */

const createRowInBoard = (number, parent) => {
  const newRow = document.createElement('div');
  newRow.classList.add('row');
  newRow.setAttribute('id', `row${number}`);
  parent.appendChild(newRow);

  for (let i = 0; i < 5; i += 1) {
    const letterTile = document.createElement('div');
    letterTile.classList.add('col-2');

    const input = document.createElement('input');
    input.setAttribute('id', `row${number}letter${i}`);
    input.setAttribute('type', 'text');
    input.setAttribute('class', 'form-control');
    letterTile.appendChild(input);

    newRow.appendChild(letterTile);
  }

  // button
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('col-2');
  const submitBtn = document.createElement('button');
  submitBtn.setAttribute('id', `submit${number}`);
  submitBtn.innerText = 'Submit';

  submitBtn.addEventListener('click', () => {
    const guessedWord = `${getElement(`row${number}letter0`).value}`
    + `${getElement(`row${number}letter1`).value}`
    + `${getElement(`row${number}letter2`).value}`
    + `${getElement(`row${number}letter3`).value}`
    + `${getElement(`row${number}letter4`).value}`;

    console.log('guessedWord', guessedWord);

    axios.post('/checkWord', {
      guess: guessedWord,
    })
      .then((response) => {
        console.log(response.data);
        const check = response.data;
        for (let i = 0; i < 5; i += 1) {
          getElement(`row${number}letter${i}`).classList.add(`${check.color[i]}`);
        }
      })
      .catch((error) => { console.log(error); });
  });

  buttonContainer.appendChild(submitBtn);
  newRow.appendChild(buttonContainer);

  return newRow;
};

const createWordBoard = () => {
  // div for main game board
  const gameBoard = document.createElement('div');
  gameBoard.classList.add('container');
  gameBoard.setAttribute('id', 'game-board-container');
  document.body.appendChild(gameBoard);
  // create each row in game board
  createRowInBoard(1, gameBoard);
  createRowInBoard(2, gameBoard);
  createRowInBoard(3, gameBoard);
  createRowInBoard(4, gameBoard);
  createRowInBoard(5, gameBoard);
  createRowInBoard(6, gameBoard);
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

    // Automatically use keyboard for elements with .use-keyboard-input
    document.querySelectorAll('.use-keyboard-input').forEach((element) => {
      element.addEventListener('focus', () => {
        this.open(element.value, (currentValue) => {
          element.value = currentValue;
        });
      });
    });
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();
    const keyLayout = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
      'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter',
      'done', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?',
      'space',
    ];

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => `<i class="material-icons">${icon_name}</i>`;

    keyLayout.forEach((key) => {
      const keyElement = document.createElement('button');
      const insertLineBreak = ['backspace', 'p', 'enter', '?'].indexOf(key) !== -1;

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

        case 'caps':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.innerHTML = createIconHTML('keyboard_capslock');

          keyElement.addEventListener('click', () => {
            this._toggleCapsLock();
            keyElement.classList.toggle('keyboard__key--active', this.properties.capsLock);
          });

          break;

        case 'enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('keyboard_return');

          keyElement.addEventListener('click', () => {
            this.properties.value += '\n';
            this._triggerEvent('oninput');
          });

          break;

        case 'space':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.innerHTML = createIconHTML('space_bar');

          keyElement.addEventListener('click', () => {
            this.properties.value += ' ';
            this._triggerEvent('oninput');
          });

          break;

        case 'done':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('check_circle');

          keyElement.addEventListener('click', () => {
            this.close();
            this._triggerEvent('onclose');
          });

          break;

        default:
          keyElement.textContent = key.toLowerCase();

          keyElement.addEventListener('click', () => {
            this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
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

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
      }
    }
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },

  close() {
    // this.properties.value = '';
    // this.eventHandlers.oninput = oninput;
    // this.eventHandlers.onclose = onclose;
    // this.elements.main.classList.add('keyboard--hidden');
  },
};

/*
 * ========================================================
 *                  GAME FUNCTIONS
 * ========================================================
 */

const startGame = () => {
  createWordBoard();
};

startGame();
Keyboard.init();
Keyboard.open();
