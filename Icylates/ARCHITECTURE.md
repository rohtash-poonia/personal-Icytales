# IcyTales Production Architecture

## Overview

This repository is now structured as a hybrid monorepo with:

- `backend/` - Node.js + Express + MongoDB backend API
- `src/` - Next.js frontend with the existing user site plus a new admin panel

## Folder Structure

backend/

- `server.js` - Express entry point
- `config/db.js` - MongoDB connection helper
- `middleware/` - Authentication and error handling
- `models/` - Mongoose schema definitions for Users, Products, Orders, Payments
- `controllers/` - Business logic for auth, users, products, orders
- `routes/` - API route endpoints
- `.env.example` - Environment variable template

src/app/admin/

- `layout.js` - Admin panel layout wrapper
- `page.js` - Admin dashboard home
- `users/page.js` - Admin user management page
- `products/page.js` - Admin product management page
- `orders/page.js` - Admin orders page

src/components/admin/

- `AdminSidebar.jsx`
- `AdminHeader.jsx`
- `AdminMetricCard.jsx`
- `AdminRevenueChart.jsx`
- `AdminTable.jsx`

## Backend API Design

Auth routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

User routes:

- `GET /api/users`
- `DELETE /api/users/:id`
- `PUT /api/users/:id/block`

Product routes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `POST /api/products/upload`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Order routes:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:userId`
- `PUT /api/orders/:id/status`

## Production Considerations

- JWT token is stored in an HTTP-only cookie
- Admin routes are protected with a dedicated `admin` middleware
- MongoDB indexes are applied for user email, product slug/category, and order lookup
- Cloudinary upload support is scaffolded via `backend/utils/cloudinary.js`

## Deployment

Frontend recommendation:

- Vercel for the Next.js app

Backend recommendation:

- Render / Railway for the Express API
- Set environment variables from `backend/.env.example`

## Missing features identified in current project

- No backend or database integration
- No authentication / role-based authorization
- No admin panel or protected admin route structure
- No product CRUD APIs or order APIs
- No payment or order tracking persistence
- No Cloudinary image upload integration
- No analytics dashboard or charts
- No user management and block/delete workflows
- No separate scalable folders for controllers, routes, models, middleware

## Next steps

1. Install backend dependencies in `backend/`
2. Configure `.env` from `backend/.env.example`
3. Start backend via `npm run dev` in `backend/`
4. Extend admin pages to fetch from the new API
5. Add auth pages and secure the user checkout flow
