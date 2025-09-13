# School Payments Dashboard - Full-Stack Application

This is a full-stack web application featuring a NestJS backend and a React frontend, designed to manage school payment transactions. The project was built as a skills assessment and is deployed live.

**Live Demo:** [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app)  *(You will get this link in Step 3)*

---

## Features

- **Secure User Authentication:** JWT-based login and signup system.
- **Transaction Dashboard:** View all transactions with real-time search, filtering by status, and column sorting.
- **Persistent State:** All filters and sorting options are stored in the URL for shareable links.
- **Payment Creation:** API endpoint to integrate with a payment gateway and generate payment links.
- **Webhook Integration:** Backend endpoint to receive and process status updates from the payment gateway.
- **Detailed Views:** Separate pages to view transactions by school and check the status of a specific order.
- **Impressive UI:** A modern, responsive interface built with React and Tailwind CSS, featuring professional hover effects.

---

## Tech Stack

- **Backend:** Node.js, NestJS, MongoDB (with Mongoose), JWT, Passport.js
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, React Router
- **Deployment:** Render (Backend), Vercel (Frontend)
- **Monorepo Management:** `concurrently`

---

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/school-payment-app.git](https://github.com/your-username/school-payment-app.git)
    cd school-payment-app
    ```

2.  **Set up the Backend:**
    - Navigate to the backend folder: `cd school-payment-backend`
    - Create a `.env` file and populate it with the necessary variables (MONGO_URI, JWT_SECRET, etc.).
    - Install dependencies: `npm install`

3.  **Set up the Frontend:**
    - Navigate to the frontend folder: `cd ../school-payment-frontend`
    - Install dependencies: `npm install`

4.  **Run Both Servers Concurrently:**
    - Go back to the root folder: `cd ..`
    - Install root dependencies: `npm install`
    - Start both servers: `npm run dev`

5.  The frontend will be available at `http://localhost:5173`.

---

## Test Credentials

To log in to the live demo, you can use the following test account:
- **Email:** `testuser@example.com`
- **Password:** `password123`
