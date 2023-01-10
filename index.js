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
  constructor(mode) {
    this.rows = 3;
    this.columns = 3;
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

  dealCards(e) {
    const hand = document.getElementById("hand");
    for (let i = 0; i < CARDS.length; i++) {
      const cardData = CARDS[i];
      const card = document.createElement("div");

      let stars = "";
      for (let i = 0; i < cardData.rank; i++) {
        stars += "*";
      }

      card.innerHTML = `
        <div class="card__power">
            <div class="top">${cardData.power[0]}</div>
            <div class="right">${cardData.power[1]}</div>
            <div class="bottom">${cardData.power[2]}</div>
            <div class="left">${cardData.power[3]}</div>
        </div>
        <p class="card__name">${cardData.name}</p>
        <p class="card__rank">${stars}</p>
      `;

      card.classList.add("card");
      card.setAttribute("id", "card-" + i);
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", (e) => {
        this.handleDrag(e, cardData);
      });
      hand.append(card);
    }
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

function calculate() {
  const grid = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
}

window.Game = Game;
