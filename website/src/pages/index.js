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
        <div className="row">
          <div className={`col col--6 ${styles.heroText}`}>
            <Heading as="h1" className="hero__title">
              Piksel: Indonesia's Digital Earth
            </Heading>
            <p className="hero__subtitle">
              Brings together{" "}
              <span className={styles.underlined}>satellite imagery</span> and{" "}
              <span className={styles.underlined}>cloud computing</span>{" "}
              technology to enable digital earth observation across the{" "}
              <span className={styles.underlined}>Indonesia</span> region
            </p>
          </div>

          <div className="col col--6">
            <div className={styles.heroImageContainer}>
              <img
                src="/img/stack_hero.png"
                alt="Piksel Hero Image"
                className={styles.heroImage}
              />
            </div>
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
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
