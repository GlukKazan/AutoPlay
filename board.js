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

function Undo(player, baseEval, zLow, zHigh) {
    this.player   = player;
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
}
  
Board.prototype.applyAction = function(action) {
    // TODO:

}

Board.prototype.redoMove = function(move) {
    this.history.push(new Undo(this.player, this.baseEval, this.zLow, this.zHigh));
    for (let i = 0; i < move.actions.length; i++) {
        this.applyAction(move.actions[i]);
    }
    this.zLow ^= z_player_low[this.player];
    this.zHigh ^= z_player_high[this.player];
    this.turn = this.design.nextTurn(this.turn);
    this.player = this.design.currPlayer(this.turn);
    this.baseEval = -this.baseEval;
    this.zLow ^= z_player_low[this.player];
    this.zHigh ^= z_player_high[this.player];
}

Board.prototype.applyMove = function(move) {
    this.redoMove(move);
    this.history  = [];
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