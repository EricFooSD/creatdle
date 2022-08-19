/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import './styles.scss';

/*
 * ========================================================
 *                 HELPER FUNCTIONS
 * ========================================================
 */

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Session helper functions
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>

/**
 * @desc get current guess letters from local session storage
 */
const getGuessFromSession = () => JSON.parse(localStorage.getItem('currentGuess'));

/**
 * @desc to set current guess letters to local session storage
 * @param {array} array the set of letters clicked on virtual keyboard
 */
const updateGuessToSession = (array) => {
  localStorage.setItem('currentGuess', JSON.stringify(array));
};

const rejectSound = new Audio('/sounds/reject.wav');

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Cookie helper functions
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const setCookie = (cname, cvalue) => {
  document.cookie = `${cname}=${cvalue};`;
};

/**
 * @desc function to get cookie value from local cookie storage
 * @param {string} cname name of the cookie required from browser
 * @return value of the cookie
 */
const getCookie = (cname) => {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

/**
 * @desc function to check current user  ID, if no user ID, set a guest user ID in cookie
 */
const checkUserCookie = () => {
  const user = getCookie('user');
  if (!user || user === '') {
    console.log('getting GuestID');
    axios
      .post('/createGuestID')
      .then((response) => {
        setCookie('user', `${response.data.guestID}`);
      })
      .catch((error) => { console.log(error); });
  }
};

/*
 * ========================================================
 *                 DOM HELPER FUNCTIONS
 * ========================================================
 */

const getElementFromID = (id) => document.getElementById(id);

// create row of 5 letter tiles in the Wordle board
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

// update letters in the row as user selects the alphabets on virtual keyboard
const updateRow = (array) => {
  const guessNumber = localStorage.getItem('guessNumber');
  for (let i = 0; i < 5; i += 1) {
    if (!array[i]) getElementFromID(`R${guessNumber}L${i}`).innerHTML = '';
    else getElementFromID(`R${guessNumber}L${i}`).innerHTML = `${array[i].toUpperCase()}`;
  }
};

// creating div for alerts
const createDivForAlert = (parent) => {
  const alert = document.createElement('div');
  alert.setAttribute('id', 'alert-container');
  alert.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12');
  parent.appendChild(alert);
};

// creating alerts for validations
const createAlert = (text, alertType, timeout) => {
  const container = getElementFromID('alert-container');
  const newAlert = document.createElement('div');
  newAlert.setAttribute('id', 'alert');
  newAlert.classList.add('alert', `${alertType}`);
  newAlert.setAttribute('role', 'alert');
  newAlert.innerHTML = `${text}`;
  container.appendChild(newAlert);

  setTimeout(() => {
    newAlert.remove();
  }, timeout);
};
// creating the div for buttons
const createDivForButton = (parent) => {
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12');
  buttonDiv.setAttribute('id', 'button-container');
  parent.appendChild(buttonDiv);
};

// creating buttons
const createBtn = (name, innerText, parent, callBack) => {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('id', `${name}`);
  button.classList.add('btn', 'btn-outline-dark');
  button.innerHTML = `${innerText}`;
  parent.appendChild(button);

  button.addEventListener('click', callBack);
};

// create the full game board for Wordle
const createWordBoard = () => {
  // div for main game board
  const gameBoard = document.createElement('div');
  gameBoard.classList.add('container');
  gameBoard.setAttribute('id', 'game-board-container');
  document.body.appendChild(gameBoard);

  // Wordle Name & Description
  const newRow = document.createElement('div');
  newRow.classList.add('row');
  newRow.setAttribute('id', 'game-board-name');
  newRow.classList.add('justify-content-center');
  gameBoard.appendChild(newRow);

  // create each row in game board
  createRowInBoard(0, gameBoard);
  createRowInBoard(1, gameBoard);
  createRowInBoard(2, gameBoard);
  createRowInBoard(3, gameBoard);
  createRowInBoard(4, gameBoard);
  createRowInBoard(5, gameBoard);

  // bootstrap row
  const row = document.createElement('div');
  row.classList.add('row', 'justify-content-center');
  gameBoard.appendChild(row);

  // alert div
  createDivForAlert(row);

  // div for button
  createDivForButton(row);
};

// input field for users to insert words to create their wordle
const createInputForWord = (number, parent) => {
  const newCol = document.createElement('div');
  newCol.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12', 'word-input');

  const inputField = document.createElement('input');
  inputField.setAttribute('id', `word-input-${number}`);
  inputField.setAttribute('type', 'text');
  inputField.setAttribute('placeholder', '5-letter-word');
  newCol.appendChild(inputField);

  parent.appendChild(newCol);
};

// input field for users to insert Name and Description to create their wordle
const createInputForWordle = (id, placeholder, parent) => {
  const newCol = document.createElement('div');
  newCol.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12', 'word-input');
  parent.appendChild(newCol);

  const inputField = document.createElement('input');
  inputField.setAttribute('id', `${id}`);
  inputField.setAttribute('type', 'text');
  inputField.setAttribute('placeholder', `${placeholder}`);
  newCol.appendChild(inputField);
};

/*
 * ========================================================
 *                  GAME FUNCTIONS
 * ========================================================
 */

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Virtual Keyboard + Functions
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// after users have correctly guessed the word, allow them to move to next word in game
// function will run when user clicks on go to next word button
const goToNextWord = () => {
  const gameId = localStorage.getItem('gameId');

  axios
    .post('/goToNextWord', { gameId })
    .then((response) => {
      const current = response.data;

      // reset game state in local storage
      updateGuessToSession([]);
      localStorage.setItem('guessNumber', 0);

      // remove old game board DOM
      getElementFromID('game-board-container').remove();

      // create new game board DOM and populate
      createWordBoard();
      getElementFromID('game-board-name').innerHTML = `${current.name}: ${current.desc}`;
    })
    .catch((error) => { console.log(error); });
};

// if user is unable get the answer after 6 guesses, allow them to try again
// function to reset game states and reset DOM
const resetGame = () => {
  const gameId = localStorage.getItem('gameId');

  axios
    .post('/resetGame', { gameId })
    .then((response) => {
      const current = response.data;

      // reset game state in local storage
      updateGuessToSession([]);
      localStorage.setItem('guessNumber', 0);

      // remove exiting game board DOM
      getElementFromID('game-board-container').remove();

      // create new game board and populate
      createWordBoard();
      getElementFromID('game-board-name').innerHTML = `${current.name}: ${current.desc}`;
    })
    .catch((error) => { console.log(error); });
};

// keyboard function for backspace
const clickBackspace = () => {
  const backspaceArray = getGuessFromSession();
  if (backspaceArray.length > 0) {
    backspaceArray.pop();
    // update local storage of current game state
    updateGuessToSession(backspaceArray);
    // update letter tiles
    updateRow(backspaceArray);
  }
};

// keyboard function when user clicks enter to try the word
const checkGuess = () => {
  let guess = '';
  const submitArray = getGuessFromSession();
  const gameId = localStorage.getItem('gameId');
  // check if there are 5 letters before submitting, if not 5 letters throw error
  if (submitArray.length < 5) {
    rejectSound.play();
    createAlert('Not enough letters', 'alert-warning', 2000);
  } else {
    submitArray.forEach((letter) => {
      guess += letter;
    });
    axios
      .post('/checkGuess', { guess, gameId })
      .then((response) => {
        const check = response.data;
        // if guess is a legitimate word
        if (check.isWord) {
          for (let i = 0; i < 5; i += 1) {
            const letter = getElementFromID(`R${check.guessNum}L${i}`);
            letter.classList.add(`${check.color[i]}`);
            letter.innerHTML = `${(check.split[i]).toUpperCase()}`;
          }
          localStorage.setItem('guessNumber', `${check.guessNum + 1}`);
          updateGuessToSession([]);
          if (check.won) {
            // if user has correctly guessed the word, show button to move to next word
            const btnCtn = getElementFromID('button-container');
            createBtn('next', 'Next Word', btnCtn, goToNextWord);
          } else if (localStorage.getItem('guessNumber') >= 6) {
            // if user's guess is wrong and it is the 6th guess, show try again button
            const btnCtn = getElementFromID('button-container');
            createBtn('tryAgain', 'Try Again', btnCtn, resetGame);
          }
        } else {
          // if submision is not a word, throw validation alert
          rejectSound.play();
          createAlert('This is not a word', 'alert-primary', 2000);
        }
      })
      .catch((error) => { console.log(error); });
  }
};

// keyboard function when user click on letters
const enterLetter = (key) => {
  const entryArray = getGuessFromSession();
  if (entryArray.length < 5) {
    entryArray.push(key);
    // update session info
    updateGuessToSession(entryArray);
    // update row in game board
    updateRow(entryArray);
  }
};

// main keyboard code
const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    // Setup main elements
    this.elements.main.classList.add('keyboard');
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
          // backspace + backspace function
          keyElement.classList.add('keyboard__key--wide');
          keyElement.innerHTML = createIconHTML('backspace');

          keyElement.addEventListener('click', clickBackspace);
          break;

        case 'done':
          // done + check guess function
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('check_circle');

          keyElement.addEventListener('click', checkGuess);
          break;

        default:
          // bring all letters in keyboard to upper class
          keyElement.textContent = key.toUpperCase();
          // update letters in "current guess"
          keyElement.addEventListener('click', () => { enterLetter(key); });
          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    return fragment;
  },

};
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Creating Wordle Page + Functions
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// process user request to create a wordle, with validation checks
const submitWordle = () => {
  const createArray = [];
  // get the words from the 5 rows
  for (let i = 0; i < 5; i += 1) {
    const word = getElementFromID(`word-input-${i}`).value.toLowerCase();
    if (word) {
      createArray.push(word);
    }
  }
  // get word name and description from input
  const wordleName = getElementFromID('wordle-name').value;
  const wordleDesc = getElementFromID('wordle-desc').value;
  const creator = getCookie('user');
  if (createArray.length !== 0) {
    axios
      .post('/checkWordsAndCreate', {
        createArray, wordleName, wordleDesc, creator,
      })
      .then((response) => {
        const check = response.data;
        if (!check.accept) {
          let words = '';
          check.rejected.forEach((element) => {
            words += `<br>${element} `;
          });
          // throw validation alert is some words are not in DB word library
          createAlert(`Some words are not valid: <br> ${words}`, 'alert-warning', 10000);
        } else {
          // if all words are valid, return message
          createAlert(`Wordle Created! <br> Your Wordle unique code is ${check.code}`, 'alert-success', 2000000);
        }
      })
      .catch((error) => { console.log(error); });
  }
};

