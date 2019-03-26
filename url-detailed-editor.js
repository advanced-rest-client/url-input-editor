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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '../../@polymer/polymer/lib/legacy/class.js';
import {IronValidatableBehavior} from '../../@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import {UrlParser} from '../../@advanced-rest-client/url-parser/url-parser.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/iron-form/iron-form.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/paper-toggle-button/paper-toggle-button.js';
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
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin Polymer.IronValidatableBehavior
 */
class UrlDetailedEditor extends
  mixinBehaviors([IronValidatableBehavior], PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
    }

    .host-input {
      @apply --layout-flex;
    }

    .path-input {
      @apply --layout-flex;
    }

    .anchor-input {
      @apply --layout-flex;
    }

    .form-row {
      @apply --layout-horizontal;
      @apply --layout-flex;
      @apply --layout-center;
    }

    .row-inputs {
      @apply --layout-horizontal;
      @apply --layout-flex;
    }

    .narrow-line {
      @apply --layout-horizontal;
      min-width: 120px;
      width: 20%;
      margin-right: 12px;
    }

    :host([narrow]) .form-row {
      margin-bottom: 20px;
    }

    :host([narrow]) .row-inputs {
      @apply --layout-vertical;
    }

    :host([narrow]) .narrow-line {
      width: 100%;
      margin-right: 0;
    }

    .param-name,
    .param-value {
      @apply --layout-flex;
    }

    .params-list {
      margin: 12px 0;
    }

    .query-title {
      @apply --arc-font-caption;
      color: var(--url-input-editor-query-title-color, #737373);
    }

    .add-param {
      margin-top: 12px;
      background-color: var(--url-input-editor-add-param-background-color, #2196F3);
      color: var(--url-input-editor-add-param-color, #fff);
    }
    </style>
    <iron-form id="form">
      <form>
        <paper-input
          id="host"
          label="Host"
          value="{{model.host}}"
          class="host-input"
          required=""
          auto-validate=""
          error-message="Valid host is required. You can use variables here."
          on-keydown="_hostKeyDown"
          on-paste="_hostPaste"
          readonly="[[readonly]]"></paper-input>
        <paper-input
          id="path"
          label="Path"
          value="{{model.path}}"
          class="path-input"
          auto-validate=""
          pattern="\\S*"
          error-message="You may want to encode this value before sending it to the server"
          readonly="[[readonly]]"></paper-input>
        <div class="params-list">
          <label class="query-title">Query parameters</label>
          <template is="dom-repeat" id="paramsList" items="{{queryParameters}}" on-dom-change="_onParamsRender">
            <div class="form-row">
              <div class="row-inputs">
                <div class="narrow-line">
                  <paper-toggle-button
                    class="enable-button"
                    checked="{{item.enabled}}"
                    title="Enable / disable parameter"
                    disabled="[[readonly]]"></paper-toggle-button>
                  <paper-input
                    inline=""
                    auto-validate=""
                    value="{{item.name}}"
                    class="param-name"
                    label="Parameter name"
                    pattern="\\S*"
                    error-message="Encode this value"
                    readonly="[[readonly]]"></paper-input>
                </div>
                <paper-input
                  inline=""
                  auto-validate=""
                  value="{{item.value}}"
                  class="param-value"
                  label="Parameter value"
                  pattern="\\S*"
                  error-message="You may want to encode this value before sending it to the server"
                  readonly="[[readonly]]"></paper-input>
              </div>
              <paper-icon-button
                icon="arc:close"
                on-click="_removeSearchParam"
                on-focus="_valueFieldLeft"
                title="Remove parameter"
                disabled="[[readonly]]"></paper-icon-button>
            </div>
          </template>
          <div class="query-actions">
            <paper-button
              raised=""
              on-click="addSearchParam"
              class="add-param"
              disabled="[[readonly]]">Add</paper-button>
          </div>
        </div>
        <paper-input
          id="hash"
          label="Hash"
          value="{{model.anchor}}"
          class="anchor-input"
          readonly="[[readonly]]"></paper-input>
      </form>
    </iron-form>
    <div class="encode-actions">
      <paper-button
        id="encode"
        on-click="_encodeParameters"
        title="URL encodes parameters in the editor"
        disabled="[[readonly]]">Encode URL</paper-button>
      <paper-button
        id="decode"
        on-click="_decodeParameters"
        title="URL decodes parameters in the editor"
        disabled="[[readonly]]">Decode URL</paper-button>
    </div>
`;
  }

  static get is() {
    return 'url-detailed-editor';
  }
  static get properties() {
    return {
      /**
       * Current value of the editor.
       */
      value: {
        type: String,
        notify: true,
        observer: '_valueChanged'
      },
      /**
       * Computed data model for the view.
       */
      model: Object,
      /**
       * List of query parameters model.
       * If not set then it is computed from current URL.
       *
       * Model for query parameters is:
       * - name {String} param name
       * - value {String} param value
       * - enabled {Boolean} is param included into the `value`
       */
      queryParameters: {
        type: Array,
        notify: true
      },
      /**
       * When set the editor is in read only mode.
       */
      readonly: Boolean,
      /**
       * When set it renders "narrow" layout.
       */
      narrow: {type: Boolean, reflectToAttribute: true}
    };
  }

  static get observers() {
    return [
      '_modelChanged(model.*, queryParameters.*)'
    ];
  }
  /**
   * A handler that is called on input
   *
   * @param {String} value
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

  _computeModel(value, queryModel) {
    if (!value) {
      this.set('model', {});
      this.set('queryParameters', []);
      return;
    }
    this.__modelComputation = true;
    if (!queryModel) {
      queryModel = [];
    }
    const parser = new UrlParser(value);
    this.__parser = parser;
    const model = {};
    model.host = this._getHostValue(parser) || '';
    model.path = parser.path || '';
    model.anchor = parser.anchor || '';
    this.set('model', model);
    this._computeSearchParams(parser, queryModel);
    this.__modelComputation = false;
  }

  _getHostValue(parser) {
    const protocol = parser.protocol;
    let host = parser.host;
    if (host) {
      if (protocol) {
        host = protocol + '//' + host;
      }
    } else {
      if (protocol) {
        host = protocol + '//';
      }
    }
    return host;
  }

  _computeSearchParams(parser, queryModel) {
    if (!queryModel) {
      queryModel = [];
    }
    if (!this.queryParameters) {
      this.set('queryParameters', queryModel);
    }
    // 1 keep disabled items in the model
    // 2 remove items that are in query model but not in search params
    // 3 update value of model
    // 4 add existing search params to the model
    const searchParams = parser.searchParams;
    for (let i = queryModel.length - 1; i >= 0; i--) {
      if (queryModel[i].enabled === false) {
        continue;
      }
      const param = this._findSearchParam(searchParams, queryModel[i].name);
      if (!param) {
        this.splice('queryParameters', i, 1);
      } else {
        if (queryModel[i].value !== param[1]) {
          this.set(['queryParameters', i, 'value'], param[1]);
        }
      }
    }
    // Add to `queryModel` params that are in `parser.searchParams`
    searchParams.forEach((pairs) => {
      const param = this._findModelParam(queryModel, pairs[0]);
      if (!param) {
        this.push('queryParameters', {
          name: pairs[0],
          value: pairs[1],
          enabled: true
        });
      }
    });
  }
  /**
   * Finds a search parameter in a parser's model by given name.
   * @param {Array} searchParams Model for search params
   * @param {String} name Name of the parameter
   * @return {Array<String>} Search parameter model item
   */
  _findSearchParam(searchParams, name) {
    for (let i = searchParams.length - 1; i >= 0; i--) {
      if (searchParams[i][0] === name) {
        return searchParams[i];
      }
    }
  }
  /**
   * Searches for a query parameters model by given name.
   * @param {Array<Object>} model Query parameters model
   * @param {String} name Name of the parameter
   * @return {Object} Model item.
   */
  _findModelParam(model, name) {
    for (let i = 0, len = model.length; i < len; i++) {
      const item = model[i];
      if (!item.enabled || item.name !== name) {
        continue;
      }
      return item;
    }
  }
  /**
   * Updates the value when model changed.
   * @param {Object} recordModel Change record for the model
   * @param {Object} recordQp Change record for search parameters
   */
  _modelChanged(recordModel, recordQp) {
    if (this.__modelComputation || this.readonly || !recordModel.base) {
      return;
    }
    if (!this.__parser) {
      this.__parser = new UrlParser('');
    }
    if (recordModel.path !== 'model') {
      this._updateParserValues(recordModel);
    }
    if (recordQp.path !== 'queryParameters' && recordQp.path !== 'queryParameters.length') {
      this._updateParserSearch(recordQp);
    }
    this._cancelModelComputation = true;
    this.set('value', this.__parser.value);
    this._cancelModelComputation = false;
  }
  /**
   * Updates parser values from change record.
   *
   * @param {Object} record Polymer's change record.
   */
  _updateParserValues(record) {
    const path = record.path.split('.');
    switch (path[1]) {
      case 'host':
        this._updateParserHost(record.value);
        break;
      case 'path':
        this.__parser.path = record.value;
        break;
      case 'anchor':
        this.__parser.anchor = record.value;
        break;
    }
  }
  /**
   * Updates `queryParameters` model from change record.
   *
   * @param {Object} record Polymer's change record.
   */
  _updateParserSearch(record) {
    const params = [];
    record.base.forEach(function(item) {
      if (!item.enabled) {
        return;
      }
      params.push([item.name, item.value]);
    });
    this.__parser.searchParams = params;
  }

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

  /** Called when URL params form has been renederd. */
  _onParamsRender() {
    let row = this.shadowRoot.querySelectorAll('.params-list > .form-row');
    if (!row || !row.length) {
      return;
    }
    setTimeout(() => {
      try {
        const last = row[row.length - 1];
        const node = last.querySelector('.param-name');
        node.focus();
      } catch (e) {}
    }, 1);
  }
  /**
   * Adds a new Query Parameter to the list.
   */
  addSearchParam() {
    if (this.readonly) {
      return;
    }
    const obj = {
      name: '',
      value: '',
      enabled: true
    };
    if (!this.queryParameters) {
      this.set('queryParameters', [obj]);
    } else {
      this.push('queryParameters', obj);
    }
  }
  // Handler for the remove button click.
  _removeSearchParam(e) {
    const index = e.model.get('index');
    this.splice('queryParameters', index, 1);
  }

  /**
   * Validates the element.
   * @return {Boolean} True if the form is valid.
   */
  _getValidity() {
    return this.$.form.validate();
  }

  _valueFieldLeft(e) {
    const index = e.model.get('index');
    if (this.queryParameters.length - 1 !== index) {
      return;
    }
    const item = e.model.get('item');
    if (item.name) {
      const t = e.composedPath()[0];
      setTimeout(() => {
        if (t.focused) {
          t._setFocused(false);
        }
      }, 1);
      this.addSearchParam();
    }
  }

  _hostKeyDown(e) {
    if (!((e.code && e.code === 'Slash') || (e.keyCode && e.keyCode === 191))) {
      return;
    }

    let pos = 0;
    const input = this.$.host.inputElement.inputElement;
    if (document.selection) {
      input.focus();
      const sel = document.selection.createRange();
      sel.moveStart('character', -input.value.length);
      pos = sel.text.length;
    } else if (input.selectionStart || input.selectionStart === '0') {
      pos = input.selectionStart;
    }
    if (pos > 8) {
      e.preventDefault();
      this.set('model.path', '/');
      this.$.path.focus();
    }
  }

  _hostPaste(e) {
    const data = e.clipboardData.getData('text/plain');
    if (!data) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.set('value', data);
  }
  /**
   * Dispatches the `url-encode` event. The editor handles the action.
   */
  _encodeParameters() {
    this.dispatchEvent(new CustomEvent('url-encode', {
      composed: true
    }));
  }
  /**
   * Dispatches the `url-decode` event. The editor handles the action.
   */
  _decodeParameters() {
    this.dispatchEvent(new CustomEvent('url-decode', {
      composed: true
    }));
  }

  _closeFocus(e) {
    e.preventDefault();
    e.stopPropagation();
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
window.customElements.define(UrlDetailedEditor.is, UrlDetailedEditor);
