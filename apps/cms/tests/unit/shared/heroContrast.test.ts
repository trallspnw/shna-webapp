import { describe, expect, it } from 'vitest'

import { getHeroOverlayOpacity } from '@shna/shared/heros/contrast'

describe('hero contrast', () => {
  it('[core] maps overlay presets to expected opacities', () => {
    expect(getHeroOverlayOpacity('none')).toBe(0)
    expect(getHeroOverlayOpacity('subtle')).toBe(0.25)
    expect(getHeroOverlayOpacity('medium')).toBe(0.45)
    expect(getHeroOverlayOpacity('strong')).toBe(0.65)
  })
})
