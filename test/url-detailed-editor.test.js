import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { UrlParser } from '@advanced-rest-client/url-parser';
import '../url-detailed-editor.js';
import { getHostValue, findSearchParam, findModelParam } from '../src/UrlDetailedEditorElement.js';

/* eslint-disable no-template-curly-in-string */

/** @typedef {import('../index').UrlDetailedEditorElement} UrlDetailedEditorElement */
/** @typedef {import('@anypoint-web-components/anypoint-input').AnypointInput} AnypointInput */
/** @typedef {import('@anypoint-web-components/anypoint-button').AnypointButton} AnypointButton */

describe('<url-detailed-editor>', () => {
  /**
   * @return {Promise<UrlDetailedEditorElement>}
   */
  async function basicFixture() {
    const value = 'https://arc.com:1234/path/o ther/?a=b&c=d#123';
    return fixture(html`<url-detailed-editor
      .value="${value}"></url-detailed-editor>`);
  }
  /**
   * @return {Promise<UrlDetailedEditorElement>}
   */
  async function emptyFixture() {
    return fixture(html`<url-detailed-editor></url-detailed-editor>`);
  }
  /**
   * @return {Promise<UrlDetailedEditorElement>}
   */
  async function readOnlyFixture(value) {
    return fixture(html`<url-detailed-editor
      .value="${value}"
      readonly></url-detailed-editor>`);
  }
  /**
   * @return {Promise<UrlDetailedEditorElement>}
   */
  async function valueFixture(value) {
    return fixture(html`<url-detailed-editor
      .value="${value}"></url-detailed-editor>`);
  }

  describe('Basics', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Model is computed', () => {
      const m = element.model;
      assert.typeOf(m, 'object', 'Model is an object');
      assert.equal(m.host, 'https://arc.com:1234', 'Host is computed');
      assert.equal(m.path, '/path/o ther/', 'Path is computed');
      assert.equal(m.anchor, '123', 'Ancor is computed');
      assert.lengthOf(element.queryParameters, 2, 'Search is computed');
    });

    it('__parser is set', () => {
      assert.typeOf(element.__parser, 'object');
    });

    it('Notifies change for host', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('#host'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'https://domain.com';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://domain.com/path/o ther/?a=b&c=d#123');
    });

    it('Notifies change for path', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('#path'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = '/other-path/';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/other-path/?a=b&c=d#123');
    });

    it('Notifies change for hash', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('#hash'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'hash-test';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=b&c=d#hash-test');
    });

    it('Notifies change for search param name', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-name'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-changed';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a-changed=b&c=d#123');
    });

    it('Notifies change for search param value', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-value';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=a-value&c=d#123');
    });

    it('Notifies change for search param value with variable', () => {
      const input = /** @type AnypointInput */ (element.shadowRoot.querySelector('.param-value'));
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      input.value = 'a-value${test}';
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?a=a-value${test}&c=d#123');
    });

    it('Notifies change for removing search param', () => {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      const button = element.shadowRoot.querySelector('.form-row > anypoint-icon-button');
      MockInteractions.tap(button);
      assert.isTrue(spy.called, 'event is dispatched');
      assert.equal(spy.args[0][0].detail.value, 'https://arc.com:1234/path/o ther/?c=d#123');
    });

    it('Changes model when value change', () => {
      element.value = 'http://arc.com/o%20ther?test=value';
      const m = element.model;
      assert.equal(m.host, 'http://arc.com', 'Host is computed');
      assert.equal(m.path, '/o%20ther', 'Path is computed');
      assert.equal(m.anchor, '', 'Ancor is computed');
      assert.lengthOf(element.queryParameters, 1, 'Search is computed');
    });

    it('Fires url-encode event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-encode', spy);
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('#encode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('Fires url-decode event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-decode', spy);
      const button = /** @type AnypointButton */ (element.shadowRoot.querySelector('#decode'));
      button.click();
      assert.isTrue(spy.calledOnce);
    });
  });

  describe('_valueChanged()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
      element._valueChanged('');
      assert.isFalse(spy.called);
    });

    it('Does nothing when _cancelModelComputation is set', () => {
      const spy = sinon.spy(element, '_computeModel');
      element._cancelModelComputation = true;
      element._valueChanged('');
      assert.isFalse(spy.called);
    });
  });

  describe('_computeModel()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets "model" to empty object when no value', () => {
      element._computeModel(undefined, undefined);
      assert.typeOf(element.model, 'object');
      assert.lengthOf(Object.keys(element.model), 0);
    });

    it('Sets "queryParameters" to empty array when no value', () => {
      element._computeModel(undefined, undefined);
      assert.typeOf(element.queryParameters, 'array');
      assert.lengthOf(element.queryParameters, 0);
    });

    it('Creates empty query model when missing', () => {
      element._computeModel('/test', undefined);
      // No error
    });

    it('Missing path does not causes errors', () => {
      element._computeModel('test', undefined);
      // No error
    });

    it('Sets model property', () => {
      element._computeModel('http://test.com/path?a=b&c=d#hash', undefined);
      assert.typeOf(element.model, 'object');
      assert.equal(element.model.host, 'http://test.com');
      assert.equal(element.model.path, '/path');
      assert.equal(element.model.anchor, 'hash');
    });

    it('Calls _computeSearchParams()', () => {
      const spy = sinon.spy(element, '_computeSearchParams');
      element._computeModel('http://test.com/path?a=b&c=d#hash', undefined);
      assert.isTrue(spy.called);
    });
  });

  describe('getHostValue()', () => {
    let parser;

    it('Build host value', () => {
      parser = new UrlParser('http://test.com/path');
      const result = getHostValue(parser);
      assert.equal(result, 'http://test.com');
    });

    it('Returns protocol only', () => {
      parser = new UrlParser('http://');
      const result = getHostValue(parser);
      assert.equal(result, 'http://');
    });
  });

  describe('_computeSearchParams()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    let parser;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Sets "queryParameters"', () => {
      parser = new UrlParser('/?a=b&c=d');
      element._computeSearchParams(parser, undefined);
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

  describe('findSearchParam()', () => {
    it('Finds a param by name', () => {
      const params = [['test', 'v']];
      const result = findSearchParam(params, 'test');
      assert.typeOf(result, 'array');
    });

    it('Returns undefined when no item in the array', () => {
      const params = [['test', 'v']];
      const result = findSearchParam(params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('_findModelParam()', () => {
    it('Finds item by name', () => {
      const params = [{
        name: 'test',
        enabled: true,
        value: '',
      }];
      const result = findModelParam(params, 'test');
      assert.typeOf(result, 'object');
    });

    it('Ignores disabled items', () => {
      const params = [{
        name: 'test',
        enabled: false,
        value: '',
      }];
      const result = findModelParam(params, 'test');
      assert.isUndefined(result);
    });

    it('Returns undefined when item not found', () => {
      const params = [{
        name: 'test',
        enabled: true,
        value: '',
      }];
      const result = findModelParam(params, 'other');
      assert.isUndefined(result);
    });
  });

  describe('addSearchParam()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.param-name');
      assert.equal(element.shadowRoot.activeElement, node);
    });
  });

  describe('_hostPaste()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
      element._hostPaste(e);
      assert.isTrue(spy.called);
    });
  });

  describe('_hostKeyDown()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Does nothing if code is not "Slash"', () => {
      // @ts-ignore
      element._hostKeyDown({
        code: 'Enter'
      });
      // No null error
    });

    it('Does nothing if keyCode is not "191"', () => {
      // @ts-ignore
      element._hostKeyDown({
        keyCode: 24
      });
      // No null error
    });

    it('Does nothing if keyCode is not "191"', () => {
      element.value = 'http://domain.com/path';
      // @ts-ignore
      element._hostKeyDown({
        keyCode: 191,
        preventDefault: () => {}
      });
      // no error
    });
  });

  describe('_getValidity()', () => {
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
    let element = /** @type UrlDetailedEditorElement */ (null);
    beforeEach(async () => {
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
