# Trustify - Your Trusted News Source

A modern, responsive news application built with React Router 7 that delivers the latest news from reliable sources around the world.

## Features

- 📰 Real-time news fetching from NewsAPI.org
- 🔍 Advanced search functionality
- 🏷️ Category-based filtering (Technology, Business, Sports, etc.)
- 🌙 Dark/Light mode toggle
- 📱 Fully responsive design
- ⚡️ Fast loading with optimized performance
- 🎨 Beautiful animations with GSAP
- 🔒 TypeScript for type safety
- 🎉 TailwindCSS for modern styling
- 🚀 Server-side rendering with React Router 7

## Getting Started

### Prerequisites

Before running Trustify, you'll need:
- Node.js (v18 or higher)
- A NewsAPI.org API key (free at [newsapi.org](https://newsapi.org/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/trustify.git
cd trustify
```

2. Install the dependencies:
```bash
npm install
```

3. Set up your API configuration:
   - Create or update `app/config/api.ts` with your NewsAPI key
   - The application fetches news from NewsAPI.org

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Usage

- **Browse News**: Latest news articles are displayed on the homepage
- **Search**: Use the search bar to find specific news topics
- **Filter**: Click on category tags to filter news by topic
- **Dark Mode**: Toggle between light and dark themes
- **Read Full Articles**: Click on any news card to read the complete article

## Project Structure

```
├── app/
│   ├── components/
│   │   └── Card.tsx          # News article card component
│   ├── config/
│   │   └── api.ts            # API configuration
│   ├── routes/
│   │   └── home.tsx          # Main news page
│   ├── services/
│   │   └── newsService.ts    # NewsAPI integration
│   ├── welcome/
│   │   ├── logo-dark.svg     # Dark mode logo
│   │   ├── logo-light.svg    # Light mode logo
│   │   └── welcome.tsx       # Welcome component
│   ├── app.css              # Global styles
│   ├── root.tsx             # App root component
│   └── routes.ts            # Route configuration
├── public/
│   ├── favicon.ico
│   └── logo.png
├── Dockerfile               # Docker configuration
├── package.json
├── vite.config.ts          # Vite configuration
└── README.md
```

## Technology Stack

- **Frontend**: React 19 with React Router 7
- **Styling**: TailwindCSS 4
- **Animations**: GSAP with ScrollTrigger
- **Language**: TypeScript
- **Build Tool**: Vite
- **News API**: NewsAPI.org
- **Deployment**: Docker support included

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
# Build the Docker image
docker build -t trustify .

# Run the container
docker run -p 3000:3000 trustify
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway
- Vercel
- Netlify

### Environment Variables

Make sure to set up the following environment variables for production:

- `NEWSAPI_KEY`: Your NewsAPI.org API key
- Any other API configurations as needed

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## API Integration

This application uses [NewsAPI.org](https://newsapi.org/) to fetch news articles. Features include:

- Top headlines from various categories
- Search functionality across articles
- Multiple language and country support
- Source-based filtering
- Real-time news updates

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured with a modern design system. The application features:

- Responsive design for all devices
- Dark/Light mode support
- Smooth animations and transitions
- Custom components with consistent styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using React Router 7 and powered by NewsAPI.org
