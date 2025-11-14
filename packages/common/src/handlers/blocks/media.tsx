import { JSX } from 'react';
import { MediaBlock } from '@common/types/payload-types';
import { Media } from '../../components/Media'
import { createLocalizedMedia } from '../../lib/mediaUtil'

/**
 * Handles rendering of media blocks.
 */
export function render(block: MediaBlock, index: number): JSX.Element {
  return (
    <Media
      key={index}
      media={createLocalizedMedia(block.media)}
      radius={true}
    />
  );
}
