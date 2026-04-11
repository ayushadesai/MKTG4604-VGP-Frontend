
  # Surplus Connect

Simple, direct matching that connects organizations with excess inventory to those who need it. No complex algorithms—just straightforward connections that create real impact.

## Features

- **Smart Text Input**: Describe what you have or need naturally, and the system extracts the key details automatically
- **Dual Interface**: 
  - **I Have Surplus**: For organizations with excess inventory
  - **I'm Looking**: For nonprofits, resellers, and organizations seeking items
- **Auto-Save Form Data**: Your information is saved locally—return anytime and pick up where you left off
- **Real-time Matching**: Instant results based on inventory type, location, and organizational needs
- **Professional UI**: Clean, intuitive interface with vibrant, accessible design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Routing**: React Router v7
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### I Have Surplus
1. Select "I Have Surplus" tab
2. Enter your organization name
3. Describe what you have available (quantity, item type)
4. Add your location
5. Click "Find Matches" to see organizations that can use your items

### I'm Looking
1. Select "I'm Looking" tab
2. Enter your organization name
3. Describe what you need
4. Add your location
5. Click "Find Available" to see organizations with surplus

## Auto-Save Feature

Form data is automatically saved to your browser's local storage. When you return, your previous information will be pre-filled—no need to re-enter everything.

## Demo Data

The application includes sample organizations and inventory for demonstration purposes.
  