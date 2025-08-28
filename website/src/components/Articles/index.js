import React from "react";
import Carousel from "../Carousel";
import styles from "./styles.module.css";

const Articles = ({ articles = [], title = "Featured Articles" }) => {
  // Sample articles data if none provided
  const defaultArticles = [
    {
      id: 1,
      title: "Getting Started with Docusaurus",
      description:
        "Learn how to build amazing documentation sites with Docusaurus v3",
      image:
        "https://images.unsplash.com/photo-1756151224665-eba765e8c3b5?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
      link: "/docs/getting-started",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Advanced Configuration",
      description:
        "Dive deep into Docusaurus configuration and customization options",
      image:
        "https://images.unsplash.com/photo-1754922493956-364a7623a016?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8",
      link: "/docs/advanced-config",
      date: "2024-01-20",
    },
    {
      id: 3,
      title: "Plugin Development",
      description:
        "Create custom plugins to extend your Docusaurus site functionality",
      image:
        "https://images.unsplash.com/photo-1755257422437-5248f69bf52e?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8",
      link: "/docs/plugin-development",
      date: "2024-01-25",
    },
    {
      id: 4,
      title: "Deployment Guide",
      description: "Deploy your Docusaurus site to various hosting platforms",
      image:
        "https://images.unsplash.com/photo-1755429518361-1d6060edcf3c?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMXx8fGVufDB8fHx8fA%3D%3D",
      link: "/docs/deployment",
      date: "2024-02-01",
    },
    {
      id: 5,
      title: "SEO Optimization",
      description: "Optimize your documentation site for search engines",
      image:
        "https://images.unsplash.com/photo-1755603461859-9da81ff3afea?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D",
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
