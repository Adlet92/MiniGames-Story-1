import type { AppPage } from '../../app/router';
import heroImageUrl from '../../assets/hero-image.png';
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
  onNavigate: (page: AppPage) => void;
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
    createHeroSection(heroImageUrl, (): void => options.onNavigate('library')),
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
