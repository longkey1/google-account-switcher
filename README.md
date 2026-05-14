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
You can test the extension locally by loading the unpacked folder in Chrome.

## License
MIT
