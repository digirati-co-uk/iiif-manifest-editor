import { PreviewView } from "../../components/organisms/PreviewView";
import { Shell } from "../../apps/Shell/Shell";
import styled, { ThemeProvider } from "styled-components";

import data from "../../../config.json";
import { Theme } from "../styles/theme";

const HomepageStyles = styled.div`
   {
    padding: 0 1rem;
  }
`;

const props = {
  config: data,
  theme: Theme,
};

const Preview = () => {
  return (
    <div className="container">
      <ThemeProvider theme={props.theme}>
        <HomepageStyles />
        <Shell previewConfig={props.config.preview} newTemplates={"[]"} />
        <PreviewView />
      </ThemeProvider>
    </div>
  );
};

export default Preview;
