# Stella Mobiles Website - Requirements & Implementation Plan

Based on the handwritten notes provided, here is the complete requirements document and a phase-wise implementation plan for the Stella Mobiles E-commerce Website.

## 1. Project Overview & Tech Stack
**Project Name:** Stella Mobiles
**Target Audience:** Customers looking to purchase mobiles and gadgets, and potential franchisees.
**Environments:** The application must be configurable for both `localhost` and a production domain.

**Tech Stack Requirements:**
*   **Frontend:** Vue.js (specifically supporting parallel/parallax scroll effects) with **Tailwind CSS** for layout and **Custom Modern CSS** for high-end neon/glow effects.
*   **Backend:** Node.js + Express
*   **Database:** PostgreSQL
*   **Design & Branding:** Strict premium dark mode palette consisting of Deep Black (backgrounds), Dark Charcoal Grey (cards/structure), and Crisp White (text). The primary accent color is a prominent, clean Matte Red (used for the Stella 'T', primary buttons, and highlights). The secondary accent color is a luxurious Gold/Warm Amber (used sparingly for premium badges, star ratings, and special deals). **Absolutely no blue or cyan.** All styling will be implemented using Tailwind's utility-first approach combined with sleek, non-jarring modern CSS for a premium, high-end feel.

## 2. Detailed Requirements

### 2.1. Customer-Facing Pages

**Homepage:**
*   Parallax/Parallel scroll effects for Banner images.
*   Mobile brands logos and icons for different categories (mobiles, gadgets).
*   "Deals of the Day" section showcasing special offers on mobiles and gadgets. Supports both manual admin selection and automated timer-based logic.
*   Franchisee details section including an option to "Download Brochure" and a link to view detailed franchisee information.
*   About section providing an overview of the company.
*   Branches section listing locations and phone numbers.
*   Customer Reviews section specifically about the shop/store.
*   Footer with necessary notes and links.

**Product Listing Page (Mobiles & Gadgets):**
*   Grid layout displaying 3 products per row.
*   Product cards should display: Photo, Name, Price, and Star Rating.
*   Functional features: Filters, Sorting options, and Search bar.

**Product Detail Page:**
*   Layout: Product Image on the left; Product details on the right.
*   Right Section: Product Name, Product Details description, Quantity selector (`- 1 +`), "Buy" button, and "Add to cart" button.
*   Bottom Section: Detailed specifications (`Specs`).
*   Customer Reviews specifically about the product.

### 2.2. Cart & Checkout Flow
*   **Checkout Page:** Collect required user details and address. Crucially, provide an option for the customer to choose between "Delivery to Address" OR "Visit nearby store and buy" (Store Pickup).
*   **Payment Page:** The system will support multiple payment flows: **Razorpay** (for automated online payments), **Custom UPI QR Code** (for 0% fee direct bank transfers with manual admin UTR verification), and **Pay at Store** (for store pickups).
*   **Confirmation Page:** Display order success and summary.

### 2.3. User Authentication & Account
*   **Login:** Strictly mobile number login using OTP verification via **Twilio**. Must include Terms & Conditions regarding accessing customer details.
*   **Account Page:**
    *   View and edit customer details.
    *   View Order History.
    *   View Payment History.

### 2.4. Admin Panel
*   **Sales Dashboard:** Overview of sales metrics.
*   **Content Management:** Homepage editing capabilities (updating banners, deals, etc.).
*   **Inventory/Product Management:** Add, edit, and delete products. Must include a **Low Stock Warning** system.
*   **Customer Management:** View all customers, including their names, phone numbers, complete order history, and payment history.

---

## 3. Phase-wise Implementation Plan

### Phase 1: Project Setup & Database Architecture
*   Initialize Vue.js frontend project with necessary routing and state management (e.g., Vuex/Pinia).
*   Initialize Node.js + Express backend project.
*   Set up PostgreSQL database and establish connection.
*   Design database schema (Tables: Users, Products, Categories, Orders, OrderItems, Reviews, Branches).
*   Configure environment variables (`.env`) to easily switch between `localhost` and the production domain.

### Phase 2: Core Backend API & Admin Foundation
*   Develop RESTful APIs for Products, Categories, and Branches.
*   Implement secure Admin authentication.
*   Build the Admin Dashboard frontend:
    *   Product management module (CRUD operations).
    *   Implement backend logic for the "Low Stock Warning".
    *   Customer data viewer module.

### Phase 3: Frontend Development - Public Pages
*   **Homepage:** Implement the UI with parallax scrolling for banners. Integrate dynamic sections (Deals, Brands, Branches, Reviews) fetching data from the backend APIs.
*   **Product Listing:** Build the 3-column grid layout. Implement client-side or server-side filtering, sorting, and search logic.
*   **Product Detail:** Build the layout with the image gallery, specifications, and integrate the product-specific review system.

### Phase 4: User Authentication & Customer Profile
*   Integrate **Twilio** OTP service in the backend.
*   Build the frontend OTP login flow, ensuring the T&C acceptance checkbox is mandatory.
*   Develop the Customer Account dashboard allowing users to update profile information and fetch their specific order/payment history.

### Phase 5: Cart, Checkout & Order Processing
*   Implement Cart state management in Vue.js (adding, removing, quantity adjustments).
*   Build the multi-step checkout UI:
    *   Address/Delivery Selection (Delivery vs. Store Pickup).
    *   **Razorpay** integration for online payments, plus offline options/QR generation.
    *   Order Confirmation screen.
*   Implement backend order creation, payment validation, and inventory deduction logic.

### Phase 6: Admin Extensions & Final Polish
*   Implement the Homepage editing capabilities in the Admin Panel (CMS features), including Deals of the Day manual/automated toggle.
*   Implement the Admin Sales Dashboard with visual metrics.
*   Conduct comprehensive E2E, API, and UI/UX testing across mobile and desktop views.
*   Finalize production deployment configurations (e.g., PM2 for Node, Nginx/Vercel/Netlify for Vue.js, DB hosting).

### Phase 7: Franchisee Portal
*   Build the Franchisee details section (Overview & Brochure download).
*   Implement Franchisee lead capture or management portal if required.

---

> [!NOTE]
> All initial questions regarding OTP (Twilio), Payments (Razorpay & Offline/QR), and Design Palette have been resolved. The plan is now finalized and ready for execution.
