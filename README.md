# AwSales 2.0 - Beta 01

A modern, beautiful dashboard application with pixel-perfect Figma implementation and full authentication flow.

## Features

- 🎨 **Pixel-perfect Figma implementation** - Sidebar and components match the original design exactly
- 📱 **Collapsible Sidebar** - Smooth transition between expanded (280px) and collapsed (80px) states
- ✅ **Form validation** - Using react-hook-form and Zod for robust validation
- 🚀 **Next.js 16** - Built with the latest Next.js App Router
- 💎 **TypeScript** - Full type safety throughout the application
- 🎯 **Tailwind CSS** - Modern utility-first CSS framework
- 📱 **Responsive Design** - Works beautifully on all screen sizes
- 🔄 **Loading states** - Smooth UX with loading indicators
- 🎭 **Custom components** - Reusable Input, Button, Logo, and layout components
- 🌑 **Dark Sidebar** - Modern dark theme with `#0d0d0d` background
- 📊 **Dashboard** - Complete dashboard with KPIs and charts
- 💾 **Memory Base** - Full memory base management system

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd "Beta_01"
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
Beta_01/
├── app/                          # Next.js App Router
│   ├── agent-studio/            # Agent Studio pages (Coming Soon)
│   ├── aops/                    # AOPs pages (Coming Soon)
│   ├── approvals/               # Approvals pages (Coming Soon)
│   ├── conversations/           # Conversations pages (Coming Soon)
│   ├── dashboard/               # Dashboard page (Active)
│   ├── history/                 # History pages (Coming Soon)
│   ├── insights/                # Insights pages (Coming Soon)
│   ├── integrations/            # Integrations pages (Coming Soon)
│   ├── library/                 # Library pages (Coming Soon)
│   ├── memory-base/             # Memory Base pages (Active)
│   ├── playground/              # Playground pages (Coming Soon)
│   ├── settings/                # Settings pages (Coming Soon)
│   ├── tools/                   # Tools pages (Coming Soon)
│   ├── triggers/                # Triggers pages (Coming Soon)
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home/Login page
├── components/                   # React components
│   ├── forms/                   # Form components (Checkbox, DatePicker, etc.)
│   ├── modals/                  # Modal components
│   ├── notifications/           # Toast notifications
│   ├── tables/                  # Data table components
│   ├── Button.tsx               # Reusable button component
│   ├── ComingSoon.tsx           # Coming soon animated component
│   ├── DashboardLayout.tsx      # Layout for dashboard pages
│   ├── Header.tsx               # Header component
│   ├── Input.tsx                # Form input component with validation
│   ├── KPICard.tsx              # KPI card component
│   ├── LoginForm.tsx            # Main login form with validation logic
│   ├── Logo.tsx                 # AwSales logo component
│   ├── Sidebar.tsx              # Collapsible sidebar from Figma
│   └── ...                      # Other components
├── lib/                         # Utilities and helpers
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   └── validations.ts           # Zod schemas for form validation
├── public/                      # Static assets
│   └── assets/                  # Images and SVGs from Figma
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Technologies Used

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Form Management:** React Hook Form
- **Validation:** Zod
- **Fonts:** Roboto, Instrument Sans

## Design System

The application follows the design specifications from the Figma file:

- **Colors:**
  - Primary: `#252b33`
  - Primary Dark: `#162d3a`
  - Text Primary: `#0c1421`
  - Text Secondary: `#8897ad`
  - Input Background: `#f7fbff`
  - Input Border: `#d4d7e3`

- **Typography:**
  - Heading: Instrument Sans
  - Body: Roboto

## Features in Detail

### Form Validation

The login form includes:
- Email validation (required, must be valid email format)
- Real-time error messages
- Visual feedback for invalid inputs

### Navigation

- Home (`/`) - Login page (no sidebar)
- Dashboard (`/dashboard`) - Dashboard with KPIs and charts (Active)
- Memory Base (`/memory-base`) - Memory base management (Active)
- Other pages - Coming soon with animated placeholder

### Active Pages

Only **Dashboard** and **Memory Base** have full functionality. All other pages display a "Coming Soon" animated placeholder with geometric shapes in grayscale tones.

### Loading States

The submit button shows a loading spinner during form submission to provide visual feedback.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

ISC
