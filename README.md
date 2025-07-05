# Getting Started

Follow these steps to get the project up and running on your local machine.

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

---

## 2. Server Setup (NestJS)

Navigate to the server directory, install dependencies, and set up the environment.

```bash
cd server
npm install # or yarn install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# server/.env

PORT=3001 # Or any desired port for the server
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
JWT_ACCESS_TOKEN_SECRET=<your-access-token-secret>
JWT_ACCESS_TOKEN_EXPIRATION_TIME=1h
JWT_REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d
```

> 🔒 **Note:**
>
> - `DATABASE_URL`: Configure this with your PostgreSQL connection string.
> - `JWT_*_SECRET`: Use strong, secure, and unique secrets.

### Database Migration

Run Prisma migrations to initialize the database schema:

```bash
npx prisma migrate dev --name init
```

---

## 3. Client Setup (Next.js)

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install # or yarn install
```

### Environment Variables

Create a `.env.local` file in the `client/`:

```env
# client/.env.local

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_BASE_URL=http://localhost:3001
```

> 🔧 **Explanation:**
>
> - `NEXT_PUBLIC_API_BASE_URL`: Base URL for the NestJS API.
> - `NEXT_PUBLIC_WS_BASE_URL`: Base URL for WebSocket (Socket.IO) connection.

---

## 4. Running the Application

You can now start both the client and server concurrently.

### Start Backend Server

From the `server/` directory:

```bash
npm run start:dev # or yarn start:dev
```

The server should be running at:  
📍 `http://localhost:3001`

### Start Frontend Client

From the `client/` directory:

```bash
npm run dev # or yarn dev
```

The client should be available at:  
🌐 `http://localhost:3000`

---

## 🎉 You're All Set!

Open your browser and visit [http://localhost:3000](http://localhost:3000) to access the application.
