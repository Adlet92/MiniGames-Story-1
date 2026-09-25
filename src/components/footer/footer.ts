import brandUrl from '../../assets/icons/brand.png';
import chatUrl from '../../assets/icons/chat.png';
import codeUrl from '../../assets/icons/code.png';
import rsLogoUrl from '../../assets/icons/rs-logo.png';
import rssUrl from '../../assets/icons/rss_feed.png';
import shareUrl from '../../assets/icons/share.png';
import './footer.scss';

interface FooterLinkData {
  label: string;
  href: string;
}

interface FooterGroupData {
  title: string;
  ariaLabel: string;
  links: FooterLinkData[];
}

const HOME_URL: string = '#/';
const RS_SCHOOL_URL: string = 'https://rs.school/courses/short-track';
const STUDENT_GITHUB_URL: string = 'https://github.com/Adlet92';

function createLink(data: FooterLinkData, className: string): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.className = className;
  link.href = data.href;
  link.textContent = data.label;
  return link;
}

function createNavigationGroup(data: FooterGroupData): HTMLElement {
  const navigation: HTMLElement = document.createElement('nav');
  navigation.className = 'footer__link-group';
  navigation.setAttribute('aria-label', data.ariaLabel);

  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.className = 'footer__group-title';
  heading.textContent = data.title;

  const list: HTMLUListElement = document.createElement('ul');
  list.className = 'footer__link-list';
  for (const linkData of data.links) {
    const item: HTMLLIElement = document.createElement('li');
    item.append(createLink(linkData, 'footer__link'));
    list.append(item);
  }

  navigation.append(heading, list);
  return navigation;
}

function createSocialLink(iconUrl: string, label: string): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.className = 'footer__social-link';
  link.href = HOME_URL;
  link.setAttribute('aria-label', label);

  const icon: HTMLImageElement = document.createElement('img');
  icon.className = 'footer__social-icon';
  icon.src = iconUrl;
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  link.append(icon);
  return link;
}

function createExternalCredit(
  href: string,
  label: string,
  iconUrl: string,
  modifier: string,
): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.className = `footer__credit footer__credit--${modifier}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noreferrer';

  const iconWrapper: HTMLSpanElement = document.createElement('span');
  iconWrapper.className = 'footer__credit-icon';
  iconWrapper.setAttribute('aria-hidden', 'true');
  const icon: HTMLImageElement = document.createElement('img');
  icon.className = 'footer__credit-image';
  icon.src = iconUrl;
  icon.alt = '';
  iconWrapper.append(icon);

  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = label;
  link.append(iconWrapper, text);
  return link;
}

export function createFooter(): HTMLElement {
  const footer: HTMLElement = document.createElement('footer');
  footer.className = 'footer';

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'footer__content';

  const top: HTMLDivElement = document.createElement('div');
  top.className = 'footer__top';

  const introduction: HTMLDivElement = document.createElement('div');
  introduction.className = 'footer__introduction';
  const brand: HTMLAnchorElement = document.createElement('a');
  brand.className = 'footer__brand';
  brand.href = HOME_URL;
  brand.setAttribute('aria-label', 'MiniGames home');
  const logo: HTMLImageElement = document.createElement('img');
  logo.className = 'footer__logo';
  logo.src = brandUrl;
  logo.alt = '';
  logo.width = 32;
  logo.height = 32;
  const brandName: HTMLSpanElement = document.createElement('span');
  brandName.textContent = 'MiniGames';
  brand.append(logo, brandName);

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'footer__description';
  description.textContent =
    'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.';
  introduction.append(brand, description);

  const navigationArea: HTMLDivElement = document.createElement('div');
  navigationArea.className = 'footer__navigation-area';
  const homeLinks: FooterLinkData[] = [
    { label: 'Home', href: HOME_URL },
    { label: 'Library', href: HOME_URL },
    { label: 'Categories', href: HOME_URL },
    { label: 'Tournaments', href: HOME_URL },
  ];
  const companyLinks: FooterLinkData[] = [
    { label: 'About Us', href: HOME_URL },
    { label: 'Contact', href: HOME_URL },
    { label: 'Privacy Policy', href: HOME_URL },
    { label: 'Terms of Service', href: HOME_URL },
  ];
  navigationArea.append(
    createNavigationGroup({
      title: 'Explore',
      ariaLabel: 'Explore',
      links: homeLinks,
    }),
    createNavigationGroup({
      title: 'Company',
      ariaLabel: 'Company',
      links: companyLinks,
    }),
  );

  const community: HTMLElement = document.createElement('nav');
  community.className = 'footer__community';
  community.setAttribute('aria-label', 'Community');
  const communityHeading: HTMLHeadingElement = document.createElement('h2');
  communityHeading.className = 'footer__group-title';
  communityHeading.textContent = 'Community';
  const socialLinks: HTMLDivElement = document.createElement('div');
  socialLinks.className = 'footer__social-links';
  socialLinks.append(
    createSocialLink(shareUrl, 'Share MiniGames'),
    createSocialLink(chatUrl, 'MiniGames community chat'),
    createSocialLink(rssUrl, 'MiniGames news feed'),
  );
  community.append(communityHeading, socialLinks);

  const linksArea: HTMLDivElement = document.createElement('div');
  linksArea.className = 'footer__links-area';
  linksArea.append(navigationArea, community);
  top.append(introduction, linksArea);

  const bottom: HTMLDivElement = document.createElement('div');
  bottom.className = 'footer__bottom';
  const copyright: HTMLParagraphElement = document.createElement('p');
  copyright.className = 'footer__copyright';
  copyright.textContent = '© 2026 MiniGames. All rights reserved.';

  const credits: HTMLDivElement = document.createElement('div');
  credits.className = 'footer__credits';
  const rsSchool: HTMLAnchorElement = createExternalCredit(
    RS_SCHOOL_URL,
    'RS School',
    rsLogoUrl,
    'rs',
  );
  const github: HTMLAnchorElement = createExternalCredit(
    STUDENT_GITHUB_URL,
    '@Adlet92',
    codeUrl,
    'github',
  );

  const designNote: HTMLParagraphElement = document.createElement('p');
  designNote.className = 'footer__design-note';
  designNote.textContent = 'Designed with love';
  credits.append(rsSchool, github, designNote);
  bottom.append(copyright, credits);

  content.append(top, bottom);
  footer.append(content);
  return footer;
}
