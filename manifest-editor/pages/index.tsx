import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <div>Welcome to the mainfest editor</div>
        </h1>
      </main>

      {/* <footer className={styles.footer}>
      </footer> */}
    </div>
  )
}

export default Home
