/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin';
import { UrlParser } from '@advanced-rest-client/url-parser';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import '@polymer/iron-form/iron-form.js';
import { close } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import styles from './DetailedStyles.js';

/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */

/** @typedef {import('./UrlDetailedEditorElement').QueryParameter} QueryParameter */
/** @typedef {import('./UrlDetailedEditorElement').ViewModel} ViewModel */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@polymer/iron-form').IronFormElement} IronFormElement */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */

/**
 * @param {UrlParser} parser
 * @return {string}
 */
export function getHostValue(parser) {
  const {protocol} = parser;
  let {host} = parser;
  if (host) {
    if (protocol) {
      host = `${protocol}//${host}`;
    }
  } else if (protocol) {
      host = `${protocol}//`;
    }
  return host;
}

/**
 * Finds a search parameter in a parser's model by given name.
 * @param {Array<string[]>} searchParams Model for search params
 * @param {string} name Name of the parameter
 * @return {string[]|undefined} Search parameter model item
 */
export function findSearchParam(searchParams, name) {
  for (let i = searchParams.length - 1; i >= 0; i--) {
    if (searchParams[i][0] === name) {
      return searchParams[i];
    }
  }
  return undefined;
}

/**
 * Searches for a query parameters model by given name.
 * @param {QueryParameter[]} model Query parameters model
 * @param {string} name Name of the parameter
 * @return {QueryParameter|undefined} Model item.
 */
export function findModelParam(model, name) {
  for (let i = 0, len = model.length; i < len; i++) {
    const item = model[i];
    if (!item.enabled || item.name !== name) {
      continue;
    }
    return item;
  }
  return undefined;
}

/**
 * `<url-detailed-editor>` Presents a form element that contains a list of
 * URL parameters.
 *
 * The element can be validated as a regular form element.
 *
 * ### Example
 *
 * ```html
 * <url-detailed-editor url="{{url}}" invalid="{{invalid}}"></url-detailed-editor>
 * ```
 *
 * ### Styling
 *
 * `<url-input-editor>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--url-input-editor` | Mixin applied to the element | `{}`
 * `--url-input-editor-add-param-background-color` | Add param button background color | `#2196F3`
 * `--url-input-editor-add-param-color` | Add param button color | `#fff`
 * `--url-input-editor-query-title-color` | Color of the query parameters section title | `#737373`
 */
export class UrlDetailedEditorElement extends ValidatableMixin(LitElement) {
  static get styles() {
    return styles;
  }

  /**
   * @return {TemplateResult}
   */
  _hostInputTemplate() {
    const { compatibility, outlined, readOnly, model } = this;
    return html`<anypoint-input
      id="host"
      .value="${model.host}"
      name="host"
      class="host-input"
      required
      autovalidate
      invalidmessage="Valid host is required. You can use variables here."
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @keydown="${this._hostKeyDown}"
      @paste="${this._hostPaste}"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">Host</label>
    </anypoint-input>`;
  }

  /**
   * @return {TemplateResult}
   */
  _pathInputTemplate() {
    const { compatibility, outlined, readOnly, model } = this;
    return html`<anypoint-input
      id="path"
      .value="${model.path}"
      name="path"
      class="path-input"
      required
      autovalidate
      pattern="\\S*"
      invalidmessage="You may want to encode this value before sending it to the server"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">Path</label>
    </anypoint-input>`;
  }

  /**
   * @return {TemplateResult}
   */
  _hashInputTemplate() {
    const { compatibility, outlined, readOnly, model } = this;
    return html`<anypoint-input
      id="hash"
      .value="${model.anchor}"
      name="anchor"
      class="anchor-input"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readOnly="${readOnly}"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">Hash</label>
    </anypoint-input>`;
  }

