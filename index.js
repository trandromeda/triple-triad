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
  boundDealCards = () => this.dealCards();
  boundStart = () => this.start();

  constructor(mode) {
    this.rows = 3;
    this.columns = 3;
    this.maxCardsPerHand = 5;
    this.mode = mode;
    this.boardEl = undefined;
    this.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    this.playerTurn = undefined;
  }

  initialize(boardEl) {
    this.boardEl = boardEl;
    this.createCells(this.rows, this.columns);
  }

  start(playerOneEl, playerTwoEl) {
    this.updatePlayerTurn();
    this.dealCards(playerOneEl, "one");
    this.dealCards(playerTwoEl, "two");
  }

  createCells(rows, columns) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const cell = this.createCell(i, j);
        this.boardEl.append(cell);
      }
    }
  }

  createCell(row, column) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("id", "cell-" + "" + row + "-" + column);
    cell.addEventListener("drop", (e) => {
      this.handleDrop(e, row, column);
    });
    cell.addEventListener("dragover", this.handleDragOver);

    return cell;
  }

  updatePlayerTurn(playerNum) {
    if (!playerNum) {
      this.playerTurn = [PLAYER.ONE, PLAYER.TWO][Math.floor(Math.random() * 2)];
    } else {
      this.playerTurn = playerNum;
    }

    document.getElementById(
      "player-turn"
    ).innerHTML = `<h3>Player ${this.playerTurn}'s turn</h3>`;
  }

  /** Update the board's game state */
  updateBoard(row, column, card) {
    const board = { ...this.board };

    /** First, add the new card to the cell */
    board[row][column] = {
      power: card.power,
      owner: this.playerTurn,
      row,
      column,
    };

    /** Second, calculate if any surrounding cards can be flipped */
    const adjacentCells = this.getAdjacentCells(board, row, column);
    const cardsToFlip = this.getCapturedCards(
      adjacentCells,
      card,
      this.playerTurn
    );

    /** Update the board state and board cells*/
    const otherPlayer =
      this.playerTurn === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;

    cardsToFlip.forEach((card) => {
      board[card.row][card.column].owner = this.playerTurn;
      const boardCell = document.getElementById(
        `cell-${card.row}-${card.column}`
      );

      boardCell.classList.remove(otherPlayer);
      boardCell.classList.add(this.playerTurn);
    });

    this.board = board;
    document
      .getElementById(`cell-${row}-${column}`)
      .classList.add(this.playerTurn);
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

  createCardEl(cardData, playerNum) {
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
    // Add the target element's id to the data transfer object
    e.dataTransfer.setData("tt/element-id", e.target.id);
    e.dataTransfer.setData("tt/card-name", card.name);
    e.dataTransfer.setData("text/plain", card.name); // fallback value
  }

  handleDrop(e, row, column) {
    e.preventDefault();

    /** Prevent further action if cell is already occupied */
    if (e.target.firstChild) return;

    /** Update board state with the new card */
    var card = this.getDroppedCard(e);
    this.updateBoard(row, column, card);

    /** Move the card into the board cell in the DOM */
    const id = e.dataTransfer.getData("tt/element-id");
    e.target.appendChild(document.getElementById(id));

    /** Update player turn */
    const otherPlayer =
      this.playerTurn === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE;
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
