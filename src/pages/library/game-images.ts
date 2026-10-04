// import camperVanImage from '../../assets/camper-van-make-it-home-card.jpg';
// import catChessImage from '../../assets/cat-chess-card.jpg';
// import catMailImage from '../../assets/cat-mail-co-card.jpg';
// import grimshireImage from '../../assets/grimshire-card.jpg';
// import heartopiaImage from '../../assets/heartopia-card.jpg';
// import leafItAloneImage from '../../assets/leaf-it-alone-card.jpg';
// import leafyCornerImage from '../../assets/leafy-corner-card.jpg';
// import paliaImage from '../../assets/palia-card.jpg';
// import potionsImage from '../../assets/shelve-the-potions-card.jpg';
// import tinyGladeImage from '../../assets/tiny-glade-card.jpg';
// import tukoniImage from '../../assets/tukoni-forest-keepers-card.jpg';
// import vacationCafeImage from '../../assets/vacation-cafe-simulator-card.jpg';
// import whisperHouseImage from '../../assets/whisper-of-the-house-card.jpg';
// import winterBurrowImage from '../../assets/winter-burrow-card.jpg';
import camperVanImage from '../../assets/camper-van-make-it-home-card.jpg';
import castNChillImage from '../../assets/cast-n-chill-card.jpg';
import catChessImage from '../../assets/cat-chess-card.jpg';
import catMailImage from '../../assets/cat-mail-co-card.jpg';
import cozySolitaireImage from '../../assets/cozy-solitaire-card.jpg';
import cozySudokuImage from '../../assets/cozy-sudoku-card.jpg';
import grimshireImage from '../../assets/grimshire-card.jpg';
import heartopiaImage from '../../assets/heartopia-card.jpg';
import islandersImage from '../../assets/islanders-new-shores-card.jpg';
import koronekoImage from '../../assets/koroneko-card.jpg';
import leafItAloneImage from '../../assets/leaf-it-alone-card.jpg';
import leafyCornerImage from '../../assets/leafy-corner-card.jpg';
import littleCornersImage from '../../assets/little-corners-card.jpg';
import organizedInsideImage from '../../assets/organized-inside-card.jpg';
import paliaImage from '../../assets/palia-card.jpg';
import potionsImage from '../../assets/shelve-the-potions-card.jpg';
import tailsideImage from '../../assets/tailside-cozy-cafe-sim-card.jpg';
import theWildAtHeartImage from '../../assets/the-wild-at-heart-card.jpg';
import tinyGladeImage from '../../assets/tiny-glade-card.jpg';
import tukoniImage from '../../assets/tukoni-forest-keepers-card.jpg';
import vacationCafeImage from '../../assets/vacation-cafe-simulator-card.jpg';
import whisperHouseImage from '../../assets/whisper-of-the-house-card.jpg';
import winterBurrowImage from '../../assets/winter-burrow-card.jpg';
import wytchwoodImage from '../../assets/wytchwood-card.jpg';

const CARD_IMAGES: Readonly<Record<string, string>> = {
  'camper-van-make-it-home': camperVanImage,
  'cast-n-chill': castNChillImage,
  'cat-chess': catChessImage,
  'cat-mail-co': catMailImage,
  'cozy-solitaire': cozySolitaireImage,
  'cozy-sudoku': cozySudokuImage,
  grimshire: grimshireImage,
  heartopia: heartopiaImage,
  'islanders-new-shores': islandersImage,
  koroneko: koronekoImage,
  'leaf-it-alone': leafItAloneImage,
  'leafy-corner': leafyCornerImage,
  'little-corners': littleCornersImage,
  'organized-inside': organizedInsideImage,
  palia: paliaImage,
  'shelve-the-potions': potionsImage,
  'tailside-cozy-cafe-sim': tailsideImage,
  'the-wild-at-heart': theWildAtHeartImage,
  'tiny-glade': tinyGladeImage,
  'tukoni-forest-keepers': tukoniImage,
  'vacation-cafe-simulator': vacationCafeImage,
  'whisper-of-the-house': whisperHouseImage,
  'winter-burrow': winterBurrowImage,
  wytchwood: wytchwoodImage,
};

export function getGameImage(slug: string, fallback: string): string {
  return CARD_IMAGES[slug] ?? fallback;
}
