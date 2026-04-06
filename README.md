# UI Components Workspace

This repository is intentionally **not** a full product app.

It is a component-design workspace built with **Expo + React Native Web** where you can:

- design and test reusable UI components,
- preview them in one place,
- migrate the polished components into other production projects.

## Stack

- Expo
- React Native
- React Native Web
- TypeScript

## Getting Started

```bash
npm install
npm run web
```

You can also run native previews:

```bash
npm run android
npm run ios
```

## Suggested Structure

- `src/components`: Reusable primitives and composed components.
- `src/screens`: Component-gallery and preview screens.
- `src/theme`: Design tokens (colors, spacing, radii, typography).

## Current Demo

The starter includes:

- `PrimaryButton`
- `InfoCard`
- `ComponentGalleryScreen`

Use these as examples and expand with your own component catalog.