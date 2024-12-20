import { HomeAssistant, LovelaceCardConfig, fireEvent } from "custom-card-helpers";
import { LitElement, CSSResult, css, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ValueChangedEvent, HAInputElement, ControlRow, Section, isSection} from "./interfaces";
import { generateControl, deepMerge } from "./controls";

export default class EditorForm extends LitElement {

    private _selectedTab: number = 0;
    _hass: HomeAssistant;
    _config: LovelaceCardConfig;
    _userStyles: CSSResult = css``;
    _mergeUserStyles: boolean = true;

    setConfig(config: LovelaceCardConfig) {
        this._config = config;
        this.requestUpdate("_config");
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    generateForm(cardConfigData) {
        if (!cardConfigData) {
            return html``;
        }

        if (cardConfigData.tabs) {
            return this.generateTabs(cardConfigData.tabs);
        } else {
            const formControls = cardConfigData.render_form.map((row: ControlRow | Section) => {
                if (isSection(row)) {
                    return this.generateSection(row);
                } else {
                    return this.generateRow(row);
                }
            });
            return html`
            <div class="card-form">
                ${formControls}
            </div>
        `;
        }
    }


    generateTabs(tabs) {
        const visibleTabs = tabs.filter(tab => this._evaluateCondition(tab.visibilityCondition || "true"));

        return html`
            <mwc-tab-bar @MDCTabBar:activated=${this._handleTabActivated}>
                ${visibleTabs.map((tab, index) => html`
                    <mwc-tab label="${tab.label}" ?selected=${this._selectedTab === index}></mwc-tab>
                `)}
            </mwc-tab-bar>
            <div class="tab-content">
                ${visibleTabs.map((tab, index) => html`
                    <div class="tab-panel" ?hidden=${this._selectedTab !== index}>
                        ${tab.content.map(item => {
                            if (item.type === "Section") {
                                return this.generateSection(item);
                            //} else if (item.type === "ControlRow") {
                            } else {
                                return this.generateRow(item);
                            }
                        })}
                    </div>
                `)}
            </div>
        `;
    }

    _handleTabActivated(event) {
        this._selectedTab = event.detail.index;
        this.requestUpdate();
    }


    generateSection(section: Section) {

        if (section.visibilityCondition && !this._evaluateCondition(section.visibilityCondition)) {
            return html``;
        }

        const cssClass = section.cssClass ? `form-row ${section.cssClass}` : "form-row";

        // Create the header element programmatically
        const headerLevel = section.headerLevel || 4;
        const headerTag = `h${headerLevel}`;
        const headerContent = `
            <${headerTag} slot="header">
                ${section.icon ? `<ha-icon icon="${section.icon}"></ha-icon>` : ''}
                ${section.label}
                ${section.secondary ? `<div slot="secondary">${section.secondary}</div>` : ''}
            </${headerTag}>
        `;

        return html`
            <div class="${cssClass}">
                <ha-expansion-panel
                    .expanded=${section.expanded || false}
                    .noCollapse=${section.noCollapse || false}
                    .outlined=${section.outlined || true}
                    .leftChevron=${section.leftChevron || false}
                    .secondary=${section.secondary || ''}
                >
                    ${unsafeHTML(headerContent)}
                    <div>
                        ${section.rows?.map(row => isSection(row) ? this.generateSection(row) : this.generateRow(row))}
                    </div>
                </ha-expansion-panel>
            </div>
        `;
    }

    generateRow(row: ControlRow) {

        if (row.visibilityCondition && !this._evaluateCondition(row.visibilityCondition)) {
            return html``;
        }
        const cssClass = row.cssClass ? `form-row ${row.cssClass}` : "form-row";
        return html`
            <div class="${cssClass}">
                ${row.label ? html`<label>${row.label}</label>` : ''}
                ${row.controls.map(control => {
                if (control.visibilityCondition && !this._evaluateCondition(control.visibilityCondition)) {
                    return html``;
                }
                return generateControl(control, this);
            })}
            </div>
        `;
    }


    public _evaluateCondition(condition: string, context: any = {}): boolean {
        try {
            return new Function('context', 'with(context) { return ' + condition + '; }').call(this, context);
        } catch (e) {
            console.error('Error evaluating condition:', condition, e);
            return false;
        }
    }

    _valueChanged(ev: ValueChangedEvent): void {
        if (!this._config || !this._hass) {
            return;
        }

        const target = ev.target as HAInputElement; // Cast to a more specific type

        //console.debug("target", target);
        //console.debug("ev.detail", ev.detail);

        // Extract the config path from the control
        const configPath = target.configValue?.split(".") ?? [];

        //console.debug("configPath: ", configPath);

        // Get the new value based on the control type and event details
        const newValue = this._getNewValue(target, ev.detail);

        //console.debug("newValue: ", newValue);

        // Determine if the control is a checkbox
        const isCheckbox = target.tagName === "HA-CHECKBOX";

        // Update the config using a helper function
        this._updateConfig(configPath, newValue, isCheckbox);

        // Fire the "config-changed" event
        fireEvent(this, "config-changed", { config: this._config }, { bubbles: true, composed: true });

        // Request an update to reflect changes
        this.requestUpdate();
    }

    // Helper function to extract the new value based on control type
    private _getNewValue(target: HAInputElement, detail?: ValueChangedEvent['detail']): string | boolean | undefined | string[] | number | object {
        if (target.tagName === "HA-SWITCH") {
            return target.checked !== undefined ? target.checked : target.__checked; // Handle switch control
        } else if (target.tagName === "HA-CHECKBOX") {
            // Return the value of the checkbox, whether checked or unchecked
            //console.debug("ha-checkbox target: ", target);
            return target.value;
        } else if (target.tagName === "HA-FORM") {
            // Handle ha-form control
            //console.debug("ha-form detail: ", detail);
            //console.debug("Object values[0]: ",Object.values(detail.value)[0]);
            const formValue = Object.values(detail.value)[0];
            return formValue;
        } else {
            const value = detail?.value !== undefined ? detail.value : target.value;
            return value;
        }
    }

    private _updateConfig(configPath: string[], newValue: any, isCheckbox: boolean = false) {
        if (!configPath.length) {
            return;
        }

        const configPathString = configPath.join(".");

        let config = { ...this._config };
        let nestedConfig = config;

        for (let i = 0; i < configPath.length - 1; i++) {
            nestedConfig[configPath[i]] = nestedConfig[configPath[i]] || {};
            nestedConfig = nestedConfig[configPath[i]];
        }

        const lastKey = configPath[configPath.length - 1];

        if (isCheckbox) {
            // Handle checkbox case: update array of values
            const existingValues = nestedConfig[lastKey] || [];
            const updatedValues = existingValues.slice(); // Create a copy to avoid mutation

            const index = updatedValues.indexOf(newValue);
            if (index > -1) {
                updatedValues.splice(index, 1); // Remove value if it exists (unchecked)
            } else {
                updatedValues.push(newValue); // Add value if it doesn't exist (checked)
            }

            // Remove empty arrays
            nestedConfig[lastKey] = updatedValues.length > 0 ? updatedValues : undefined;
        } else {
            // Handle switch case: update boolean value
            if (newValue === "" || newValue === null || newValue === undefined) {
                delete nestedConfig[lastKey];
            } else {
                nestedConfig[lastKey] = newValue;
            }
        }

        this._config = deepMerge(this._config, config);
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        const constructor = this.constructor as typeof EditorForm;
        //this.shadowRoot.adoptedStyleSheets = [constructor.styles.styleSheet, this._userStyles.styleSheet];
        if (this._mergeUserStyles) {
            this.shadowRoot.adoptedStyleSheets = [constructor.styles.styleSheet, this._userStyles.styleSheet];
        } else {
            this.shadowRoot.adoptedStyleSheets = [this._userStyles.styleSheet];
        }
    }

    static get styles() {
        const baseStyles = css`
            /* Base styles for the form container */
            .card-form {
                display: grid;
                grid-gap: 8px;
            }

             /* Styles for tabs */
            mwc-tab-bar {
                border-bottom: 1px solid var(--divider-color);
            }
            .tab-content {
                padding: 10px;
            }
            .tab-panel {
                display: none;
            }
            .tab-panel:not([hidden]) {
                display: block;
            }
            /* Base styles for form rows */
            .form-row {
                display: grid;
                grid-template-columns: 1fr;
                grid-gap: 8px;
                /* margin-bottom: 10px; */
                border-radius: 10px;
            }

            /* Styles for form rows with two controls */
            .form-row.two-controls {
                grid-template-columns: 1fr 1fr;
            }
            /* Labels in form rows with two controls */
            .form-row.two-controls label {
                grid-column: span 2; /* Make the label span across both columns */
                justify-self: start; /* Left-justify the label */
                font-weight: bold;
                height: auto;
                margin-bottom: 5px; /* Add some space below the label */
                padding-left: 8px;
            }

            /* ensure full width for form controls not in two-controls class */

            .form-row:not(.two-controls) .form-control > * {
                width: -webkit-fill-available;
            }

            /* Base styles for form controls */
            .form-control {
                display: flex; /* Use flexbox for internal alignment */
                align-items: center;
                padding: 8px;
                border-radius: 10px;
            }

            /* Label styles within form controls */
            .form-control label {
                font-weight: bold;
                padding-left: 8px;
            }

            /* Styles for expandable sections */
            ha-expansion-panel {
                margin-bottom: 10px;
                border-radius: var(--ha-card-border-radius, 34px);
            }
            ha-expansion-panel[outlined] {
                border: 2px solid var(--chip-background-color);
            }
            ha-expansion-panel[expanded] {
                background-color: var(--chip-background-color);
            }
            h1 > ha-icon,
            h2 > ha-icon,
            h3 > ha-icon,
            h4 > ha-icon,
            h5 > ha-icon,
            h6 > ha-icon {
                margin: 0 8px;
            }

            hr {
                width: 95%;
                border: 1px solid var(--chip-background-color);
            }

            /* Styles for form errors */
            .form-error {
                color: var(--error-color); /* Home Assistant theme color */
                font-size: 0.875em;
                margin-top: 5px;
            }
        `;

        return baseStyles;
    }
}

