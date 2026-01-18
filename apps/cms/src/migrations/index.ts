import * as migration_20260118_030703 from './20260118_030703';

export const migrations = [
  {
    up: migration_20260118_030703.up,
    down: migration_20260118_030703.down,
    name: '20260118_030703'
  },
];
