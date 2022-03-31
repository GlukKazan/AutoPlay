"use strict";

const z = require('./zobrist');

let mt            = null;
let z_low         = null;
let z_high        = null;
let z_player_low  = null;
let z_player_high = null;

function create(design) {
    if (mt === null) {
        mt = z.create();
        z_low  = new Array(design.positions.length - 1);
        z_high = new Array(design.positions.length - 1);
        for (let pos = 0; pos < design.positions.length; pos++) {
            z_low[pos]  = new Array(design.pieces.length);
            z_high[pos] = new Array(design.pieces.length);
            for (let piece = 0; piece < design.pieces.length; piece++) {
                z_low[pos][piece]  = new Array(design.playerNames.length);
                z_high[pos][piece] = new Array(design.playerNames.length);
                for (let player = 0; player < design.playerNames.length; player++) {
                    z_low[pos][piece][player] = mt.next(32);
                    z_high[pos][piece][player] = mt.next(32);
                }
            }
        }
        z_player_low  = new Array(design.playerNames.length);
        z_player_high = new Array(design.playerNames.length);
        for (let player = 0; player < design.playerNames.length; player++) {
            z_player_low[player]  = mt.next(32);
            z_player_high[player] = mt.next(32);
        }
    }
    return new Board(design);
}

function Undo(turn, baseEval, zLow, zHigh) {
    this.turn     = turn;
    this.baseEval = baseEval;
    this.zLow     = zLow;
    this.zHigh    = zHigh;
}

function Board(design) {
    this.design   = design;
    this.pieces   = [];
    this.turn     = 0;
    this.player   = design.currPlayer(this.turn);
    this.zLow     = 0;
    this.zHigh    = 0;
    this.baseEval = 0;
    this.history  = [];
    this.captured = [];
}
  
Board.prototype.redoAction = function(action) {
    if (action.to) {
        this.captured.push(this.pieces[action.to]);
    } else if (action.from) {
        this.captured.push(this.pieces[action.from]);
    }
    if (action.from) {
        const pos = action.from;
        const piece = this.pieces[pos];
        if (piece) {
            this.zLow ^= z_low[pos][piece.type][piece.player];
            this.zHigh ^= z_high[pos][piece.type][piece.player];
            this.baseEval -= this.design.price[piece.type];
            if (this.design.adj) {
                let p = pos - 1;
                if (this.player != 1) {
                    p = this.design.adj[0][p];
                }
                this.baseEval -= this.design.adj[piece.type][p];
            }
        }
        this.pieces[pos] = null;
    }
    if (action.to && action.piece) {
        const pos = action.to;
        this.zLow ^= z_low[pos][piece.type][piece.player];
        this.zHigh ^= z_high[pos][piece.type][piece.player];
        this.baseEval += this.design.price[piece.type];
        if (this.design.adj) {
            let p = pos - 1;
            if (this.player != 1) {
                p = this.design.adj[0][p];
            }
            this.baseEval += this.design.adj[piece.type][p];
        }
        this.pieces[pos] = action.piece;
    }
}

Board.prototype.undoAction = function(action) {
    if (action.to) {
        if (this.captured.length == 0) return false;
        if (action.from) {
            this.pieces[action.from] = this.pieces[action.to];
        }
        this.pieces[action.to] = this.captured.pop();
    } else if (action.from) {
        if (this.captured.length == 0) return false;
        this.pieces[action.from] = this.captured.pop();
    } else return false;
    return true;
}

Board.prototype.redoMove = function(move) {
    this.history.push(new Undo(this.turn, this.baseEval, this.zLow, this.zHigh));
    for (let i = 0; i < move.actions.length; i++) {
        this.redoAction(move.actions[i]);
    }
    this.zLow ^= z_player_low[this.player];
    this.zHigh ^= z_player_high[this.player];
    this.turn = this.design.nextTurn(this.turn);
    this.player = this.design.currPlayer(this.turn);
    this.baseEval = -this.baseEval;
    this.zLow ^= z_player_low[this.player];
    this.zHigh ^= z_player_high[this.player];
}

Board.prototype.undoMove = function(move) {
    if (this.history.length == 0) return false;
    for (let i = move.actions.length; i >= 0; i--) {
        if (!this.undoAction(move.actions[i])) return false;
    }
    const u = this.history.pop();
    this.turn = u.turn;
    this.player = design.currPlayer(this.turn);
    this.zLow = u.zLow;
    this.zHigh = u.zHigh;
    this.baseEval = u.baseEval;
    return true;
}

Board.prototype.clear = function() {
    this.history  = [];
    this.captured = [];
}

Board.prototype.setLastFrom = function(pos) {
    this.lastFrom = pos; 
}
  
Board.prototype.isLastFrom = function(pos) {
    if (!_.isUndefined(this.lastFrom)) {
         return this.lastFrom == pos;
    }
    return false;
}
  
Board.prototype.setLastTo = function(pos) {
    this.lastTo = pos; 
}
  
Board.prototype.isLastTo = function(pos) {
    if (!_.isUndefined(this.lastTo)) {
         return this.lastTo == pos;
    }
    return false;
}
  
Board.prototype.getPiece = function(pos) {
    if (_.isUndefined(this.pieces[pos])) {
        return null;
    } else {
        return this.pieces[pos];
    }
}
  
Board.prototype.setPiece = function(pos, piece) {
    this.pieces[pos] = piece;
}

module.exports.create = create;