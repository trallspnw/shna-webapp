import * as migration_20260121_020348 from './20260121_020348';
import * as migration_20260121_022847 from './20260121_022847';
import * as migration_20260207_051834 from './20260207_051834';

export const migrations = [
  {
    up: migration_20260121_020348.up,
    down: migration_20260121_020348.down,
    name: '20260121_020348',
  },
  {
    up: migration_20260121_022847.up,
    down: migration_20260121_022847.down,
    name: '20260121_022847',
  },
  {
    up: migration_20260207_051834.up,
    down: migration_20260207_051834.down,
    name: '20260207_051834'
  },
];
