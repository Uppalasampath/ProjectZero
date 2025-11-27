# ZERO - Sustainability Management Platform

<div align="center">


**Comprehensive sustainability management platform integrating circular marketplace, carbon tracking, and compliance automation**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

[Live Demo](https://uppalasampath.github.io/ProjectZero/) · [Report Bug](https://github.com/Uppalasampath/ProjectZero/issues) · [Request Feature](https://github.com/Uppalasampath/ProjectZero/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building](#building)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## 🌍 About

**ZERO** is an enterprise-grade sustainability management platform designed to help organizations achieve their environmental goals through data-driven insights and automated compliance management. The platform seamlessly integrates three core pillars of modern sustainability operations:

- **Circular Economy Marketplace** - Facilitate waste-to-resource transformation
- **Carbon Management** - Track, analyze, and reduce carbon emissions
- **Compliance Automation** - Streamline regulatory reporting and framework adherence

Built with modern web technologies and a minimalist design philosophy inspired by Persefoni, ZERO provides an intuitive interface for sustainability professionals to manage complex environmental data and drive measurable impact.

---

## ✨ Key Features

### 🔄 Circular Marketplace
- **Material Exchange** - List and discover recyclable materials and waste streams
- **Transaction Management** - Track material transactions with verification workflows
- **Analytics Dashboard** - Real-time marketplace insights and trends
- **Waste Listing** - Easy-to-use interface for listing available materials

### 📊 Carbon Tracking & Management
- **Emissions Dashboard** - Comprehensive carbon footprint visualization
- **Source Management** - Track emissions across Scope 1, 2, and 3 categories
- **Baseline Calculator** - Establish and monitor carbon reduction targets
- **Supplier Portal** - Collaborate with suppliers on emissions data
- **Smart Recommendations** - AI-driven suggestions for carbon reduction
- **Offset Marketplace** - Purchase verified carbon credits and offsets

### 📑 Compliance & Regulatory
- **Framework Support** - Built-in templates for major sustainability frameworks
- **Data Collection** - Structured workflows for regulatory data gathering
- **Report Generation** - Automated compliance report creation
- **Regulatory Monitor** - Stay updated on changing environmental regulations
- **Audit Trails** - Complete tracking of compliance activities

### 🏢 Organization Management
- **Multi-user Support** - Role-based access control
- **Organization Settings** - Configure company profile and preferences
- **User Onboarding** - Guided setup for new organizations
- **Help & Support** - Comprehensive documentation and resources

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks and concurrent features
- **TypeScript 5.8** - Type-safe development experience
- **Vite 5.4** - Lightning-fast build tool and dev server
- **React Router 6.30** - Declarative client-side routing
- **TanStack Query 5.83** - Powerful data synchronization and caching

### UI/UX
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful, consistent icon set
- **Recharts** - Composable charting library

### Backend & Services
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **React Hook Form** - Performant, flexible form validation
- **Zod** - TypeScript-first schema validation

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite SWC** - Fast React refresh with SWC compiler

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** >= 9.x or **yarn** >= 1.22.x
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Uppalasampath/ProjectZero.git
   cd ProjectZero
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Building

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```
ProjectZero/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── 404.html        # SPA redirect for GitHub Pages
│   └── robots.txt
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # shadcn/ui components
│   │   └── ...
│   ├── contexts/      # React context providers
│   │   └── AuthContext.tsx
│   ├── pages/         # Route components
│   │   ├── Index.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Carbon.tsx
│   │   ├── Compliance.tsx
│   │   └── ...
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD for GitHub Pages
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

---

## 🌐 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"

2. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - Workflow builds and deploys to `gh-pages` branch
   - Live at: `https://uppalasampath.github.io/ProjectZero/`

3. **Manual Deployment**
   - Navigate to Actions tab
   - Select "Deploy to GitHub Pages" workflow
   - Click "Run workflow"

### Other Platforms

<details>
<summary>Deploy to Vercel</summary>

```bash
npm install -g vercel
vercel
```

Update `vite.config.ts`:
```typescript
base: '/', // Remove repository-specific base path
```
</details>

<details>
<summary>Deploy to Netlify</summary>

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Build command: `npm run build`
Publish directory: `dist`
</details>

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - For the excellent component library
- **Radix UI** - For accessible primitives
- **Supabase** - For backend infrastructure
- **Persefoni** - For design inspiration

---

## 📞 Support

For support, please:
- Open an [issue](https://github.com/Uppalasampath/ProjectZero/issues)
- Check existing [documentation](https://github.com/Uppalasampath/ProjectZero/wiki)
- Contact the development team

---

<div align="center">

**Built with ❤️ for a sustainable future**

[⬆ Back to Top](#zero---sustainability-management-platform)

</div>
