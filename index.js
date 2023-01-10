import { CARDS } from "./cards.js";

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
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ];
  }

  initialize(boardEl) {
    this.boardEl = boardEl;
    this.createCells(this.rows, this.columns);
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

  /** Update the board's game state */
  updateBoard(row, column, card) {
    const board = { ...this.board };
    board[row][column] = {
      value: card.power,
      owner: "", // card.owner
    };
    this.board = board;

    console.log("updated board ", this.board);
  }

  start(playerOneEl, playerTwoEl) {
    this.dealCards(playerOneEl, "one");
    this.dealCards(playerTwoEl, "two");
  }

  /**
   * There can only be two cards of four-star or higher rarity in a deck.
   * There can only be one card of five-star rarity in a deck.
   */
  dealCards(hand, playerNum) {
    hand.innerHTML = "";

    const cards = shuffle(CARDS);
    let numFourStarCardsInHand = 0;
    let numFiveStarCardsInHand = 0;

    for (let i = 0; i < this.maxCardsPerHand; i++) {
      let cardData = this.drawCard(cards);

      if (numFiveStarCardsInHand > 0 && cardData.rank === 5) {
        cardData = this.drawCard(cards, cardData);
      }
      if (numFourStarCardsInHand > 1 && cardData.rank === 4) {
        cardData = this.drawCard(cards, cardData);
      }

      if (cardData.rank === 4) numFourStarCardsInHand += 1;
      if (cardData.rank === 5) numFiveStarCardsInHand += 1;

      const cardEl = this.createCardEl(cardData, playerNum);

      hand.append(cardEl);
    }
  }

  drawCard(cards, returnedCard) {
    if (returnedCard) {
      cards.push(returnedCard);
    }
    return cards.shift();
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
    <div class="card__power">
        <div class="top">${powers[0]}</div>
        <div class="right">${powers[1]}</div>
        <div class="bottom">${powers[2]}</div>
        <div class="left">${powers[3]}</div>
    </div>
    <p class="card__name">${cardData.name}</p>
    <div class="card__rank">${stars}</div>
  `;

    cardEl.classList.add("card", playerNum);
    cardEl.setAttribute("id", "card-" + playerNum + "-" + cardData.name);
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

function calculate() {
  const grid = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
}

window.Game = Game;
