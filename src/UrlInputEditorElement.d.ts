import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {UrlParser} from '@advanced-rest-client/url-parser/url-parser.js';

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
 */
export declare class UrlInputEditorElement {
  static readonly styles: CSSResult;
  readonly _toggleIconClass: string;

  /**
   * Current URL value.
   */
  value: string;

  /**
   * Enables outlined theme.
   */
  outlined: boolean;

  /**
   * Enables compatibility with Anypoint components.
   */
  compatibility: boolean;

  /**
   * True if detailed editor is opened.
   */
  detailsOpened: boolean;

  /**
   * Default protocol for the URL if it's missing.
   */
  defaultProtocol: string;

  /**
   * When set the editor is in read only mode.
   */
  readOnly: boolean;

  /**
   * When set it renders "narrow" layout.
   */
  narrow: boolean;
  _preventValueChangeEvent: boolean;
  
  render(): TemplateResult;
  _mainInputTemplate(): TemplateResult;
  _attachListeners(node: EventTarget): void;
  _detachListeners(node: EventTarget): void;

  /**
   * A handler that is called on input
   */
  _onValueChanged(value: string): void;

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   */
  _extValueChangedHandler(e: CustomEvent): void;

  /**
   * Opens detailed view.
   */
  toggle(): void;

  /**
   * HTTP encode query parameters
   */
  encodeParameters(): void;

  /**
   * HTTP decode query parameters
   */
  decodeParameters(): void;

  /**
   * Dispatches analytics event with "event" type.
   *
   * @param label A label to use with GA event
   */
  _dispatchAnalyticsEvent(label: string): CustomEvent;

  /**
   * HTTP encode or decode query parameters depending on [type].
   */
  _decodeEncode(type: string): void;

  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   *
   * @param parser Instance of UrlParser
   * @param processFn Function name to call on each parameter
   */
  _processUrlParams(parser: UrlParser, processFn: string): void;

  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   */
  _autocompleteQuery(e: CustomEvent): Promise<void>;

  /**
   * Dispatches `url-history-query` custom event.
   *
   * @param q URL query
   */
  _dispatchUrlQuery(q: string): CustomEvent;

  /**
   * Ensures that protocol is set before user input.
   */
  _mainFocus(e: Event): void;
  _keyDownHandler(e: KeyboardEvent): void;

  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send a `send` event.
   */
  _onEnter(): void;

  /**
   * A trick to instantly replace main URL input with host field and back
   * without animation jumping when transitioning.
   * Sets / removes `sized` class name from the collapse element. This class
   * sets minimum height for the element so the host field will be visible
   * instantly in place of dissapearing main URL.
   */
  _colapseTransitioning(e: CustomEvent): void;

  /**
   * Validates the element.
   */
  _getValidity(): boolean;
  _inputHandler(e: CustomEvent): void;
}
export declare interface UrlInputEditorElement extends ValidatableMixin, EventsTargetMixin, LitElement {
}
