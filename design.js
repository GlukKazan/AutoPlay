"use strict";

const _ = require('underscore');

let design = null;

function create() {
    if (design === null) {
        design = new Design();
    }
    return design;
}

function Design() {
    this.options       = [];
    this.dirs          = [];
    this.players       = [];
    this.playerNames   = [];
    this.positions     = [null];
    this.positionNames = [''];
    this.modes         = [];
    this.zones         = [];
    this.zoneNames     = [];
    this.pieces        = [];
    this.price         = [0];
    this.moves         = [];
}

Design.prototype.allDirections = function() {
    return _.range(this.dirs.length);
}
  
Design.prototype.allPositions = function() {
    return _.range(1, this.positions.length - 1);
}

Design.prototype.allPlayers = function() {
    return _.range(1, this.playerNames.length - 1);
}

Design.prototype.getDirection = function(name) {
    var dir = _.indexOf(this.dirs, name);
    if (dir < 0) {
        return null;
    }
    return dir;
}
  
Design.prototype.navigate = function(player, pos, dir) {
    if (!_.isUndefined(this.players[player])) {
        dir = this.players[player][dir];
    }
    if (this.positions[pos][dir] != 0) {
        return +pos + this.positions[pos][dir];
    } else {
        return null;
    }
}
  
Design.prototype.opposite = function(dir, player) {
    if (_.isUndefined(player)) {
        player = 0;
    }
    return this.players[player][dir];
}

Design.prototype.getZone = function(name) {
    var zone = _.indexOf(this.zoneNames, name);
    if (zone < 0) return null;
    return zone;
}
  
Design.prototype.inZone = function(player, pos, zone) {
    if (!_.isUndefined(this.zones[zone])) {
        if (!_.isUndefined(this.zones[zone][player])) {
            return _.indexOf(this.zones[zone][player], pos) >= 0;
        }
    }
    return false;
}

Design.prototype.nextPlayer = function(player) {
    if (player + 1 >= this.playerNames.length) {
        return 1;
    } else {
        return player + 1;
    }
}
  
Design.prototype.nextTurn = function(board) {
    var turn = board.turn + 1;
    if (_.isUndefined(this.turns)) {
        if (turn >= this.players.length - 1) {
            turn = 0;
            if (!_.isUndefined(this.repeat)) {
                turn += this.repeat;
            }
        }
    } else {
        if (turn >= this.turns.length) {
            turn = 0;
            if (!_.isUndefined(this.repeat)) {
                turn += this.repeat;
            }
        }
    }
    return turn;
}

Design.prototype.currPlayer = function(turn) {
    if (_.isUndefined(this.turns)) {
        return turn + 1;
    } else {
        return this.turns[turn].player;
    }
}
  
Design.prototype.setOption = function(name, value) {
    this.options[name] = value;
}

Design.prototype.getOption = function(name) {
    return this.options[name];
}

Design.prototype.posToString = function(pos) {
    if (_.isUndefined(this.positionNames[pos])) return "?";
    return this.positionNames[pos];
}
 
Design.prototype.stringToPos = function(name) {
    var pos = _.indexOf(this.positionNames, name);
    if (pos < 0) return null;
    return pos;
}
 
Design.prototype.addDirection = function(name) {
    this.dirs.push(name);
}

Design.prototype.addPlayer = function(name, symmetry) {
    var ix = this.playerNames.length;
    if (this.playerNames.length == 0) {
        this.playerNames.push("opposite");
    }
    this.players[ix] = symmetry;
    this.playerNames.push(name);
}

Design.prototype.addTurn = function(player, modes) {
    if (_.isUndefined(this.turns)) {
        this.turns = [];
    }
    if (!_.isUndefined(modes) && !_.isArray(modes)) {
        modes = [modes];
    }
    this.turns.push({
        p: player,
        m: modes
    });
}
  
Design.prototype.repeatMark = function() {
    if (_.isUndefined(this.turns)) {
        this.turns = [];
    }
    this.repeat = this.turns.length;
}
  
Design.prototype.addPosition = function(name, dirs) {
   if ((this.positions.length == 0) && (name != "start")) {
        this.positionNames.push("start");
        this.positions.push(_.map(_.range(dirs.length), function(n) {return 0;}));
   }
   this.positionNames.push(name);
   this.positions.push(dirs);
 }

