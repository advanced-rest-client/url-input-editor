import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { UrlParser } from '@advanced-rest-client/url-parser/url-parser.js';
import '../url-input-editor.js';

describe('<url-input-editor>', function() {
  async function basicFixture() {
    return await fixture(html`<url-input-editor></url-input-editor>`);
  }

  async function readonlyFixture() {
    return await fixture(html`<url-input-editor readonly></url-input-editor>`);
  }

  async function detailsFixture() {
    return await fixture(html`<url-input-editor detailsopened></url-input-editor>`);
  }

  async function valueFixture(value) {
    return await fixture(html`<url-input-editor .value="${value}"></url-input-editor>`);
  }

  describe('Basic tests', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Adds protocol on input focus', async () => {
      const input = element.shadowRoot.querySelector('.main-input');
      const compare = 'http://';
      input.focus();
      assert.equal(input.value, compare);
    });

    it('Dispatches url-value-changed custom event', async () => {
      const value = 'https://mulesoft.com/';
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element.value = value;
      assert.equal(spy.args[0][0].detail.value, value);
    });

    it('Encodes URL', async () => {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      const comp = 'http://192.168.2.252/service/board/1/edit?description=We\'ll+keep+your+' +
        'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.encodeParameters();
      assert.equal(element.value, comp);
    });

    it('Decode URL', async () => {
      const comp = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      const url = 'http://192.168.2.252/service/board/1/edit?description=We%27ll+keep+your+' +
        'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.decodeParameters();
      assert.equal(element.value, comp);
    });

    it('Opens detailed editor', async () => {
      const button = element.shadowRoot.querySelector('.toggle-button');
      button.click();
      assert.isTrue(element.detailsOpened);
    });
  });

  describe('Read only mode', () => {
    let element;
    beforeEach(async () => {
      element = await readonlyFixture();
    });

    it('Ignores input focus', async () => {
      element.value = '';
      await nextFrame();
      const input = element.shadowRoot.querySelector('.main-input');
      const compare = 'http://';
      input.focus();
      assert.notEqual(input.value, compare);
    });

    it('Skips url-value-changed custom event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element.value = 'https://mulesoft.com/';
      assert.isFalse(spy.called);
    });

    it('Does not encode URL', function() {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We\'ll keep your precious' +
        ' pup fed, watered, walked and socialized during their stay.';
      element.value = url;
      element.encodeParameters();
      assert.equal(element.value, url);
    });

    it('Does not eecode URL', function() {
      const url = 'http://192.168.2.252/service/board/1/edit?description=We%27ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
      element.value = url;
      element.decodeParameters();
      assert.equal(element.value, url);
    });
  });

  describe('Validation', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Empty value does not passes validation', async () => {
      element.value = '';
      await nextFrame();
      const result = element.validate();
      assert.isFalse(result);
    });

    it('Passes validation with value', () => {
      element.value = 'test';
      const result = element.validate();
      assert.isTrue(result);
    });
  });

  describe('_onValueChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing when "_preventValueChangeEvent" is set', () => {
      element._preventValueChangeEvent = true;
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element._onValueChanged('test');
      assert.isFalse(spy.called);
    });

    it('Does nothing when read only mode', () => {
      element.readOnly = true;
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element._onValueChanged('test');
      assert.isFalse(spy.called);
    });

    it('Dispatches "url-value-changed" event', () => {
      const value = 'https://test';
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element._onValueChanged(value);
      assert.isTrue(spy.called);
    });

    it('Event has "value"', () => {
      const value = 'https://test';
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element._onValueChanged(value);
      const e = spy.args[0][0];
      assert.equal(e.detail.value, value);
    });
  });

  describe('_extValueChangedHandler()', () => {
    const newValue = 'https://test-value';

    it('Ignores events dispatched by self', async () => {
      const element = await basicFixture();
      element._extValueChangedHandler({
        composedPath: () => [element],
        detail: {
          value: newValue
        }
      });
      assert.notEqual(element.value, newValue);
    });

    it('Ignores events when readonly', async () => {
      const element = await readonlyFixture();
      element._extValueChangedHandler({
        composedPath: () => [],
        detail: {
          value: newValue
        }
      });
      assert.notEqual(element.value, newValue);
    });

    it('Sets new value', async () => {
      const element = await basicFixture();
      element._extValueChangedHandler({
        composedPath: () => [],
        detail: {
          value: newValue
        }
      });
      assert.equal(element.value, newValue);
    });

    it('Re-sets _preventValueChangeEvent flag', async () => {
      const element = await basicFixture();
      element._extValueChangedHandler({
        composedPath: () => [],
        detail: {
          value: newValue
        }
      });
      assert.isFalse(element._preventValueChangeEvent);
    });

    it('Does nothing when value already set', async () => {
      const element = await basicFixture();
      element.value = newValue;
      element._extValueChangedHandler({
        composedPath: () => [],
        detail: {
          value: newValue
        }
      });
      assert.isUndefined(element._preventValueChangeEvent);
    });

    it('url-value-changed event is not dispatched', async () => {
      const element = await basicFixture();
      const spy = sinon.spy();
      element.addEventListener('url-value-changed', spy);
      element._extValueChangedHandler({
        composedPath: () => [],
        detail: {
          value: newValue
        }
      });
      assert.isFalse(spy.called);
    });
  });

  describe('toggle()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Toggles detailsOpened', () => {
      element.toggle();
      assert.isTrue(element.detailsOpened);
    });

    it('Toggles back detailsOpened', () => {
      element.detailsOpened = true;
      element.toggle();
      assert.isFalse(element.detailsOpened);
    });

    it('iron-collapse is opened after toggle', async () => {
      element.toggle();
      await nextFrame();
      const collapse = element.shadowRoot.querySelector('#collapse');
      assert.isTrue(collapse.opened);
    });

    it('iron-collapse is closed by default', () => {
      const collapse = element.shadowRoot.querySelector('#collapse');
      assert.isFalse(collapse.opened);
    });
  });

  describe('_dispatchAnalyticsEvent()', () => {
    let element;
    const label = 'test-label';
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element._dispatchAnalyticsEvent(label);
      assert.isTrue(spy.called);
    });

    it('Returns the same event', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.typeOf(e, 'customevent');
    });

    it('Event bubbles', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.isTrue(e.bubbles);
    });

    it('Event is composed', () => {
      const e = element._dispatchAnalyticsEvent(label);
      if (e.composed !== undefined) {
        // Edge...
        assert.isTrue(e.composed);
      }
    });

    it('Detail.type is set', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.equal(e.detail.type, 'event');
    });

    it('Detail.category is set', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.equal(e.detail.category, 'Request view');
    });

    it('Detail.action is set', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.equal(e.detail.action, 'URL editor');
    });

    it('Detail.label is set', () => {
      const e = element._dispatchAnalyticsEvent(label);
      assert.equal(e.detail.label, label);
    });
  });

  describe('encodeParameters()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _decodeEncode with "encode" argument', () => {
      const spy = sinon.spy(element, '_decodeEncode');
      element.encodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'encode');
    });

    it('Calls _dispatchAnalyticsEvent with label', () => {
      const spy = sinon.spy(element, '_dispatchAnalyticsEvent');
      element.encodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Encode parameters');
    });

    it('Does nothing when read only mode', () => {
      element.readOnly = true;
      const spy = sinon.spy(element, '_decodeEncode');
      element.encodeParameters();
      assert.isFalse(spy.called);
    });
  });

  describe('decodeParameters()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _decodeEncode with "decode" argument', () => {
      const spy = sinon.spy(element, '_decodeEncode');
      element.decodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'decode');
    });

    it('Calls _dispatchAnalyticsEvent with label', () => {
      const spy = sinon.spy(element, '_dispatchAnalyticsEvent');
      element.decodeParameters();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Decode parameters');
    });

    it('Does nothing when read only mode', () => {
      element.readOnly = true;
      const spy = sinon.spy(element, '_decodeEncode');
      element.decodeParameters();
      assert.isFalse(spy.called);
    });
  });

  describe('_decodeEncode()', () => {
    let element;
    const encodedUrl = 'http://192.168.2.252/service/board+1/edit?description=We\'ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
    const decodedUrl = 'http://192.168.2.252/service/board 1/edit?description=We\'ll keep your precious' +
      ' pup fed, watered, walked and socialized during their stay.';

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls "_processUrlParams()" with parser instance and decode function', () => {
      element.value = encodedUrl;
      const spy = sinon.spy(element, '_processUrlParams');
      element._decodeEncode('decode');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].constructor.name, 'UrlParser');
      assert.equal(spy.args[0][1], 'decodeQueryString');
    });

    it('Sets decoded value', () => {
      element.value = encodedUrl;
      element._decodeEncode('decode');
      assert.equal(element.value, decodedUrl);
    });

    it('Calls "_processUrlParams()" with parser instance and encode function', () => {
      element.value = decodedUrl;
      const spy = sinon.spy(element, '_processUrlParams');
      element._decodeEncode('encode');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].constructor.name, 'UrlParser');
      assert.equal(spy.args[0][1], 'encodeQueryString');
    });

    it('Sets decoded value', () => {
      element.value = decodedUrl;
      element._decodeEncode('encode');
      assert.equal(element.value, encodedUrl);
    });

    it('Does nothing when no value', () => {
      element.value = '';
      const spy = sinon.spy(element, '_processUrlParams');
      element._decodeEncode('encode');
      assert.isFalse(spy.called);
    });
  });

  describe('_processUrlParams() - decoding', () => {
    let element;
    const encodedUrl = 'http://192.168.2.252/service/board+1/edit?desc+ription=We\'ll+keep+your+' +
    'precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.';
    const fnName = 'decodeQueryString';
    let parser;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Decodes query parameters', () => {
      parser = new UrlParser(encodedUrl);
      element._processUrlParams(parser, fnName);
      const param = parser.searchParams[0];
      assert.equal(param[0], 'desc ription');
      assert.equal(param[1], 'We\'ll keep your precious pup fed, watered, walked and socialized during their stay.');
    });

    it('Decodes path', () => {
      parser = new UrlParser(encodedUrl);
      element._processUrlParams(parser, fnName);
      assert.equal(parser.path, '/service/board 1/edit');
    });

    it('Ignores path when not set', () => {
      parser = new UrlParser('?a=b');
      element._processUrlParams(parser, fnName);
      // No error
    });
  });

  describe('_processUrlParams() - decoding', () => {
    let element;
    const encodedUrl = 'http://192.168.2.252/service/board 1/edit?desc ription=We\'ll keep your ' +
    'precious pup fed, watered, walked and socialized during their stay.';
    const fnName = 'encodeQueryString';
    let parser;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Decodes query parameters', () => {
      parser = new UrlParser(encodedUrl);
      element._processUrlParams(parser, fnName);
      const param = parser.searchParams[0];
      assert.equal(param[0], 'desc+ription');
      assert.equal(param[1],
        'We\'ll+keep+your+precious+pup+fed%2C+watered%2C+walked+and+socialized+during+their+stay.');
    });

    it('Decodes path', () => {
      parser = new UrlParser(encodedUrl);
      element._processUrlParams(parser, fnName);
      assert.equal(parser.path, '/service/board+1/edit');
    });

    it('Ignores path when not set', () => {
      parser = new UrlParser('?a=b');
      element._processUrlParams(parser, fnName);
      // No error
    });
  });

  describe('_dispatchUrlQuery()', () => {
    let element;
    const query = 'http://';

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches the event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-history-query', spy);
      element._dispatchUrlQuery(query);
      assert.isTrue(spy.called);
    });

    it('Returns the same event', () => {
      const e = element._dispatchUrlQuery(query);
      assert.typeOf(e, 'customevent');
    });

    it('Event bubbles', () => {
      const e = element._dispatchUrlQuery(query);
      assert.isTrue(e.bubbles);
    });

    it('Event is composed', () => {
      const e = element._dispatchUrlQuery(query);
      if (e.composed !== undefined) {
        assert.isTrue(e.composed);
      }
    });

    it('Event is cancelable', () => {
      const e = element._dispatchUrlQuery(query);
      assert.isTrue(e.cancelable);
    });

    it('Detail.q is set', () => {
      const e = element._dispatchUrlQuery(query);
      assert.equal(e.detail.q, query);
    });
  });

  describe('_autocompleteQuery()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Cancels the event', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {},
        detail: {}
      };
      const spy = sinon.spy(e, 'preventDefault');
      element._autocompleteQuery(e);
      assert.isTrue(spy.called);
    });

    it('Stops event propagation', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {},
        detail: {}
      };
      const spy = sinon.spy(e, 'stopPropagation');
      element._autocompleteQuery(e);
      assert.isTrue(spy.called);
    });

    it('Dispatches "url-history-query" event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-history-query', spy);
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {},
        detail: {
          value: 'test'
        }
      };
      element._autocompleteQuery(e);
      assert.isTrue(spy.called);
    });

    it('Sets suggestions on the target', () => {
      element.addEventListener('url-history-query', function f(e) {
        element.removeEventListener('url-history-query', f);
        e.preventDefault();
        e.detail.result = Promise.resolve([{
          url: 'http://test'
        }]);
      });
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {},
        detail: {
          value: 'test'
        }
      };
      return element._autocompleteQuery(e)
      .then(() => {
        assert.typeOf(e.target.source, 'array');
        assert.lengthOf(e.target.source, 1);
        assert.equal(e.target.source[0], 'http://test');
      });
    });

    it('Sets empty suggestions on the target when error', () => {
      element.addEventListener('url-history-query', function f(e) {
        element.removeEventListener('url-history-query', f);
        e.preventDefault();
        e.detail.result = Promise.reject(new Error('test'));
      });
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {},
        detail: {
          value: 'test'
        }
      };
      return element._autocompleteQuery(e)
      .then(() => {
        assert.typeOf(e.target.source, 'array');
        assert.lengthOf(e.target.source, 0);
      });
    });
  });

  describe('_mainFocus()', () => {
    let element;
    let input;
    beforeEach(async () => {
      element = await basicFixture();
      input = element.shadowRoot.querySelector('.main-input');
    });

    it('Sets default protocol when no value', () => {
      element.value = '';
      element._mainFocus({
        target: input
      });
      assert.equal(element.value, element.defaultProtocol + '://');
    });

    it('Does nothing when input has value', () => {
      element.value = 'test';
      element._mainFocus({
        target: input
      });
      assert.equal(element.value, 'test');
    });

    it('Does nothing when readonly mode', () => {
      element.readOnly = true;
      element.value = '';
      element._mainFocus({
        target: input
      });
      assert.equal(element.value, '');
    });
  });

  describe('_keyDownHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Does nothing when no target', () => {
      const e = {
        composedPath: () => []
      };
      const spy = sinon.spy();
      element.addEventListener('send-request', spy);
      element._keyDownHandler(e);
      assert.isFalse(spy.called);
    });

    it('Does nothing when target is not an input', () => {
      const e = {
        composedPath: () => [document.createElement('span')]
      };
      const spy = sinon.spy();
      element.addEventListener('send-request', spy);
      element._keyDownHandler(e);
      assert.isFalse(spy.called);
    });

    it('Calls "_onEnter()" when keyboard code is "Enter"', () => {
      const e = {
        composedPath: () => [document.createElement('input')],
        code: 'Enter'
      };
      const spy = sinon.spy(element, '_onEnter');
      element._keyDownHandler(e);
      assert.isTrue(spy.called);
    });

    it('Calls "_onEnter()" when keyboard code is "NumpadEnter"', () => {
      const e = {
        composedPath: () => [document.createElement('input')],
        code: 'NumpadEnter'
      };
      const spy = sinon.spy(element, '_onEnter');
      element._keyDownHandler(e);
      assert.isTrue(spy.called);
    });

    it('Calls "_onEnter()" when keyCode is "13"', () => {
      const e = {
        composedPath: () => [document.createElement('input')],
        keyCode: 13
      };
      const spy = sinon.spy(element, '_onEnter');
      element._keyDownHandler(e);
      assert.isTrue(spy.called);
    });

    it('Does not call "_onEnter()" when other keyCode', () => {
      const e = {
        composedPath: () => [document.createElement('input')],
        keyCode: 23
      };
      const spy = sinon.spy(element, '_onEnter');
      element._keyDownHandler(e);
      assert.isFalse(spy.called);
    });

    it('Does not call "_onEnter()" when other keyboard code', () => {
      const e = {
        composedPath: () => [document.createElement('input')],
        code: 'KeyS'
      };
      const spy = sinon.spy(element, '_onEnter');
      element._keyDownHandler(e);
      assert.isFalse(spy.called);
    });
  });

  describe('_onEnter()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches "send-request" event', () => {
      const spy = sinon.spy();
      element.addEventListener('send-request', spy);
      element._onEnter();
      assert.isTrue(spy.called);
    });

    it('The event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('send-request', spy);
      element._onEnter();
      assert.isTrue(spy.args[0][0].bubbles);
    });

    it('The event is composed', () => {
      const spy = sinon.spy();
      element.addEventListener('send-request', spy);
      element._onEnter();
      assert.isTrue(spy.args[0][0].composed);
    });
  });

  describe('encodeQueryString()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty string when argument is empty', () => {
      const result = element.encodeQueryString('');
      assert.equal(result, '');
    });

    it('Returns empty string when argument is empty', () => {
      const result = element.encodeQueryString('');
      assert.equal(result, '');
    });

    it('URL encodes string', () => {
      const result = element.encodeQueryString(';This / is? &test:= + $ , #');
      assert.equal(result, '%3BThis+%2F+is%3F+%26test%3A%3D+%2B+%24+%2C+%23');
    });
  });

  describe('decodeQueryString()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty string when argument is empty', () => {
      const result = element.decodeQueryString('');
      assert.equal(result, '');
    });

    it('Returns empty string when argument is empty', () => {
      const result = element.decodeQueryString('');
      assert.equal(result, '');
    });

    it('URL encodes string', () => {
      const result = element.decodeQueryString('%3BThis+%2F+is%3F+%26test%3A%3D+%2B+%24+%2C+%23');
      assert.equal(result, ';This / is? &test:= + $ , #');
    });
  });

  describe('_colapseTransitioning()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Adds class name to collapse when value and opened', () => {
      element.detailsOpened = true;
      element._colapseTransitioning({
        detail: {
          value: true
        }
      });
      const node = element.shadowRoot.querySelector('#collapse');
      assert.isTrue(node.classList.contains('sized'));
    });

    it('Removes class name to collapse when value and not opened', () => {
      const node = element.shadowRoot.querySelector('#collapse');
      node.classList.add('sized');
      element._colapseTransitioning({
        detail: {
          value: true
        }
      });
      assert.isFalse(node.classList.contains('sized'));
    });
  });

  describe('_getValidity()', () => {
    it('Calls validate on detailed editor', async () => {
      const element = await detailsFixture();
      const node = element.shadowRoot.querySelector('url-detailed-editor');
      const spy = sinon.spy(node, 'validate');
      element._getValidity();
      assert.isTrue(spy.called);
    });

    it('Calls validate on main input', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.main-input');
      const spy = sinon.spy(node, 'validate');
      element._getValidity();
      assert.isTrue(spy.called);
    });

    it('Validate is false when no input', async () => {
      const element = await basicFixture();
      element.value = '';
      await nextFrame();
      const result = element._getValidity();
      assert.isFalse(result);
    });

    it('Validate is true when has value', async () => {
      const element = await basicFixture();
      element.value = 'http://test';
      const result = element._getValidity();
      assert.isTrue(result);
    });
  });

  describe('events tests', function() {
    const value = 'http://ux.mulesoft.com/path?param=value';
    let element;
    beforeEach(async () => {
      element = await valueFixture(value);
    });

    it('Dispatches "send-request" custom event on main field', () => {
      const spy = sinon.stub();
      element.addEventListener('send-request', spy);
      const input = element.shadowRoot.querySelector('.main-input');
      MockInteractions.pressEnter(input.inputElement);
      assert.isTrue(spy.calledOnce, 'Fired send-request event');
    });

    it('Fires "url-value-changed" custom event', () => {
      const spy = sinon.stub();
      element.addEventListener('url-value-changed', spy);
      element.detailsOpened = true;
      const details = element.shadowRoot.querySelector('url-detailed-editor');
      const input = details.shadowRoot.querySelector('#host');
      input.value = 'https://test-com/';
      assert.isTrue(spy.calledOnce, 'Fired url-value-changed event');
    });

    it('"url-value-changed" contains all properties', function(done) {
      element.addEventListener('url-value-changed', function clb(e) {
        element.removeEventListener('url-value-changed', clb);
        assert.equal(e.detail.value, 'https://test-com/path?param=value');
        done();
      });
      element.detailsOpened = true;
      const details = element.shadowRoot.querySelector('url-detailed-editor');
      const input = details.shadowRoot.querySelector('#host');
      input.value = 'https://test-com';
    });
  });

  describe('a11y', () => {
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with details', async () => {
      const element = await detailsFixture();
      await assert.isAccessible(element);
    });
  });
});
