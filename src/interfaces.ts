export interface HAInputElement extends HTMLElement {
    value: string;
    checked: boolean;
    configValue: string;
    __checked?: boolean;
  }

export interface DropdownOption {
    label: string | undefined;
    value: string;
}

export interface ValueChangedEvent {
    detail: {
        value: {
            itemValue: string;
            parentElement: {
                configValue: string;
            };
        }
    };
    target: {
        value: string;
        configValue: string;
        checked?: boolean;
        tagName?: string;
    };

}

export interface Control {
    type: string;
    label: string;
    configValue: string;
    items?: { value: string; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    helper?: string;
    mode?: string;
    controls?: Control[];
    cssClass?: string;
    domain?: string;
    disabled?: boolean;
    outlined?: boolean;
    leftChevron?: boolean;
    schema?: any;
    selector?: any;
    required?: boolean;
    visibilityCondition?: any;
    disabledCondition?: any;
    requiredCondition?: any;
  }

export interface ControlRow {
    label?: string;
    type?: string;
    controls: Control[];
    rows?: ControlRow[];
    cssClass?: string;
    hidden?: boolean;
    visibilityCondition?: any;
}

export interface Section {
    label?: string;
    icon?: string;
    type: 'Section';
    outlined?: boolean;
    leftChevron?: boolean;
    expanded?: boolean;
    noCollapse?: boolean;
    controls: Control[];
    rows?: ControlRow[];
    cssClass?: string;
    headerLevel?: number;
    visibilityCondition?: any;
    disabledCondition?: any;
    requiredCondition?: any;
    disabled?: boolean;
    required?: boolean;
    selector?: any;
  }

/*
export interface TextboxControl extends Control {
    type: 'Textbox';
  }

export interface DropdownControl extends Control {
    type: 'Dropdown';
  }

export interface CheckboxesControl extends Control {
    type: 'Checkboxes';
  }

export interface EntityDropdownControl extends Control {
    type: 'EntityDropdown';
  }

export interface SliderControl extends Control {
    type: 'Slider';
    min: number;
    max: number;
    step?: number;
  }

export interface SwitchControl extends Control {
    type: 'Switch';
  }

export interface ColorPickerControl extends Control {
    type: 'ColorPicker';
    mode?: string;
  }
*/

export type AnyControl =
    | Control
    | Section;
//    | TextboxControl
//    | DropdownControl
//    | CheckboxesControl
//    | EntityDropdownControl
//    | SliderControl
//    | SwitchControl

export function isSection(row: ControlRow | Section): row is Section {
    return row.type === 'Section';
  }
export function isControlRow(row: ControlRow | Section): row is ControlRow {
    return row.type === 'ControlRow';
}