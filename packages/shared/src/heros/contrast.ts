export type HeroContrastMode = 'overlay' | 'surface'
export type HeroOverlayPreset = 'none' | 'subtle' | 'medium' | 'strong'
export type HeroOverlayStyle = 'solid' | 'gradient'
export type HeroThemeVariant = 'dark' | 'light'
export type HeroContentAlign = 'left' | 'center'

const overlayOpacityMap: Record<HeroOverlayPreset, number> = {
  none: 0,
  subtle: 0.25,
  medium: 0.45,
  strong: 0.65,
}

export const getHeroOverlayOpacity = (preset: HeroOverlayPreset = 'medium') => {
  return overlayOpacityMap[preset] ?? overlayOpacityMap.medium
}

type OverlayStyleOptions = {
  preset?: HeroOverlayPreset | null
  style?: HeroOverlayStyle | null
  align?: HeroContentAlign | null
}

export const getHeroOverlayStyle = ({ preset, style, align }: OverlayStyleOptions = {}) => {
  const resolvedPreset = preset ?? 'medium'
  const resolvedStyle = style ?? 'gradient'
  const resolvedAlign = align ?? 'left'
  const opacity = getHeroOverlayOpacity(resolvedPreset)
  const base = `hsl(var(--background) / ${opacity})`
  const transparent = 'hsl(var(--background) / 0)'

  if (resolvedStyle === 'solid') {
    return {
      opacity,
      style: {
        backgroundColor: base,
      },
    }
  }

  if (resolvedAlign === 'center') {
    return {
      opacity,
      style: {
        backgroundImage: `radial-gradient(circle at center, ${base} 0%, ${base} 45%, ${transparent} 100%)`,
      },
    }
  }

  return {
    opacity,
    style: {
      backgroundImage: `linear-gradient(90deg, ${base} 0%, ${base} 45%, ${transparent} 100%)`,
    },
  }
}
