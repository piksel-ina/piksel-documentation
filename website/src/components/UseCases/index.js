import React from "react";
import ModernCard from "@site/src/components/ModernCard/";
import styles from "./style.module.css";

const useCaseData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    title: "Environment",
    description:
      "We provide trusted imagery and data about Australian landscapes to researchers and land managers, helping them navigate environmental complexity.",
    link: "/environment",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1755001244508-58fcc65797ec?q=80&w=3987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Technology",
    description:
      "Cutting-edge solutions for modern challenges in data management and analysis, powered by innovative research and development.",
    link: "/technology",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    title: "Research",
    description:
      "Supporting scientific research with reliable data and innovative tools that enable breakthrough discoveries and insights.",
    link: "/research",
  },
];

/**
 * Main UseCase component that renders all cards
 */
export default function UseCase() {
  return (
    <section className={styles.useCaseSection}>
      <div className="container">
        {/* Section Header */}
        <div className="section__header">
          <div className="text--center margin-bottom--lg">
            <h2 className="section__title">Our Use Cases</h2>
            <p className="section__subtitle">
              Discover how our solutions make a difference across various
              domains
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="row">
          {useCaseData.map((useCase) => (
            <div key={useCase.id} className="col col--4 margin-bottom--lg">
              <ModernCard
                image={useCase.image}
                title={useCase.title}
                description={useCase.description}
                link={useCase.link}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
