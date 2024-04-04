import styled, { css } from "styled-components";

export const AudioPlayerContainer = styled.div`
  background: #ededed; // Not in variable.
  display: flex;
  padding: 0.5em;
  align-items: center;
`;

const BaseButton = styled.button`
  cursor: pointer;
  padding: 0.75em 1.5em;
  font-size: 0.938em;
  background: none;
  color: inherit;
  border: none;
  text-decoration: none;
  display: inline-block;
  vertical-align: top;
  white-space: nowrap;
`;

export const PlayButton = styled(BaseButton)`
  width: 2em;
  height: 2em;
  overflow: hidden;
  font-size: 1.1em;
  background: #fff;
  border-radius: 3px;
  padding: 0;
  margin: 0;
  color: #000; // Not in colours

  &:disabled {
    color: #999;
  }
`;

export const TimeDisplay = styled.div`
  margin: 0 1em;
  font-size: 0.85em;
  color: #000;
`;

export const ProgressContainer = styled.div`
  flex: 1 1 0px;
  height: 6px;
  display: flex;
  position: relative;
  padding: 15px 0;
`;

export const ProgressCurrent = styled.div`
  background: #d85680;
  height: 6px;
  pointer-events: none;
  position: absolute;
  top: 13px;
  left: 0;
  border-radius: 3px;
  transition: width 200ms;
`;

export const ProgressBackground = styled.div`
  position: absolute;
  top: 13px;
  left: 0;
  height: 6px;
  border-radius: 3px;
  width: 100%;
  pointer-events: none;
  background: #fff;
`;

export const SoundButton = styled(BaseButton)`
  width: 2em;
  height: 2em;
  overflow: hidden;
  font-size: 1.1em;
  background: transparent;
  border-radius: 3px;
  padding: 0;
  margin: 0;
`;

export const SoundContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const VolumeContainer = styled.div<{ $isOpen: boolean }>`
  width: 0;
  overflow: hidden;
  transition: width 500ms;
  color: #4a473f; // Not in colours

  ${(props) =>
    props.$isOpen &&
    css`
      width: 150px;
    `}
`;

export const VolumeSlider = styled.input.attrs({ type: "range" })`
  width: 120px;
  margin: 0 15px;
`;
