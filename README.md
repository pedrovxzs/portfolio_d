# Vibecodado - Portfolio Website

A modern, fully-featured portfolio website built with **Figma AI** for design foundation and **Claude Haiku 4.5** for intelligent development.

## 🎨 Project Overview

**Vibecodado** is a professional portfolio website designed for artists, designers, and creatives. It features responsive design, admin panel, and stunning gallery with smooth interactions.

### Original Design
- **Design**: [Portfolio on Figma](https://www.figma.com/design/JfBtx73HGLEl199ENAZIwx/Portfolio-website-design)

---

## ✨ Features

### Public Features
- 🎨 Dynamic Portfolio Gallery with responsive grid
- 🖼️ Media Support (images, videos, audio)
- 🔍 Category filtering system
- 📱 Fully responsive design
- ⌨️ Keyboard navigation (arrow keys, ESC)
- 🎯 Click-to-fullscreen viewing
- 🌙 Modern UI with smooth animations
- 📞 Contact & About sections

### Admin Features
- 🔐 Secure password-protected panel
- ➕ Add images/videos/audio easily
- ✏️ Edit project metadata (title, description, category, technologies)
- 🗑️ Delete management
- ☁️ Cloud persistence in Postgres (Neon via Vercel integration)
- 🎯 Category organization
- 📝 Item metadata (title, description, tags/technologies)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- npm or pnpm

### Installation & Running

```bash
# Install dependencies
npm i

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 🔐 Admin Panel

### Local Access
1. Go to `http://localhost:5173/admin/login`
2. Password is set in `.env.local`
3. Click the lock icon (🔒) in header to access

### Add Items
1. Click "Adicionar Item"
2. Fill Title, Category, Description, and Technologies
3. Select Media Type (Image, Video, or Audio)
4. Upload media file to Vercel Blob (URL is filled automatically)
5. Click "Adicionar Item"

### Change Password
Edit `.env.local`:
```
VITE_ADMIN_PASSWORD=your_new_secure_password
```

Restart dev server to apply.

---

## 🛠️ Technology Stack

- **React** 18.3.1 - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** 4.1.12 - Styling
- **Vite** 6.3.5 - Build tool
- **React Router** 7.13.0 - Navigation
- **Radix UI** - Components
- **Lucide React** - Icons

---

## 📄 License

Available for personal and commercial use.

---

**Made with ❤️ for showcasing creative work**
