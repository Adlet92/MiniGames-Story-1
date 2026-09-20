import heroImageUrl from '../../assets/hero-image.png';
import islandersImage from '../../assets/islanders-new-shores-card.jpg';
import bubbleImage from '../../assets/shelve-the-potions-card.jpg';
import candyImage from '../../assets/tailside-cozy-cafe-sim-card.jpg';
import cafeImage from '../../assets/vacation-cafe-simulator-card.jpg';
import winterImage from '../../assets/winter-burrow-card.jpg';

import previousIcon from '../../assets/icons/arrow_back.svg';
import nextIcon from '../../assets/icons/arrow_forward.svg';
import heartIcon from '../../assets/icons/heart_icon.svg';
import starIcon from '../../assets/icons/star_icon.svg';
import uploadIcon from '../../assets/icons/upload.svg';
import illustration from '../../assets/illustration-side.jpg';
import type { SliderAssets } from '../../features/slider/slider';
import { createSliderSection } from '../../features/slider/slider';
import { createDeveloperCtaSection } from '../developer-cta/developer-cta';
import { createHeroSection } from '../hero/hero-section';
import { createLeaderboardSection } from '../leaderboard/leaderboard';
// import './home-page.scss';

export function createHomePage(): HTMLElement {
  const homePage: HTMLElement = document.createElement('main');

  const sliderAssets: SliderAssets = {
    candyImage,
    islandersImage,
    cafeImage,
    winterImage,
    bubbleImage,
    previousIcon,
    nextIcon,
    starIcon,
    heartIcon,
  };

  homePage.append(
    createHeroSection(heroImageUrl),
    createSliderSection(sliderAssets),
    createLeaderboardSection(),
    createDeveloperCtaSection({
      illustrationUrl: illustration,
      uploadIconUrl: uploadIcon,
    }),
  );

  return homePage;
}