  /**
   * @return {TemplateResult}
   */
  _paramsTemplate() {
    const items = this.queryParameters || [];
    const { compatibility, readOnly, outlined } = this;
    return html`
    <div class="params-list">
      <label class="query-title">Query parameters</label>
      ${items.map((item, index) => this._paramItemTemplate(item, index, compatibility, outlined, readOnly))}
      <div class="query-actions">
        <anypoint-button
          emphasis="low"
          @click="${this.addSearchParam}"
          class="add-param"
          ?compatibility="${compatibility}"
          ?disabled="${readOnly}">Add</anypoint-button>
      </div>
    </div>`;
  }

  /**
   * @param {QueryParameter} item
   * @param {number} index
   * @param {boolean} compatibility
   * @param {boolean} outlined
   * @param {boolean} readOnly
   * @return {TemplateResult}
   */
  _paramItemTemplate(item, index, compatibility, outlined, readOnly) {
    return html`<div class="form-row">
      <div class="row-inputs">
        <div class="narrow-line">
          <anypoint-switch
            data-index="${index}"
            .checked="${item.enabled}"
            @checked-changed="${this._enabledHandler}"
            title="Enable / disable parameter"
            aria-label="Actiavate to toggle enabled state of this item"
          ></anypoint-switch>

          <anypoint-input
            autovalidate
            .value="${item.name}"
            data-property="name"
            data-index="${index}"
            class="param-name"
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?readOnly="${readOnly}"
            pattern="\\S*"
            invalidmessage="Encode this value"
            @value-changed="${this._paramInputHandler}"
            nolabelfloat
          >
            <label slot="label">Parameter name</label>
          </anypoint-input>
        </div>
        <anypoint-input
          autovalidate
          .value="${item.value}"
          data-property="value"
          data-index="${index}"
          class="param-value"
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
          ?readOnly="${readOnly}"
          pattern="\\S*"
          invalidmessage="You may want to encode this value before sending it to the server"
          @value-changed="${this._paramInputHandler}"
          nolabelfloat
        >
          <label slot="label">Parameter value</label>
        </anypoint-input>
      </div>
      <anypoint-icon-button
        data-index="${index}"
        @click="${this._removeSearchParam}"
        title="Remove this parameter"
        aria-label="Activate to remove this item"
        ?disabled="${readOnly}"
        ?compatibility="${compatibility}"
      >
        <span class="icon" data-index="${index}">${close}</span>
      </anypoint-icon-button>
    </div>`;
  }

  /**
   * @return {TemplateResult}
   */
  _formTemplate() {
    return html`
    <iron-form id="form">
      <form>
        ${this._hostInputTemplate()}
        ${this._pathInputTemplate()}
        ${this._paramsTemplate()}
        ${this._hashInputTemplate()}
      </form>
    </iron-form>`;
  }

  /**
   * @return {TemplateResult}
   */
  _actionsTemplate() {
    const { compatibility, readOnly } = this;
    return html`<div class="encode-actions">
      <anypoint-button
        id="encode"
        ?compatibility="${compatibility}"
        @click="${this._encodeParameters}"
        title="URL encodes parameters in the editor"
        ?disabled="${readOnly}">Encode URL</anypoint-button>
      <anypoint-button
        id="decode"
        ?compatibility="${compatibility}"
        @click="${this._decodeParameters}"
        title="URL decodes parameters in the editor"
        ?disabled="${readOnly}">Decode URL</anypoint-button>
    </div>`;
  }

  /**
   * @return {TemplateResult}
   */
  render() {
    return html`
    ${this._formTemplate()}
    ${this._actionsTemplate()}`;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Current value of the editor.
       */
      value: { type: String },
      /**
       * Computed data model for the view.
       */
      model: { type: Object },
      /**
       * List of query parameters model.
       * If not set then it is computed from current URL.
       *
       * Model for query parameters is:
       * - name {String} param name
       * - value {String} param value
       * - enabled {Boolean} is param included into the `value`
       */
      queryParameters: { type: Array },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set it renders "narrow" layout.
       */
      narrow: { type: Boolean, reflect: true }
    };
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const old = this._value;
    if (old === value) {
      return;
    }
    this._value = value;
    this.requestUpdate('value', old);
    this._valueChanged(value);
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this.model = /** @type ViewModel */ ({});

