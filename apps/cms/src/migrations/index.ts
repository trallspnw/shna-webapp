import * as migration_20260118_030703 from './20260118_030703';
import * as migration_20260308_000001 from './20260308_000001';

export const migrations = [
  {
    up: migration_20260118_030703.up,
    down: migration_20260118_030703.down,
    name: '20260118_030703'
  },
  {
    up: migration_20260308_000001.up,
    down: migration_20260308_000001.down,
    name: '20260308_000001'
  },
];
