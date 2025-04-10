# Trend Radar Visualisation

This modern web app provides you with an interactive trend radar. It is used to visualise and manage potential threats and opportunities across Political, Economic, Social and Technological dimensions. These strategic points are displayed in a concentric circle diagram.

1. The outer ring represents trends with the lowest likelihood of occurrence, whereas the inner rings represent trends with increasing likelihood.
2. The size of a point represents its potential impact, with larger points indicating a higher impact.
3. The colour of a point indicates the preparedness level, ranging from red (low preparedness) to green (high preparedness).

The app was built with Next.js, React, and TypeScript, featuring a responsive design with TailwindCSS.

## Features

- Interactive ring diagram (concentric circles) visualization
- Dynamic control panel for trend management
- Real-time trend table updates
- Responsive design that works on both desktop and mobile
- Light and Dark mode support (based on system preference)

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (React)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Testing**: [Jest](https://jestjs.io/docs/next/getting-started) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- **Code Quality**: [ESLint](https://eslint.org/)

## Getting Started

### GitHub Codespaces (Recommended)

1. Click the "Code" button on the repository
2. Select "Create codespace on main"
3. Wait for the codespace to initialize
4. Once the codespace is ready, it will automatically install dependencies using `npm install`.
5. Start the development server with `npm run dev`

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Testing

The project uses Jest and React Testing Library for testing. Tests are located in `__tests__` directories next to the components they test. To run tests:

```bash
npm run test        # Run tests
```

Test coverage reports are generated in the `coverage` directory.

## Project Structure

- `/src/components` - React components
- `/src/store` - State management (Zustand)
- `/src/types` - TypeScript types and interfaces
- `/src/constants` - Application constants
- `/..directory/__tests__` - Test files for a given directory.

## Deployment

This project is configured for static exports via Next.js. To deploy:

1. Build the project:
   ```bash
   npm run build
   ```
2. The static output will be in the `out` directory
3. Deploy the contents of `out` to any static hosting service

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing code style.
