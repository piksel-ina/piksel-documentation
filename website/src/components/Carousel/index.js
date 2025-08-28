import React, { useState, useEffect, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Touch handling state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth < 1024;

      setIsMobile(mobile);

      if (mobile) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (tablet) {
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

  // Touch handlers for swipe functionality
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Only allow swipes within boundaries
    if (isLeftSwipe && currentIndex < maxIndex) {
      // Swipe left (next) - only if not at the end
      setCurrentIndex(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      // Swipe right (previous) - only if not at the start
      setCurrentIndex(currentIndex - 1);
    }
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
      {/* Header with title and desktop navigation */}
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}

        {showNavigation && !isMobile && (
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

      {/* Carousel container with side navigation for mobile */}
      <div className={styles.carouselWrapper}>
        {/* Left navigation button for mobile */}
        {showNavigation && isMobile && (
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            aria-label="Previous items"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          className={styles.carouselContainer}
          ref={carouselRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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

        {/* Right navigation button for mobile */}
        {showNavigation && isMobile && (
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`${styles.navButton} ${styles.navButtonRight}`}
            aria-label="Next items"
          >
            <ChevronRight size={20} />
          </button>
        )}
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
