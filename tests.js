function runTests() {
    const rows = 3;
    const columns = 7;
    const maze = Maze.makeStructure(rows, columns);

    function deepEquals(desiredGrid, givenGrid) {
        if (typeof givenGrid !== typeof desiredGrid) {
            return false;
        }

        return desiredGrid.filter((row, i) => {
            if (typeof givenGrid[i] !== typeof row) {
                return false;
            }

            return row.filter((desiredValue, j) => {
                return desiredValue === givenGrid[i][j];
            }).length === desiredGrid[0].length;
        }).length === desiredGrid.length;
    }

    console.log("Maze.makeStructure returns a grid with the desired number of rows and columns:", (function () {
        return (maze.length === rows) && Maze.makeStructure(rows, columns).filter((row) => {
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

        return deepEquals(desiredMaze, nodes);

    })())

    console.log("Maze.findStartColumn identifies the column where the maze opening is", (function () {

        const structure1 = [
            [0b1001, 0b0100, 0b1001, 0b1000, 0b1010, 0b1100],
            [0b0101, 0b0011, 0b0110, 0b0101, 0b1001, 0b0100],
        ];

        const structure2 = [
            [0b1001, 0b1100, 0b1001, 0b0000, 0b1010, 0b1100],
            [0b0101, 0b0011, 0b0110, 0b0101, 0b1001, 0b0100],
        ];

        const structure3 = [
            [0b1001, 0b1100, 0b1001, 0b1000, 0b1010, 0b0100],
            [0b0101, 0b0011, 0b0110, 0b0101, 0b1001, 0b0100],
        ];

        return Maze.findStartColumn(structure1) === 1
            && Maze.findStartColumn(structure2) === 3
            && Maze.findStartColumn(structure3) === 5;

    })())

    console.log("Maze.flattenStructure returns the correct string encoding of a given structure", (function () {
        const expectedString = "969c98c98aa8c9cd98cd,1a6365361ac534126536,1aaac1ac3e53c53e969c,1ae963e59a6963ac7945,5986b8c559c1a8e59675,5559a6365751c7963c96,5573acbc1c553c3ac71e,579ac3a65361c79c1c3c,3c7969eb2ae5596553a6,b2a2e3aaaa8636b63aae";

        const structure = [
            [9, 6, 9, 12, 9, 8, 12, 9, 8, 10, 10, 8, 12, 9, 12, 13, 9, 8, 12, 13],
            [1, 10, 6, 3, 6, 5, 3, 6, 1, 10, 12, 5, 3, 4, 1, 2, 6, 5, 3, 6],
            [1, 10, 10, 10, 12, 1, 10, 12, 3, 14, 5, 3, 12, 5, 3, 14, 9, 6, 9, 12],
            [1, 10, 14, 9, 6, 3, 14, 5, 9, 10, 6, 9, 6, 3, 10, 12, 7, 9, 4, 5],
            [5, 9, 8, 6, 11, 8, 12, 5, 5, 9, 12, 1, 10, 8, 14, 5, 9, 6, 7, 5],
            [5, 5, 5, 9, 10, 6, 3, 6, 5, 7, 5, 1, 12, 7, 9, 6, 3, 12, 9, 6],
            [5, 5, 7, 3, 10, 12, 11, 12, 1, 12, 5, 5, 3, 12, 3, 10, 12, 7, 1, 14],
            [5, 7, 9, 10, 12, 3, 10, 6, 5, 3, 6, 1, 12, 7, 9, 12, 1, 12, 3, 12],
            [3, 12, 7, 9, 6, 9, 14, 11, 2, 10, 14, 5, 5, 9, 6, 5, 5, 3, 10, 6],
            [11, 2, 10, 2, 14, 3, 10, 10, 10, 10, 8, 6, 3, 6, 11, 6, 3, 10, 10, 14],
        ];

        return Maze.flattenStructure(structure) === expectedString;
    })())


    console.log("Maze.inflateStructure returns a maze structure from a given string", (function () {
        const string = "969c98c98aa8c9cd98cd,1a6365361ac534126536,1aaac1ac3e53c53e969c,1ae963e59a6963ac7945,5986b8c559c1a8e59675,5559a6365751c7963c96,5573acbc1c553c3ac71e,579ac3a65361c79c1c3c,3c7969eb2ae5596553a6,b2a2e3aaaa8636b63aae";

        const expectedStructure = [
            [9, 6, 9, 12, 9, 8, 12, 9, 8, 10, 10, 8, 12, 9, 12, 13, 9, 8, 12, 13],
            [1, 10, 6, 3, 6, 5, 3, 6, 1, 10, 12, 5, 3, 4, 1, 2, 6, 5, 3, 6],
            [1, 10, 10, 10, 12, 1, 10, 12, 3, 14, 5, 3, 12, 5, 3, 14, 9, 6, 9, 12],
            [1, 10, 14, 9, 6, 3, 14, 5, 9, 10, 6, 9, 6, 3, 10, 12, 7, 9, 4, 5],
            [5, 9, 8, 6, 11, 8, 12, 5, 5, 9, 12, 1, 10, 8, 14, 5, 9, 6, 7, 5],
            [5, 5, 5, 9, 10, 6, 3, 6, 5, 7, 5, 1, 12, 7, 9, 6, 3, 12, 9, 6],
            [5, 5, 7, 3, 10, 12, 11, 12, 1, 12, 5, 5, 3, 12, 3, 10, 12, 7, 1, 14],
            [5, 7, 9, 10, 12, 3, 10, 6, 5, 3, 6, 1, 12, 7, 9, 12, 1, 12, 3, 12],
            [3, 12, 7, 9, 6, 9, 14, 11, 2, 10, 14, 5, 5, 9, 6, 5, 5, 3, 10, 6],
            [11, 2, 10, 2, 14, 3, 10, 10, 10, 10, 8, 6, 3, 6, 11, 6, 3, 10, 10, 14],
        ];

        return deepEquals(expectedStructure, Maze.inflateStructure(string))
    })())

}

runTests();
