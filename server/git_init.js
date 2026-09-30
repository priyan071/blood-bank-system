const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function initRepo() {
  const dir = path.resolve(__dirname, '..');
  console.log('Initializing git repository in:', dir);
  
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('Repository initialized.');

  // Check status matrix
  const statusMatrix = await git.statusMatrix({
    fs,
    dir,
  });

  console.log(`Found ${statusMatrix.length} total tracked/untracked items in matrix.`);
  
  // Filter out ignored files and stage everything else
  let addedCount = 0;
  for (const [filepath, head, workdir, stage] of statusMatrix) {
    if (workdir !== 0) {
      await git.add({ fs, dir, filepath });
      addedCount++;
    }
  }

  console.log(`Staged ${addedCount} files.`);

  // Create commit
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Priyan R',
      email: 'priyan.donor@gmail.com',
    },
    message: 'feat: Initial release of HemoVault Blood Bank Management System\n\n- Full-stack MERN centralized blood transfusion management\n- Admin, Donor, and Hospital portals with 1-click evaluation logins\n- Real-time 8-blood-group inventory & cold storage tracking\n- Pathology screening, emergency requisition pipeline, and audit traceability\n- Vercel deployment configuration',
  });

  console.log('Commit created successfully! SHA:', sha);

  // Set HEAD to main branch
  await git.branch({
    fs,
    dir,
    ref: 'main',
    checkout: true,
  });

  const currentBranch = await git.currentBranch({ fs, dir });
  console.log('Current branch:', currentBranch);
}

initRepo().catch(console.error);
