# Google Account Switcher

A Chrome extension that automatically switches Google accounts based on the service domain (e.g., Gmail, Google Drive) by redirecting with the `authuser` parameter.

## Features
- Configure specific Google accounts (email addresses) for different Google services/domains.
- Fast and privacy-friendly redirection using the `declarativeNetRequest` API.
- Reliable account switching using the `authuser` query parameter, which doesn't depend on the login order (unlike `/u/0/` paths).

## How to Use
1. Open the Chrome Extensions management page (`chrome://extensions`).
2. Turn on "Developer mode" in the top right corner.
3. Click "Load unpacked" and select this project folder.
4. Open the extension's Options page to configure your rules.
   - Example: Domain: `mail.google.com`, Account: `your.name@gmail.com`
5. When you navigate to the configured domain, you will be automatically redirected to the specified account.

## Development & Build
A GitHub Actions workflow is included to automatically package the extension into a ZIP file whenever you push to the `master` branch. The packaged extension can be found in the "Actions" tab as an Artifact.

## Release
To create a new release, use the provided `Makefile`:

1.  Run the release command with the desired type (`patch`, `minor`, or `major`):
    ```bash
    make release type=patch dryrun=false
    ```
2.  This command will:
    - Automatically bump the version in `manifest.json`.
    - Commit and push the change to the `master` branch.
    - Create a git tag (e.g., `v1.0.1`).
    - Push the tag to GitHub.
3.  GitHub Actions will then automatically create a GitHub Release and attach the `extension.zip`.


## License
MIT
