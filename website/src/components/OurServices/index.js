import React from "react";
import { ArrowRight, MapPin, Layers, Blocks, MonitorUp } from "lucide-react";
import styles from "./style.module.css";

const OurServices = () => {
  const steps = [
    { step: 1, text: "Access Piksel Maps", icon: MapPin },
    { step: 2, text: "Explore map data", icon: Layers },
    { step: 3, text: "Experiment with Piksel Sandbox", icon: Blocks },
    { step: 4, text: "Add our products to GIS tools", icon: MonitorUp },
  ];

  const stats = [
    { label: "Satellite Images", value: "2.3M+", color: "blue" },
    { label: "Years of Data", value: "30+", color: "green" },
    { label: "Coverage Area", value: "100%", color: "purple" },
  ];

  const yearLabels = ["1988", "1994", "2000", "2006", "2012", "2019"];

  return (
    <div className={`${styles.container} margin-top--xl padding-vert--xl `}>
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

      {/* Floating Background Elements */}
      <div className={styles.floatingElement1}></div>
      <div className={styles.floatingElement2}></div>
      <div className={styles.floatingElement3}></div>

      {/* Main Content */}
      <div className={`${styles.contentWrapper}`}>
        <div className={styles.gridContainer}>
          {/* Left Content - Glassmorphism Card */}
          <div className={styles.contentCard}>
            <div className={styles.cardContent}>
              {/* Header Badge */}
              <div className={styles.headerBadge}>
                <div className={styles.badgeIcon}>
                  <MapPin size={24} />
                </div>
                <span className={styles.badgeText}>Interactive Mapping</span>
              </div>

              {/* Main Heading */}
              <h1 className={styles.mainHeading}>
                Explore imagery on a
                <span className={styles.gradientText}> digital map</span>
              </h1>

              {/* Subheading */}
              <h2 className={styles.subHeading}>
                See more than 30 years of landscape change
              </h2>

              {/* Description */}
              <p className={styles.description}>
                For decades satellites have been capturing imagery of Indonesian
                landscapes. Piksel corrects, curates, and makes this image data
                freely available on our interactive digital earth platform.
              </p>

              {/* CTA Button */}
              <div className={styles.ctaContainer}>
                <button className={styles.ctaButton}>
                  Start Exploring
                  <ArrowRight size={20} className={styles.ctaIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
