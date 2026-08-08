# FreshBite – Free Hosting & Deployment Guide

This guide provides step-by-step instructions for deploying your **FreshBite** application live on the web for submission (Task ID: WD-EC-001).

---

## 🚀 Option 1: Full-Stack Hosting on Render (Recommended for Node.js Express Backend)

**Render** allows you to host Node.js Express applications completely free.

### Steps:
1. Push your project to a public **GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of FreshBite full-stack app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/freshbite.git
   git push -u origin main
   ```
2. Go to [Render.com](https://render.com/) and sign up for a free account.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository (`freshbite`).
5. Configure deployment settings:
   - **Name**: `freshbite-food-ordering`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click **Create Web Service**.
7. Render will build and launch your site live at a URL like:
   `https://freshbite-food-ordering.onrender.com`

---

## ⚡ Option 2: Static Frontend Hosting on Vercel / Netlify / GitHub Pages

If you wish to deploy the frontend interface quickly without backend hosting:

### A. Vercel (Instant 1-Minute Deployment)
1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New Project** -> Select `freshbite` repository.
3. Click **Deploy**. Vercel will generate your live link:
   `https://freshbite.vercel.app`

### B. Netlify (Drag & Drop Deployment)
1. Go to [Netlify.com](https://www.netlify.com/).
2. Log in and go to **Sites** -> **Add New Site** -> **Deploy Manually**.
3. Drag and drop the `freshbite` project folder directly into the Netlify dashboard.
4. Your site will be live instantly!

### C. GitHub Pages
1. Push your repository to GitHub.
2. In your repository on GitHub, go to **Settings** -> **Pages**.
3. Under **Source**, select `main` branch and `/ (root)` folder.
4. Click **Save**. Your site will be published at:
   `https://YOUR_USERNAME.github.io/freshbite/`

---

## 📝 Submission Requirements Checklist for Data Alcott Internship

1. **GitHub Repository**: Share public repository link.
2. **Live Site URL**: Paste your Render, Vercel, Netlify, or GitHub Pages URL.
3. **Screenshots**: Take screenshots of Home, Menu, Cart, Checkout with Live Credit Card preview, and Order Tracker.
4. **Video Demonstration**: Record a 3-5 min walkthrough video showing menu browsing, adding an item, promo code `FRESH20`, online payment checkout, and live order tracking.