// loading the create wordle page
const loadCreatePage = () => {
  getElementFromID('home-container').remove();
  // div for creating wordle
  const createPage = document.createElement('div');
  createPage.setAttribute('id', 'create-container');
  createPage.classList.add('container', 'd-flex', 'align-items-center', 'justify-content-evenly');

  // bootstrap row
  const row = document.createElement('div');
  row.classList.add('row', 'justify-content-center');
  createPage.appendChild(row);

  // name of Wordle
  createInputForWordle('wordle-name', 'Wordle Name', row);

  // description of Wordle
  createInputForWordle('wordle-desc', 'Wordle Description', row);

  // create inputs
  createInputForWord(0, row);
  createInputForWord(1, row);
  createInputForWord(2, row);
  createInputForWord(3, row);
  createInputForWord(4, row);

  // div for button
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12');
  buttonDiv.setAttribute('id', 'button-container');
  row.appendChild(buttonDiv);

  // button
  createBtn('submit', 'Submit', buttonDiv, submitWordle);

  // alert div
  createDivForAlert(row);

  document.body.appendChild(createPage);
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Playing Wordle Page + Functions
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// function to load the Wordle game page
const loadStartGamePage = () => {
  getElementFromID('code-container').remove();
  const gameId = localStorage.getItem('gameId');
  createWordBoard();
  axios
    .post('/checkCurrentGame', { gameId })
    .then((response) => {
      const current = response.data;
      getElementFromID('game-board-name').innerHTML = `${current.name}: ${current.desc}`;
      // update the current state of the game, ie how many guesses, what where the guesses and color
      for (let i = 0; i < current.guessSplit.length; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          const letter = getElementFromID(`R${i}L${j}`);
          letter.classList.add(`${current.color[i][j]}`);
          letter.innerHTML = `${(current.guessSplit[i][j]).toUpperCase()}`;
        }
      }
      localStorage.setItem('guessNumber', `${current.color.length}`);
      localStorage.setItem('currentGuess', JSON.stringify([]));
    })
    .catch((error) => { console.log(error); });

  // load virtual keyboard
  Keyboard.init();
};

