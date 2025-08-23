import React from "react";
import { MapPin, Database, BarChart3 } from "lucide-react";
import Translate from "@docusaurus/Translate";
import { translate } from "@docusaurus/Translate";
import GlassCard from "../GlassCard";
import styles from "./style.module.css";

const OurServices = () => {
  const services = [
    {
      id: 1,
      icon: MapPin,
      badgeText: translate({
        id: "ourServices.service1.badge",
        message: "Interactive Mapping",
        description: "Badge text for interactive mapping service",
      }),
      title: translate({
        id: "ourServices.service1.title",
        message: "Explore imagery on a",
        description: "Title for interactive mapping service",
      }),
      highlightText: translate({
        id: "ourServices.service1.highlight",
        message: "digital map",
        description: "Highlighted text for interactive mapping service",
      }),
      subtitle: translate({
        id: "ourServices.service1.subtitle",
        message: "See more than 30 years of landscape change",
        description: "Subtitle for interactive mapping service",
      }),
      description: translate({
        id: "ourServices.service1.description",
        message:
          "For decades satellites have been capturing imagery of Indonesian landscapes. Piksel corrects, curates, and makes this image data freely available on our interactive digital earth platform.",
        description: "Description for interactive mapping service",
      }),
      buttonText: translate({
        id: "ourServices.service1.button",
        message: "Start Exploring",
        description: "Button text for interactive mapping service",
      }),
    },
    {
      id: 2,
      icon: BarChart3,
      badgeText: translate({
        id: "ourServices.service2.badge",
        message: "Data Analytics",
        description: "Badge text for data analytics service",
      }),
      title: translate({
        id: "ourServices.service2.title",
        message: "Transform data into",
        description: "Title for data analytics service",
      }),
      highlightText: translate({
        id: "ourServices.service2.highlight",
        message: "actionable insights",
        description: "Highlighted text for data analytics service",
      }),
      subtitle: translate({
        id: "ourServices.service2.subtitle",
        message: "Advanced analytics for better decision making",
        description: "Subtitle for data analytics service",
      }),
      description: translate({
        id: "ourServices.service2.description",
        message:
          "Our comprehensive analytics platform processes vast amounts of geospatial data to provide meaningful insights. From trend analysis to predictive modeling, we help organizations make data-driven decisions.",
        description: "Description for data analytics service",
      }),
      buttonText: translate({
        id: "ourServices.service2.button",
        message: "View Analytics",
        description: "Button text for data analytics service",
      }),
    },
    {
      id: 3,
      icon: Database,
      badgeText: translate({
        id: "ourServices.service3.badge",
        message: "API Integration",
        description: "Badge text for API integration service",
      }),
      title: translate({
        id: "ourServices.service3.title",
        message: "Access data through",
        description: "Title for API integration service",
      }),
      highlightText: translate({
        id: "ourServices.service3.highlight",
        message: "powerful APIs",
        description: "Highlighted text for API integration service",
      }),
      subtitle: translate({
        id: "ourServices.service3.subtitle",
        message: "Seamless integration for developers",
        description: "Subtitle for API integration service",
      }),
      description: translate({
        id: "ourServices.service3.description",
        message:
          "Build applications with our robust API infrastructure. Access real-time satellite data, historical imagery, and analytical tools through our developer-friendly REST APIs with comprehensive documentation.",
        description: "Description for API integration service",
      }),
      buttonText: translate({
        id: "ourServices.service3.button",
        message: "Explore APIs",
        description: "Button text for API integration service",
      }),
    },
  ];

  return (
    <div className={`${styles.container} margin-top--xl padding-vert--xl`}>
      <div className={styles.background}>
        <div className={`${styles.light} ${styles.light1}`}></div>
        <div className={`${styles.light} ${styles.light2}`}></div>
        <div className={`${styles.light} ${styles.light3}`}></div>
        <div className={`${styles.light} ${styles.light4}`}></div>
        <div className={`${styles.light} ${styles.light5}`}></div>
        <div className={`${styles.light} ${styles.light6}`}></div>
        <div className={`${styles.light} ${styles.light7}`}></div>
        <div className={`${styles.light} ${styles.light8}`}></div>
        <div className={`${styles.light} ${styles.light9}`}></div>
      </div>

      <div className="container">
        <div className="row">
          {services.map((service) => (
            <div key={service.id} className="col col--6">
              <GlassCard
                icon={service.icon}
                badgeText={service.badgeText}
                title={service.title}
                highlightText={service.highlightText}
                subtitle={service.subtitle}
                description={service.description}
                buttonText={service.buttonText}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurServices;
