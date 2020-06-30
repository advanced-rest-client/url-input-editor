import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin';
import {UrlParser} from '@advanced-rest-client/url-parser';

export declare function getHostValue(parser: UrlParser): string;
export declare function findSearchParam(searchParams: Array<string[]>, name: string): string[]|undefined;
export declare function findModelParam(model: QueryParameter[], name: string): QueryParameter|undefined;

export declare interface QueryParameter {
  /**
   * The name of the parameter
   */
  name: string;
  /**
   * The value of the parameter
   */
  value: string;
  /**
   * Whether the parameter is currently enabled.
   */
  enabled: boolean;
}

export declare interface ViewModel {
  host: string;
  path: string;
  anchor: string;
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
export declare class UrlDetailedEditorElement {
  static readonly styles: CSSResult;

  /**
   * Current value of the editor.
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
   * Computed data model for the view.
   */
  model: ViewModel;

  /**
   * List of query parameters model.
   * If not set then it is computed from current URL.
   *
   * Model for query parameters is:
   * - name {String} param name
   * - value {String} param value
   * - enabled {Boolean} is param included into the `value`
   */
  queryParameters: QueryParameter[];

  /**
   * When set the editor is in read only mode.
   */
  readOnly: boolean;

  /**
   * When set it renders "narrow" layout.
   */
  narrow: boolean;
  __parser: UrlParser;
  _cancelModelComputation: boolean;

  _hostInputTemplate(): TemplateResult;
  _pathInputTemplate(): TemplateResult;
  _hashInputTemplate(): TemplateResult;
  _paramsTemplate(): TemplateResult;
  _paramItemTemplate(item: QueryParameter, index: number, compatibility: boolean, outlined: boolean, readOnly: boolean): TemplateResult;
  _formTemplate(): TemplateResult;
  _actionsTemplate(): TemplateResult;
  render(): TemplateResult;

  /**
   * A handler that is called on input
   */
  _valueChanged(value: string): void;
  _computeModel(value: string, queryModel: QueryParameter[]): void;
  _computeSearchParams(parser: UrlParser, queryModel: QueryParameter[]): void;

  /**
   * Updates the value when model changed.
   *
   * @param prop Changed property
   * @param value New value
   */
  _modelChanged(prop: string, value: string): void;
  _queryModelChanged(): void;

  /**
   * Updates parser values from change record.
   *
   * @param prop Changed property
   * @param value New value
   */
  _updateParserValues(prop: string, value: string): void;

  /**
   * Updates `queryParameters` model from change record.
   *
   * @param model Cureent model for the query parameters
   */
  _updateParserSearch(model: QueryParameter[]): void;
  _updateParserHost(value: string): void;

  /**
   * Focuses on the last query parameter name filed
   */
  focusLastName(): void;

  /**
   * Adds a new Query Parameter to the list.
   */
  addSearchParam(): void;

  /**
   * Handler for the remove button click.
   */
  _removeSearchParam(e: CustomEvent): void;

  /**
   * Validates the element.
   *
   * @returns True if the form is valid.
   */
  _getValidity(): boolean;
  _hostKeyDown(e: KeyboardEvent): void;
  _hostPaste(e: Event): void;

  /**
   * Dispatches the `url-encode` event. The editor handles the action.
   */
  _encodeParameters(): void;

  /**
   * Dispatches the `url-decode` event. The editor handles the action.
   */
  _decodeParameters(): void;
  _inputHandler(e: CustomEvent): void;
  _enabledHandler(e: CustomEvent): void;
  _paramInputHandler(e: CustomEvent): void;
}
export declare interface UrlDetailedEditorElement extends ValidatableMixin, LitElement {
}
