"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedProperty = void 0;
exports.deepMerge = deepMerge;
exports.isObject = isObject;
exports.generateControl = generateControl;
const lit_1 = require("lit");
const getNestedProperty = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};
exports.getNestedProperty = getNestedProperty;
function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        const targetValue = output[key];
        const sourceValue = source[key];
        if (key === "type") {
            // Preserve the type property
            output[key] = sourceValue;
        }
        else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            output[key] = [...new Set([...targetValue, ...sourceValue])]; // Merge arrays while removing duplicates
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            output[key] = deepMerge({ ...targetValue }, sourceValue);
        }
        else {
            output[key] = sourceValue;
        }
    }
    return output;
}
function isObject(obj) {
    return obj !== null && typeof obj === "object";
}
function generateControl(control, card) {
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
    if (control.selector && control.selector.select && control.selector.select.optionsCondition) {
        const options = card._evaluateCondition(control.selector.select.optionsCondition, context);
        control.selector.select.options = options;
    }
    switch (control.type) {
        case 'Selector':
            return (0, lit_1.html) `
            <div class="form-control">
            <ha-selector
                .hass=${card._hass}
                .selector=${control.selector}
                .configValue=${control.configValue}
                .value=${(0, exports.getNestedProperty)(card._config, control.configValue)}
                .label=${control.label}
                .helper=${control.helper}
                .disabled=${isDisabled}
                .required=${isRequired}
                @value-changed=${card._valueChanged}
            ></ha-selector>
            </div>
            `;
        case 'Filler':
            return (0, lit_1.html) `<div class="form-control"></div>`;
        case 'Divider':
            return (0, lit_1.html) `<hr>`;
        default:
            return (0, lit_1.html) `
                <div class="form-control">
                    <ha-alert alert-type="error" title="Unsupported Control Type">
                    The control type "${control.type}" is not supported.
                </ha-alert>
                </div>
                `;
    }
}
