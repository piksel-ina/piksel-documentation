import React from "react";
import { Map, FileCode2, Unplug, GitBranch } from "lucide-react";
import Translate from "@docusaurus/Translate";
import { translate } from "@docusaurus/Translate";
import GlassCard from "../GlassCard";
import styles from "./style.module.css";

const OurServices = () => {
  const services = [
    {
      id: 1,
      icon: Map,
      title: translate({
        id: "ourServices.service1.title",
        message: "Piksel Map",
        description: "Title for interactive mapping service",
      }),
      description: translate({
        id: "ourServices.service1.description",
        message:
          "Explore and visualize geospatial datasets through our interactive web platform. Access satellite imagery, environmental data, and spatial analytics with intuitive mapping tools",
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
      icon: FileCode2,
      title: translate({
        id: "ourServices.service2.title",
        message: "Piksel Sandbox",
        description: "Title for data analytics service",
      }),
      description: translate({
        id: "ourServices.service2.description",
        message:
          "Experiment, learn, and prototype in our cloud-based Jupyter environment with pre-configured geospatial libraries, sample datasets, and collaborative features for spatial data analysis.",
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
      icon: Unplug,
      title: translate({
        id: "ourServices.service3.title",
        message: "Piksel Data API",
        description: "Title for API integration service",
      }),
      description: translate({
        id: "ourServices.service3.description",
        message:
          "Access comprehensive geospatial datasets through our robust API infrastructure. Retrieve satellite imagery, vector data, and processed analytics via RESTful endpoints.",
        description: "Description for API integration service",
      }),
      buttonText: translate({
        id: "ourServices.service3.button",
        message: "Explore APIs",
        description: "Button text for API integration service",
      }),
    },
    {
      id: 4,
      icon: GitBranch,
      title: translate({
        id: "ourServices.service4.title",
        message: "Piksel Workflows",
        description: "Title for API integration service",
      }),
      description: translate({
        id: "ourServices.service4.description",
        message:
          "Automate large-scale geospatial data processing with Argo Workflows. Execute complex analysis pipelines, satellite image processing, and spatial computations on scalable cloud infrastructure.",
        description: "Description for API integration service",
      }),
      buttonText: translate({
        id: "ourServices.service4.button",
        message: "Explore APIs",
        description: "Button text for API integration service",
      }),
    },
  ];

  return (
    <div className={`${styles.container} margin-top--xl padding-vert--lg`}>
      <div className={styles.background}></div>

      <div className="container">
        <div className="section__header">
          <div className="text--center">
            <h2 className="section__title section__title--white ">
              {translate({
                id: "ourServices.title",
                message: "Our Services",
                description: "The title of the our services section",
              })}
            </h2>
            <p className="section__subtitle section__subtitle--white-less">
              {translate({
                id: "ourServices.subtitle",
                message: "Making geospatial data accessible for everyone",
                description: "The subtitle of the our services section",
              })}
            </p>
          </div>
        </div>
        <div className="row margin-top--md margin-bottom--lg">
          {services.map((service) => (
            <div
              key={service.id}
              className={`col col--3 margin-bottom--md ${styles.ourServices_content}`}
            >
              <div className={styles.cardWrapper}>
                <GlassCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  buttonText={service.buttonText}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurServices;
