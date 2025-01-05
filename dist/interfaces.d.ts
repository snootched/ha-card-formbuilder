export interface HAInputElement extends HTMLElement {
    value: string;
    checked: boolean;
    configValue: string;
    __checked?: boolean;
}
export interface ValueChangedEvent {
    detail: {
        value: {
            itemValue: string;
            parentElement: {
                configValue: string;
            };
        };
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
    helper?: string;
    cssClass?: string;
    disabled?: boolean;
    required?: boolean;
    visibilityCondition?: any;
    disabledCondition?: any;
    requiredCondition?: any;
    alertType?: string;
    title?: string;
    message?: string;
    html?: string;
    selector?: any;
}
export interface SelectorControl extends Control {
    type: 'Selector';
    selector: any;
    items?: {
        value: string;
        label: string;
    }[];
    min?: number;
    max?: number;
    step?: number;
    domain?: string;
    mode?: string;
}
export interface MessageControl extends Control {
    type: 'Message';
    alertType: string;
    title: string;
    message: string;
}
export interface RawHTMLControl extends Control {
    type: 'RawHTML';
    html: string;
}
export interface DividerControl extends Control {
    type: 'Divider';
}
export interface FillerControl extends Control {
    type: 'Filler';
}
export interface ColorPreviewControl extends Control {
    type: 'ColorPreview';
    configValue: string;
}
export interface CodeEditorControl extends Control {
    type: 'CodeEditor';
    mode: string;
}
export interface ControlRow {
    label?: string;
    type?: string;
    controls: AnyControl[];
    rows?: ControlRow[];
    cssClass?: string;
    hidden?: boolean;
    visibilityCondition?: any;
    disabledCondition?: any;
    requiredCondition?: any;
}
export interface Section {
    label?: string;
    icon?: string;
    type: 'Section';
    outlined?: boolean;
    leftChevron?: boolean;
    expanded?: boolean;
    noCollapse?: boolean;
    controls: AnyControl[];
    rows?: ControlRow[];
    cssClass?: string;
    headerLevel?: number;
    visibilityCondition?: any;
    disabledCondition?: any;
    requiredCondition?: any;
    disabled?: boolean;
    required?: boolean;
    selector?: any;
    secondary?: string;
}
export type AnyControl = Section | SelectorControl | MessageControl | RawHTMLControl | DividerControl | FillerControl | ColorPreviewControl | CodeEditorControl;
export declare function isSection(row: ControlRow | Section): row is Section;
export declare function isControlRow(row: ControlRow | Section): row is ControlRow;
