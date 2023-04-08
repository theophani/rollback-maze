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
        name: "up",
        mask: 0b1000,
    },
    down: {
        name: "down",
        mask: 0b0010,
    },
    left: {
        name: "left",
        mask: 0b0001,
    },
    right: {
        name: "right",
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

        const maze = new Maze(this.elem, rows, columns, unitSize);

        this.cursor = new Cursor(this.elem, unitSize, maze);

        return this;
    }
}

class Maze {
    constructor(boardElem, rows, columns, unitSize) {

        const mazeElem = document.createElement("div");
        this.elem = mazeElem;
        this.elem.className = "maze";

        boardElem.appendChild(mazeElem);

        this.start = { row: -1, column: Math.floor(Math.random()*columns) };

        this.structure = Maze.makeMaze(rows, columns, this.start.column, Math.floor(Math.random() * columns));

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

    static makeMaze(rows, columns, startColumn = 0, endColumn = 0) {

        const nodes = Maze.makeNodes(rows, columns);
        const lastRowIndex = rows - 1;

        Maze.performHuntAndKill(nodes);

        Maze.removeWall(nodes, 0, startColumn, directions.up);
        Maze.removeWall(nodes, lastRowIndex, endColumn, directions.down);

        return nodes;
    }

    static neighbourAt(nodes, selected, direction) {
        let row = selected.row;
        let column = selected.column;

        if (direction === directions.up) {
            row--;
        }

        if (direction === directions.down) {
            row++;
        }

        if (direction === directions.left) {
            column--;
        }

        if (direction === directions.right) {
            column++;
        }

        if (nodes[row] && nodes[row][column]) {
            return {
                row,
                column,
                direction,
            };
        }

        return false;
    }

    static performHuntAndKill(nodes) {

        let selected = {
            row: Math.floor(Math.random() * nodes.length),
            column: Math.floor(Math.random() * nodes[0].length),
        }

        while (selected) {
            selected = advanceToNeighbour(selected, nodes) || findAdjacentStart(nodes);
        }

        function findAdjacentStart(nodes) {
            let selected = firstUnvisitedAdjacentNode(nodes);

            if (selected) {
                let neighbour = randomNeighbour(visitedNeighbours(nodes, selected));
                Maze.removeWall(nodes, selected.row, selected.column, neighbour.direction);
            }

            return selected;
        }

        function firstUnvisitedAdjacentNode(nodes) {
            for (let row = 0; row < nodes.length; row++) {
                for (let column = 0; column < nodes[0].length; column++) {
                    if (Maze.unvisited(nodes[row][column])) {
                        let neighbours = visitedNeighbours(nodes, { row, column });
                        if (neighbours.length) {
                            return { row, column };
                        }
                    }
                }
            }
            return false;
        }

        function advanceToNeighbour(selected, nodes) {
            let neighbours = unvisitedNeighbours(nodes, selected);
            let neighbour = randomNeighbour(neighbours);

            if (neighbour) {
                Maze.removeWall(nodes, selected.row, selected.column, neighbour.direction);
                return neighbour;
            }

            return false;
        }

        function unvisitedNeighbours(nodes, selected) {
            let unvisitedNeighbours = [
                Maze.neighbourAt(nodes, selected, directions.up),
                Maze.neighbourAt(nodes, selected, directions.down),
                Maze.neighbourAt(nodes, selected, directions.left),
                Maze.neighbourAt(nodes, selected, directions.right),
            ].filter(n => {
                return n ? Maze.unvisited(nodes[n.row][n.column]) : false;
            });

            return unvisitedNeighbours.length ? unvisitedNeighbours : false;
        }

        function visitedNeighbours(nodes, selected) {
            let visitedNeighbours = [
                Maze.neighbourAt(nodes, selected, directions.up),
                Maze.neighbourAt(nodes, selected, directions.down),
                Maze.neighbourAt(nodes, selected, directions.left),
                Maze.neighbourAt(nodes, selected, directions.right),
            ].filter(n => {
                return n ? !Maze.unvisited(nodes[n.row][n.column]) : false;
            });

            return visitedNeighbours.length ? visitedNeighbours : false;
        }

        function randomNeighbour(neighbours) {
            if (neighbours) {
                return neighbours[Math.floor(Math.random() * neighbours.length)];
            } else {
                return false;
            }
        }

        return nodes;
    }

    static makeNwBinaryTree(nodes) {
        const lastColumnIndex = nodes[0].length - 1;

        nodes.forEach((row, i) => {
            row.forEach((_, j) => {
                if (i === 0 && j < lastColumnIndex) {
                    Maze.removeWall(nodes, i, j, directions.right);
                } else if (Math.random() > 0.5 && j < lastColumnIndex) {
                    Maze.removeWall(nodes, i, j, directions.right);
                } else if (i > 0) {
                    Maze.removeWall(nodes, i, j, directions.up);
                }
            });
        });
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

        document.addEventListener("keydown", event => {
            this.#attemptMove(event);
        });

        return this;
    }

    #allowedToMove(direction) {
        if (this.row === -1) {
            return direction === directions.down.mask;
        }

        if (this.row === this.maze.structure.length) {
            return direction === directions.up.mask;
        }

        const constraints = this.maze.structure[this.row][this.column];

        // the constraints describe walls, i.e. where the cursor CAN’T go
        if (constraints & direction) {
            return false;
        } else {
            return true;
        }
    }

    #attemptMove(e) {
        e = e || window.event;

        // up arrow
        if (e.keyCode == '38' && this.#allowedToMove(directions.up.mask)) {
            this.moveUp();
        }

        // down arrow
        else if (e.keyCode == '40' && this.#allowedToMove(directions.down.mask)) {
            this.moveDown();
        }

        // left arrow
        else if (e.keyCode == '37' && this.#allowedToMove(directions.left.mask)) {
            this.moveLeft();
        }

        // right arrow
        else if (e.keyCode == '39' && this.#allowedToMove(directions.right.mask)) {
            this.moveRight();
        }
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
