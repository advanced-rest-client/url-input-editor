import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { UrlParser } from '@advanced-rest-client/url-parser/url-parser.js';
import '../url-detailed-editor.js';

describe('<url-detailed-editor>', function() {
  async function basicFixture() {
    const value = 'https://arc.com:1234/path/o ther/?a=b&c=d#123';
    return await fixture(html`<url-detailed-editor
      .value="${value}"></url-detailed-editor>`);
  }
  async function emptyFixture() {
    return await fixture(html`<url-detailed-editor></url-detailed-editor>`);
  }

  async function readOnlyFixture(value) {
    return await fixture(html`<url-detailed-editor
      .value="${value}"
      readonly></url-detailed-editor>`);
  }

  async function valueFixture(value) {
    return await fixture(html`<url-detailed-editor
      .value="${value}"></url-detailed-editor>`);
  }

  describe('Basics', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Model is computed', function() {
      const m = element.model;
      assert.typeOf(m, 'object', 'Model is an object');
      assert.equal(m.host, 'https://arc.com:1234', 'Host is computed');
      assert.equal(m.path, '/path/o ther/', 'Path is computed');
      assert.equal(m.anchor, '123', 'Ancor is computed');
      assert.lengthOf(element.queryParameters, 2, 'Search is computed');
    });

    it('__parser is set', function() {
      assert.typeOf(element.__parser, 'object');
    });

    it('Notifies change for host', function() {
      const input = element.shadowRoot.querySelector('#host');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'https://domain.com';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://domain.com/path/o ther/?a=b&c=d#123');
    });

    it('Notifies change for path', function() {
      const input = element.shadowRoot.querySelector('#path');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = '/other-path/';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/other-path/?a=b&c=d#123');
    });

    it('Notifies change for hash', function() {
      const input = element.shadowRoot.querySelector('#hash');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'hash-test';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=b&c=d#hash-test');
    });

    it('Notifies change for search param name', function() {
      const input = element.shadowRoot.querySelector('.param-name');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-changed';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a-changed=b&c=d#123');
    });

    it('Notifies change for search param value', function() {
      const input = element.shadowRoot.querySelector('.param-value');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-value';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=a-value&c=d#123');
    });

    it('Notifies change for search param value with variable', function() {
      const input = element.shadowRoot.querySelector('.param-value');
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-value${test}';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=a-value${test}&c=d#123');
    });

    it('Notifies change for removing search param', function() {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      const button = element.shadowRoot.querySelector('.form-row > anypoint-icon-button');
      MockInteractions.tap(button);
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?c=d#123');
    });

    it('Changes model when value change', function() {
      element.value = 'http://arc.com/o%20ther?test=value';
      const m = element.model;
      assert.equal(m.host, 'http://arc.com', 'Host is computed');
      assert.equal(m.path, '/o%20ther', 'Path is computed');
      assert.equal(m.anchor, '', 'Ancor is computed');
      assert.lengthOf(element.queryParameters, 1, 'Search is computed');
    });

    it('Fires url-encode event', function() {
      const spy = sinon.spy();
      element.addEventListener('url-encode', spy);
      const button = element.shadowRoot.querySelector('#encode');
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('Fires url-decode event', function() {
      const spy = sinon.spy();
      element.addEventListener('url-decode', spy);
      const button = element.shadowRoot.querySelector('#decode');
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('_valueChanged()', () => {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
    });

    it('Calls "_computeModel()"', () => {
      const spy = sinon.spy(element, '_computeModel');
      element._valueChanged('http://');
      assert.isTrue(spy.called);
    });

    it('_computeModel() is called with passed value', () => {
      const spy = sinon.spy(element, '_computeModel');
      element._valueChanged('http://');
      assert.equal(spy.args[0][0], 'http://');
    });

    it('_computeModel() is called with default query parameters model', () => {
      const spy = sinon.spy(element, '_computeModel');
      element._valueChanged('http://');
      const params = spy.args[0][1];
      assert.typeOf(params, 'array');
      assert.lengthOf(params, 0);
    });

    it('_computeModel() is called with computed query model', () => {
      const spy = sinon.spy(element, '_computeModel');
      const model = [{ name: 'a', value: 'b', enabled: true }];
      element.queryParameters = model;
      element._valueChanged('http://');
      const params = spy.args[0][1];
      assert.deepEqual(params, model);
    });

    it('Does nothing when no value and model', () => {
      const spy = sinon.spy(element, '_computeModel');
      element.queryParameters = undefined;
      element._valueChanged();
      assert.isFalse(spy.called);
    });

    it('Does nothing when _cancelModelComputation is set', () => {
      const spy = sinon.spy(element, '_computeModel');
      element._cancelModelComputation = true;
      element._valueChanged();
      assert.isFalse(spy.called);
    });
  });

  describe('_computeModel()', () => {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
    });

    it('Sets "model" to empty object when no value', () => {
      element._computeModel();
      assert.typeOf(element.model, 'object');
      assert.lengthOf(Object.keys(element.model), 0);
    });

    it('Sets "queryParameters" to empty array when no value', () => {
      element._computeModel();
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 0);
    });

    it('Creates empty query model when missing', () => {
      element._computeModel('/test');
      // No error
    });

    it('Missing path does not causes errors', () => {
      element._computeModel('test');
      // No error
    });

    it('Sets model property', () => {
      element._computeModel('http://test.com/path?a=b&c=d#hash');
      assert.typeOf(element.model, 'object');
      assert.equal(element.model.host, 'http://test.com');
      assert.equal(element.model.path, '/path');
      assert.equal(element.model.anchor, 'hash');
    });

    it('Calls _computeSearchParams()', () => {
      const spy = sinon.spy(element, '_computeSearchParams');
      element._computeModel('http://test.com/path?a=b&c=d#hash');
      assert.isTrue(spy.called);
    });
  });

  describe('_getHostValue()', () => {
    let element;
    let parser;
    beforeEach(async function() {
      element = await basicFixture();
    });

    it('Build host value', () => {
      parser = new UrlParser('http://test.com/path');
      const result = element._getHostValue(parser);
      assert.equal(result, 'http://test.com');
    });

    it('Returns protocol only', () => {
      parser = new UrlParser('http://');
      const result = element._getHostValue(parser);
      assert.equal(result, 'http://');
    });
  });

  describe('_computeSearchParams()', () => {
    let element;
    let parser;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Sets "queryParameters"', () => {
      parser = new UrlParser('/?a=b&c=d');
      element._computeSearchParams(parser);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 2);
    });

    it('Adds disabled items to the model', () => {
      const model = [{
        name: 'disabled',
        value: 'true',
        enabled: false
      }];
      parser = new UrlParser('/?a=b&c=d');
      element._computeSearchParams(parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 3);
      assert.isFalse(element.queryParameters[0].enabled);
    });

    it('Duplicates the entry keeping enabled / diabled state', () => {
      const model = [{
        name: 'a',
        value: 'b',
        enabled: false
      }];
      parser = new UrlParser('/?a=b&c=d');
      element._computeSearchParams(parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 3);
      assert.isFalse(element.queryParameters[0].enabled);
      assert.isTrue(element.queryParameters[1].enabled);
      assert.isTrue(element.queryParameters[2].enabled);
    });

    it('Removes missing query parameters', () => {
      const model = [{
        name: 'a',
        value: 'b',
        enabled: true
      }];
      parser = new UrlParser('/?c=d');
      element._computeSearchParams(parser, model);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 1);
      assert.equal(element.queryParameters[0].name, 'c');
    });
  });

  describe('_findSearchParam()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Finds a param by name', () => {
      const params = [['test', 'v']];
      const result = element._findSearchParam(params, 'test');
      assert.typeOf(result, 'array');
    });

    it('Returns undefined when no item in the array', () => {
      const params = [['test', 'v']];
      const result = element._findSearchParam(params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('_findModelParam()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Finds item by name', () => {
      const params = [{
        name: 'test',
        enabled: true
      }];
      const result = element._findModelParam(params, 'test');
      assert.typeOf(result, 'object');
    });

    it('Ignores disabled items', () => {
      const params = [{
        name: 'test',
        enabled: false
      }];
      const result = element._findModelParam(params, 'test');
      assert.isUndefined(result);
    });

    it('Returns undefined when item not found', () => {
      const params = [{
        name: 'test',
        enabled: true
      }];
      const result = element._findModelParam(params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('addSearchParam()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Does nothing in readonly mode', () => {
      element.readOnly = true;
      element.addSearchParam();
      assert.isUndefined(element.queryParameters);
    });

    it('Sets queryParameters property', () => {
      element.addSearchParam();
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 1);
    });

    it('Added property is empty', () => {
      element.addSearchParam();
      const param = element.queryParameters[0];
      assert.equal(param.name, '');
      assert.equal(param.value, '');
      assert.isTrue(param.enabled);
    });

    it('Adds property to existing list', () => {
      element.addSearchParam();
      element.addSearchParam();
      assert.lengthOf(element.queryParameters, 2);
    });

    it('focuses on last name filed', async () => {
      element.addSearchParam();
      await aTimeout();
      const node = element.shadowRoot.querySelector('.param-name');
      assert.equal(element.shadowRoot.activeElement, node);
    });
  });

  describe('_hostPaste()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Does nothing when no clipboard data', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clipboardData: {
          getData: () => {}
        }
      };
      element._hostPaste(e);
      assert.isUndefined(element.value);
    });

    it('Sets new value', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clipboardData: {
          getData: () => 'http://test.com'
        }
      };
      element._hostPaste(e);
      assert.equal(element.value, 'http://test.com');
    });

    it('Cancels the event', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clipboardData: {
          getData: () => 'http://test.com'
        }
      };
      const spy = sinon.spy(e, 'preventDefault');
      element._hostPaste(e);
      assert.isTrue(spy.called);
    });

    it('Stops event propagation', () => {
      const e = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clipboardData: {
          getData: () => 'http://test.com'
        }
      };
      const spy = sinon.spy(e, 'stopPropagation');
      element._hostPaste(e);
      assert.isTrue(spy.called);
    });
  });

  describe('_hostKeyDown()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
    });

    it('Does nothing if code is not "Slash"', () => {
      element._hostKeyDown({
        code: 'Enter'
      });
      // No null error
    });

    it('Does nothing if keyCode is not "191"', () => {
      element._hostKeyDown({
        keyCode: 24
      });
      // No null error
    });

    it('Does nothing if keyCode is not "191"', () => {
      element.value = 'http://domain.com/path';
      element._hostKeyDown({
        keyCode: 191,
        preventDefault: () => {}
      });
      // no error
    });
  });

  describe('_getValidity()', () => {
    let element;
    beforeEach(async function() {
      element = await emptyFixture();
      element.value = 'http://domain.com/path';
      await nextFrame();
    });

    it('Returns true when valid', () => {
      const result = element._getValidity();
      assert.isTrue(result);
    });
  });

  describe('read only editor', () => {
    const value = 'https://arc.com:1234/path/o ther/?a=b&c=d#123';
    let element;
    beforeEach(async function() {
      element = await readOnlyFixture(value);
    });

    it('ignores model computation', () => {
      element._modelChanged('host', 'test');
      assert.equal(element.value, value);
    });

    it('ignores query model computation', () => {
      element.queryParameters[0].value = 'test';
      element._queryModelChanged();
      assert.equal(element.value, value);
    });
  });

  describe('Disabling parameters', () => {
    const value = 'https://arc.com/?a=b&c=d&e=f';
    let element;
    beforeEach(async function() {
      element = await valueFixture(value);
    });

    it('removes query parameter', () => {
      const button = element.shadowRoot.querySelector('anypoint-switch');
      MockInteractions.tap(button);
      assert.equal(element.value, 'https://arc.com/?c=d&e=f');
    });

    it('re-enables query parameter', async () => {
      const button = element.shadowRoot.querySelector('anypoint-switch');
      MockInteractions.tap(button);
      await nextFrame();
      MockInteractions.tap(button);
      assert.equal(element.value, value);
    });

    it('does not change value when adding not enabled model item', () => {
      const item = {
        name: 'test',
        value: 'value',
        enabled: false
      };
      element.queryParameters.push(item);
      element.queryParameters = [...element.queryParameters];
      assert.equal(element.value, value);
    });
  });

  describe('a11y', () => {
    it('is accessible when empty', async () => {
      const element = await emptyFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible with all values', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});
