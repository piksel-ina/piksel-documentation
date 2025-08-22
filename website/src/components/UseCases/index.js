import React from "react";
import ModernCard from "@site/src/components/ModernCard/";
import styles from "./style.module.css";
import { translate } from "@docusaurus/Translate";

// Use case data with stable identifiers
const USE_CASES = [
  {
    id: "usecase1",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    link: "/environment",
  },
  {
    id: "usecase2",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/technology",
  },
  {
    id: "usecase3",
    image:
      "https://plus.unsplash.com/premium_photo-1666256629413-ea053d34ff36?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/research",
  },
];

// Helper function to get translations for each use case
function getUseCaseTranslations(useCaseId) {
  switch (useCaseId) {
    case "usecase1":
      return {
        title: translate({
          id: "useCase.card.environment.title",
          message: "Environment",
          description: "Title for environment use case card",
        }),
        description: translate({
          id: "useCase.card.environment.description",
          message:
            "We provide trusted imagery and data about Indonesian landscapes to researchers and land managers, helping them navigate environmental complexity.",
          description: "Description for environment use case card",
        }),
      };
    case "usecase2":
      return {
        title: translate({
          id: "useCase.card.technology.title",
          message: "Technology",
          description: "Title for technology use case card",
        }),
        description: translate({
          id: "useCase.card.technology.description",
          message:
            "Cutting-edge solutions for modern challenges in data management and analysis, powered by innovative research and development.",
          description: "Description for technology use case card",
        }),
      };
    case "usecase3":
      return {
        title: translate({
          id: "useCase.card.research.title",
          message: "Research",
          description: "Title for research use case card",
        }),
        description: translate({
          id: "useCase.card.research.description",
          message:
            "Supporting scientific research with reliable data and innovative tools that enable breakthrough discoveries and insights.",
          description: "Description for research use case card",
        }),
      };
    default:
      return { title: "", description: "" };
  }
}

export default function UseCase() {
  return (
    <section className={styles.useCaseSection}>
      <div className="container">
        <div className="section__header">
          <div className="text--center margin-bottom--lg">
            <h2 className="section__title">
              {translate({
                id: "useCase.title",
                message: "Our Use Cases",
                description: "The title of the use cases section",
              })}
            </h2>
            <p className="section__subtitle">
              {translate({
                id: "useCase.subtitle",
                message:
                  "Discover how our solutions make a difference across various domains",
                description: "The subtitle of the use cases section",
              })}
            </p>
          </div>
        </div>

        <div className="row">
          {USE_CASES.map((useCase) => {
            const translations = getUseCaseTranslations(useCase.id);

            return (
              <div key={useCase.id} className="col col--4 margin-bottom--lg">
                <ModernCard
                  image={useCase.image}
                  title={translations.title}
                  description={translations.description}
                  link={useCase.link}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
