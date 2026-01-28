# Software Development Methodologies L3  Oguzhan Simsek 54840
## Astral Bloom – Full-Stack Web Application

This repository contains the implementation of **Astral Bloom**, a full-stack web application developed as part of the **Software Development Methodologies L3** course.

The project demonstrates the application of modern software development practices, including layered architecture, RESTful API design, authentication, database integration, and client–server communication.

---

## 📌 Project Overview

**Astral Bloom** is a web application designed for **same-day flower bouquet delivery in Warsaw**.  
Users can browse a catalog of bouquets, create accounts, place orders, and track delivery status.

The system is implemented as a **client–server architecture**, with a React frontend and a Node.js backend connected to a PostgreSQL database.

---

## 🏗 System Architecture


- Frontend runs on **port 5173**
- Backend API runs on **port 4000**
- Communication is handled via REST endpoints

---

## ✨ Implemented Features

### User Authentication
- User registration and login
- JWT-based authentication
- Protected routes for checkout and orders
- Persistent login across page refreshes

### Catalog Service
- Dynamic bouquet catalog loaded from the database
- Each bouquet includes price, tags, eco option, description, and image
- Same-day delivery focused design

### Cart & Checkout
- Add bouquets to cart and adjust quantities
- Checkout with delivery window selection
- Server-side validation of input data
- Orders are created and stored in the database

### Orders Management
- User-specific order history
- Order status tracking (PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
- Order cancellation allowed only when status is **PREPARING**

### Payment Handling
- Simulated PayU payment method (payment stub)
- Payment authorization recorded as part of the order timeline

### Notifications
- Order updates stored and displayed as a timeline
- Includes payment, preparation, and cancellation events

### Profile Management
- View and update user contact details
- Default delivery address support
- Logout functionality

---

## 🧰 Technologies Used

### Frontend
- React
- Vite
- React Router
- React Query (TanStack)
- React Context API (Authentication, Cart, Notifications)
- Zustand (UI state)
- Custom CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Docker & docker-compose (database)
- PayU payment simulation (stub)

---

## 🚀 How to Run the Project

### Backend Setup
```bash
cd backend
npm install
docker compose up -d
npx prisma migrate dev
npm run seed
npm run dev
