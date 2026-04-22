<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=00D9FF&center=true&vCenter=true&width=700&lines=UniTrade+Platform;Campus+Marketplace+System;AI+Powered+%7C+Real-Time+%7C+Scalable" alt="Typing SVG" />

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-000000?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## 📌 Overview

**UniTrade** is a full-stack campus marketplace platform designed to enable students to **buy, sell, and donate items within a closed community**.

Unlike generic marketplaces, UniTrade focuses on:
- **Trust (campus-restricted users)**
- **Relevance (student-specific listings)**
- **Smart decision-making (AI-powered features)**


Client → React Frontend → Express API → Controllers → Services → MongoDB
↘ Socket.IO (Real-time Chat)


---

## 🚧 Project Status

> ⚠️ **This project is actively under development**

Planned / in-progress improvements:
- Advanced **rate limiting** for API protection  
- Enhanced **search & filtering system**  
- Improved **recommendation engine**  
- Performance optimizations & scaling  

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Marketplace System** | Create, update, and browse listings |
| 🎁 **Donation Support** | Users can list items as donations |
| 🤖 **AI Tagging** | Automatic tag generation for better discovery |
| 💰 **Fair Price Estimation** | AI-assisted pricing suggestions |
| 🎯 **Recommendation Engine** | Personalized item suggestions |
| 💬 **Real-Time Chat** | Buyer-seller messaging via Socket.IO |
| 🖼️ **Image Uploads** | Cloud-based media storage using Cloudinary |
| 🔐 **JWT Authentication** | Secure login & protected routes |
| 📧 **Email Integration** | Notifications & communication support |

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Context API (State Management)
- Protected Routing

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose

### **Real-Time**
- Socket.IO

### **AI Modules**
- Auto Tagging Engine
- Fair Price Prediction
- Recommendation Engine

### **Media Handling**
- Cloudinary (Image Upload & CDN)

### **Security**
- JWT Authentication
- Middleware-based route protection

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/UniTrade
cd UniTrade
2. Install dependencies
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
3. Configure environment variables
Backend .env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
4. Run the application
# Backend
npm run dev

# Frontend
npm run dev
📡 Core Modules
🔐 Authentication
Register / Login
JWT-based authorization
🛒 Listings
Create / Edit / Delete items
Image upload support
AI-assisted tagging
💬 Chat System
Real-time messaging
Persistent conversations
🤖 AI Engine
Tag generation
Price estimation
Recommendation system
🗂️ Project Structure
UniTrade/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── engines/          # AI logic
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── context/
│
├── .env
└── package.json
🌟 Key Highlights
Combines AI + real-time systems + full-stack architecture
Designed for real-world campus usage
Modular and scalable backend structure
Uses production-grade services like Cloudinary
👤 Author

Dushyant Yadav
B.Tech CSE (AI & Data Science)



🚀 Building something meaningful for campus communities
