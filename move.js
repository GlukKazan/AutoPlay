"use strict";

function createContext(design, board, pos, piece) {
    return new MoveContext(design, board, pos, piece);
}

function MoveContext(design, board, pos, piece) {
    this.design  = design;
    this.board   = board;
    this.from    = pos;
    this.pos     = pos;
    this.mode    = null;
    this.parent  = null;
    this.part    = 1;
    this.piece   = piece;
    this.move    = new Move(this.mode);
    this.succeed = false;
    this.changes = [];
    this.marks   = [];
}
  
MoveContext.prototype.copy = function() {
    var r = new MoveContext(this.design, this.board, this.pos, this.piece);
    r.parent = this;
    r.part   = this.part + 1;
    r.move   = this.move.copy();
    r.mode   = this.mode;
    return r;
}

MoveContext.prototype.setPiece = function(pos, piece) {
    this.changes.push({
       p: pos,
       x: piece
    });
}
  
MoveContext.prototype.getPiece = function(pos) {
    for (var i = 0; i < this.changes.length; i++) {
        if (this.changes[i].p == pos) return this.changes[i].x;
    }
    if (this.parent !== null) {
        return this.parent.getPiece(pos);
    }
    return this.board.getPiece(pos);
}

MoveContext.prototype.mark = function() {
    this.marks.push(this.pos);
}
  
MoveContext.prototype.back = function() {
    if (this.marks.length > 0) {
        this.pos = this.marks[this.marks.length - 1];
    }
}
  
MoveContext.prototype.pop = function() {
    if (this.marks.length > 0) {
        this.pos = this.marks.pop();
    }
}
  
MoveContext.prototype.take = function() {
    this.hand = {
       start: this.pos,
       piece: this.board.getPiece(this.pos)
    };
}

MoveContext.prototype.put = function() {
    if (!_.isUndefined(this.hand)) {
        this.piece = this.hand.piece;
        this.move.movePiece(this.hand.start, this.pos, this.hand.piece, this.part);
        delete this.hand;
        this.succeed = true;
    }
}
  
MoveContext.prototype.getParam = function(params, ix) {
    if (_.isUndefined(params)) return null;
    if (_.isArray(params)) return params[ix];
    return params;
}

MoveContext.prototype.go = function(params, ix) {
    var dir = this.getParam(params, ix);
    if (dir === null) return false;
    var player = this.board.player;
    if (!_.isUndefined(this.hand)) {
        player = this.hand.piece.player;
    }
    var p = this.design.navigate(player, this.pos, dir);
    if (p === null) return false;
    this.pos = p;
    return true;
}
  
MoveContext.prototype.opposite = function(params, ix) {
    var dir = this.getParam(params, ix);
    if (dir === null) return null;
    return this.design.opposite(dir);
}

MoveContext.prototype.isLastFrom = function(params, ix) {
    var pos = this.getParam(params, ix);
    if (pos === null) {
        pos = this.pos;
    }
    if ((this.parent !== null) && (this.parent.parent !== null)) {
        if (pos == this.parent.parent.from) return true;
    }
    return this.board.isLastFrom(pos);
}

MoveContext.prototype.isLastTo = function(params, ix) {
    var pos = this.getParam(params, ix);
    if (pos === null) {
        pos = this.pos;
    }
    if ((this.parent !== null) && (this.parent.parent !== null)) {
        if (pos == this.parent.parent.from) return true;
    }
    return this.board.isLastTo(pos);
}

MoveContext.prototype.isEmpty = function() {
    return !this.getPiece(this.pos);
}
  
MoveContext.prototype.isEnemy = function() {
    var piece = this.getPiece(this.pos);
    if (!piece) return false;
    return piece.player != this.board.player;
}
  
MoveContext.prototype.isFriend = function() {
    var piece = this.getPiece(this.pos);
    if (!piece) return false;
    return piece.player == this.board.player;
}
  
MoveContext.prototype.isPiece = function(params, ix) {
    var t = this.getParam(params, ix);
    if (t === null) {
        return !this.isEmpty();
    }
    var piece = this.getPiece(this.pos);
    if (piece === null) return false;
    return piece.type == t;
}

MoveContext.prototype.inZone = function(params, ix) {
    var zone = this.getParam(params, ix);
    if (zone === null) return null;
    var player = this.board.player;
    if (!_.isUndefined(this.hand)) {
        player = this.hand.piece.player;
    }
    return this.design.inZone(player, this.pos, zone);
}
  
MoveContext.prototype.promote = function(params, ix) {
    if (_.isUndefined(this.hand)) return false;
    var type = this.getParam(params, ix);
    if (type === null) return false;
    this.hand.piece = this.hand.piece.promote(type);
    return true;
}
  
MoveContext.prototype.capture = function() {
    this.setPiece(this.pos, null);
    this.move.capturePiece(this.pos, this.part);
}
  
MoveContext.prototype.end = function(params, ix) {
    var hand = this.hand;
    this.put();
    this.mode = this.getParam(params, ix);
    if (this.succeed) {
        if (this.mode !== null) {
            var ctx = this.copy();
            this.board.forks.push(ctx);
        } else {
            this.board.moves.push(this.move);
        }
    }
    this.move = this.move.clone(this.part);
    this.hand = hand;
}
  
function createMove(mode) {
    return new Move(mode);
}

function Move(mode) {
    this.actions = [];
    this.mode    = mode;
}

Move.prototype.copy = function() {
    var r = new Move(this.mode);
    _.each(this.actions, function(a) {
        r.actions.push(a);
    });
    return r;
}
  
Move.prototype.clone = function(part) {
    var r = new Move(this.mode);
    _.each(this.actions, function(a) {
        if (a.from && a.to && (a.part == part)) return;
        r.actions.push(a);
    });
    return r;
}

Move.prototype.moveToString = function(design) {
    var r = ""; var p = null;
    for (var i = 0; i < this.actions.length; i++) {
         var a = this.actions[i];
         if (a.from && a.to) {
             if ((p === null) || (p != a.from)) {
                  if (r != "") r = r + " ";
                  r = r + design.posToString(a.from);
             }
             r = r + "-" + design.posToString(a.to);
             p = a.to;
         }
    }
    return r;
}

Move.prototype.isPass = function() {
    return this.actions.length == 0;
}
  
Move.prototype.isDropMove = function() {
    if (this.actions.length != 1) return false;
    return this.actions[0].from && this.actions[0].to && this.actions[0].piece;
}
  
Move.prototype.isSimpleMove = function() {
    if (this.actions.length != 1) return false;
    return this.actions[0].from && this.actions[0].to !== null;
}
 
Move.prototype.movePiece = function(from, to, piece, part) {
    if (_.isUndefined(part)) part = 1;
    this.actions.push({
        from: from,
        to: to,
        piece: piece,
        part: part
    });
}
  
Move.prototype.capturePiece = function(from, part) {
    if (_.isUndefined(part)) part = 1;
    this.actions.push({
        from: from,
        part: part
    });
}
  
Move.prototype.dropPiece = function(to, piece, part) {
    if (_.isUndefined(part)) part = 1;
    this.actions.push({
        to: to,
        piece: piece,
        part: part
    });
}

module.exports.createContext = createContext;
module.exports.createMove = createMove;