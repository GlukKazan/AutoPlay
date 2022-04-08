"use strict";

const fen = "1pnbrqk";

const pieceAdj = [
    [  63,   62,  61,  60,  59,  58,   57,   56, // Flip
       55,   54,  53,  52,  51,  50,   49,   48, 
       47,   46,  45,  44,  43,  42,   41,   40, 
       39,   38,  37,  36,  35,  34,   33,   32, 
       31,   30,  29,  28,  27,  26,   25,   24, 
       23,   22,  21,  20,  19,  18,   17,   16, 
       15,   14,  13,  12,  11,  10,    9,    8, 
        7,    6,   5,   4,   3,   2,    1,    0 
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
    
const step = function(ctx, params) {
    if (ctx.go(params, 0) && !ctx.isFriend()) {
        ctx.end();
    }
}

const pawnShift = function(ctx, params) {
    if (ctx.go(params, 0) && ctx.isEmpty()) {
        if (ctx.inZone(0)) {
            ctx.promote(5);
        }    
        ctx.end();
    }
}

const pawnLeap = function(ctx, params) {
    if (ctx.go(params, 0) && ctx.isEnemy()) {
        if (ctx.inZone(0)) {
            ctx.promote(5);
        }    
        ctx.end();
    }
}

const pawnJump = function(ctx, params) {
    if (ctx.go(params, 0) && 
        ctx.isEmpty() && 
        ctx.inZone(1) && 
        ctx.go(params, 0) && 
        ctx.isEmpty()) {
        ctx.end();
    }
}

const enPassant = function(ctx, params) {
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

const jump = function(ctx, params) {
    if (ctx.go(params, 0) && 
        ctx.go(params, 1) && 
       !ctx.isFriend()) {
        ctx.end();
    }
}

const slide = function(ctx, params) {
    while (ctx.go(params, 0)) {
        if (ctx.isFriend()) break;
        ctx.end();
        if (!ctx.isEmpty()) break;
    }
}

const O_O = function(ctx, params) {
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

const O_O_O = function(ctx, params) {
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

const checkAttrs = function(board, list) {
    if (list.length != 2) return true;
    for (let i = 0; i < list.length; i++) {
        const piece = board.getPiece(list[i]);
        if (piece !== null) {
            if (piece.getValue(0) !== null) return false;
        }
    }
    return true;
}

const setAttrs = function(board, move, list) {
    for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < move.actions.length; j++) {
            if (move.actions[j].to == list[i]) {
                const piece = board.getPiece(list[i]);
                if (piece !== null) move.actions[j].piece = piece.setValue(0, true);
            }
        }
    }
}

const checkDirection = function(design, board, player, pos, dir, leapers, riders) {
    let p = design.navigate(player, pos, dir);
    if (p === null) return false;
    let piece = board.getPiece(p);
    if (piece !== null) {
        if (piece.player == player) return false;
        return (_.indexOf(leapers, +piece.type) >= 0) || (_.indexOf(riders, +piece.type) >= 0);
    }
    while (piece === null) {
        p = design.navigate(player, p, dir);
        if (p === null) return false;
        piece = board.getPiece(p);
    }
    if (piece.player == player) return false;
    return _.indexOf(riders, +piece.type) >= 0;
  }

const checkLeap = function(design, board, player, pos, o, d, knight) {
    let p = design.navigate(player, pos, o);
    if (p === null) return false;
    p = design.navigate(player, p, d);
    if (p === null) return false;
    let piece = board.getPiece(p);
    if (piece === null) return false;
    return (piece.player != player) && (piece.type == knight);
  }

const checkPositions = function(design, board, player, positions) {
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (checkDirection(design, board, player, pos, 0,  [6], [4, 5])) return false;
        if (checkDirection(design, board, player, pos, 1,  [6], [4, 5])) return false;
        if (checkDirection(design, board, player, pos, 2,  [6], [4, 5])) return false;
        if (checkDirection(design, board, player, pos, 3,  [6], [4, 5])) return false;
        if (checkDirection(design, board, player, pos, 4,  [1, 6], [3, 5])) return false;
        if (checkDirection(design, board, player, pos, 5,  [1, 6], [3, 5])) return false;
        if (checkDirection(design, board, player, pos, 6,  [6], [3, 5])) return false;
        if (checkDirection(design, board, player, pos, 7,  [6], [3, 5])) return false;
        if (checkLeap(design, board, player, pos, 0, 4, 2)) return false;
        if (checkLeap(design, board, player, pos, 0, 5, 2)) return false;
        if (checkLeap(design, board, player, pos, 3, 6, 2)) return false;
        if (checkLeap(design, board, player, pos, 3, 7, 2)) return false;
        if (checkLeap(design, board, player, pos, 1, 5, 2)) return false;
        if (checkLeap(design, board, player, pos, 1, 7, 2)) return false;
        if (checkLeap(design, board, player, pos, 2, 4, 2)) return false;
        if (checkLeap(design, board, player, pos, 2, 6, 2)) return false;
    }
    return true;
}

const invariant = function(board, moves) {
    let r = [];
    const player = board.player;
    _.each(moves, function(move) {
        board.redoMove(move);
        const king = board.findPiece(player, 6);
        if (king !== null) {
            let list = [king];
            if (move.actions.length == 2) {
                list.push(move.actions[1].to);
            }
            if (checkAttrs(board, list) &&
                checkPositions(design, board, player, list)) {
                setAttrs(board, move, list);
                r.push(move);
            }
        }
        board.undoMove(move);
    });
    return r;
}

// TODO: Goal
// TODO: Promotion (check moveToString)

function build(design) {
    design.setOption("smart-moves", "false");

    let g = design.addGrid();
    g.addScale("a/b/c/d/e/f/g/h"); g.addScale("8/7/6/5/4/3/2/1");
    g.addDirection("n",[ 0, -1]);   // 0
    g.addDirection("e",[ 1,  0]);   // 1
    g.addDirection("w",[-1,  0]);   // 2
    g.addDirection("s",[ 0,  1]);   // 3
    g.addDirection("nw",[-1, -1]);  // 4
    g.addDirection("ne",[ 1, -1]);  // 5
    g.addDirection("sw",[-1,  1]);  // 6
    g.addDirection("se",[ 1,  1]);  // 7
    design.addPlayer("White", [3, 2, 1, 0, 7, 6, 5, 4]);
    design.addPlayer("Black", [3, 1, 2, 0, 6, 7, 4, 5]);
    g.addPositions();

    design.addZone("last-rank", 1, ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"]);
    design.addZone("last-rank", 2, ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]);
    design.addZone("third-rank", 1, ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"]);
    design.addZone("third-rank", 2, ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"]);

    design.addPiece("Pawn", 1, 800);
    design.addMove(1, pawnShift, [0], 0);
    design.addMove(1, pawnJump, [0], 0);
    design.addMove(1, pawnLeap, [4], 0);
    design.addMove(1, pawnLeap, [5], 0);
    design.addMove(1, enPassant, [1, 0], 0);
    design.addMove(1, enPassant, [2, 0], 0);

    design.addPiece("Knight", 2, 3350);
    design.addMove(2, jump, [0, 4], 0);
    design.addMove(2, jump, [0, 5], 0);
    design.addMove(2, jump, [3, 6], 0);
    design.addMove(2, jump, [3, 7], 0);
    design.addMove(2, jump, [1, 5], 0);
    design.addMove(2, jump, [1, 7], 0);
    design.addMove(2, jump, [2, 4], 0);
    design.addMove(2, jump, [2, 6], 0);

    design.addPiece("Bishop", 3, 3450);
    design.addMove(3, slide, [4], 0);
    design.addMove(3, slide, [5], 0);
    design.addMove(3, slide, [6], 0);
    design.addMove(3, slide, [7], 0);

    design.addPiece("Rook", 4, 5000);
    design.addMove(4, slide, [0], 0);
    design.addMove(4, slide, [1], 0);
    design.addMove(4, slide, [2], 0);
    design.addMove(4, slide, [3], 0);

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
    design.addMove(6, O_O, [1, 2], 1);
    design.addMove(6, O_O_O, [2, 1], 1);

    design.setAdj(pieceAdj);
    design.addInvariant(invariant);
    design.setup(8, 8, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", fen);
}

module.exports.build = build;
