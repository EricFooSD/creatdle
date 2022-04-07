/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import './styles.scss';

/*
 * ========================================================
 *                 HELPER FUNCTIONS
 * ========================================================
 */

// get the current guess letters from session
const getGuessFromSession = () => JSON.parse(sessionStorage.getItem('currentGuess'));

// update the current guess letters to session
const updateGuessToSession = (array) => {
  sessionStorage.setItem('currentGuess', JSON.stringify(array));
};

const rejectSound = new Audio('/sounds/reject.wav');

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Helper functions for Cookies

const setCookie = (cname, cvalue) => {
  document.cookie = `${cname}=${cvalue};`;
};

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

// checking if user cookie is already present and set if not
const checkUserCookie = () => {
  const user = getCookie('user');
  if (!user || user === '') {
    console.log('getting GuestID');
    axios
      .post('/createGuestID')
      .then((response) => {
        console.log(response.data);
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

const getElement = (id) => document.getElementById(id);

// create rows in the Wordle board
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

// update letters in the row as user selects the alphabets
const updateRow = (array) => {
  const guessNumber = sessionStorage.getItem('guessNumber');
  for (let i = 0; i < 5; i += 1) {
    if (!array[i]) getElement(`R${guessNumber}L${i}`).innerHTML = '';
    else getElement(`R${guessNumber}L${i}`).innerHTML = `${array[i].toUpperCase()}`;
  }
};

// creating the div for alerts
const createDivForAlert = (parent) => {
  const alert = document.createElement('div');
  alert.setAttribute('id', 'alert-container');
  alert.classList.add('col-md-12', 'd-flex', 'justify-content-center', 'col-12');
  parent.appendChild(alert);
};

// creating alerts for validations
const createAlert = (text, alertType, timeout) => {
  const container = getElement('alert-container');
  const newAlert = document.createElement('div');
  newAlert.setAttribute('id', 'alert');
  newAlert.classList.add('alert');
  newAlert.classList.add(`${alertType}`);
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

// create the letters matrix for Wordle
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
// Starting and Playing the Game

// after users have correctly guessed the word, allow them to move to next word in game
const goToNextWord = () => {
  const gameId = sessionStorage.getItem('gameId');

  axios
    .post('/goToNextWord', { gameId })
    .then((response) => {
      const current = response.data;
      updateGuessToSession([]);
      sessionStorage.setItem('guessNumber', 0);
      getElement('game-board-container').remove();
      createWordBoard();
      getElement('game-board-name').innerHTML = `${current.name}: ${current.desc}`;
    })
    .catch((error) => { console.log(error); });
};

// keyboard function for backspace
const clickBackspace = () => {
  const backspaceArray = getGuessFromSession();
  if (backspaceArray.length > 0) {
    backspaceArray.pop();
    updateGuessToSession(backspaceArray);
    updateRow(backspaceArray);
  }
};

// keyboard function when user clicks enter to try the word
const checkGuess = () => {
  let guess = '';
  const submitArray = getGuessFromSession();
  const gameId = sessionStorage.getItem('gameId');
  // check if there are 5 letters before submitting, throw error
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
        console.log(response.data);
        const check = response.data;
        // if submission is a word
        if (check.isWord) {
          for (let i = 0; i < 5; i += 1) {
            const letter = getElement(`R${check.guessNum}L${i}`);
            letter.classList.add(`${check.color[i]}`);
            letter.innerHTML = `${(check.split[i]).toUpperCase()}`;
          }
          sessionStorage.setItem('guessNumber', `${check.guessNum + 1}`);
          updateGuessToSession([]);
        } else {
          // if submision is not a word, throw validation alert
          rejectSound.play();
          createAlert('This is not a word', 'alert-primary', 2000);
        }
        if (check.won) {
          // if user has correctly guessed the word, throw button to move to next word
          const btnCtn = getElement('button-container');
          // button
          createBtn('next', 'Next Word', btnCtn, goToNextWord);
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

// client load the game ie the matrix
const loadStartGamePage = () => {
  getElement('code-container').remove();
  const gameId = sessionStorage.getItem('gameId');
  createWordBoard();
  axios
    .post('/checkCurrentGame', { gameId })
    .then((response) => {
      console.log(response.data);
      const current = response.data;
      getElement('game-board-name').innerHTML = `${current.name}: ${current.desc}`;
      // update the current state of the game, ie how many guesses, what where the guesses and color
      for (let i = 0; i < current.guessSplit.length; i += 1) {
        for (let j = 0; j < 5; j += 1) {
          const letter = getElement(`R${i}L${j}`);
          letter.classList.add(`${current.color[i][j]}`);
          letter.innerHTML = `${(current.guessSplit[i][j]).toUpperCase()}`;
        }
      }
      sessionStorage.setItem('guessNumber', `${current.color.length}`);
      sessionStorage.setItem('currentGuess', JSON.stringify([]));
    })
    .catch((error) => { console.log(error); });

  Keyboard.init();
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Checking Unique Code

// check the unique entered is valid
const checkCode = () => {
  const enteredCode = getElement('code-input').value;
  const user = getCookie('user');
  // if code entered is not 6 digit throw error
  if (enteredCode.length !== 6) {
    createAlert('Please enter a 6 digit code', 'alert-danger', 3000);
  } else {
    axios
      .post('/checkCodeAndCreate', { enteredCode, user })
      .then((response) => {
        const check = response.data;
        // check the word entered is an actually word, if not validation alert
        if (!check.availCode) {
          createAlert('Not a valid code, create a new wordle instead', 'alert-warning', 3000);
        } else {
          sessionStorage.setItem('gameId', `${check.gameId}`);
          loadStartGamePage();
        }
      })
      .catch((error) => { console.log(error); });
  }
};

// load page for user to input unique code
const loadCodePage = () => {
  getElement('home-container').remove();
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
  createBtn('code', 'Submit', getElement('button-container'), checkCode);

  // alert div
  createDivForAlert(row);
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Create Wordle

// process user request to create a wordle, after validation checks
const submitWordle = () => {
  const createArray = [];
  // get the words from the 5 rows
  for (let i = 0; i < 5; i += 1) {
    const word = getElement(`word-input-${i}`).value;
    if (word) {
      createArray.push(word);
    }
  }
  // get word name and description from input
  const wordleName = getElement('wordle-name').value;
  const wordleDesc = getElement('wordle-Desc').value;
  const creator = getCookie('user');
  if (createArray.length !== 0) {
    axios
      .post('/checkWordsAndCreate', {
        createArray, wordleName, wordleDesc, creator,
      })
      .then((response) => {
        const check = response.data;
        console.log('check', check);
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
  getElement('home-container').remove();
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
  createInputForWordle('wordle-Desc', 'Wordle Description', row);

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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Homepage

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

// by default, load homepage
loadHomePage();
// check and set cookie for 'user'
checkUserCookie();
