import HapiSlide from "./HapiSlide";
import IntroSlide from "./IntroSlide";
import GallerySlide from "./GallerySlide";
import ClimateSlide from "./ClimateSlide";
import MissionSlide from "./MissionSlide";
import TechnologiesSlide from "./TechnologiesSlide";
import ThankYouSlide from "./ThankYouSlide";
import ListItems from "../ListItems";
import { FLOOD_TYPES, HISTORICAL_EVENTS } from "../../../data/slidesData";
import PreventionSlide from "./PreventionSlide";

export function renderSlideContent(contentType) {
  const contentMap = {
    hapi: <HapiSlide />,
    intro: <IntroSlide />,
    types: <ListItems items={FLOOD_TYPES} />,
    gallery: <GallerySlide />,
    climate: <ClimateSlide />,
    historical: <ListItems items={HISTORICAL_EVENTS} />,
    prevention: <PreventionSlide />,
    mission: <MissionSlide />,
    technologies: <TechnologiesSlide />,
    thankyou: <ThankYouSlide />,
  };

  return contentMap[contentType] || null;
}
