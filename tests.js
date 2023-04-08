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
