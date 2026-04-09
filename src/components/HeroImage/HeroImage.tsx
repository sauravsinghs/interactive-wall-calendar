import { useState, useEffect, useRef } from "react";
import { getMonthImage } from "../../utils/images";
import { formatMonthYear } from "../../utils/dateUtils";
import styles from "./HeroImage.module.css";

interface Props {
  currentMonth: Date;
  direction: "next" | "prev" | null;
}

export function HeroImage({ currentMonth, direction }: Props) {
  const monthIndex = currentMonth.getMonth();
  const imageUrl = getMonthImage(monthIndex);
  const [animating, setAnimating] = useState(false);
  const prevImageRef = useRef(imageUrl);
  const [displayImage, setDisplayImage] = useState(imageUrl);

  useEffect(() => {
    if (imageUrl !== prevImageRef.current && direction) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayImage(imageUrl);
        prevImageRef.current = imageUrl;
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayImage(imageUrl);
      prevImageRef.current = imageUrl;
    }
  }, [imageUrl, direction]);

  const flipClass = animating
    ? direction === "next"
      ? styles.flipOut
      : styles.flipOutReverse
    : styles.flipIn;

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.imageFrame}>
        <div className={`${styles.imageContainer} ${flipClass}`}>
          <img
            src={displayImage}
            alt={formatMonthYear(currentMonth)}
            className={styles.image}
          />
          <div className={styles.imageOverlay}>
            <span className={styles.monthLabel}>
              {formatMonthYear(currentMonth)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
