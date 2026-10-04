import heroImageUrl from '../../assets/hero-image.png';
// import islandersImage from '../../assets/islanders-new-shores-card.jpg';
// import winterBurrowImage from '../../assets/winter-burrow-card.jpg';

// import catMailImage from '../../assets/cat-mail-co-card.jpg';
// import heartopiaImage from '../../assets/heartopia-card.jpg';
// import paliaImage from '../../assets/palia-card.jpg';
// import shelvePotionsImage from '../../assets/shelve-the-potions-card.jpg';
// import tailsideImage from '../../assets/tailside-cozy-cafe-sim-card.jpg';
// import tinyGladeImage from '../../assets/tiny-glade-card.jpg';
// import vacationCafeImage from '../../assets/vacation-cafe-simulator-card.jpg';

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
import type { SnackbarVariant } from '../ui/snackbar/snackbar';

export interface HomePageOptions {
  onGameDetails: (slug: string) => void;
  onNotify: (message: string, variant: SnackbarVariant) => void;
}

export function createHomePage(options: HomePageOptions): HTMLElement {
  const homePage: HTMLElement = document.createElement('main');
  const sliderAssets: SliderAssets = {
    previousIcon,
    nextIcon,
    starIcon,
    heartIcon,
  };

  homePage.append(
    createHeroSection(heroImageUrl),
    createSliderSection(sliderAssets, {
      onGameDetails: options.onGameDetails,
      onNotify: options.onNotify,
    }),
    createLeaderboardSection({ onNotify: options.onNotify }),
    createDeveloperCtaSection({
      illustrationUrl: illustration,
      uploadIconUrl: uploadIcon,
    }),
  );
  return homePage;
}
