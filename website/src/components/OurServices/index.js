import React from "react";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Blocks,
  MonitorUp,
} from "lucide-react";
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

              {/* Steps Section */}
              <div className={styles.stepsContainer}>
                <h3 className={styles.stepsHeading}>
                  <Layers size={20} />
                  Use Our Services:
                </h3>

                {steps.map((item, index) => (
                  <div key={index} className={styles.stepItem}>
                    <item.icon size={16} className={styles.stepIcon} />
                    <span className={styles.stepText}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className={styles.ctaContainer}>
                <button className={styles.ctaButton}>
                  Start Exploring
                  <ArrowRight size={20} className={styles.ctaIcon} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Data Visualization */}
          <div className={styles.visualizationContainer}>
            <div className={styles.visualizationCard}>
              {/* Timeline Visualization */}
              <div className={styles.timelineContainer}>
                {/* Satellite Background */}
                <div className={styles.satelliteBackground}></div>

                {/* SVG Data Streams */}
                <svg className={styles.dataStreams} viewBox="0 0 400 300">
                  <defs>
                    <linearGradient
                      id="stream1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--ifm-color-primary)"
                        stopOpacity="0.8"
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--ifm-color-secondary)"
                        stopOpacity="0.9"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--ifm-color-danger)"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                    <linearGradient
                      id="stream2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--ifm-color-success)"
                        stopOpacity="0.8"
                      />
                      <stop
                        offset="50%"
                        stopColor="var(--ifm-color-warning)"
                        stopOpacity="0.9"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--ifm-color-info)"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M50,250 Q100,200 150,180 T250,160 T350,140"
                    stroke="url(#stream1)"
                    strokeWidth="3"
                    fill="none"
                    className={styles.streamPath1}
                  />
                  <path
                    d="M50,260 Q120,210 180,190 T280,170 T380,150"
                    stroke="url(#stream2)"
                    strokeWidth="3"
                    fill="none"
                    className={styles.streamPath2}
                  />
                  <path
                    d="M50,270 Q140,220 200,200 T300,180 T400,160"
                    stroke="url(#stream1)"
                    strokeWidth="2"
                    fill="none"
                    className={styles.streamPath3}
                  />
                </svg>

                {/* Year Labels */}
                <div className={styles.yearLabels}>
                  {yearLabels.map((year, index) => (
                    <div key={year} className={styles.yearLabel}>
                      <div
                        className={styles.yearDot}
                        style={{ animationDelay: `${index * 0.2}s` }}
                      ></div>
                      <span>{year}</span>
                    </div>
                  ))}
                </div>

                {/* Statistics Cards */}
                <div className={styles.statsContainer}>
                  {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                      <div className={styles.statContent}>
                        <div
                          className={`${styles.statIndicator} ${
                            styles[`stat${stat.color}`]
                          }`}
                        ></div>
                        <div>
                          <div className={styles.statValue}>{stat.value}</div>
                          <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
