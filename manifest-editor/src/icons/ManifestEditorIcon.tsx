import styled from "styled-components";

const StyleWrapper = styled.div`
  height: 3em;
  margin-left: 1em;
  text-rendering: geometricPrecision;
  letter-spacing: -0.5px;
  cursor: pointer;
  .cls-1 {
    font-size: 1em;
    font-family: Poppins-SemiBold, Poppins;
    font-weight: 600;
    letter-spacing: -0.03em;
  }
  .cls-2 {
    fill: #e94581;
  }
  .cls-3 {
    fill: #c63e75;
  }
`;

export const ManifestEditorIcon: React.FC = () => (
  <StyleWrapper>
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 700 550"
    >
      <text className="cls-1" transform="translate(44.87 20.29)">
        IIIF Manifest Editor
      </text>
      <rect
        className="cls-2"
        x="3.91"
        y="3.91"
        width="18.87"
        height="18.87"
        transform="translate(-5.53 13.35) rotate(-45)"
      />
      <rect
        className="cls-2"
        x="16.04"
        y="3.91"
        width="18.87"
        height="18.87"
        transform="translate(-1.97 21.93) rotate(-45)"
      />
      <rect
        className="cls-3"
        x="14.24"
        y="8.18"
        width="10.34"
        height="10.34"
        transform="translate(-3.75 17.64) rotate(-45)"
      />
    </svg>
  </StyleWrapper>
);
