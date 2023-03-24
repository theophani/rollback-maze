// Array.prototype.at is fancy! Polyfill for older versions of Safari
if (![].at) {
    Array.prototype.at = function (pos) {
        return pos < 0
            ? this[this.length + pos]
            : this.slice(pos, pos + 1)[0];
    }
}

const directions = {
    up: {
        mask: 0b1000,
    },
    down: {
        mask: 0b0010,
    },
    left: {
        mask: 0b0001,
    },
    right: {
        mask: 0b0100,
    },
};

directions.up.inverse = directions.down.mask;
directions.down.inverse = directions.up.mask;
directions.left.inverse = directions.right.mask;
directions.right.inverse = directions.left.mask;

class Square {
    constructor(walls, unitSize) {
        this.elem = document.createElement("div");
        this.elem.className = "square";
        this.elem.style.width = `${unitSize}px`;
        this.elem.style.height = `${unitSize}px`;

        Square.drawWalls(this.elem, walls);

        this.enter = () => {
            this.elem.classList.add("entered");
            this.elem.classList.remove("abandoned");
        };

        this.abandon = () => {
            this.elem.classList.add("abandoned");
        };

        return this;
    }

    static drawWalls(elem, walls) {
        const top =  directions.up.mask & walls;
        const right = directions.right.mask & walls;
        const bottom = directions.down.mask & walls;
        const left = directions.left.mask & walls;

        elem.className += ` walls-${walls}`;
        elem.className += ` top-${top ? "on" : "off"}`;
        elem.className += ` right-${right ? "on" : "off"}`;
        elem.className += ` bottom-${bottom ? "on" : "off"}`;
        elem.className += ` left-${left ? "on" : "off"}`;
    }
}

class Board {
    constructor(rows, columns, unitSize) {

        this.elem = document.createElement("div");
        this.elem.className = "board";
        this.rows = rows;
        this.columns = columns;

        this.maze = new Maze(this.elem, rows, columns, unitSize);

        this.cursor = new Cursor(this.elem, unitSize, this.maze);

        document.addEventListener("keydown", event => {
            this.attemptCursorMove(event);
        })

        return this;
    }

    allowedToMove(direction) {
        if (this.cursor.row === -1) {
            return direction === directions.down.mask;
        }

        if (this.cursor.row === this.rows) {
            return direction === directions.up.mask;
        }

        const constraints = this.maze.structure[this.cursor.row][this.cursor.column];

        // the constraints describe walls, i.e. where the cursor CAN’T go
        if (constraints & direction) {
            return false;
        } else {
            return true;
        }
    }

    attemptCursorMove(e) {
        e = e || window.event;

        // up arrow
        if (e.keyCode == '38' && this.allowedToMove(directions.up.mask)) {
            this.cursor.moveUp();
        }

        // down arrow
        else if (e.keyCode == '40' && this.allowedToMove(directions.down.mask)) {
            this.cursor.moveDown();
        }

        // left arrow
        else if (e.keyCode == '37' && this.allowedToMove(directions.left.mask)) {
            this.cursor.moveLeft();
        }

        // right arrow
        else if (e.keyCode == '39' && this.allowedToMove(directions.right.mask)) {
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

        this.structure = Maze.makeMaze(rows, columns);
        this.start = { row: -1, column: 0 };

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

    static unvisited(node) {
        // i.e. is unconnected, i.e. has all its walls still
        return node === 0b1111;
    }

    static removeWall(nodes, row, column, neighbourDirection) {
        let nRow = row;
        let nColumn = column;

        if (neighbourDirection === directions.up) {
            nRow--;
        }

        if (neighbourDirection === directions.down) {
            nRow++;
        }

        if (neighbourDirection === directions.left) {
            nColumn--;
        }

        if (neighbourDirection === directions.right) {
            nColumn++;
        }

        if (row >= 0 && row < nodes.length && column >= 0 && column < nodes[row].length) {
            nodes[row][column] = nodes[row][column] - neighbourDirection.mask;
        }

        if (nRow >= 0 && nRow < nodes.length && nColumn >= 0 && nColumn < nodes[nRow].length) {
            nodes[nRow][nColumn] = nodes[nRow][nColumn] - neighbourDirection.inverse;
        }
    }

    static makeNodes(rows, columns) {
        let row = 0;
        const nodes = [];

        while (row < rows) {
            let column = 0;
            nodes.push([]);
            while (column < columns) {
                nodes[row].push(0b1111);
                column++;
            }
            row++;
        }

        return nodes;
    }

    static makeMaze(rows, columns) {

        const nodes = Maze.makeNodes(rows, columns);

        Maze.removeWall(nodes, 0, 0, directions.up);
        Maze.removeWall(nodes, rows - 1, 1, directions.down);

        nodes.forEach((row, i) => {
            row.forEach((_, j) => {
                if ((Math.random() > 0.5 || (i + 1) === rows) && (j + 1) < columns) {
                    Maze.removeWall(nodes, i, j, directions.right);
                } else if ((i + 1)< rows) {
                    Maze.removeWall(nodes, i, j, directions.down);
                }
            });
        });

        return nodes;
    }

    enter(row, column) {
        if (this.rows[row] && this.rows[row][column]) {
            this.rows[row][column].enter();
        }
    }

    abandon(row, column) {
        if (this.rows[row] && this.rows[row][column]) {
            this.rows[row][column].abandon();
        }
    }
}

class Cursor {
    constructor(boardElem, unitSize, maze) {
        this.elem = document.createElement("div");
        this.elem.className = "cursor";
        boardElem.appendChild(this.elem);

        this.unitSize = unitSize;
        this.cursorSize = unitSize/5;

        this.elem.style.width = `${this.cursorSize}px`;
        this.elem.style.height = `${this.cursorSize}px`;

        this.maze = maze;

        this.path = [];

        this.#setPosition(maze.start);

        return this;
    }

    #move() {
        this.elem.style.top = `${this.unitSize * (this.row + 0.5) - this.cursorSize / 2}px`;
        this.elem.style.left = `${this.unitSize * (this.column + 0.5) - this.cursorSize / 2}px`;
        this.maze.enter(this.row, this.column);
    }

    #recordPath(direction) {
        if (this.path.length && this.path.at(-1).direction.inverse === direction.mask) {
            const lastSquare = this.path.pop();
            this.maze.abandon(lastSquare.row, lastSquare.column);
        } else {
            this.path.push({
                row: this.row,
                column: this.column,
                direction: direction,
            });
        }
    }

