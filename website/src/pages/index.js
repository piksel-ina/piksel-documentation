import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <div className={`${styles.heroText}`}>
          <Heading as="h1" className="hero__title text--uppercase">
            Indonesia's Digital Earth
          </Heading>
          <p className="hero__subtitle">
            Piksel brings together satellite imagery and cloud computing
            technology to enable digital earth observation across the Indonesia
            region
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Read How
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <div className={styles.headerWrapper}>
        <HomepageHeader />
      </div>
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
