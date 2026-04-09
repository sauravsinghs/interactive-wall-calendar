import { CalendarPage } from "./components/CalendarPage/CalendarPage";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.app}>
      <CalendarPage />
    </div>
  );
}
