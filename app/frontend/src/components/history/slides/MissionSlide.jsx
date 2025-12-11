import { MISSION_SOLUTIONS } from "../../../data/slidesData";
import ListItems from "../ListItems";

export default function MissionSlide() {
  return (
    <div className="slide-description">
      <p>
        Supplying real-time, analytics-based flood-risk insights to improve
        community resilience.
      </p>
      <ListItems items={MISSION_SOLUTIONS} />
    </div>
  );
}
