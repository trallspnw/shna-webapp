// Adapted from https://ui.mantine.dev/category/footers/

'use client'

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconBrandBluesky,
  IconWorld,
} from '@tabler/icons-react';
import { ActionIcon, Container, Group, Text } from '@mantine/core';
import classes from './Footer.module.scss';
import { LocalizedMedia, LocalizedText } from '../types/language';
import { useLanguage } from '../hooks/useLanguage';
import { resolveLocalizedText } from '../lib/translation'
import clsx from 'clsx';
import type { JSX } from 'react';
import { Logo } from './Logo';

export type SocialChannel = 'facebook' | 'instagram' | 'x' | 'youtube' | 'bluesky';

type LinkGroup = {
  title: LocalizedText
  links: {
    href: string
    label: LocalizedText
  }[];
};

export type FooterProps = {
  logo?: LocalizedMedia
  linkGroups: LinkGroup[]
  slogan?: LocalizedText
  socialLinks: string[]
  className?: string
};

const iconProps = {
  size: 18,
  stroke: 1.5,
}

const iconMap: Record<SocialChannel | 'generic', JSX.Element> = {
  facebook: <IconBrandFacebook {...iconProps} />,
  instagram: <IconBrandInstagram {...iconProps} />,
  x: <IconBrandX {...iconProps} />,
  youtube: <IconBrandYoutube {...iconProps} />,
  bluesky: <IconBrandBluesky {...iconProps} />,
  generic: <IconWorld {...iconProps} />,
}

/**
 * Footer component. Accepts configured values from the global footer configuration. Includes a logo, a slogan, 
 * groups links, and social media links.
 */
export function Footer({ logo, linkGroups, slogan, socialLinks, className }: FooterProps) {
  const [language] = useLanguage();

  const groups = linkGroups.map((group, lgIndex) => (
    <div className={classes.wrapper} key={`lg-${lgIndex}`}>
      <Text className={classes.title}>{resolveLocalizedText(group.title, language)}</Text>
      {group.links.map((link, lIndex) => (
        <Text<'a'>
          key={`l-${lIndex}`}
          className={classes.link}
          component="a"
          href={link.href}
        >
          {resolveLocalizedText(link.label, language)}
        </Text>
      ))}
    </div>
  ));

  return (
    <footer className={clsx(classes.footer, className)}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          {logo && <Logo 
            media={logo} 
          />}
          <Text size="xs" c="dimmed" className={classes.description}>
            {resolveLocalizedText(slogan, language)}
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>

      {Object.keys(socialLinks).length > 0 && (
        <Container className={classes.socials}>
          <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
            {Object.entries(socialLinks).map(([channel, href], index) => {
              if (!href) return null;
              return (
                <ActionIcon
                  key={`social-${index}`}
                  size="lg"
                  color="gray"
                  variant="subtle"
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={channel}
                >
                  {iconMap[getPlatform(href)]}
                </ActionIcon>
              );
            })}
          </Group>
        </Container>
      )}
    </footer>
  );
}

/**
 * Any social media platform may be configured in the CMS. This maps known platforms to well-known icons.
 */
function getPlatform(url: string): SocialChannel | 'generic' {
  try {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('facebook.com')) return 'facebook'
    if (hostname.includes('instagram.com')) return 'instagram'
    if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'x'
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('bsky.app'))return 'bluesky'

    return 'generic'
  } catch {
    return 'generic'
  }
}
