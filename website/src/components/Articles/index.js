import React from "react";
import Translate, { translate } from "@docusaurus/Translate";
import Carousel from "../Carousel";
import styles from "./styles.module.css";

const Articles = ({ articles = [], title }) => {
  const defaultArticles = [
    {
      id: 1,
      title: translate({
        id: "articles.defaultArticles.satelliteImageryBasics.title",
        message: "Understanding Satellite Imagery for Indonesia",
      }),
      description: translate({
        id: "articles.defaultArticles.satelliteImageryBasics.description",
        message:
          "Learn the fundamentals of satellite imagery analysis and how it applies to Indonesian geographical features and environmental monitoring.",
      }),
      image:
        "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2F0ZWxsaXRlJTIwaW1hZ2VyeXxlbnwwfHwwfHx8MA%3D%3D",
      link: "/docs/satellite-imagery-basics",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: translate({
        id: "articles.defaultArticles.cloudComputing.title",
        message: "Cloud Computing for Geospatial Data",
      }),
      description: translate({
        id: "articles.defaultArticles.cloudComputing.description",
        message:
          "Discover how cloud computing revolutionizes geospatial data processing and analysis for large-scale earth observation projects.",
      }),
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xvdWQlMjBjb21wdXRpbmd8ZW58MHx8MHx8fDA%3D",
      link: "/docs/cloud-computing-geospatial",
      date: "2024-01-20",
    },
    {
      id: 3,
      title: translate({
        id: "articles.defaultArticles.environmentalMonitoring.title",
        message: "Environmental Monitoring with Piksel",
      }),
      description: translate({
        id: "articles.defaultArticles.environmentalMonitoring.description",
        message:
          "Explore how Piksel's digital earth technology helps monitor deforestation, urban growth, and climate change impacts across Indonesia.",
      }),
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9yZXN0JTIwbW9uaXRvcmluZ3xlbnwwfHwwfHx8MA%3D%3D",
      link: "/docs/environmental-monitoring",
      date: "2024-01-25",
    },
    {
      id: 4,
      title: translate({
        id: "articles.defaultArticles.apiIntegration.title",
        message: "Integrating Piksel Data API",
      }),
      description: translate({
        id: "articles.defaultArticles.apiIntegration.description",
        message:
          "Step-by-step guide to integrate Piksel's geospatial data API into your applications and workflows.",
      }),
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBpJTIwaW50ZWdyYXRpb258ZW58MHx8MHx8fDA%3D",
      link: "/docs/api-integration",
      date: "2024-02-01",
    },
    {
      id: 5,
      title: translate({
        id: "articles.defaultArticles.workflowAutomation.title",
        message: "Automating Geospatial Workflows",
      }),
      description: translate({
        id: "articles.defaultArticles.workflowAutomation.description",
        message:
          "Learn how to automate large-scale geospatial data processing using Piksel Workflows and Argo technology.",
      }),
      image:
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXV0b21hdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      link: "/docs/workflow-automation",
      date: "2024-02-05",
    },
  ];

  const articlesData = articles.length > 0 ? articles : defaultArticles;

  const defaultTitle = translate({
    id: "articles.title",
    message: "Featured Articles",
  });

  const displayTitle = title || defaultTitle;

  const renderArticle = (article) => (
    <div
      className={styles.articleCard}
      onClick={() => (window.location.href = article.link)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          window.location.href = article.link;
        }
      }}
    >
      {article.image && (
        <div className={styles.articleImage}>
          <img src={article.image} alt={article.title} loading="lazy" />
        </div>
      )}

      <div className={styles.articleBody}>
        <h2 className={styles.articleTitle}>{article.title}</h2>

        <p className={styles.articleDescription}>{article.description}</p>

        {article.date && (
          <div className={styles.articleDate}>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.articlesWrapper}>
      <Carousel
        items={articlesData}
        title={displayTitle}
        renderItem={renderArticle}
        itemsPerView={{ desktop: 3, tablet: 2, mobile: 1 }}
        showNavigation={true}
        showPagination={true}
      />
    </div>
  );
};

export default Articles;
