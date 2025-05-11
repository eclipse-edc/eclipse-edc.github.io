# Broken Links Checking Workflows

This directory contains GitHub Actions workflows for checking broken links in the Eclipse EDC documentation website.

## Workflows

### 1. `check-broken-links.yaml`

This workflow runs on pull requests to check for broken external links in the documentation. It uses the [lychee-action](https://github.com/lycheeverse/lychee-action) to find and report broken links.

Key features:
- Runs on PR open, synchronize, and reopen events
- Checks only external links (HTTP/HTTPS)
- Caches results to reduce API requests
- Posts a comment on the PR if broken links are found
- Optimized settings to reduce GitHub API rate limit issues (429 errors)

### 2. `check-broken-links-schedule.yaml`

This workflow runs on a schedule (weekly) to detect broken links and creates GitHub issues when problems are found.

Key features:
- Runs every Sunday at 00:00 UTC
- Can also be triggered manually
- Creates a GitHub issue with detailed report when broken links are found
- Uses caching to reduce API requests

## Configuration

The link checking is configured with:

1. `.lycheeignore` file at the repository root - contains patterns of URLs to exclude from checking
2. Command-line arguments in the workflows, which specify:
   - Cache settings
   - Path exclusions (e.g., `.git`, `node_modules`)
   - Only checking HTTP/HTTPS links
   - Retries and timeout settings
   - Concurrency limits to avoid rate limiting

## Troubleshooting

### Common Issues

1. **GitHub API Rate Limiting (429 errors)**
   - The workflow uses several strategies to reduce API requests
   - If you still encounter this, consider adding specific GitHub patterns to `.lycheeignore`

2. **False Positives for Hugo Site Links**
   - Relative links that work after Hugo builds the site might be reported as broken
   - These are ignored using patterns in `.lycheeignore`

3. **High Link Count**
   - For better performance, the workflow focuses only on external (HTTP/HTTPS) links 