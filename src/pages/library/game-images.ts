import camperVanImage from '../../assets/camper-van-make-it-home-card.jpg';
import catChessImage from '../../assets/cat-chess-card.jpg';
import catMailImage from '../../assets/cat-mail-co-card.jpg';
import grimshireImage from '../../assets/grimshire-card.jpg';
import heartopiaImage from '../../assets/heartopia-card.jpg';
import leafItAloneImage from '../../assets/leaf-it-alone-card.jpg';
import leafyCornerImage from '../../assets/leafy-corner-card.jpg';
import paliaImage from '../../assets/palia-card.jpg';
import potionsImage from '../../assets/shelve-the-potions-card.jpg';
import tinyGladeImage from '../../assets/tiny-glade-card.jpg';
import tukoniImage from '../../assets/tukoni-forest-keepers-card.jpg';
import vacationCafeImage from '../../assets/vacation-cafe-simulator-card.jpg';
import whisperHouseImage from '../../assets/whisper-of-the-house-card.jpg';
import winterBurrowImage from '../../assets/winter-burrow-card.jpg';

const CARD_IMAGES: Readonly<Record<string, string>> = {
  'camper-van-make-it-home': camperVanImage,
  'cat-chess': catChessImage,
  'cat-mail-co': catMailImage,
  grimshire: grimshireImage,
  heartopia: heartopiaImage,
  'leaf-it-alone': leafItAloneImage,
  'leafy-corner': leafyCornerImage,
  palia: paliaImage,
  'shelve-the-potions': potionsImage,
  'tiny-glade': tinyGladeImage,
  'tukoni-forest-keepers': tukoniImage,
  'vacation-cafe-simulator': vacationCafeImage,
  'whisper-of-the-house': whisperHouseImage,
  'winter-burrow': winterBurrowImage,
};

export function getGameImage(slug: string, fallback: string): string {
  return CARD_IMAGES[slug] ?? fallback;
}
