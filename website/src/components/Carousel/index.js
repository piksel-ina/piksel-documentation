import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./styles.module.css";

const Carousel = ({
  items = [],
  title,
  renderItem,
  itemsPerView = { desktop: 3, tablet: 2, mobile: 1 },
  showNavigation = true,
  showPagination = true,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItemsPerView, setCurrentItemsPerView] = useState(
    itemsPerView.desktop
  );

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (window.innerWidth < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else {
        setCurrentItemsPerView(itemsPerView.desktop);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerView]);

  const maxIndex = Math.max(0, items.length - currentItemsPerView);

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
    const percentage = (currentIndex * 100) / currentItemsPerView;
    return `translateX(-${percentage}%)`;
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className={`${styles.carousel} ${className}`}>
      {(title || showNavigation) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}

          {showNavigation && (
            <div className={styles.navigationButtons}>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={styles.navButton}
                aria-label="Previous items"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className={styles.navButton}
                aria-label="Next items"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.carouselContainer}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: getTransformValue(),
          }}
        >
          {items.map((item, index) => (
            <div key={item.id || index} className={styles.carouselItem}>
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <div>{JSON.stringify(item)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {showPagination && maxIndex > 0 && (
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

export default Carousel;
