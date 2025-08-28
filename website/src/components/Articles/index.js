import React from "react";
import Carousel from "../Carousel";
import styles from "./styles.module.css";

const Articles = ({ articles = [], title = "Latest Articles" }) => {
  // Sample articles data if none provided
  const defaultArticles = [
    {
      id: 1,
      title: "Getting Started with Docusaurus",
      description:
        "Learn how to build amazing documentation sites with Docusaurus v3",
      image: "https://via.placeholder.com/300x200/2e8555/ffffff?text=Article+1",
      link: "/docs/getting-started",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Advanced Configuration",
      description:
        "Dive deep into Docusaurus configuration and customization options",
      image: "https://via.placeholder.com/300x200/1976d2/ffffff?text=Article+2",
      link: "/docs/advanced-config",
      date: "2024-01-20",
    },
    {
      id: 3,
      title: "Plugin Development",
      description:
        "Create custom plugins to extend your Docusaurus site functionality",
      image: "https://via.placeholder.com/300x200/7c4dff/ffffff?text=Article+3",
      link: "/docs/plugin-development",
      date: "2024-01-25",
    },
    {
      id: 4,
      title: "Deployment Guide",
      description: "Deploy your Docusaurus site to various hosting platforms",
      image: "https://via.placeholder.com/300x200/f57c00/ffffff?text=Article+4",
      link: "/docs/deployment",
      date: "2024-02-01",
    },
    {
      id: 5,
      title: "SEO Optimization",
      description: "Optimize your documentation site for search engines",
      image: "https://via.placeholder.com/300x200/388e3c/ffffff?text=Article+5",
      link: "/docs/seo",
      date: "2024-02-05",
    },
  ];

  const articlesData = articles.length > 0 ? articles : defaultArticles;

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
        <h3 className={styles.articleTitle}>{article.title}</h3>

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
        title={title}
        renderItem={renderArticle}
        itemsPerView={{ desktop: 3, tablet: 2, mobile: 1 }}
        showNavigation={true}
        showPagination={true}
      />
    </div>
  );
};

export default Articles;
