import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REPOS_TO_SYNC = [
  'cups',
  'cups-filters',
  'libcupsfilters',
  'libppd',
  'ipp-usb',
  'system-config-printer',
  'pappl-retrofit',
  'cups-browsed',
  'ps-printer-app',
  'ghostscript-printer-app',
  'hplip-printer-app',
  'legacy-drivers',
  'pappl',
];

const CUSTOM_ROLES: Record<string, { layer: string, role: string }> = {
  'cups': { layer: 'cups', role: 'Core print server and job management system.' },
  'cups-filters': { layer: 'filter', role: 'Legacy filter executables.' },
  'libcupsfilters': { layer: 'filter', role: 'Core data format conversion functions.' },
  'libppd': { layer: 'filter', role: 'Legacy PPD file support library.' },
  'ipp-usb': { layer: 'transport', role: 'Daemon for IPP over USB.' },
  'system-config-printer': { layer: 'application', role: 'GUI for CUPS printer administration.' },
  'pappl-retrofit': { layer: 'backend', role: 'Retro-fitting classic drivers into PAPPL.' },
  'cups-browsed': { layer: 'cups', role: 'Daemon for network printer discovery.' },
  'ps-printer-app': { layer: 'backend', role: 'PostScript Printer Application.' },
  'ghostscript-printer-app': { layer: 'backend', role: 'Ghostscript Printer Application.' },
  'hplip-printer-app': { layer: 'backend', role: 'HPLIP Printer Application.' },
  'legacy-drivers': { layer: 'backend', role: 'Collection of legacy printer drivers.' },
  'pappl': { layer: 'backend', role: 'Printer Application Framework.' },
};

async function fetchFromGithub(url: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenPrinting-PrintLab'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function syncGithub() {
  console.log('Fetching OpenPrinting repositories from GitHub...');
  
  try {
    const repos = await fetchFromGithub('https://api.github.com/orgs/OpenPrinting/repos?per_page=100');
    console.log(`Found ${repos.length} repositories in OpenPrinting organization.`);
    
    const papplRepo = await fetchFromGithub('https://api.github.com/repos/michaelrsweet/pappl');
    if (papplRepo) {
      repos.push(papplRepo);
    }
    
    let synced = 0;
    
    for (const repo of repos) {
      const custom = CUSTOM_ROLES[repo.name] || { layer: 'unknown', role: repo.description || '' };
      
      await prisma.repository.upsert({
        where: { slug: repo.name },
        update: {
          name: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          license: repo.license?.name,
          defaultBranch: repo.default_branch,
          isArchived: repo.archived,
          lastCommitDate: repo.pushed_at ? new Date(repo.pushed_at) : null,
          retrievedAt: new Date()
        },
        create: {
          id: repo.name,
          name: repo.name,
          slug: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          architectureLayer: custom.layer,
          role: custom.role,
          license: repo.license?.name,
          defaultBranch: repo.default_branch,
          isArchived: repo.archived,
          lastCommitDate: repo.pushed_at ? new Date(repo.pushed_at) : null,
        }
      });
      synced++;
      console.log(`Synced repo ${repo.name}`);

      const releases = await fetchFromGithub(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases?per_page=10`);
      if (releases && releases.length > 0) {
        await prisma.repository.update({
          where: { slug: repo.name },
          data: { latestRelease: releases[0].tag_name }
        });
        
        for (const release of releases) {
          await prisma.release.upsert({
            where: { id: release.id.toString() },
            update: {
              name: release.name || release.tag_name,
              tagName: release.tag_name,
              publishedAt: release.published_at ? new Date(release.published_at) : new Date(),
            },
            create: {
              id: release.id.toString(),
              repositoryId: repo.name,
              name: release.name || release.tag_name,
              tagName: release.tag_name,
              publishedAt: release.published_at ? new Date(release.published_at) : new Date(),
              url: release.html_url,
            }
          });
        }
      }

      const issues = await fetchFromGithub(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/issues?state=all&per_page=50`);
      if (issues) {
        for (const issue of issues) {
          if (issue.pull_request) {
            await prisma.pullRequest.upsert({
              where: { id: issue.id.toString() },
              update: {
                title: issue.title,
                state: issue.state,
                updatedAt: new Date(issue.updated_at),
                closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                mergedAt: issue.pull_request.merged_at ? new Date(issue.pull_request.merged_at) : null,
              },
              create: {
                id: issue.id.toString(),
                repositoryId: repo.name,
                number: issue.number,
                title: issue.title,
                state: issue.state,
                createdAt: new Date(issue.created_at),
                updatedAt: new Date(issue.updated_at),
                closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                mergedAt: issue.pull_request.merged_at ? new Date(issue.pull_request.merged_at) : null,
                author: issue.user?.login || 'unknown',
                url: issue.html_url,
              }
            });
          } else {
            await prisma.issue.upsert({
              where: { id: issue.id.toString() },
              update: {
                title: issue.title,
                state: issue.state,
                updatedAt: new Date(issue.updated_at),
                closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
              },
              create: {
                id: issue.id.toString(),
                repositoryId: repo.name,
                number: issue.number,
                title: issue.title,
                state: issue.state,
                createdAt: new Date(issue.created_at),
                updatedAt: new Date(issue.updated_at),
                closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
                author: issue.user?.login || 'unknown',
                url: issue.html_url,
              }
            });
          }
        }
      }

      const workflows = await fetchFromGithub(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/actions/runs?per_page=10`);
      if (workflows && workflows.workflow_runs) {
        for (const run of workflows.workflow_runs) {
          await prisma.cIPipeline.upsert({
            where: { id: run.id.toString() },
            update: {
              status: run.conclusion || run.status,
              duration: run.run_started_at ? Math.floor((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000) : 0,
              completedAt: run.updated_at ? new Date(run.updated_at) : null,
            },
            create: {
              id: run.id.toString(),
              repository: repo.name,
              commit: run.head_sha,
              branch: run.head_branch || 'main',
              status: run.conclusion || run.status,
              totalTests: 0,
              passedTests: 0,
              failedTests: 0,
              duration: run.run_started_at ? Math.floor((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000) : 0,
              triggeredAt: new Date(run.created_at),
              completedAt: run.updated_at ? new Date(run.updated_at) : null,
            }
          });
        }
      }
    }
    
    console.log(`Successfully synced ${synced} core repositories and their metadata to database.`);
  } catch (error) {
    console.error('Failed to sync GitHub data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncGithub();
