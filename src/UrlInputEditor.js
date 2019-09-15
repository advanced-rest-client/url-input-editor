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
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { UrlParser } from '@advanced-rest-client/url-parser/url-parser.js';
import { keyboardArrowDown } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '../url-detailed-editor.js';
import styles from './EditorStyles.js';
/**
 * The request URL editor
 *
 * The editor renders a simple editor view with an input field. The input
 * uses `paper-autocomplete` element to render URL suggestions.
 *
 * When setting `detailsOpened` property to `true` it renders detailed editor.
 * The editor allows to edit host, path, query parameetrs and hash
 * separatelly.
 *
 * ### Example
 *
 * ```html
 * <url-input-editor
 *  url="{{requestURL}}"
 *  on-send-request="_sendAction"
 *  on-url-value-changed="_handleNewUrl"></url-input-editor>
 * ```
 *
 * ### Styling
 *
 * `<url-input-editor>` provides the following custom properties and mixins
 * for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--url-input-editor` | Mixin applied to the element | `{}`
 *
 * Use paper elements mixin to style this element.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin ValidatableMixin
 * @appliesMixin EventsTargetMixin
 */
export class UrlInputEditor extends EventsTargetMixin(ValidatableMixin(LitElement)) {
  static get styles() {
    return styles;
  }

  render() {
    const {
      _toggleIconClass,
      compatibility,
      readOnly,
      outlined,
      detailsOpened,
      narrow,
      value
    } = this;
    return html`
    <div class="container">
      <div class="editor">
        ${this._mainInputTemplate()}
        <iron-collapse id="collapse"
          ?opened="${detailsOpened}"
          @transitioning-changed="${this._colapseTransitioning}">
          <url-detailed-editor
            .value="${value}"
            @url-encode="${this.encodeParameters}"
            @url-decode="${this.decodeParameters}"
            @value-changed="${this._inputHandler}"
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?readOnly="${readOnly}"
            ?narrow="${narrow}"
          ></url-detailed-editor>
        </iron-collapse>
      </div>
      <anypoint-icon-button
        class="${_toggleIconClass}"
        @click="${this.toggle}"
        title="Toggle detailed editor"
        aria-label="Activate to toggle detailed editor"
        ?compatibility="${compatibility}"
      >
        <span class="icon">${keyboardArrowDown}</span>
      </anypoint-icon-button>
    </div>
`;
  }

