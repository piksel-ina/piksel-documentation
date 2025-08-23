import React from "react";
import { ArrowRight } from "lucide-react";
import styles from "./style.module.css";

const GlassCard = ({
  icon: Icon,
  badgeText,
  title,
  highlightText,
  subtitle,
  description,
  buttonText = "Start Exploring",
}) => {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardContent}>
        {/* Header Badge */}
        <div className={styles.headerBadge}>
          <div className={styles.badgeIcon}>
            <Icon size={24} />
          </div>
          <span className={styles.badgeText}>{badgeText}</span>
        </div>

        {/* Main Heading */}
        <h1 className={styles.mainHeading}>
          {title}
          <span className={styles.gradientText}> {highlightText}</span>
        </h1>

        {/* Subheading */}
        <h2 className={styles.subHeading}>{subtitle}</h2>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* CTA Button */}
        <div className={styles.ctaContainer}>
          <button className={styles.ctaButton}>
            {buttonText}
            <ArrowRight size={20} className={styles.ctaIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassCard;
