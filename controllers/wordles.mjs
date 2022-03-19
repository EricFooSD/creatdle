/*
 * ========================================================
 *                  Controller Functions
 * ========================================================
 */

export default function initWordlesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const playerHand = {
      playerOne: [cardDeck.pop()],
      playerTwo: [cardDeck.pop()],
    };
    const winner = decideWinner(playerHand.playerOne[0].rank, playerHand.playerTwo[0].rank);
    const currentScore = {
      playerOne: 0,
      playerTwo: 0,
    };

    const outcome = {
      message: outcomeMsg(winner),
      score: updateScore(currentScore, winner),
    };

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
        outcome,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        outcome: game.gameState.outcome,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const playerHand = {
        playerOne: [game.gameState.cardDeck.pop()],
        playerTwo: [game.gameState.cardDeck.pop()],
      };

      const winner = decideWinner(playerHand.playerOne[0].rank, playerHand.playerTwo[0].rank);

      const outcome = {
        message: outcomeMsg(winner),
        score: updateScore(game.gameState.outcome.score, winner),
      };
      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
          outcome,
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        outcome: game.gameState.outcome,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
  };
}
