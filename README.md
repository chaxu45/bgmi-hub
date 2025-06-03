# Firebase Studio BGMI India Hub

This is a Next.js starter project for a BGMI (Battlegrounds Mobile India) esports hub, built in Firebase Studio.

## Key Features

*   News display
*   Tournament listings
*   Team rosters
*   Image-based leaderboards
*   Predict & Win feature
*   Admin panel for managing content (news, tournaments, teams, leaderboards, predictions)
*   Google AdSense integration

## Getting Started

To get started with development:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
    This will start the Next.js app (usually on port 9002 as configured in `package.json`) and the Genkit development server if you have AI flows.

## Admin Panel

Admin routes are accessible under `/admin/*`. In the default configuration (`src/components/layout/nav-menu.tsx`), admin links in the navigation are visible when `process.env.NODE_ENV === 'development'`. For production, you would typically implement proper authentication and authorization to protect these routes.

## Deployment

To deploy your application live:

1.  **Environment Variables (Crucial for Production):**
    Before building and deploying, ensure you have set the following environment variables in your hosting provider's settings:

    *   `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`: Your Google AdSense Publisher ID (e.g., `ca-pub-XXXXXXXXXXXXXXXX`). This is required for ads to work.
    *   `NEXT_PUBLIC_APP_URL`: The full public URL of your deployed application (e.g., `https://www.yourdomain.com`). This is used by server components for API calls.

2.  **AdSense Configuration:**
    *   Ensure all `adSlotId` props in `<AdsenseAdUnit />` components (e.g., in `src/app/page.tsx`, `src/app/predict-and-win/page.tsx`) are replaced with actual, active Ad Slot IDs from your Google AdSense account.
    *   Verify your `public/ads.txt` file contains your correct AdSense Publisher ID.

3.  **Build the Application:**
    ```bash
    npm run build
    ```
    This command compiles your Next.js application for production and outputs it to the `.next` folder.

4.  **Host Your Application:**
    *   Deploy the contents of your project (including the `.next` folder, `public` folder, `package.json`, etc.) to a hosting provider that supports Next.js.
    *   Given the `apphosting.yaml` file, Firebase App Hosting is a likely target. Follow the Firebase documentation for deploying Next.js applications.
    *   Other popular platforms include Vercel, Netlify, AWS Amplify.

5.  **Custom Domain:**
    *   Configure your custom domain through your hosting provider's dashboard and update your DNS records accordingly.

## Tech Stack

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   Lucide React Icons
*   Genkit (for potential AI features)
*   JSON files as a simple database (in `src/data/json-db/`)

To get started, take a look at `src/app/page.tsx`.
