import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { cp, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

test('Pages workflow publishes the site at the repository root', async (t) => {
  const workflow = await readFile('.github/workflows/deploy-pages.yml', 'utf8');
  assert.match(workflow, /cp -R index\.html install\.html privacy\.html assets converter shared bookmarklets bookmarklets_screenshot dist/);
  assert.match(workflow, /actions\/upload-pages-artifact/);
  assert.match(workflow, /actions\/deploy-pages/);

  const projectDirectory = await mkdtemp(join(tmpdir(), 'pages-layout-'));
  t.after(() => rm(projectDirectory, { force: true, recursive: true }));
  for (const path of ['index.html', 'install.html', 'privacy.html', 'assets', 'converter', 'shared', 'bookmarklets', 'bookmarklets_screenshot']) {
    await cp(path, join(projectDirectory, path), { recursive: true });
  }

  const assemblyBlock = workflow.match(
    /- name: Assemble Pages artifact\n\s+run: \|\n((?: {10}.+(?:\n|$))+)/,
  );
  assert.ok(assemblyBlock, 'Pages workflow must define an assembly command');
  const command = assemblyBlock[1].split('\n').map((line) => line.slice(10)).join('\n');
  await execFile('/bin/sh', ['-eu', '-c', command], { cwd: projectDirectory });
  for (const path of ['index.html', 'install.html', 'privacy.html', 'assets/install.js', 'assets/tutorial.css', 'converter/index.html', 'shared/bookmarklet.js', 'bookmarklets/catalog.json', 'bookmarklets_screenshot/staymiles-rate-helper-zh/before.png', 'bookmarklets_screenshot/staymiles-rate-helper-zh/after.png', 'bookmarklets_screenshot/eva-mileage-hotel-healper-zh/before.png', 'bookmarklets_screenshot/eva-mileage-hotel-healper-zh/after.png']) {
    assert.equal((await stat(join(projectDirectory, 'dist', path))).isFile(), true, path);
  }
});
