# FreshBite – Full-Stack Food Ordering Platform
### Project Submission & Build Documentation (Task ID: WD-EC-001)

**Developer Internship:** Data Alcott Systems – Free Web Development Internship (Online)  
**Domain:** E-Commerce → Food & Restaurant  
**Architecture:** Full-Stack Node.js & Express Web Application + REST API  

---

## 🍊 Project Overview

**FreshBite** is a modern online food ordering web application built with **HTML5, CSS3, Vanilla JavaScript, and a Node.js Express REST API backend**. It provides real-time food menu filtering, cart operations, promo code processing, checkout simulation, live order tracking, and user profile management.

---

## ⚙️ Backend REST API Endpoints

The Express server (`server.js`) handles static page delivery and provides the following REST API routes under `/api/`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/food` | Returns list of food items. Supports query parameters `category`, `diet`, `search`, and `sort`. |
| `GET` | `/api/food/:id` | Returns details for a specific food item including ingredients & nutrition facts. |
| `GET` | `/api/restaurants` | Returns partner restaurants list with ratings, delivery fees, and cuisine types. |
| `POST` | `/api/coupons/apply` | Validates promo codes (`FRESH20`, `FRESHFREE`, `WELCOME10`). |
| `POST` | `/api/orders` | Submits a new delivery order, calculates tax/fees, and stores order record. |
| `GET` | `/api/orders/:id` | Fetches live order status for the interactive order tracker. |
| `POST` | `/api/auth/login` | User authentication simulation endpoint. |

---

## ✨ Features Summary

- **Hero & Promo Cards**: Interactive search, live stats counter, promo code highlights (`FRESH20` & `FRESHFREE`).
- **Partner Restaurant Grid**: Filtered kitchen listings with cuisine badges and rating indicators.
- **Dynamic Food Menu**: Categorized food grid with live search, price/rating sorting, and dietary filters (**Veg 🌱**, **Non-Veg 🍖**, **Vegan 🌿**, **Gluten-Free 🌾**).
- **Product Detail Modal**: Ingredient pills, complete nutritional facts (Calories, Protein, Carbs, Fats), and instant Add-to-Cart CTA.
- **Shopping Cart & Smooth Navigation**: Interactive `#cart` section with quantity controls, item removal, live tax & fee calculations, and coupon code support.
- **Multi-Step Checkout**: Delivery address form, delivery schedule toggle, payment method selector, and order review.
- **Live Order Tracker Modal**: Animated order status stepper (Order Placed -> Kitchen Preparing -> Out for Delivery -> Delivered) with progress bar and delivery timer countdown.
- **User Account Dashboard**: Profile details, past order history with "Reorder" action, saved addresses, and wishlist.

---

## 📁 File Structure

```
freshbite/
├── package.json         # Node.js dependencies (express, cors) & start script
├── server.js            # Express web server & REST API endpoints
├── index.html           # Main SPA HTML structure
├── style.css            # Custom CSS system, grid layouts, animations & themes
├── script.js             # Client REST API fetch handlers & UI state controller
├── README.md            # Project documentation & setup instructions
└── assets/
    └── images/          # High-resolution food photography
        ├── hero_banner.png
        ├── margherita_pizza.png
        ├── chicken_burger.png
        ├── sushi_platter.png
        ├── butter_chicken.png
        ├── buddha_bowl.png
        └── chocolate_lava.png
```

---

## 🚀 How to Run locally

1. Open terminal in the project directory `C:\Users\lenovo\.gemini\antigravity-ide\scratch\freshbite`.
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Express backend server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🌐 Deployment & Live Hosting

For complete step-by-step instructions on deploying FreshBite live for your internship submission, view the [HOSTING.md](file:///C:/Users/lenovo/.gemini/antigravity-ide/scratch/freshbite/HOSTING.md) guide.

- **Full-Stack (Render / Railway)**: Deploys `node server.js` on free tier.
- **Frontend (Vercel / Netlify / GitHub Pages)**: 1-click instant deployment.
