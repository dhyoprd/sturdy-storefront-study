import { rmSync } from "node:fs";

for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`.data/test-sturdy.db${suffix}`, { force: true });
}
