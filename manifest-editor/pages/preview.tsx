import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { PreviewView } from "../components/organisms/PreviewView";

const Preview: NextPage = () => {
  return (
    <div className={styles.container}>
      {/* Whilst we will have our own configuarable preview options fed by JSON
      there will also be the option to pass your persisted URL and open a link directly to
      for example an external Universal Viewer */}
      <PreviewView />
    </div>
  );
};

export default Preview;
