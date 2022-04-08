"use strict";

function set(design, board, setup) {
    const chunks = setup.split('-');
    board.clear();
    let row = 0; let col = 0;
    const pieces = chunks[0];
    for (let i = 0; i < pieces.length; i++) {
        let c = pieces.charAt(i);
        if (c == '/') {
            row++;
            col = 0;
        } else {
            if (c >= '0' && c <= '9') {
                for (let j = 0; j < parseInt(c); j++) col++;
            } else {
                const isBlack = c >= 'a' && c <= 'z';
                if (!isBlack) c = pieces.toLowerCase().charAt(i);
                const t = _.indexOf(design.fen, c);
                if (t > 0) {
                    const piece = design.createPiece(t, isBlack ? 2 : 1);
                    const pos = row * design.width + col + 1;
                    board.setPiece(pos, piece);
                }
                col++;
            }
        }
    }
    board.setTurn(parseInt(chunks[1]));
}

function get(design, board) {
    // TODO:
    
}

module.exports.set = set;
module.exports.get = get;