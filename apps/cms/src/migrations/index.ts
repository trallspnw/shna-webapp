import * as migration_20260120_231541 from './20260120_231541';
import * as migration_20260121_005458 from './20260121_005458';

export const migrations = [
  {
    up: migration_20260120_231541.up,
    down: migration_20260120_231541.down,
    name: '20260120_231541',
  },
  {
    up: migration_20260121_005458.up,
    down: migration_20260121_005458.down,
    name: '20260121_005458'
  },
];
