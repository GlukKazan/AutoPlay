"use strict";

const g_timeout = 5000;

const minEval = -2000000;
const maxEval = +2000000;

const minMateBuffer = minEval + 2000;
const maxMateBuffer = maxEval - 2000;

const g_hashSize = 1 << 22;
const g_hashMask = g_hashSize - 1;

const hashflagAlpha = 1;
const hashflagBeta  = 2;
const hashflagExact = 3;

let g_hashTable;

let g_nodeCount;
let g_qNodeCount;
let g_searchValid;
let g_startTime;

function HashEntry(lock, value, flags, hashDepth, bestMove) {
    this.lock = lock;
    this.value = value;
    this.flags = flags;
    this.hashDepth = hashDepth;
    this.bestMove = bestMove;
}

function StoreHash(board, value, flags, ply, move, depth) {
    if (value >= maxMateBuffer) value += depth;
    else if (value <= minMateBuffer) value -= depth;
    g_hashTable[board.zLow & g_hashMask] = new HashEntry(board.zHigh, value, flags, ply, move);
}

function search(design, board, callback, maxPly, logger) {
    let alpha = minEval;
    let beta = maxEval;

    g_nodeCount = 0;
    g_qNodeCount = 0;
    g_searchValid = true;

    let bestMove = 0;
    let value;
    g_startTime = (new Date()).getTime();

    for (let i = 1; i <= maxPly && g_searchValid; i++) {
        let tmp = AlphaBeta(design, board, i, 0, alpha, beta, moves);
        if (!g_searchValid) break;
        value = tmp;
        if (value > alpha && value < beta) {
            alpha = value - 500;
            beta = value + 500;
            if (alpha < minEval) alpha = minEval;
            if (beta > maxEval) beta = maxEval;
        } else if (alpha != minEval) {
            alpha = minEval;
            beta = maxEval;
            i--;
        }
        if (g_hashTable[board.zLow & g_hashMask] != null) {
            bestMove = g_hashTable[board.zLow & g_hashMask].bestMove;
        }
        if (logger != null) {
            logger(bestMove, value, (new Date()).getTime() - g_startTime, i);
        }
    }
    if (callback != null) {
        callback(bestMove, value, (new Date()).getTime() - g_startTime, i - 1);
    }
}

function QSearch(design, board, alpha, beta, ply, depth) {
    g_qNodeCount++;

    let realEval = design.evaluate(board);
    if (realEval >= beta) return realEval;
    if (realEval > alpha) alpha = realEval;

    const moves = design.getCaptureMoves(board);
    for (let i = 0; i < moves.length; i++) {
        if (!board.redoMove(moves[i])) continue;
        let value = -QSearch(design, board, -beta, -alpha, ply - 1, depth + 1);
        board.undoMove(moves[i]);
        if (value > realEval) {
            if (value >= beta) return value;
            if (value > alpha) alpha = value;
            realEval = value;
        }
    }
    return realEval;
}

function AlphaBeta(design, board, ply, depth, alpha, beta) {
    if (ply <= 0) return QSearch(design, board, alpha, beta, 0, depth + 1);

    g_nodeCount++;
    if ((g_nodeCount & 127) == 127) {
        if ((new Date()).getTime() - g_startTime > g_timeout) {
            g_searchValid = false;
            return beta - 1;
        }
    }

    if (depth > 0 && board.isRepDraw()) return 0;

    // Mate distance pruning
    let oldAlpha = alpha;
    alpha = alpha < minEval + depth ? alpha : minEval + depth;
    beta = beta > maxEval - (depth + 1) ? beta : maxEval - (depth + 1);
    if (alpha >= beta) return alpha;

    let hashMove = null;
    let hashFlag = hashflagAlpha;
    let hashNode = g_hashTable[board.zLow & g_hashMask];
    if (hashNode != null && hashNode.lock == board.zHigh) {
        hashMove = hashNode.bestMove;
    }

    let moveMade = false;
    let realEval = minEval;
    const moves = design.getMoves(board);

    for (let i = 0; i < moves.length; i++) {
        let currentMove = moves[i];
        let plyToSearch = ply - 1;
        if (!board.redoMove(currentMove)) continue;
        let value = AlphaBeta(design, board, plyToSearch, depth + 1, -beta, -alpha);
        moveMade = true;
        board.undoMove(currentMove);
        if (!g_searchValid) return alpha;

        if (value > realEval) {
            if (value >= beta) {
                StoreHash(board, value, hashflagBeta, ply, currentMove, depth);
                return value;
            }
            if (value > oldAlpha) {
                hashFlag = hashflagExact;
                alpha = value;
            }
            realEval = value;
            hashMove = currentMove;
        }
    }

    if (!moveMade) {
        // TODO: Checkmate
        return minEval + depth;
    }

    StoreHash(board, realEval, hashFlag, ply, hashMove, depth);
    return realEval;
}

module.exports.search = search;