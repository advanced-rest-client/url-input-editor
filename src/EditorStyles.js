import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-input,
.editor {
  flex: 1;
  width: auto;
}

anypoint-autocomplete {
  bottom: 0;
}

anypoint-item > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-button {
  margin-top: 20px;
  transform: rotateZ(0deg);
  transition: transform 0.3s ease-in-out;
}

.toggle-button.opened {
  transform: rotateZ(-180deg);
}

iron-collapse.sized {
  min-height: 48px;
}

[hidden] {
  display: none !important;
}

.container {
  display: flex;
  flex-direction: row;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
