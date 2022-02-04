import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { PreviewView } from "../components/organisms/PreviewView";

const Preview: NextPage = () => {
  return (
    <div className={styles.container}>
      <PreviewView />
    </div>
  );
};

export default Preview;