// check if the unique code entered is valid, if value create game for user
const checkCode = () => {
  const enteredCode = getElementFromID('code-input').value;
  const user = getCookie('user');
  // if code entered is not 6 digit throw error
  if (enteredCode.length !== 6) {
    createAlert('Please enter a 6 digit code', 'alert-danger', 3000);
  } else {
    axios
      .post('/checkCodeAndCreate', { enteredCode, user })
      .then((response) => {
        const check = response.data;
        // check if code is a valid code, if it is, create game for user
        if (!check.availCode) {
          createAlert('Not a valid code, create a new wordle instead', 'alert-warning', 3000);
        } else {
          localStorage.setItem('gameId', `${check.gameId}`);
          loadStartGamePage();
        }
      })
      .catch((error) => { console.log(error); });
  }
};

// load page for user to input unique code
const loadCodePage = () => {
  getElementFromID('home-container').remove();
  // div for entering unique code
  const codePage = document.createElement('div');
  codePage.setAttribute('id', 'code-container');
  codePage.classList.add('container', 'd-flex', 'align-items-center', 'justify-content-center');
  document.body.appendChild(codePage);

  // bootstrap row
  const row = document.createElement('div');
  row.classList.add('row', 'justify-content-center');
  codePage.appendChild(row);

  // bootstrap col to house input
  const newCol = document.createElement('div');
  newCol.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12', 'word-input');
  row.appendChild(newCol);
  // input
  const inputField = document.createElement('input');
  inputField.setAttribute('id', 'code-input');
  inputField.setAttribute('type', 'text');
  inputField.setAttribute('placeholder', 'Unique Code');
  newCol.appendChild(inputField);

  // button div
  createDivForButton(row);

  // button
  createBtn('code', 'Submit', getElementFromID('button-container'), checkCode);

  // alert div
  createDivForAlert(row);
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Homepage
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// loading homepage
const loadHomePage = () => {
  // div for home page
  const homePage = document.createElement('div');
  homePage.setAttribute('id', 'home-container');
  homePage.classList.add('container', 'd-flex', 'align-items-center', 'justify-content-evenly');
  document.body.appendChild(homePage);

  // buttons for Play Wordle and Create Wordle
  createBtn('play', 'Play Wordle', homePage, loadCodePage);
  createBtn('create', 'Create Wordle', homePage, loadCreatePage);
};

/*
 * ========================================================
 *                 INITIALISE GAME
 * ========================================================
 */

// by default, load homepage
loadHomePage();
// check and set cookie for 'user'
checkUserCookie();
