"use strict";

const _ = require('underscore');
const design = require('./design');
const chess = require('./chess');

let game = design.create();
chess.build(game);

_.each(game.allPlayers(), function(p) {
    console.log(game.playerNames[p] + ' = ' + p);
});
console.log('\n');

//console.log(game.players[0]);
//console.log(game.players[2]);

let pos = game.stringToPos('e4');
console.log('Player 1');
_.each(game.allDirections(), function(d) {
    const p = game.navigate(1, pos, d);
    console.log(game.posToString(pos) + ' -' + game.dirs[d] + '-> ' + game.posToString(p));
});
console.log('\n');

/*console.log('Player 2');
_.each(game.allDirections(), function(d) {
    const p = game.navigate(2, pos, d);
    console.log(game.posToString(pos) + ' -' + game.dirs[d] + '-> ' + game.posToString(p));
});
console.log('\n');

console.log('Opposite');
_.each(game.allDirections(), function(d) {
    const p = game.navigate(0, pos, d);
    console.log(game.posToString(pos) + ' -' + game.dirs[d] + '-> ' + game.posToString(p));
});
console.log('\n');*/

//console.log(game.findDirection(game.stringToPos('b3'), game.stringToPos('c4')));
//console.log(game.getZone('third-rank'));
//console.log(game.inZone(2, game.stringToPos('e1'), 0));

//console.log(game.nextPlayer(2));
//console.log(game.currPlayer(2));
//console.log(game.nextTurn(1));