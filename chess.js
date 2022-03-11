"use strict";

const pieceAdj = [
    [   0,    0,   0,   0,   0,   0,    0,    0, // Empty
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0 
    ], 
    [   0,    0,   0,   0,   0,   0,    0,    0, // Pawn
      -25,  105, 135, 270, 270, 135,  105,  -25,
      -80,    0,  30, 176, 176,  30,    0,  -80,
      -85,   -5,  25, 175, 175,  25,   -5,  -85,
      -90,  -10,  20, 125, 125,  20,  -10,  -90,
      -95,  -15,  15,  75,  75,  15,  -15,  -95, 
     -100,  -20,  10,  70,  70,  10,  -20, -100, 
        0,    0,   0,   0,   0,   0,    0,    0
    ],
    [-200, -100, -50, -50, -50, -50, -100, -200, // Knight
     -100,    0,   0,   0,   0,   0,    0, -100,
      -50,    0,  60,  60,  60,  60,    0,  -50,
      -50,    0,  30,  60,  60,  30,    0,  -50,
      -50,    0,  30,  60,  60,  30,    0,  -50,
      -50,    0,  30,  30,  30,  30,    0,  -50,
     -100,    0,   0,   0,   0,   0,    0,  -100,
     -200,  -50, -25, -25, -25, -25,  -50,  -200
    ],
    [ -50,  -50,  -25,-10, -10, -25,  -50,   -50, // Bishop
      -50,  -25,  -10,  0,   0, -10,  -25,   -50,
      -25,  -10,    0, 25,  25,   0,  -10,   -25,
      -10,    0,   25, 40,  40,  25,    0,   -10,
      -10,    0,   25, 40,  40,  25,    0,   -10,
      -25,  -10,    0, 25,  25,   0,  -10,   -25,
      -50,  -25,  -10,  0,   0, -10,  -25,   -50,
      -50,  -50,  -25,-10, -10, -25,  -50,   -50
    ],
    [ -60,  -30,  -10, 20,  20, -10,  -30,   -60, // Rook
       40,   70,   90,120, 120,  90,   70,    40,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60,
      -60,  -30,  -10, 20,  20, -10,  -30,   -60
    ],
    [   0,    0,   0,   0,   0,   0,    0,    0, // Queen
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0, 
        0,    0,   0,   0,   0,   0,    0,    0 
    ], 
    [  50,  150, -25, -125, -125, -25, 150,  50, // King
       50,  150, -25, -125, -125, -25, 150,  50,
       50,  150, -25, -125, -125, -25, 150,  50,
       50,  150, -25, -125, -125, -25, 150,  50,
       50,  150, -25, -125, -125, -25, 150,  50,
       50,  150, -25, -125, -125, -25, 150,  50,
       50,  150, -25, -125, -125, -25, 150,  50,
      150,  250,  75,  -25,  -25,  75, 250, 150
    ]];
    
let step = function(ctx, params) {
    if (ctx.go(params, 0) && !ctx.isFriend()) {
        ctx.end();
    }
}

let pawnShift = function(ctx, params) {
    if (ctx.go(params, 0) && ctx.isEmpty()) {
        if (ctx.inZone(0)) {
            ctx.promote(4);
        }    
        ctx.end();
    }
}

let pawnLeap = function(ctx, params) {
    if (ctx.go(params, 0) && ctx.isEnemy()) {
        if (ctx.inZone(0)) {
            ctx.promote(4);
        }    
        ctx.end();
    }
}

let pawnJump = function(ctx, params) {
    if (ctx.go(params, 0) && 
        ctx.isEmpty() && 
        ctx.inZone(1) && 
        ctx.go(params, 0) && 
        ctx.isEmpty()) {
        ctx.end();
    }
}

let enPassant = function(ctx, params) {
    if (ctx.go(params, 0) &&
        ctx.isEnemy() &&
        ctx.isPiece(0)) {
        ctx.capture();
        if (ctx.go(params, 1)) {
            ctx.put();
            if (ctx.go(params, 1) &&
                ctx.isLastFrom()) {
                ctx.end();
            }
        }
    }
}

let jump = function(ctx, params) {
    if (ctx.go(params, 0) && 
        ctx.go(params, 1) && 
       !ctx.isFriend()) {
        ctx.end();
    }
}

let slide = function(ctx, params) {
    while (ctx.go(params, 0)) {
        if (ctx.isFriend()) break;
        ctx.end();
        if (!ctx.isEmpty()) break;
    }
}

let O_O = function(ctx, params) {
    if (ctx.go(params, 0) &&
        ctx.isEmpty() &&
        ctx.go(params, 0) &&
        ctx.isEmpty()) {
        ctx.put();
        if (ctx.go(params, 0) &&
            ctx.isFriend() &&
            ctx.isPiece(1)) {
            ctx.take();
            if (ctx.go(params, 1) &&
                ctx.go(params, 1)) {
                ctx.end();
            }
        }
    }
}

