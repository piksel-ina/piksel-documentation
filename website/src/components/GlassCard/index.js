import React from "react";
import { ArrowRight } from "lucide-react";
import styles from "./style.module.css";

const GlassCard = ({
  icon: Icon,
  title,
  description,
  buttonText = "Start Exploring",
  buttonTextSecondary = "Learn More",
}) => {
  return (
    <div className={styles.glassCard}>
      <div className={styles.glassCard_content}>
        <div className={styles.glassCard_icon}>
          <Icon size={84} strokeWidth={0.5} />
        </div>
        <h3 className={styles.glassCard_title}>{title}</h3>

        <p className={styles.glassCard_description}>{description}</p>

        {/* CTA Button */}
        <div className={styles.glassCard_cta}>
          <button
            className={`button button--outline ${styles.glassCard_ctaPrimary}`}
          >
            {buttonText}
          </button>
          <button
            className={`button button--link ${styles.glassCard_ctaSecondary}`}
          >
            {buttonTextSecondary}
            <ArrowRight
              size={15}
              strokeWidth={1.3}
              className={styles.glassCard_ctaIcon}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassCard;
