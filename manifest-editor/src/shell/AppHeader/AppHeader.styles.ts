import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  padding: 0.5em;
  height: 3em;
  align-items: center;
`;

export const IconButton = styled.button`
  height: 1.75em;
  width: 1.75em;
  background: #e9e9e9;
  border-radius: 3px;
  display: flex;
  text-align: center;
  align-items: center;
  font-size: 1.1em;
  border: none;
  justify-content: center;

  &:focus {
    background: #ec5681;
    color: #fff;
    svg {
      fill: #fff;
    }
  }
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const Logo = styled.div`
  color: #6e6e6e;
  display: flex;
  align-items: center;
  margin-left: 1em;
  font-weight: bold;
  text-rendering: geometricPrecision;
  letter-spacing: -0.5px;
  user-select: none;
  cursor: pointer;
`;

export const ProjectPreview = styled.div`
  margin: 0 auto;
  padding: 3px;
  background: #f4f4f4;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  width: 26em;
  display: flex;
  flex-direction: row;
`;

export const Draft = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  padding: 0.28em;
  padding-left: 0.5em;
  align-items: center;
  overflow: hidden;
`;

export const DraftsText = styled.div`
  color: #828282;
  padding-right: 1em;
`;

export const DraftTitle = styled.div`
  color: #333;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const ContextButton = styled.button`
  background: #e7fff4;
  border: 1px solid #c5e3cd;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  color: #666666;
  padding: 0.35em 0.7em;
  letter-spacing: -0.42px;
`;