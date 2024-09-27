"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSection = isSection;
exports.isControlRow = isControlRow;
//    | TextboxControl
//    | DropdownControl
//    | CheckboxesControl
//    | EntityDropdownControl
//    | SliderControl
//    | SwitchControl
function isSection(row) {
    return row.type === 'Section';
}
function isControlRow(row) {
    return row.type === 'ControlRow';
}
