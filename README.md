# 🎉 UtsavAI - AI-Powered Event Planning Platform

An intelligent event planning platform that helps Indian parents plan perfect birthday celebrations with AI-matched vendors.

## ✨ Features

- 🤖 **AI-Powered Vendor Matching** - Smart algorithm matches customers with best vendors
- 📝 **Simple Requirements Form** - Easy-to-use planning interface
- 🎨 **Event Gallery** - Showcase real event photos and decorations
- ⭐ **Client Testimonials** - Video and text reviews from happy customers
- 🤝 **Trusted Partners** - Curated network of verified vendors
- 🔒 **Secure Admin Panel** - Protected dashboard for managing everything
- 📊 **Analytics Dashboard** - Track requests, bookings, and performance

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/utsavai.git
cd utsavai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your credentials
# - Supabase URL and API key
# - Admin email and password
# - Admin secret key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Copy your project URL and anon key

### 2. Run SQL Migrations
Run these SQL files in Supabase SQL Editor (in order):
1. `ADD_GALLERY_AND_TESTIMONIALS.sql` - Gallery and testimonials tables
2. `ADD_TRUSTED_PARTNERS_TABLE.sql` - Trusted partners table
3. `ADD_VENDOR_OPTIONS_COLUMN.sql` - Enhanced vendor suggestions

### 3. Configure Environment Variables
Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🔐 Admin Access

### Login
- URL: `http://localhost:3000/admin/login`
- Default credentials are in `.env.local`
- Change credentials before going to production!

### Admin Features
- Dashboard with analytics
- Manage vendors and partners
- View customer requests
- Manage event gallery
- Manage testimonials
- View bookings and orders

## 📁 Project Structure

```
utsavai/
├── src/
│   ├── app/
│   │   ├── admin/          # Admin panel
│   │   ├── api/            # API routes
│   │   ├── about/          # About page
│   │   ├── contact/        # Contact page
│   │   ├── careers/        # Careers page
│   │   ├── blog/           # Blog page
│   │   └── plan/           # Planning form
│   ├── components/         # React components
│   └── lib/                # Utilities
├── public/                 # Static files
├── .env.example            # Environment template
└── *.sql                   # Database migrations
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Custom secure auth
- **Deployment**: Vercel (recommended)

## 📝 Environment Variables

Required variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password
- `ADMIN_SECRET` - Secret key for token generation

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables in Vercel
Add all variables from `.env.local` to Vercel:
- Go to Project Settings → Environment Variables
- Add each variable
- Redeploy

## 🔒 Security

- ✅ Passwords are hashed (SHA-256)
- ✅ Rate limiting on login attempts
- ✅ Session token authentication
- ✅ Protected admin routes
- ✅ Environment variables for secrets
- ✅ `.env.local` excluded from git

**Never commit `.env.local` to git!**

## 📚 Documentation

- `GITHUB_PUSH_GUIDE.md` - How to safely push to GitHub
- `ADMIN_SECURITY_SETUP.md` - Admin authentication details
- `SIMPLIFIED_FLOW_SUMMARY.md` - Customer flow documentation
- `TRUSTED_PARTNERS_SETUP.md` - Partners system setup
- `COMPLETE_SETUP_SUMMARY.md` - Gallery & testimonials setup

## 🧪 Testing

### Run Verification Script
```bash
./verify-security.sh
```

This checks:
- `.gitignore` configuration
- Environment files
- Hardcoded credentials
- Git tracking status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Private project - All rights reserved

## 📞 Support

For issues or questions:
- Email: support@utsavai.com
- Create an issue on GitHub

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Change default admin password** - Before going to production
3. **Run SQL migrations** - Required for database setup
4. **Use HTTPS in production** - For secure authentication
5. **Backup your database** - Regularly backup Supabase data

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Multi-city support
- [ ] Mobile app
- [ ] Vendor mobile app
- [ ] Real-time booking updates
- [ ] Advanced analytics

---

Made with ❤️ for Indian families