let O_O_O = function(ctx, params) {
    if (ctx.go(params, 0) &&
        ctx.isEmpty() &&
        ctx.go(params, 0) &&
        ctx.isEmpty()) {
        ctx.put();
        if (ctx.go(params, 0) &&
            ctx.isEmpty() &&
            ctx.go(params, 0) &&
            ctx.isFriend() &&
            ctx.isPiece(1)) {
            ctx.take();
            if (ctx.go(params, 1) &&
                ctx.go(params, 1) &&
                ctx.go(params, 1)) {
                ctx.end();
            }
        }
    }
}

function build(design) {
    design.setOption("smart-moves", "false");

    let g = design.addGrid();
    g.addScale("a/b/c/d/e/f/g/h"); g.addScale("8/7/6/5/4/3/2/1");
    g.addDirection("n",[ 0, -1]); g.addDirection("nw",[-1, -1]);
    g.addDirection("e",[ 1,  0]); g.addDirection("ne",[ 1, -1]);
    g.addDirection("w",[-1,  0]); g.addDirection("sw",[-1,  1]);
    g.addDirection("s",[ 0,  1]); g.addDirection("se",[ 1,  1]);
    design.addPlayer("White", [6, 7, 4, 5, 2, 3, 0, 1]);
    design.addPlayer("Black", [6, 5, 2, 7, 4, 1, 0, 3]);
    g.addPositions();

    design.addZone("last-rank", 1, ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"]);
    design.addZone("last-rank", 2, ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]);
    design.addZone("third-rank", 1, ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"]);
    design.addZone("third-rank", 2, ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"]);

    design.addPiece("Pawn", 1, 800);
    design.addMove(1, pawnShift, [4], 0);
    design.addMove(1, pawnJump, [4], 0);
    design.addMove(1, pawnLeap, [7], 0);
    design.addMove(1, pawnLeap, [3], 0);
    design.addMove(1, enPassant, [1, 4], 0);
    design.addMove(1, enPassant, [0, 4], 0);

    design.addPiece("Knight", 2, 3350);
    design.addMove(2, jump, [4, 7], 0);
    design.addMove(2, jump, [4, 3], 0);
    design.addMove(2, jump, [2, 6], 0);
    design.addMove(2, jump, [2, 5], 0);
    design.addMove(2, jump, [0, 7], 0);
    design.addMove(2, jump, [0, 6], 0);
    design.addMove(2, jump, [1, 3], 0);
    design.addMove(2, jump, [1, 5], 0);

    design.addPiece("Bishop", 3, 3450);
    design.addMove(3, slide, [7], 0);
    design.addMove(3, slide, [6], 0);
    design.addMove(3, slide, [3], 0);
    design.addMove(3, slide, [5], 0);

    design.addPiece("Rook", 4, 5000);
    design.addMove(4, slide, [4], 0);
    design.addMove(4, slide, [2], 0);
    design.addMove(4, slide, [0], 0);
    design.addMove(4, slide, [1], 0);

    design.addPiece("Queen", 5, 9750);
    design.addMove(5, slide, [4], 0);
    design.addMove(5, slide, [2], 0);
    design.addMove(5, slide, [0], 0);
    design.addMove(5, slide, [1], 0);
    design.addMove(5, slide, [7], 0);
    design.addMove(5, slide, [6], 0);
    design.addMove(5, slide, [3], 0);
    design.addMove(5, slide, [5], 0);

    design.addPiece("King", 6, 600000);
    design.addMove(6, step, [4], 0);
    design.addMove(6, step, [2], 0);
    design.addMove(6, step, [0], 0);
    design.addMove(6, step, [1], 0);
    design.addMove(6, step, [7], 0);
    design.addMove(6, step, [6], 0);
    design.addMove(6, step, [3], 0);
    design.addMove(6, step, [5], 0);
    design.addMove(6, O_O, [1, 0], 1);
    design.addMove(6, O_O_O, [0, 1], 1);

    design.setAdj(pieceAdj);

    design.setup("White", "Pawn", ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]);
    design.setup("White", "Rook", ["a1", "h1"]);
    design.setup("White", "Knight", ["b1", "g1"]);
    design.setup("White", "Bishop", ["c1", "f1"]);
    design.setup("White", "Queen", ["d1"]);
    design.setup("White", "King", ["e1"]);
    design.setup("Black", "Pawn", ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]);
    design.setup("Black", "Rook", ["a8", "h8"]);
    design.setup("Black", "Knight", ["b8", "g8"]);
    design.setup("Black", "Bishop", ["c8", "f8"]);
    design.setup("Black", "Queen", ["d8"]);
    design.setup("Black", "King", ["e8"]);
}

module.exports.build = build;
