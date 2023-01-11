import { CARDS } from "./cards.js";
const PLAYER = {
  ONE: "one",
  TWO: "two",
};

/**
 * Create a 3x3 board on the canvas made of rows and columns
 * Start a game in either single- or multi-player mode
 * Deal cards to each player
 * Handle selecting a card, placing a card on the board, validating placement, and resolving outcome
 * Handle end of game
 */
class Game {
  boundStart = () => this.start();

  constructor(mode) {
    this.rows = 3;
    this.columns = 3;
    this.maxCardsPerHand = 5;
    this.mode = mode;
    this.boardEl = undefined;
    /**
        Array<{
            power: Array<number>,
            owner: 'one' | 'two'
            row: number,
            column: number
        }>;
     */
    this.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    this.currentPlayer = undefined;
    this.turnsPlayed = 0;
    this.reset = false;
  }

  initialize(boardEl) {
    this.boardEl = boardEl;
    this.createCells(this.rows, this.columns);
  }

  start(playerOneEl, playerTwoEl) {
    if (this.reset) {
      this.board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];
      this.boardEl.innerHTML = "";
      this.createCells(this.rows, this.columns);
      this.turnsPlayed = 0;
      this.reset = false;
    }
    this.updatePlayerTurn(undefined);
    this.dealCards(playerOneEl, "one");
    this.dealCards(playerTwoEl, "two");
  }

  createCells(rows, columns) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("id", "cell-" + "" + i + "-" + j);
        cell.addEventListener("drop", (e) => {
          this.handleDrop(e, i, j);
        });
        cell.addEventListener("dragover", this.handleDragOver);
        this.boardEl.append(cell);
      }
    }
  }

  updatePlayerTurn(player) {
    if (!player) {
      this.currentPlayer = [PLAYER.ONE, PLAYER.TWO][
        Math.floor(Math.random() * 2)
      ];
    } else {
      this.currentPlayer = player;
    }

    const playerTurnEl = document.getElementById("player-turn");
    playerTurnEl.innerHTML = `<h3>Player ${this.currentPlayer}'s turn</h3>`;

    /** Hide other player's hand */
    document
      .getElementById(`player-${this.currentPlayer}-hand`)
      .classList.remove("hidden");
    const otherPlayer = getOtherPlayer(this.currentPlayer);
    document
      .getElementById(`player-${otherPlayer}-hand`)
      .classList.add("hidden");

    /** Style player turn */
    playerTurnEl.classList.add(this.currentPlayer);
    playerTurnEl.classList.remove(otherPlayer);
  }

  /**
   * There can only be two cards of four-star or higher rarity in a deck.
   * There can only be one card of five-star rarity in a deck.
   */
  dealCards(handEl, playerNum) {
    handEl.innerHTML = "";

    const cards = shuffle(CARDS);
    let numFourStarCardsInHand = 0;
    let numFiveStarCardsInHand = 0;

    for (let i = 0; i < this.maxCardsPerHand; i++) {
      let drawnCard = drawCard(cards);

      if (numFiveStarCardsInHand > 0 && drawnCard.rank === 5) {
        drawnCard = drawCard(cards, drawnCard);
      }
      if (numFourStarCardsInHand > 1 && drawnCard.rank === 4) {
        drawnCard = drawCard(cards, drawnCard);
      }

      if (drawnCard.rank === 4) numFourStarCardsInHand += 1;
      if (drawnCard.rank === 5) numFiveStarCardsInHand += 1;

      const cardEl = this.createCardEl(drawnCard, playerNum);

      handEl.append(cardEl);
    }
  }

  /** Update the board's game state */
  updateBoard(row, column, card) {
    const board = [...this.board];

    /** First, add the new card to the cell */
    board[row][column] = {
      power: card.power,
      owner: this.currentPlayer,
      row,
      column,
    };

    /** Second, calculate if any surrounding cards can be flipped */
    const adjacentCells = this.getAdjacentCells(board, row, column);
    const cardsToFlip = this.getCapturedCards(
      adjacentCells,
      card,
      this.currentPlayer
    );

    /** Update the board state and board cells*/
    const otherPlayer = getOtherPlayer(this.currentPlayer);
    cardsToFlip.forEach((card) => {
      board[card.row][card.column].owner = this.currentPlayer;
      const boardCell = document.getElementById(
        `cell-${card.row}-${card.column}`
      );

      boardCell.classList.remove(otherPlayer);
      boardCell.classList.add(this.currentPlayer);
    });

    document
      .getElementById(`cell-${row}-${column}`)
      .classList.add(this.currentPlayer);
    this.board = board;
  }

  getAdjacentCells(board, row, column) {
    return [
      {
        direction: "left",
        card: board[row][column - 1],
      },
      {
        direction: "right",
        card: board[row][column + 1],
      },
      {
        direction: "top",
        card: board[row - 1] && board[row - 1][column],
      },
      {
        direction: "bottom",
        card: board[row + 1] && board[row + 1][column],
      },
    ];
  }

  getCapturedCards(adjacentCells, currentCard, currentPlayer) {
    return adjacentCells
      .map((adjacent) => {
        const adjacentCard = adjacent.card;
        const isOpponentCard =
          adjacentCard && adjacentCard.owner !== currentPlayer;

        if (isOpponentCard) {
          const [attackingPosition, defendingPosition] =
            this.getAttackingDefendingPositions(adjacent.direction);

          if (
            currentCard.power[attackingPosition] >
            adjacentCard.power[defendingPosition]
          )
            return adjacentCard;
        }
      })
      .filter((card) => card);
  }

  getAttackingDefendingPositions(direction) {
    switch (direction) {
      case "top":
        return [0, 2];
      case "right":
        return [1, 3];
      case "bottom":
        return [2, 0];
      case "left":
        return [3, 1];
    }
  }

  createCardEl(cardData) {
    const cardEl = document.createElement("div");

    const powers = cardData.power.map((power) => {
      if (power === 10) return "A";
      return power;
    });

    let stars = "";
    for (let i = 0; i < cardData.rank; i++) {
      stars += "<span>⭐️</span>";
    }

    cardEl.innerHTML = `
        <div class="card__rank">${stars}</div>
        <p class="card__name">${cardData.name}</p>
        <div class="card__power">
            <div class="top">${powers[0]}</div>
            <div class="right">${powers[1]}</div>
            <div class="bottom">${powers[2]}</div>
            <div class="left">${powers[3]}</div>
        </div>
    `;

    cardEl.classList.add("card");
    cardEl.setAttribute("id", guidGenerator());
    cardEl.setAttribute("draggable", "true");
    cardEl.addEventListener("dragstart", (e) => {
      this.handleDrag(e, cardData);
    });

    return cardEl;
  }

  handleDrag(e, card) {
    e.dataTransfer.setData("tt/element-id", e.target.id);
    e.dataTransfer.setData("tt/card-name", card.name);
    e.dataTransfer.setData("text/plain", card.name); // fallback value
  }

  handleDrop(e, row, column) {
    e.preventDefault();

    /** Prevent further action if cell is already occupied */
    if (e.target.firstChild) return;

    this.turnsPlayed += 1;

    /** Update board state with the new card */
    var card = this.getDroppedCard(e);
    this.updateBoard(row, column, card);

    /** Move the card into the board cell in the DOM */
    const id = e.dataTransfer.getData("tt/element-id");
    e.target.appendChild(document.getElementById(id));

    /** Check if game is over */
    if (this.turnsPlayed === 9) {
      this.determineWinner(this.board);
      return;
    }

    /** Update player turn */
    const otherPlayer = getOtherPlayer(this.currentPlayer);
    this.updatePlayerTurn(otherPlayer);
  }

  getDroppedCard(e) {
    var cardName =
      e.dataTransfer.getData("tt/card-name") ||
      e.dataTransfer.getData("text/plain");
    return CARDS.find(({ name }) => name === cardName);
  }

  handleDragOver(ev) {
    ev.preventDefault();
  }

  determineWinner(board) {
    let playerOneScore = 0;
    let playerTwoScore = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const cell = board[i][j];
        if (cell.owner === PLAYER.ONE) playerOneScore += 1;
        if (cell.owner === PLAYER.TWO) playerTwoScore += 1;
      }
    }

    const playerTurnEl = document.getElementById("player-turn");

    const isDraw = playerOneScore === playerTwoScore;
    if (isDraw) {
      playerTurnEl.innerHTML = `<h1>Draw!</h1>`;
      return;
    }

    const winner = playerOneScore > playerTwoScore ? PLAYER.ONE : PLAYER.TWO;
    playerTurnEl.innerHTML = `<h1>Player ${winner} wins!</h1>`;
    playerTurnEl.classList.add(winner);
    playerTurnEl.classList.remove(getOtherPlayer(winner));
    // const audio = new Audio('audio_file.mp3');
    // audio.play();

    this.reset = true;
    const startButton = document.getElementById("start-button");
    startButton.classList.remove("hidden");
    startButton.innerText = "Play again";
  }
}

/** Shuffle and return a new array */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return [...array];
}

function drawCard(cards, returnedCard) {
  if (returnedCard) {
    cards.push(returnedCard);
  }
  return cards.shift();
}

function getOtherPlayer(currentPlayer) {
  return currentPlayer === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;
}

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

window.Game = Game;
