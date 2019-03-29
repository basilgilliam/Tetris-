const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const sq = 20;
const scoreElement = document.getElementById('score');

const row = 20;
const col = 10;
const vacant = 'white';

// -- draw a square --

const drawSquare = (x,y,color) =>{
context.fillStyle = color;
context.fillRect(x*sq, y*sq, sq, sq);

context.strokeStyle = 'black';
context.strokeRect(x*sq,y*sq,sq,sq);
}



// -- create the board --

let board = [];
 
for (r = 0; r < row; r++){
    board[r] = [];
    for(c = 0; c < col; c++){
        board[r][c] = vacant;
    }
}



// -- draw board --

const drawboard = () =>{
    for(r = 0; r < row; r++){
        for(c = 0; c < col; c++){
            drawSquare(c,r, board[r][c])
        }
    }
}

drawboard();



// -- The pieces and their colors

const Pieces = [
    [Z, "red"],
    [S, 'blue'],
    [T, 'yellow'],
    [O,'green'],
    [L, 'purple'],
    [I, 'orange'],
    [J, 'indigo']
];

//make random piece

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * Pieces.length);
    return new Piece( Pieces[r][0], Pieces[r][1]);
}

let p = randomPiece();



// -- The object piece --


function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // start from the first pattern in array
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // need to conrtol the pieces

    this.x = 3;
    this.y = 0;
 }


// fill function 

Piece.prototype.fill = function(color){
    for (r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw the occcupied squares only
            if(this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}


// -- draw a piece to the board --

Piece.prototype.draw = function(){
    this.fill(this.color);
}


// -- undraw the piece --

Piece.prototype.unDraw = function(){
    this.fill(vacant);
}


// -- move the piece down --

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
    this.unDraw();
    this.y++;
    this.draw();
    } else{
        this.lock();
        p = randomPiece();
    }
}

// -- move piece to the right --

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
    this.unDraw();
    this.x++;
    this.draw();
    } else{
       
    }
}

// -- move piece to the left --

Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
    this.unDraw();
    this.x--;
    this.draw();
    } else{

    }
}


// -- rotate piece --

Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    if(!this.collision(0,0,nextPattern)){
        if (this.x > col/2){
            //right wall
            kick =  -1;   // move piece to the left

        } else {
            // left wall
            kick = 1;    // move piece to the right

        }
    }

    if(!this.collision(kick,0,nextPattern)){
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
    } else{

    }
}

let score = 0;

Piece.prototype.lock = function(){
    for (r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // need to skip the vacant squares
            if(!this.activeTetromino[r][c]){
               continue;
            }
            // check if piece is on top of board = Game Over
            if(this.y + r < 0){
                alert ('Game Over!')
                // stop request animation frame
                gameOver = true;
                break;
            }
            // lock the piece
            board[this.y + r][this.x + c] = this.color;
        }
    }
    // -- remove full rows --
    for(r = 0; r < row; r++){
        let isRowFull = true;
        for( c = 0; c < col; c++){
            isRowFull = isRowFull && (board[r][c] != vacant);
        }
        if(isRowFull){
            // if the row is full we move all the rows above it down
            for( y =r; y > 1; y--){
                for(c = 0; c < col; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][...] has no row above it
            for(c = 0; c < col; c++){
                board[0][c] = vacant;
            }
            //increment the score
            score += 10;
        }
    }
    // update the board
    drawboard();

    // update the score
    scoreElement.innerHTML = score;
}


// -- collision function against walls and other pieces --


Piece.prototype.collision= function(x,y,piece){
    for (r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinate of the piece after the movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if(newX < 0 || newX >= col || newY >= row || newY < 0){
               return true;
            }
            // skip newY <0; no board[-1].. will break
            if(newY < 0){
                continue;
            }
            //check if there is locked piece already in place
            if(board[newY][newX] != vacant){
                return true;
            }

        }
    }
    return false;
}



// -- CONTROL the piece --
const control = (event) =>{
if(event.keyCode === 37){
    p.moveLeft();
    dropStart = Date.now();
} else if (event.keyCode === 38){
    p.rotate();
    dropStart = Date.now();
} else if(event.keyCode === 39){
    p.moveRight();
    dropStart = Date.now();
} else if(event.keyCode === 40){
    p.moveDown();
    dropStart = Date.now();
} 
}
document.addEventListener('keydown', control);

