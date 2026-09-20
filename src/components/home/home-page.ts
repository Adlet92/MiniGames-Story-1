import heroImageUrl from '../../assets/camper-van-make-it-home-card.jpg';
import { createHeroSection } from '../hero/hero-section';
// import './home-page.scss';

export function createHomePage(): HTMLElement {
  const main: HTMLElement = document.createElement('main');

  main.append(createHeroSection(heroImageUrl));

  return main;
}
