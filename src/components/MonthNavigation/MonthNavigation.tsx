import { formatMonthYear } from "../../utils/dateUtils";
import styles from "./MonthNavigation.module.css";

interface Props {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNavigation({ currentMonth, onPrev, onNext, onToday }: Props) {
  return (
    <div className={styles.nav}>
      <button
        className={styles.arrowBtn}
        onClick={onPrev}
        aria-label="Previous month"
        title="Previous month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.center}>
        <h2 className={styles.monthYear}>{formatMonthYear(currentMonth)}</h2>
        <button className={styles.todayBtn} onClick={onToday}>
          Today
        </button>
      </div>

      <button
        className={styles.arrowBtn}
        onClick={onNext}
        aria-label="Next month"
        title="Next month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
