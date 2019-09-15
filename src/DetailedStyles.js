import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.host-input {
  flex: 1;
}

.path-input {
  flex: 1;
}

.anchor-input {
  flex: 1;
}

.form-row {
  display: flex;
  align-items: row;
  align-items: center;
  flex: 1;
}

.row-inputs {
  display: flex;
  align-items: row;
  flex: 1;
}

anypoint-input {
  width: auto;
}

.narrow-line {
  display: flex;
  align-items: row;
  align-items: center;
  flex: 1;
  min-width: 120px;
  width: 20%;
  margin-right: 12px;
}

:host([narrow]) .form-row {
  margin-bottom: 20px;
}

:host([narrow]) .row-inputs {
  align-items: column;
}

:host([narrow]) .narrow-line {
  width: 100%;
  margin-right: 0;
}

.param-name,
.param-value {
  flex: 1;
}

.params-list {
  margin: 12px 0;
}

.query-title {
  font-size: var(--arc-font-caption-font-size);
  font-weight: var(--arc-font-caption-font-weight);
  line-height: var(--arc-font-caption-line-height);
  letter-spacing: var(--arc-font-caption-letter-spacing);
  color: var(--url-input-editor-query-title-color, #737373);
  margin-left: 12px;
}

.add-param {
  margin-top: 12px;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
