#!/usr/bin/env node
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

async function stageAndCommit(message = 'feat: update project configuration for Vercel deployment') {
  console.log('[Git] Checking status matrix...');
  const statusMatrix = await git.statusMatrix({ fs, dir: ROOT_DIR });
  
  let staged = 0;
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    if (workdir !== head || workdir !== stage) {
      if (workdir !== 0) {
        await git.add({ fs, dir: ROOT_DIR, filepath });
        staged++;
      } else {
        await git.remove({ fs, dir: ROOT_DIR, filepath });
        staged++;
      }
    }
  }

  if (staged > 0) {
    console.log(`[Git] Staged ${staged} file(s).`);
    const sha = await git.commit({
      fs,
      dir: ROOT_DIR,
      author: {
        name: 'Priyan R',
        email: 'priyan.donor@gmail.com',
      },
      message,
    });
    console.log(`[Git] Commit created: ${sha}`);
    return sha;
  } else {
    console.log('[Git] Working directory clean, nothing to commit.');
  }
}

async function setRemote(url) {
  try {
    await git.deleteRemote({ fs, dir: ROOT_DIR, remote: 'origin' });
  } catch (e) {}
  await git.addRemote({ fs, dir: ROOT_DIR, remote: 'origin', url });
  console.log(`[Git] Origin remote set to: ${url}`);
}

async function listRemotes() {
  const remotes = await git.listRemotes({ fs, dir: ROOT_DIR });
  console.log('[Git] Remotes:', remotes);
  return remotes;
}

async function push(remoteUrl, token = null) {
  await stageAndCommit();
  
  if (remoteUrl) {
    await setRemote(remoteUrl);
  }

  console.log(`[Git] Pushing 'main' branch to remote...`);
  
  const pushResult = await git.push({
    fs,
    http,
    dir: ROOT_DIR,
    remote: 'origin',
    ref: 'main',
    force: false,
    onAuth: () => {
      if (token) {
        return { username: token, password: '' };
      }
      return undefined;
    },
  });

  console.log('[Git] Push completed successfully!', pushResult);
}

const args = process.argv.slice(2);
const command = args[0] || 'status';

(async () => {
  try {
    if (command === 'commit') {
      const msg = args.slice(1).join(' ') || 'feat: update repository';
      await stageAndCommit(msg);
    } else if (command === 'set-remote') {
      const url = args[1];
      if (!url) throw new Error('Usage: node scripts/git_cli.js set-remote <url>');
      await setRemote(url);
    } else if (command === 'push') {
      const url = args[1];
      const token = args[2] || process.env.GITHUB_TOKEN;
      await push(url, token);
    } else if (command === 'status') {
      const statusMatrix = await git.statusMatrix({ fs, dir: ROOT_DIR });
      console.log(`[Git] Status: ${statusMatrix.length} tracked/untracked items`);
      for (const [filepath, head, workdir, stage] of statusMatrix) {
        if (head !== workdir || stage !== workdir) {
          console.log(`  - [${filepath}]: head=${head}, workdir=${workdir}, stage=${stage}`);
        }
      }
      await listRemotes();
    } else {
      console.log('Available commands: status, commit <msg>, set-remote <url>, push <url> [token]');
    }
  } catch (err) {
    console.error('[Git Error]:', err.message);
  }
})();
