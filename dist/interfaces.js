"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSection = isSection;
exports.isControlRow = isControlRow;
function isSection(row) {
    return row.type === 'Section';
}
function isControlRow(row) {
    return row.type === 'ControlRow';
}
