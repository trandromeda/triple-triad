// import { CARDS } from "./cards.js";

const CARDS = [
  {
    power: [3, 3, 4, 4],
    rank: 1,
    name: "Bomb",
    sprite: "",
  },
  {
    power: [1, 3, 4, 7],
    rank: 1,
    name: "Pixie",
    sprite: "",
  },
  {
    power: [6, 3, 8, 5],
    rank: 2,
    name: "Frog",
    sprite: "",
  },
  {
    power: [5, 5, 5, 5],
    rank: 2,
    name: "Fire Elemental",
    sprite: "",
  },
  {
    power: [8, 6, 7, 5],
    rank: 3,
    name: "Ifrit",
    sprite: "",
  },
];

/**
 * Create a 3x3 board on the canvas
 * Start a game in either single- or multi-player mode
 * Deal cards to each player
 * Handle selecting a card, placing a card on the board, validating placement, and resolving outcome
 * Handle end of game
 */
class Game {
  constructor(mode) {
    this.rows = 3;
    this.columns = 3;
    this.mode = mode;
    this.board = undefined;
  }

  initialize(board) {
    this.board = board;
    this.createSpaces();
    this.createHands();
  }

  createSpaces() {
    const rows = this.rows;
    const columns = this.columns;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const space = document.createElement("div");
        space.classList.add("space");
        space.setAttribute("id", "cell-" + "" + i + "-" + j);
        space.addEventListener("drop", this.onDrop(i, j));
        space.addEventListener("dragover", this.onDragOver);
        this.board.append(space);
      }
    }
  }

  createHands() {
    const hand = document.getElementById("hand");
    for (let i = 0; i < CARDS.length; i++) {
      const card = document.createElement("div");
      card.innerHTML = CARDS[i].name;
      card.classList.add("card");
      card.setAttribute("id", "card-" + i);
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", this.onDrag);
      hand.append(card);
    }
  }

  onDrag(e) {
    // Add the target element's id to the data transfer object
    e.dataTransfer.setData("text/plain", e.target.innerText);
    e.dataTransfer.setData("application/my-app", e.target.id);
  }

  onDrop(row, column) {
    return (e) => {
      this.handleDrop(e, row, column);
    };
  }

  handleDrop(ev, row, column) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text/plain");

    console.log("row and column ", row, column);

    const id = ev.dataTransfer.getData("application/my-app");
    ev.target.appendChild(document.getElementById(id));

    const targetId = ev.target.id;
  }

  onDragOver(ev) {
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