// -- drop the piece every 1 sec --

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if( delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
}


drop();






















































































































// // --- make sqaures --- 
// const drawSquare = (x, y, color) =>{
//     context.fillStyle = color;
//     context.fillRect(x*sq, y*sq, sq, sq);
//     context.strokeStyle ='#000';
//     context.strokeRect(x*sq, y*sq, sq, sq);
// }


// // ---- create board ---
// const rows = 20;
// const columns = 10;
// const vacant = 'white';

// let board = [];
// for(r = 0; r < rows; r++){
//     board[r] = [];
//     for(c = 0; c < columns; c++){
//         board[r][c] = vacant;
//     }
// }

// //----- draw board -----
// const drawboard = () =>{
//     for(r=0; r < rows; r++){
//         for(c = 0; c < columns; c++){
//             drawSquare(c,r,board[r][c]);
//         }
//     }
// }

// drawboard();

// // ----- building tetris pieces -----
// //---- each array is position of piece according to 1 -----
// // const z = [[ 
// //     [1,1,0], [0,0,1], [0,0,0], [0,1,0],
// //     [0,1,1], [0,1,1], [1,1,0], [1,1,0],
// //     [0,0,0], [0,1,0], [0,1,1], [1,0,0]
// // ]];

// // let piece = z[0];
// // const pieceColor = 'orange';

// // for( r = 0; r < piece.length; r++){
// //     for( c = 0; c < piece.length; c++){
// //         if(piece[r][c]){
// //             drawSquare(c,r,pieceColor);
// //         }
// //     }
// // }

// // // ----- construction function ----
// // let piece = new piece(z, 'blue')

// // const piece = (tetromino, color) =>{
// //     this.tetromino = tetromino;
// //     this.tetrominoNum = 0;
// //     this.activeTetromino = this.tetromino[this.tetrominoNum];
// //     this.color = color;
// //     this.x = 3;
// //     this.y = -2;
// // }

// // for( r = 0; r < this.activeTetromino.length; r++){
// //     for( c = 0; c < this.activeTetromino.length; c++){
// //         drawSquare(c,r,this.color);
// //     }
// // }


// // ----- draw and undraw() function -----
// //draw
// Piece.prototype.draw = function(){
//     for(r = 0; r < this.activeTetromino.length; r++){
//         for(c = 0; r < this.activeTetromino.length; c++){
//             if(this.activeTetromino[r][c] ){
//                 drawSquare(this.x + c, this.y + r, this.color);
//             }
//         }
//     }
// }

// //undraw
// Piece.prototype.unDraw = function(){
//     for(r = 0; r < this.activeTetromino.length; r++){
//         for(c = 0; r < this.activeTetromino.length; c++){
//             if(this.activeTetromino[r][c] ){
//                 drawSquare(this.x + c, this.y + r, Vacant);
//             }
//         }
//     }
// }


// // --- Control Pieces ---

// const control = (event) => {
//     if(event.keyCode === 37){
//         piece.moveLeft();
//     } else if(event.keyCode === 38){
//         piece.rotate();
//     } else if(event.keyCode === 39){
//         piece.moveRight();
//     } else if(event.keyCode === 40){
//         piece.moveDown();
//     }
// };

// document.addEventListener('keydown', control())


// --- Collision Detection ----
// If Collision = false... do movement
// if Collision = true .. dont do movement
// Needs to know the piece and its future coordinates

// Piece.prototype.collision = function(x,y,piece) x and y = The future piece coordinates 
// ex. move left = this.collision(-1,0,this.activeTetromino)



// --- Rotate a Piece ---

// this.tetrominoN = 0
// this.tetrominoN; = (Z[0]) 
// this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length
// Piece.prototype.rotate = function(){
//    this.undraw();
//    this.tetrominoN = (this.tetrominN + 1) % this.tetromino.length  
//    this.activeTetromino = this.tetromino[this.tetrominoN];
//    this.draw();
        // // let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        //    let kick = 0;
        //    if(this.collision(0, 0, nextPattern)){
        //        if (this.x > col/2){
        //            kick = -1;
        //        } else{
        //            kick = 1
        //        }
        //    }


        // if(!this.collision(kick,0,nextPattern)){
        //     this.undraw();
        //     this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        //     this.activeTetromino = this.tetromino[this.tetrominoN];
        //     this.draw();
        // }
//}



// --- Random Piece Function ---

