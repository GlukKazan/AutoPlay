"use strict";

const design = require('./design');
const chess = require('./chess');
const board = require('./board');

let game = design.create();
chess.build(game);

let init = board.create(game);