    this.compatibility = false;
    this.outlined = false;
    this.readOnly = false;
  }

  /**
   * A handler that is called on input
   *
   * @param {string} value
   */
  _valueChanged(value) {
    if (this._cancelModelComputation) {
      return;
    }
    let qp = this.queryParameters;
    const hasQp = !!(qp && qp.length);
    if (!value && !hasQp) {
      return;
    }
    if (!hasQp) {
      qp = [];
    }
    this._computeModel(value, qp);
  }

  /**
   * @param {string} value
   * @param {QueryParameter[]} [queryModel=[]]
   */
  _computeModel(value, queryModel=[]) {
    if (!value) {
      this.model = /** @type ViewModel */ ({});
      this.queryParameters = /** @type QueryParameter[] */ ([]);
      return;
    }
    const parser = new UrlParser(value);
    this.__parser = parser;
    const model = {};
    model.host = getHostValue(parser) || '';
    model.path = parser.path || '';
    model.anchor = parser.anchor || '';
    this.model = /** @type ViewModel */ (model);
    this._computeSearchParams(parser, queryModel);
  }

  /**
   * @param {UrlParser} parser
   * @param {QueryParameter[]} [queryModel=[]]
   */
  _computeSearchParams(parser, queryModel=[]) {
    if (!this.queryParameters) {
      this.queryParameters = /** @type QueryParameter[] */ (queryModel);
    }
    const items = this.queryParameters;
    // 1 keep disabled items in the model
    // 2 remove items that are in query model but not in search params
    // 3 update value of model
    // 4 add existing search params to the model
    const { searchParams } = parser;
    for (let i = queryModel.length - 1; i >= 0; i--) {
      if (queryModel[i].enabled === false) {
        continue;
      }
      const param = findSearchParam(searchParams, queryModel[i].name);
      if (!param) {
        items.splice(i, 1);
      } else if (queryModel[i].value !== param[1]) {
        items[i].value = param[1];
      }
    }
    // Add to `queryModel` params that are in `parser.searchParams`
    searchParams.forEach((pairs) => {
      const param = findModelParam(queryModel, pairs[0]);
      if (!param) {
        items[items.length] = {
          name: pairs[0],
          value: pairs[1],
          enabled: true
        };
      }
    });

    this.queryParameters = /** @type QueryParameter[] */ ([...items]);
  }

  /**
   * Updates the value when model changed.
   * @param {string} prop Changed property
   * @param {string} value New value
   */
  _modelChanged(prop, value) {
    if (this.readOnly) {
      return;
    }
    if (!this.__parser) {
      this.__parser = new UrlParser('');
    }
    this._updateParserValues(prop, value);
    this._cancelModelComputation = true;
    this.value = this.__parser.value;
    this._cancelModelComputation = false;
  }

  _queryModelChanged() {
    if (this.readOnly) {
      return;
    }
    if (!this.__parser) {
      this.__parser = new UrlParser('');
    }
    this._updateParserSearch(this.queryParameters);
    this._cancelModelComputation = true;
    this.value = this.__parser.value;
    this._cancelModelComputation = false;
  }

  /**
   * Updates parser values from change record.
   *
   * @param {string} prop Changed property
   * @param {string} value New value
   */
  _updateParserValues(prop, value) {
    switch (prop) {
      case 'host':
        this._updateParserHost(value);
        break;
      case 'path':
        this.__parser.path = value;
        break;
      case 'anchor':
        this.__parser.anchor = value;
        break;
      default:
    }
  }

  /**
   * Updates `queryParameters` model from change record.
   *
   * @param {QueryParameter[]} model Cureent model for the query parameters
   */
  _updateParserSearch(model) {
    const params = [];
    model.forEach((item) => {
      if (!item.enabled) {
        return;
      }
      params.push([item.name, item.value]);
    });
    this.__parser.searchParams = params;
  }

  /**
   * @param {string} value
   */
  _updateParserHost(value) {
    const index = value.indexOf('://');
    if (index === -1) {
      this.__parser.protocol = undefined;
      this.__parser.host = value;
    } else {
      this.__parser.protocol = value.substr(0, index + 1);
      this.__parser.host = value.substr(index + 3);
    }
  }

  /**
   * Focuses on the last query parameter name filed
   */
  focusLastName() {
    const row = this.shadowRoot.querySelector('.params-list > :nth-last-child(2)');
    if (!row) {
      return;
    }
    try {
      const node = row.querySelector('.param-name');
      // @ts-ignore
      node.focus();
    } catch (e) {
      // ...
    }
  }

  /**
   * Adds a new Query Parameter to the list.
   */
  addSearchParam() {
    if (this.readOnly) {
      return;
    }
    const obj = {
      name: '',
      value: '',
      enabled: true
    };
    const items = this.queryParameters || [];
    items[items.length] = obj;
    this.queryParameters = /** @type QueryParameter[] */ ([...items]);
    setTimeout(() => this.focusLastName());
  }

  // Handler for the remove button click.
  _removeSearchParam(e) {
    const index = Number(e.currentTarget.dataset.index);
    const items = this.queryParameters;
    items.splice(index, 1);
    this.queryParameters = [...items];
    this._queryModelChanged();
  }

  /**
   * Validates the element.
   * @return {boolean} True if the form is valid.
   */
  _getValidity() {
    const form = /** @type IronFormElement */ (this.shadowRoot.querySelector('#form'));
    return form.validate();
  }

  _hostKeyDown(e) {
    if (!((e.code && e.code === 'Slash') || (e.keyCode && e.keyCode === 191))) {
      return;
    }

    let pos = 0;
    const host = /** @type AnypointInput */ (this.shadowRoot.querySelector('#host'));
    const input = host.inputElement;
    // @ts-ignore
    if (document.selection) {
      input.focus();
      // @ts-ignore
      const sel = document.selection.createRange();
      sel.moveStart('character', -input.value.length);
      pos = sel.text.length;
      // @ts-ignore
    } else if (input.selectionStart || input.selectionStart === '0') {
      pos = input.selectionStart;
    }
    if (pos > 8) {
      e.preventDefault();
      this.model.path = '/';
      this.requestUpdate();
      const node = this.shadowRoot.querySelector('#path');
      // @ts-ignore
      node.focus();
    }
  }

  _hostPaste(e) {
    const data = e.clipboardData.getData('text/plain');
    if (!data) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.value = data;
  }

  /**
   * Dispatches the `url-encode` event. The editor handles the action.
   */
  _encodeParameters() {
    this.dispatchEvent(new CustomEvent('url-encode', {
      composed: true
    }));
    setTimeout(() => this.validate(this.value));
  }

  /**
   * Dispatches the `url-decode` event. The editor handles the action.
   */
  _decodeParameters() {
    this.dispatchEvent(new CustomEvent('url-decode', {
      composed: true
    }));
    setTimeout(() => this.validate(this.value));
  }

  _inputHandler(e) {
    const { name, value } = e.target;
    const old = this.model[name];
    if (old === value) {
      return;
    }
    this.model[name] = value;
    this._modelChanged(name, value);
  }

  _enabledHandler(e) {
    const index = Number(e.target.dataset.index);
    const item = this.queryParameters[index];
    item.enabled = e.detail.value;
    this._queryModelChanged();
  }

  _paramInputHandler(e) {
    const { value } = e.target;
    const { property } = e.target.dataset;
    const index = Number(e.target.dataset.index);
    const item = this.queryParameters[index];
    const old = item[property];
    if (old === value) {
      return;
    }
    item[property] = value;
    this._queryModelChanged();
  }
  /**
   * Fired when encode URL action has been called.
   *
   * The event does not bubbles.
   *
   * @event url-encode
   */
  /**
   * Fired when decode URL action has been called.
   *
   * The event does not bubbles.
   *
   * @event url-decode
   */
}
