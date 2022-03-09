import { NextPage } from "next";
import { PreviewView } from "../components/organisms/PreviewView";
import { Shell } from "../components/apps/Shell/Shell";
import { ThemeProvider } from "styled-components";

import data from "../config.json";
import { Theme } from "../styles/theme";

import styles from "../styles/Home.module.css";

export const getStaticProps = async () => {
  return {
    props: {
      config: data,
      theme: Theme,
    },
  };
};
const Preview: NextPage = (props: any) => {
  return (
    <div className={styles.container}>
      <ThemeProvider theme={props.theme}>
        <Shell previewConfig={props.config.preview} />

        {/* Whilst we will have our own configuarable preview options fed by JSON
      there will also be the option to pass your persisted URL and open a link directly to
      for example an external Universal Viewer */}
        <PreviewView />
      </ThemeProvider>
    </div>
  );
};

export default Preview;
