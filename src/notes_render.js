////Rendering Code


import yaml from 'js-yaml';

// Load the YAML file
const yamlData = yaml.load(fs.readFileSync('cards.yaml', 'utf8'));

// Assign the YAML data to the cardConfig variable
const cardConfig = yamlData;








function generateControl(control) {
  switch (control.type) {
    case 'Textbox':
      return html`
        <ha-textfield label=${control.label} .value=${this._config[control.configValue] || ''} @change=${(e) => this._valueChanged(e, control.configValue)}></ha-textfield>
      `;
    case 'Dropdown':
      return html`
        <ha-select label=${control.label} .value=${this._config[control.configValue] || ''} @change=${(e) => this._valueChanged(e, control.configValue)}>
          ${control.items.map(item => html`<ha-list-item .value=${item.value}>${item.label}</ha-list-item>`)}
        </ha-select>
      `;
    case 'Checkboxes':
      return html`
        <div>
          <label>${control.label}</label>
          ${control.items.map(item => html`
            <ha-checkbox .value=${item.value} checked=${this._config[control.configValue].includes(item.value)} @change=${(e) => this._valueChanged(e, control.configValue)}>${item.label}</ha-checkbox>
          `)}
        </div>
      `;
    case 'EntityDropdown':
      // Implement your entity dropdown logic here
      return html`
        `;
    case 'Slider':
      return html`
        <ha-slider label=${control.label} min=${control.min} max=${control.max} step=${control.step || 1} value=${this._config[control.configValue] || control.min} @change=${(e) => this._valueChanged(e, control.configValue)}>
          ${control.helper ? html`<p class="helper-text">${control.helper}</p>` : ''}
        </ha-slider>
      `;
    case 'Switch':
      return html`
        <ha-switch label=${control.label} checked=${!!this._config[control.configValue]} @change=${(e) => this._valueChanged(e, control.configValue)}></ha-switch>
      `;
    case 'ColorPicker':
      // Implement your color picker logic here
      return html`
        `;
    case 'Section':
      const expansionPanelProps = {
        outlined: control.outlined || false,
        leftChevron: control.leftChevron || false,
        // Add other properties as needed
      };

      return html`
        <ha-expansion-panel ${htmlAttributes(expansionPanelProps)}>
          <span slot="header">${control.label}</span>
          <div class="form-section">
            ${control.controls.map(generateControl)}
          </div>
        </ha-expansion-panel>
      `;
  }
}

function htmlAttributes(props) {
  return Object.keys(props)
    .filter(key => props[key] !== undefined)
    .map(key => `${key}="${props[key]}"`)
    .join(' ');
}

function generateForm(cardType) {
  const cardConfigData = cardConfig[cardType];
  if (!cardConfigData) {
    return html``;
  }

  const formControls = cardConfigData.render_form.map(row => {
    if (Array.isArray(row)) {
      // Row contains multiple controls
      return html`
        <div class="form-row">
          ${row.map(control => html`
            <div class="form-control">
              ${generateControl(control)}
            </div>
          `)}
        </div>
      `;
    } else {
      // Single control row
      return html`
        <div class="form-row">
          <div class="form-control">
            ${generateControl(row)}
          </div>
        </div>
      `;
    }
  });

  return html`
    <h2>Edit ${cardType} Card</h2>
    <div class="card-form">
      ${formControls}
    </div>
  `;
}

render() {
  const cardType = 'cb-lcars-base-card'; // Replace with actual card type
  return generateForm(cardType);
}