Design.prototype.addZone = function(name, player, positions) {
    var zone = _.indexOf(this.zoneNames, name);
    if (zone < 0) {
        zone = this.zoneNames.length;
        this.zoneNames.push(name);
    }
    if (_.isUndefined(this.zones[zone])) {
        this.zones[zone] = [];
    }
    this.zones[zone][player] = _.map(positions, function(name) {
        return this.stringToPos(name);
    }, this);
}

Design.prototype.addPriority = function(mode) {
    this.modes.push(mode);
}
  
Design.prototype.addPiece = function(name, type, price) {
    this.pieces[type] = name;
    this.price[type] = price ? price : 1;
}

Design.prototype.getPieceType = function(name) {
    var r = _.indexOf(this.pieces, name);
    if (r < 0) return null;
    return r;
}

Design.prototype.createPiece = function(type, player) {
    return new Piece(this, type, player);
}
  
Design.prototype.addMove = function(type, fun, params, mode, sound) {
    this.moves.push({
        t: type,
        f: fun,
        p: params,
        s: sound,
        m: mode
    });
}
  
Design.prototype.addGrid = function() {
    return new Grid(this);
}

Design.prototype.setAdj = function(adj) {
    this.adj = adj;
}

Design.prototype.setup = function(player, type, positions) {
    var t = _.indexOf(this.pieces, type);
    var p = _.indexOf(this.playerNames, player);
    if ((t < 0) || (p < 0)) return;
    var piece = this.createPiece(t, p);
    if (!_.isArray(positions)) {
        positions = [positions];
    }
    _.chain(positions)
     .map(function(name) {
        return this.stringToPos(name);
      }, this)
     .each(function(pos) {
        this.initial.push({
           p: pos,
           t: piece
        });
      }, this);
  }

function Piece(design, type, player) {
    this.design = design;
    this.type   = type;
    this.player = player;
}

Piece.prototype.getType = function() {
    return this.design.pieceNames[this.type];
}
  
Piece.prototype.getPlayer = function() {
    return this.design.playerNames[this.player];
}

Piece.prototype.pieceToString = function() {
    return this.getPlayer() + " " + this.getType();
}

Piece.prototype.getValue = function(ix) {
    if (_.isUndefined(this.values)) return null;
    if (_.isUndefined(this.values[ix])) return null;
    return this.values[ix];
}
  
Piece.prototype.setValue = function(ix, value) {
    var v = this.getValue(ix);
    if ((v === null) && (value === null)) return this;
    if ((v !== null) && (value !== null) && (v == value)) return this;
    var r = new Piece(this.type, this.player);
    if (_.isUndefined(r.values)) {
        r.values = [];
    }
    if (!_.isUndefined(this.values)) {
        _.each(_.keys(this.values), function(i) {
            r.values[i] = this.values[i];
        }, this);
    }
    if (value !== null) {
        r.values[ix] = value;
    } else {
        delete r.values[ix];
    }
    return r;
}

Piece.prototype.promote = function(type) {
    if (type == this.type) return this;
    return this.design.createPiece(type, this.player);
}
  
Piece.prototype.changeOwner = function(player) {
    if (player == this.player) return this;
    return this.design.createPiece(this.type, player);
}

function Grid() {
    this.design = design;
    this.scales = [];
    this.dirs   = [];
}

Grid.prototype.addScale = function(scale) {
    this.scales.push(scale.split('/'));
}

Grid.prototype.addDirection = function(name, offsets) {
    if (_.indexOf(this.dirs, name) < 0) {
        this.design.addDirection(name);
    }
    var ix = _.indexOf(this.design.dirs, name);
    if (ix >= 0) {
        this.dirs[ix] = offsets;
    }
}

var addPositions = function(self, ix, name, point) {
    if (ix < 0) {
        var offsets = _.map(_.range(self.dirs.length), function(dir) {
            return 0;
        });
        _.each(_.keys(self.dirs), function(dir) {
            var o = 0;
            for (var c = self.scales.length - 1; c >= 0; c--) {
                 if (c < self.scales.length - 1) {
                     o = o * self.scales[c].length;
                 }
                 var v = self.dirs[dir][c];
                 var x = point[c] + v;
                 if (x < 0) return;
                 if (x >= self.scales[c].length) return;
                 o += v;
            }
            offsets[dir] = o;
        });
        self.design.addPosition(name, offsets);
        return;
    }
    for (var i = 0; i < self.scales[ix].length; i++) {
        point.unshift(i);
        addPositions(self, ix - 1, self.scales[ix][i] + name, point);
        point.shift();
    }
}
  
Grid.prototype.addPositions = function() {
    addPositions(this, this.scales.length - 1, "", []);
}

module.exports.create = create;