import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./style.module.css";

const Articles = ({ articles = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

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

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, articlesData.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Calculate the transform value
  const getTransformValue = () => {
    const percentage = (currentIndex * 100) / itemsPerView;
    return `translateX(-${percentage}%)`;
  };

  return (
    <div className={styles.articlesCarousel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Latest Articles</h2>

        <div className={styles.navigationButtons}>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={styles.navButton}
            aria-label="Previous articles"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={styles.navButton}
            aria-label="Next articles"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: getTransformValue(),
          }}
        >
          {articlesData.map((article) => (
            <div key={article.id} className={styles.carouselItem}>
              <div
                className={styles.card}
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
                  <div className={styles.cardImage}>
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{article.title}</h3>

                  <p className={styles.cardDescription}>
                    {article.description}
                  </p>

                  {article.date && (
                    <div className={styles.cardDate}>
                      {new Date(article.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {maxIndex > 0 && (
        <div className={styles.pagination}>
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${styles.paginationDot} ${
                currentIndex === index ? styles.paginationDotActive : ""
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