    #setPosition(position) {
        this.row = position.row;
        this.column = position.column;
        this.#move();
    }

    moveUp() {
        this.row--;
        this.#recordPath(directions.up);
        this.#move();
    }

    moveDown() {
        this.row++;
        this.#recordPath(directions.down);
        this.#move();
    }

    moveLeft() {
        this.column--;
        this.#recordPath(directions.left);
        this.#move();
    }

    moveRight() {
        this.column++;
        this.#recordPath(directions.right);
        this.#move();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const board = new Board(10, 20, 50);
    document.body.appendChild(board.elem);
});

function runTests() {
    const rows = 3;
    const columns = 7;
    const maze = Maze.makeMaze(rows, columns);

    console.log("Maze.makeMaze returns a grid with the desired number of rows and columns:", (function () {
        return (maze.length === rows) && Maze.makeMaze(rows, columns).filter((row) => {
            return row.length === columns;
        }).length === rows;
    })());

    console.log("Maze.removeWalls can be used to craft the desired maze", (function () {

        const desiredMaze = [
            [0b1001, 0b0100, 0b1001, 0b1000, 0b1010, 0b1100],
            [0b0101, 0b0011, 0b0110, 0b0101, 0b1001, 0b0100],
            [0b0001, 0b1110, 0b1001, 0b0110, 0b0101, 0b0101],
            [0b0101, 0b1001, 0b0110, 0b1001, 0b0110, 0b0101],
            [0b0111, 0b0101, 0b1011, 0b0110, 0b1011, 0b0110],
        ];

        const nodes = Maze.makeNodes(desiredMaze.length, desiredMaze[0].length);

        Maze.removeWall(nodes, 0, 0, directions.right);
        Maze.removeWall(nodes, 0, 0, directions.down);

        Maze.removeWall(nodes, 0, 1, directions.up);
        Maze.removeWall(nodes, 0, 1, directions.down);

        Maze.removeWall(nodes, 0, 2, directions.right);
        Maze.removeWall(nodes, 0, 2, directions.down);

        Maze.removeWall(nodes, 0, 3, directions.right);
        Maze.removeWall(nodes, 0, 3, directions.down);

        Maze.removeWall(nodes, 0, 4, directions.right);

        Maze.removeWall(nodes, 0, 5, directions.down);

        Maze.removeWall(nodes, 1, 0, directions.down);

        Maze.removeWall(nodes, 1, 1, directions.right);

        Maze.removeWall(nodes, 1, 3, directions.down);

        Maze.removeWall(nodes, 1, 4, directions.right);
        Maze.removeWall(nodes, 1, 4, directions.down);

        Maze.removeWall(nodes, 1, 5, directions.down);

        Maze.removeWall(nodes, 2, 0, directions.right);
        Maze.removeWall(nodes, 2, 0, directions.down);

        Maze.removeWall(nodes, 2, 2, directions.right);
        Maze.removeWall(nodes, 2, 2, directions.down);

        Maze.removeWall(nodes, 2, 4, directions.down);

        Maze.removeWall(nodes, 2, 5, directions.down);

        Maze.removeWall(nodes, 3, 0, directions.down);

        Maze.removeWall(nodes, 3, 1, directions.right);
        Maze.removeWall(nodes, 3, 1, directions.down);

        Maze.removeWall(nodes, 3, 3, directions.right);
        Maze.removeWall(nodes, 3, 3, directions.down);

        Maze.removeWall(nodes, 3, 5, directions.down);

        Maze.removeWall(nodes, 4, 1, directions.down);

        Maze.removeWall(nodes, 4, 2, directions.right);

        Maze.removeWall(nodes, 4, 4, directions.right);

        return desiredMaze.filter((row, i) => {
            return row.filter((desiredValue, j) => {
                return desiredValue === nodes[i][j];
            }).length === desiredMaze[0].length;
        }).length === desiredMaze.length;

    })())

    console.log(maze);
}

runTests();
