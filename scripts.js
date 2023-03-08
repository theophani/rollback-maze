class Square {
    constructor(walls, unitSize) {
        this.elem = document.createElement("div");
        this.elem.className = "square";
        this.elem.style.width = `${unitSize}px`;
        this.elem.style.height = `${unitSize}px`;

        this.drawWalls(this.elem, walls);

        this.enter = () => {
            this.elem.className += " entered";
        };

        // Hrmm. Maybe I don’t want this?
        this.exit = () => {
            this.elem.className = this.elem.className.split(" ").filter((name) => {
                return name !== "entered";
            }).concat(" ");
        };

        return this;
    }

    drawWalls(elem, walls) {

        const top = 0b1000 & walls;
        const right = 0b0100 & walls;
        const bottom = 0b0010 & walls;
        const left = 0b0001 & walls;

        elem.className += ` walls-${walls}`;
        elem.className += ` top-${top ? "on" : "off"}`;
        elem.className += ` right-${right ? "on" : "off"}`;
        elem.className += ` bottom-${bottom ? "on" : "off"}`;
        elem.className += ` left-${left ? "on" : "off"}`;
    }
}

class Board {
    constructor(rows, columns, unitSize) {

        this.elem = document.createElement("div");;
        this.elem.className = "board";
        this.rows = rows;
        this.columns = columns;

        this.maze = new Maze(this.elem, rows, columns, unitSize);

        this.cursor = new Cursor(this.elem, unitSize);

        this.cursor.setPosition(this.maze.start);

        document.addEventListener("keydown", event => {
            this.attemptCursorMove(event);
        })

        return this;
    }

    attemptCursorMove(e) {
        e = e || window.event;

        // up arrow
        if (e.keyCode == '38' && this.cursor.row > 0) {
            this.cursor.moveUp();
        }

        // down arrow
        else if (e.keyCode == '40' && this.cursor.row < (this.rows - 1)) {
            this.cursor.moveDown();
        }

        // left arrow
        else if (e.keyCode == '37' && this.cursor.column > 0) {
            this.cursor.moveLeft();
        }

        // right arrow
        else if (e.keyCode == '39' && this.cursor.column < (this.columns - 1)) {
            this.cursor.moveRight();
        }
    }
}

class Maze {
    constructor(boardElem, rows, columns, unitSize) {

        const mazeElem = document.createElement("div");
        this.elem = mazeElem;
        this.elem.className = "maze";

        boardElem.appendChild(mazeElem);

        this.structure = this.makeMaze(rows, columns);
        this.start = { row: 0, column: 1 };

        this.rows = this.structure.map(row => {
            return row.map(walls => {
                return new Square(walls, unitSize);
            });
        });

        this.rows.forEach((row) => {
            const rowElem = document.createElement("div");
            rowElem.className = "row";
            mazeElem.appendChild(rowElem);

            row.forEach(() => {
                row.forEach((square) => {
                    rowElem.appendChild(square.elem);
                });
            });
        });

        return this;
    }

    makeMaze(rows, columns) {
        return [
            [0b1001, 0b0100, 0b1001, 0b1000, 0b1010, 0b1100],
            [0b0101, 0b0011, 0b0110, 0b0101, 0b1001, 0b0100],
            [0b0001, 0b1110, 0b1001, 0b0110, 0b0101, 0b0101],
            [0b0101, 0b1001, 0b0110, 0b1001, 0b0110, 0b0101],
            [0b0111, 0b0101, 0b1011, 0b0110, 0b1011, 0b0110],
        ];
    }
}

class Cursor {
    constructor(boardElem, unitSize) {
        this.elem = document.createElement("div");
        this.elem.className = "cursor";
        boardElem.appendChild(this.elem);

        this.unitSize = unitSize;
        this.cursorSize = unitSize/5;

        this.row = 0;
        this.column = 0;

        this.elem.style.width = `${this.cursorSize}px`;
        this.elem.style.height = `${this.cursorSize}px`;

        return this;
    }

    #move() {
        this.elem.style.top = `${this.unitSize * (this.row + 0.5) - this.cursorSize / 2}px`;
        this.elem.style.left = `${this.unitSize * (this.column + 0.5) - this.cursorSize / 2}px`;
    }

    setPosition(position) {
        this.row = position.row;
        this.column = position.column;
        this.#move();
    }

    moveUp() {
        this.row--;
        this.#move();
    }

    moveDown() {
        this.row++;
        this.#move();
    }

    moveLeft() {
        this.column--;
        this.#move();
    }

    moveRight() {
        this.column++;
        this.#move();
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const board = new Board(5, 6, 100);
    document.body.appendChild(board.elem);
});