  _mainInputTemplate() {
    const {
      compatibility,
      readOnly,
      outlined,
      value,
      detailsOpened
    } = this;
    return html`
    <div class="ac-wrapper">
      <anypoint-input
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        ?readOnly="${readOnly}"
        .value="${value}"
        class="main-input"
        required
        autovalidate
        invalidmessage="The URL is required"
        @focus="${this._mainFocus}"
        @value-changed="${this._inputHandler}"
        ?hidden="${detailsOpened}"
        id="mainInput"
      >
        <label slot="label">Request URL</label>
      </anypoint-input>
      <anypoint-autocomplete
        loader
        openonfocus
        target="mainInput"
        @query="${this._autocompleteQuery}"
      ></anypoint-autocomplete>
    </div>`;
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
      // Current URL value.
      value: { type: String },
      /**
       * True if detailed editor is opened.
       */
      detailsOpened: { type: Boolean },
      /**
       * Default protocol for the URL if it's missing.
       */
      defaultProtocol: { type: String },
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

  get _toggleIconClass() {
    const { detailsOpened } = this;
    let klas = 'toggle-button';
    if (detailsOpened) {
      klas += ' opened';
    }
    return klas;
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
    this._onValueChanged(value);
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this._extValueChangedHandler = this._extValueChangedHandler.bind(this);
    this._keyDownHandler = this._keyDownHandler.bind(this);
    this.defaultProtocol = 'http';
    this.value = 'http://';
  }

  _attachListeners(node) {
    node.addEventListener('url-value-changed', this._extValueChangedHandler);
    this.addEventListener('keydown', this._keyDownHandler);
  }

  _detachListeners(node) {
    node.removeEventListener('url-value-changed', this._extValueChangedHandler);
    this.removeEventListener('keydown', this._keyDownHandler);
  }

  /**
   * A handler that is called on input
   *
   * @param {String} value
   */
  _onValueChanged(value) {
    if (this._preventValueChangeEvent || this.readOnly) {
      return;
    }
    this.dispatchEvent(new CustomEvent('url-value-changed', {
      bubbles: true,
      composed: true,
      detail: {
        value
      }
    }));
  }

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   *
   * @param {CustomEvent} e
   */
  _extValueChangedHandler(e) {
    if (e.composedPath()[0] === this || this.readOnly) {
      return;
    }
    const { value } = e.detail;
    if (this.value !== value) {
      this._preventValueChangeEvent = true;
      this.value = value;
      this._preventValueChangeEvent = false;
    }
  }

  /**
   * Opens detailed view.
   */
  toggle() {
    this.detailsOpened = !this.detailsOpened;
  }

  /**
   * HTTP encode query parameters
   */
  encodeParameters() {
    if (this.readOnly) {
      return;
    }
    this._decodeEncode('encode');
    this._dispatchAnalyticsEvent('Encode parameters');
  }

  /**
   * HTTP decode query parameters
   */
  decodeParameters() {
    if (this.readOnly) {
      return;
    }
    this._decodeEncode('decode');
    this._dispatchAnalyticsEvent('Decode parameters');
  }
  /**
   * Dispatches analytics event with "event" type.
   * @param {String} label A label to use with GA event
   * @return {CustomEvent}
   */
  _dispatchAnalyticsEvent(label) {
    const e = new CustomEvent('send-analytics', {
      bubbles: true,
      composed: true,
      detail: {
        type: 'event',
        category: 'Request view',
        action: 'URL editor',
        label
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * HTTP encode or decode query parameters depending on [type].
   *
   * @param {String} type
   */
  _decodeEncode(type) {
    const url = this.value;
    if (!url) {
      return;
    }
    const parser = new UrlParser(url);
    if (type === 'decode') {
      this._processUrlParams(parser, 'decodeQueryString');
    } else {
      this._processUrlParams(parser, 'encodeQueryString');
    }
    this.value = parser.value;
  }
  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   * @param {UrlParser} parser Instance of UrlParser
   * @param {String} processFn Function name to call on each parameter
   */
  _processUrlParams(parser, processFn) {
    const decoded = parser.searchParams.map((item) => {
      const key = this[processFn](item[0]);
      const value = this[processFn](item[1]);
      return [key, value];
    });
    parser.searchParams = decoded;
    const path = parser.path;
    if (path && path.length) {
      const parts = path.split('/');
      let tmp = '/';
      for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];
        if (!part) {
          continue;
        }
        part = this[processFn](part);
        tmp += part;
        if (i + 1 !== len) {
          tmp += '/';
        }
      }
      parser.path = tmp;
    }
  }
  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async _autocompleteQuery(e) {
    e.preventDefault();
    e.stopPropagation();
    const autocomplete = e.target;
    const { value } = e.detail;
    const ev = this._dispatchUrlQuery(value);
    try {
      let result = await ev.detail.result;
      result = result.map((item) => item.url);
      autocomplete.source = result;
    } catch (_) {
      autocomplete.source = [];
    }
  }
  /**
   * Dispatches `url-history-query` custom event.
   * @param {String} q URL query
   * @return {CustomEvent}
   */
  _dispatchUrlQuery(q) {
    const e = new CustomEvent('url-history-query', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        q
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Ensures that protocol is set before user input.
   *
   * @param {Event} e
   */
  _mainFocus(e) {
    if (this.value || this.readOnly) {
      return;
    }
    this.value = this.defaultProtocol + '://';
    const input = e.target.inputElement;
    setTimeout(() => {
      input.setSelectionRange(0, this.value.length);
    });
  }

  _keyDownHandler(e) {
    const target = e.composedPath()[0];
    if (!target || target.nodeName !== 'INPUT') {
      return;
    }
    if ((e.code && (e.code === 'Enter' || e.code === 'NumpadEnter')) || (e.keyCode && e.keyCode === 13)) {
      this._onEnter();
    }
  }
  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send a `send` event.
   */
  _onEnter() {
    this.dispatchEvent(new CustomEvent('send-request', {
      bubbles: true,
      composed: true
    }));
  }
  /**
   * Returns a string where all characters that are not valid for a URL
   * component have been escaped. The escaping of a character is done by
   * converting it into its UTF-8 encoding and then encoding each of the
   * resulting bytes as a %xx hexadecimal escape sequence.
   * <p>
   * Note: this method will convert any the space character into its escape
   * short form, '+' rather than %20. It should therefore only be used for
   * query-string parts.
   *
   * <p>
   * The following character sets are <em>not</em> escaped by this method:
   * <ul>
   * <li>ASCII digits or letters</li>
   * <li>ASCII punctuation characters:
   *
   * <pre>- _ . ! ~ * ' ( )</pre>
   * </li>
   * </ul>
   * </p>
   *
   * <p>
   * Notice that this method <em>does</em> encode the URL component delimiter
   * characters:<blockquote>
   *
   * <pre>
   * ; / ? : &amp; = + $ , #
   * </pre>
   *
   * </blockquote>
   * </p>
   *
   * @param {String} str A string containing invalid URL characters
   * @return {String} a string with all invalid URL characters escaped
   */
  encodeQueryString(str) {
    if (!str) {
      return str;
    }
    return encodeURIComponent(str).replace(/%20/g, '+');
  }
  /**
   * Returns a string where all URL component escape sequences have been
   * converted back to their original character representations.
   *
   * Note: this method will convert the space character escape short form, '+',
   * into a space. It should therefore only be used for query-string parts.
   *
   * @param {String} str string containing encoded URL component sequences
   * @return {String} string with no encoded URL component encoded sequences
   */
  decodeQueryString(str) {
    if (!str) {
      return str;
    }
    return decodeURIComponent(str.replace(/\+/g, '%20'));
  }
  /**
   * A trick to instantly replace main URL input with host field and back
   * without animation jumping when transitioning.
   * Sets / removes `sized` class name from the collapse element. This class
   * sets minimum height for the element so the host field will be visible
   * instantly in place of dissapearing main URL.
   *
   * @param {Event} e
   */
  _colapseTransitioning(e) {
    const { value } = e.detail;
    const collapse = this.shadowRoot.querySelector('#collapse');
    if (value && this.detailsOpened) {
      collapse.classList.add('sized');
    } else if (value && !this.detailsOpened) {
      collapse.classList.remove('sized');
    }
  }
  /**
   * Validates the element.
   * @return {Boolean}
   */
  _getValidity() {
    let element;
    if (this.detailsOpened) {
      element = this.shadowRoot.querySelector('url-detailed-editor');
    } else {
      element = this.shadowRoot.querySelector('.main-input');
    }
    if (!element) {
      return true;
    }
    return element.validate();
  }

  _inputHandler(e) {
    this.value = e.detail.value;
  }
  /**
   * Fired when the URL value change.
   * Note that this event is fired before validation occur and therefore
   * the URL may be invalid.
   *
   * @event url-value-changed
   * @param {String} value The URL.
   */
  /**
   * Fired when the user use the "entrer" key in any of the fields.
   *
   * @event send-request
   */
  /**
   * Fired when autocomplete element request data.
   * This event is to be handled by `url-history-saver` element but it can be
   * handled by any element that intercepts this event.
   *
   * @event url-history-query
   * @param {String} q A query filter.
   */
}
