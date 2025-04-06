# BlahBlah-Notes

An AI-Based Notes Taking application built with Next.js, React, and Google's Gemini AI.

## Features

- Create, edit, and delete notes
- Rich text editing with formatting options
- AI-powered note analysis and assistance
- Dark/light mode support
- Responsive design
- User authentication

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blahblah-notes.git
cd blahblah-notes
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Setup

This project uses Prisma with a PostgreSQL database. To set up the database:

```bash
npm run migrate
# or
yarn migrate
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Prisma](https://www.prisma.io/) - ORM for database access
- [Supabase](https://supabase.io/) - Authentication and database
- [Google Gemini AI](https://ai.google.dev/) - AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

## License

This project is licensed under the MIT License - see the LICENSE file for details.
