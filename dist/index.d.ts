import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";
import { LitElement, CSSResult } from "lit";
import { ValueChangedEvent, ControlRow, Section } from "./interfaces";
export default class EditorForm extends LitElement {
    private _selectedTab;
    _hass: HomeAssistant;
    _config: LovelaceCardConfig;
    _userStyles: CSSResult;
    _mergeUserStyles: boolean;
    setConfig(config: LovelaceCardConfig): void;
    set hass(hass: HomeAssistant);
    generateForm(cardConfigData: any): import("lit-html").TemplateResult<1>;
    generateTabs(tabs: any): import("lit-html").TemplateResult<1>;
    _handleTabActivated(event: any): void;
    generateSection(section: Section): any;
    generateRow(row: ControlRow): import("lit-html").TemplateResult<1>;
    _evaluateCondition(condition: string, context?: any): boolean;
    _valueChanged(ev: ValueChangedEvent): void;
    _debouncedValueChanged: (...args: any[]) => void;
    private _getNewValue;
    private _updateConfig;
    updated(changedProperties: any): void;
    static get styles(): CSSResult;
}
