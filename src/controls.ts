import { html } from "lit";
import EditorForm from "./index";
import { AnyControl } from "./interfaces";
import { unsafeHTML } from "lit/directives/unsafe-html.js";


export const getNestedProperty = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export function deepMerge<T>(target: T, source: T): T {
    const output = { ...target } as any;

    for (const key of Object.keys(source)) {
        const targetValue = output[key];
        const sourceValue = (source as any)[key];

        if (key === "type") {
            // Preserve the type property
            output[key] = sourceValue;
        } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            output[key] = [...new Set([...targetValue, ...sourceValue])]; // Merge arrays while removing duplicates
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            output[key] = deepMerge({ ...targetValue }, sourceValue);
        } else {
            output[key] = sourceValue;
        }
    }

    return output;
}
export function isObject(obj: any): boolean {
    return obj !== null && typeof obj === "object";
}


export function generateControl(control: AnyControl, card: EditorForm){

    /////put in the conditions for the new controls
    ///// todo:  ?default val based on condition.. should only be set if set value doesn't exist. think about it..   const defaultValue = control.defaultValueCondition ? this._evaluateCondition(control.defaultValueCondition) : '';
    //console.debug('generateControl:', control);

    //pass in context to have access to the card's properties and window object
    const context = { ...card, hass: card._hass, window };

    // Evaluate visibility, disabled, and required conditions
    // eg yaml:  isVisible: 'this._config.cblcars_card_config.show_icon === true'
    //visible default is true
    //disabled default is false
    //required default is false

    const isVisible = control.visibilityCondition ? card._evaluateCondition(control.visibilityCondition, context) : true;
    const isDisabled = control.disabledCondition ? card._evaluateCondition(control.disabledCondition, context) : false;
    const isRequired = control.requiredCondition ? card._evaluateCondition(control.requiredCondition, context) : false;

    if (!isVisible) {
        return null;
    }
  // Handle dynamic list creation for 'select' selector type
  /*
    eg yaml will pull in all css variables starting with '--picard-'

     - controls:
        - label: "options from vars"
          configValue: "cblcars_card_config.variables.card.color.background.inactive"
          type: Selector
          selector:
            select:
              optionsCondition: |
                  (() => {
                    const styles = document.documentElement.style;
                    const options = [];
                    for (let i = 0; i < styles.length; i++) {
                      const name = styles[i];
                      if (name.startsWith('--picard-')) {
                        const value = styles.getPropertyValue(name).trim();
                        options.push({ value, label: name.replace('--', '') });
                      }
                    }
                    return options;
                  })()

  */
    if ('selector' in control && control.selector && control.selector.select && control.selector.select.optionsCondition) {
        const options = card._evaluateCondition(control.selector.select.optionsCondition, context);
        control.selector.select.options = options;
    }

    switch (control.type) {

        case 'Selector':
        return html`
            <div class="form-control">
            <ha-selector
                .hass=${card._hass}
                .selector=${control.selector}
                .configValue=${control.configValue}
                .value=${getNestedProperty(card._config, control.configValue)}
                .label=${control.label}
                .helper=${control.helper}
                .disabled=${isDisabled}
                .required=${isRequired}
                @value-changed=${card._valueChanged}
            ></ha-selector>
            </div>
            `;

        case 'Filler':
            return html`<div class="form-control"></div>`;

        case 'Divider':
            return html`<hr>`;

        case 'Message':
            return html`
                <div class="form-control">
                    <ha-alert alert-type=${control.alertType || "info"} title=${control.title || ""}>
                        ${control.message || ""}
                    </ha-alert>
                </div>
            `;

        case 'RawHTML':
            return html`
                <div class="form-control">
                    ${unsafeHTML(control.html || "")}
                </div>
            `;
        case 'ColorPreview':
            let colorValue = getNestedProperty(card._config, control.configValue);
            console.log('colorValue:', colorValue);

            // Provide a default color value if colorValue is not set
            if (!colorValue) {
                colorValue = 'var(--default-color, #0000ff)'; // Default to a nice blue color
            }

            // Check if colorValue is a CSS variable or a hex color
            const isCssVariable = colorValue.startsWith('var(');
            let computedColorValue = colorValue;
            let displayText = colorValue;

            if (isCssVariable) {
                // Extract the CSS variable name from colorValue
                const cssVariableNameMatch = colorValue.match(/var\((--[^,)]+)\)/);
                const cssVariableName = cssVariableNameMatch ? cssVariableNameMatch[1] : colorValue;
                console.log('cssVariableName:', cssVariableName);

                // Get the computed color value directly
                computedColorValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName).trim();
                console.log('computedColorValue:', computedColorValue);

                // Check if computedColorValue is empty and provide a fallback
                if (!computedColorValue) {
                    console.warn(`CSS variable ${cssVariableName} is not defined. Using fallback color.`);
                    computedColorValue = '#0000ff'; // Fallback to a nice blue color
                }
            } else {
                displayText = 'User Defined Color';
            }

            // Function to convert RGB string to luminance
            const getLuminance = (rgb) => {
                console.log('RGB input to getLuminance:', rgb);
                const rgbValues = rgb.match(/\d+/g).map(Number);
                console.log('Parsed RGB values:', rgbValues);
                const [r, g, b] = rgbValues.map(value => value / 255).map(value => {
                    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
                });
                console.log('Normalized RGB values:', [r, g, b]);
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };

            // Determine text color based on luminance
            const luminance = getLuminance(computedColorValue);
            console.log('Luminance:', luminance);
            const textColor = luminance > 0.5 ? '#000' : '#fff';
            console.log('textColor:', textColor);

            return html`
                <div class="form-control" style="width: 100%;">
                    <div style="-webkit-fill-available; height: 50px; background-color: ${colorValue}; border-radius: 25px; border: 1px solid #000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${textColor};">
                        <div>${displayText}</div>
                        <div>${computedColorValue}</div>
                    </div>
                </div>
            `;

        default:
            return html`
                <div class="form-control">
                    <ha-alert alert-type="error" title="Unsupported Control Type">
                    The control type "${control.type}" is not supported.
                </ha-alert>
                </div>
                `;
    }
}
