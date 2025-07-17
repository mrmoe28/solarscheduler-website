# SolarScheduler PWA Icons

This directory contains the app icons for the SolarScheduler Progressive Web App.

## Required Icon Sizes

The following icon sizes are needed for full PWA compatibility:

- **72x72** - Android home screen
- **96x96** - Android home screen
- **128x128** - Chrome Web Store
- **144x144** - Android splash screen
- **152x152** - iOS home screen
- **192x192** - Android home screen
- **384x384** - Android splash screen
- **512x512** - Android splash screen

## Icon Requirements

- **Format**: PNG with transparent background
- **Content**: SolarScheduler logo (solar panel icon + text)
- **Colors**: Primary blue (#2563eb) on transparent background
- **Style**: Modern, clean, readable at small sizes

## Placeholder Notice

Currently using placeholder icons. Replace with actual SolarScheduler branded icons for production.

## Generating Icons

You can use tools like:
- [PWA Asset Generator](https://github.com/PWABuilder/PWABuilder)
- [App Icon Generator](https://appicon.co/)
- [Favicon Generator](https://realfavicongenerator.net/)

## Usage

Icons are referenced in:
- `manifest.json` - PWA manifest
- `app.html` - HTML meta tags
- Service worker for offline caching