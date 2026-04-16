# Enneagram Quiz & Notion Sharing

A modern web application built with Next.js that hosts an Enneagram personality assessment and allows users to share their results directly to a Notion database.

## 🚀 Features
- **Personality Assessment**: Comprehensive 200+ question quiz (randomized per session).
- **Result Sharing**: One-click sharing of personality types and scores to Notion.
- **Admin Dashboard**: Secure interface to manage questions and system settings.
- **Responsive Design**: Mobile-friendly interface optimized for different screen sizes.
- **Data Privacy**: Local database (Prisma/SQLite) for fast results and minimal dependencies.

## 🛠️ Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Notion Internal Integration Token](https://www.notion.so/my-integrations)
- A Notion Database ID

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/drummerweed/enneagram-quiz.git
    cd enneagram-quiz
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Create a `.env` file in the root directory (copy from `.env.example`).
    - Add your `DATABASE_URL`, `NOTION_TOKEN`, and `NOTION_DATABASE_ID`.
4.  Initialize the database:
    ```bash
    npx prisma migrate dev
    npm run seed
    ```

### Running the App
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🐳 Docker Deployment
You can also run this application using Docker:
```bash
docker-compose up -d
```

## 📄 License
MIT
