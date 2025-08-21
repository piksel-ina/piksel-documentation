import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import Translate, { translate } from "@docusaurus/Translate";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <div className={`${styles.heroText}`}>
          <Heading as="h1" className="hero__title text--uppercase">
            {translate({
              id: "homepage.hero.title",
              message: "Indonesia's Digital Earth",
              description: "The main title on the homepage hero section",
            })}
          </Heading>
          <p className="hero__subtitle">
            {translate({
              id: "homepage.hero.subtitle",
              message:
                "Piksel brings together satellite imagery and cloud computing technology to enable digital earth observation across the Indonesia region",
              description: "The subtitle text on the homepage hero section",
            })}
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              {translate({
                id: "homepage.hero.button",
                message: "Read How",
                description: "The button text to read documentation",
              })}
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
      title={translate({
        id: "homepage.meta.title",
        message: siteConfig.title,
        description: "Site title for the homepage",
      })}
      description={translate({
        id: "homepage.meta.description",
        message: "Description will go into a meta tag in <head />",
        description: "Meta description for the homepage",
      })}
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
