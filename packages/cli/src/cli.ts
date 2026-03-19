#!/usr/bin/env node

import { runExtract } from './commands/extract';

async function main() {
  const [, , rawCommand, ...rest] = process.argv;

  const command = rawCommand ?? 'extract';
  if (command !== 'extract') {
    process.stderr.write(`Unknown command: ${command}\n`);
    process.exitCode = 1;
    return;
  }

  const cwdArg = rest.find((arg) => arg.startsWith('--cwd='));
  const cwd = cwdArg ? cwdArg.slice('--cwd='.length) : process.cwd();

  try {
    await runExtract({ rootDir: cwd });
    process.stdout.write('DevCMS schema extracted to ./cms/schema.json\n');
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    process.stderr.write(`devcms extract failed: ${message}\n`);
    process.exitCode = 1;
  }
}

void main();

