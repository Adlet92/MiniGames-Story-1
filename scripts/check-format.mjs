import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const prettierPath = fileURLToPath(
  new URL('../node_modules/prettier/bin/prettier.cjs', import.meta.url),
);

const result = spawnSync(process.execPath, [prettierPath, '.', '--check'], {
  encoding: 'utf8',
});

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

process.stdout.write(output);

if (result.error) {
  console.error(result.error.message);
}

const hasWarnings = /\[warn\]/i.test(output);

process.exit(result.status === 0 && !hasWarnings ? 0 : 1);
