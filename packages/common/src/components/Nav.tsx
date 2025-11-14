'use client'

import { Burger, Container, Group, Button, Drawer, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { resolveLocalizedText } from '@common/lib/translation'
import { useLanguage } from '../hooks/useLanguage'
import { usePathname } from 'next/navigation'
import { LanguageSelector } from './LanguageSelector'
import { NavItem } from '@common/types/nav'
import classes from './Nav.module.scss'
import clsx from 'clsx'
import { LocalizedMedia } from '../types/language'
import { Logo } from './Logo'
import { useEffect, useRef, useState } from 'react'

export type NavProps = {
  logo?: LocalizedMedia
  pages: NavItem[]
}

/**
 * Main navigation component. Displays links in a row if there is room. Otherwise, links are collapsed into a hamburger
 * menu. Both Navs are rendered, but only one is shown. The desktop Nav is compared with the window width to determine 
 * mode.
 */
export function Nav({ logo, pages }: NavProps) {
  const [language] = useLanguage()
  const pathname = usePathname()
  const [opened, { close, toggle }] = useDisclosure(false)
  const desktopRef = useRef<HTMLDivElement>(null)
  // Both should be false until we calculate
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Determine view mode on load and resize: desktop/mobile
  useEffect(() => {
    const update = () => {
      if (!desktopRef.current) return
      const desktopNavWidth = desktopRef.current.scrollWidth
      const windowWidth = window.innerWidth
      const isMobile = desktopNavWidth > windowWidth;
      setIsMobile(isMobile)
      setIsDesktop(!isMobile)
    }

    window.addEventListener('resize', update)
    update()
    return () => window.removeEventListener('resize', update)
  }, [])

  const links = pages.map(({ href, label }, index) => (
    <Button 
      key={index}
      component='a'
      href={href}
      variant={pathname === href ? 'light' : 'subtle'}
      className={clsx(
        classes.link,
        {
          [classes.active]: pathname === href,
        },
      )}
    >
      {resolveLocalizedText(label, language)}
    </Button>
  ))

  return (
    <>
      <header className={classes.nav}>
        <div className=
          {clsx(
            classes.surfaceWrapper,
            {
              [classes.show]: isMobile,
            }
          )
        }>
          <Container 
            size="xl" 
            className={clsx(
              classes.inner, 
            )}
          >
            {logo && <Logo 
              className={clsx(classes.logo)}
              media={logo} 
            />}

            <Group className={classes.inner_right} gap="sm" wrap='nowrap'>

              <LanguageSelector />

              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                aria-label="Toggle navigation"
              />

            </Group>
          </Container>
        </div>
        <div className=
          {clsx(
            classes.surfaceWrapper,
            {
              [classes.show]: isDesktop,
            }
          )
        }>
          <Container 
            size="xl" 
            className={clsx(
              classes.inner,
            )}
            ref={desktopRef}
          >
            {logo && <Logo 
              className={clsx(classes.logo)}
              media={logo} 
            />}

            <Group className={classes.inner_right} gap="sm" wrap='nowrap'>
              <Group gap={5} wrap='nowrap'>
                {links}
              </Group>

              <LanguageSelector />

            </Group>
          </Container>
        </div>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        padding="md"
        size="xs"
        position="right"
      >
        <Stack>
          {links}
        </Stack>
      </Drawer>
    </>
  )
}
