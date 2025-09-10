# AlurAI - AI-Powered Form Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange)](https://firebase.google.com/)

AlurAI is an innovative AI-powered form builder that creates smart conversational forms using artificial intelligence. Transform traditional static forms into engaging, chat-like experiences that feel natural and intuitive for users.

## 🚀 Features

### Core Functionality
- **🤖 AI Form Generator**: Create conversational form flows instantly from natural language descriptions
- **✏️ Visual Form Editor**: Manually edit and refine AI-generated forms with an intuitive visual interface
- **💬 Conversational UI**: Chat-based interface that makes form filling feel like a natural conversation
- **📊 Intelligent Data Parsing**: Upload files or paste data to automatically populate form fields
- **📈 Real-time Progress**: Visual progress indicators to guide users through the form journey
- **🔧 Flow Optimization**: AI-powered suggestions to improve form conversion and user experience

### Advanced Features
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **🎨 Custom Branding**: Personalize forms with your brand colors, logos, and styling
- **📊 Deep Analytics**: Comprehensive insights into form performance and user behavior
- **🔗 Custom URLs**: Create branded, memorable URLs for your forms
- **📤 Export Options**: Export form data to Excel, CSV, and other formats
- **🔒 Secure & Private**: Enterprise-grade security with data encryption

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.3, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **AI/ML**: Google Genkit, Gemini AI
- **Backend**: Stack Auth (Authentication), Vercel (Hosting), Firebase (Firestore Database)
- **File Storage**: MinIO
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun
- Firebase project
- Google AI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alur-ai.git
   cd alur-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration (Database only)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Stack Auth Configuration
   STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_client_key
   STACK_SECRET_SERVER_KEY=your_stack_server_key

   # Google AI Configuration
   GOOGLE_GENAI_API_KEY=your_gemini_api_key

   # MinIO Configuration (optional)
   MINIO_ENDPOINT=your_minio_endpoint
   MINIO_ACCESS_KEY=your_access_key
   MINIO_SECRET_KEY=your_secret_key

   # Creem Payment Gateway Configuration
   CREEM_API_KEY=your_creem_api_key
   CREEM_BASE_URL=https://api.creem.io/v1
   CREEM_PRO_PRODUCT_ID=your_creem_pro_product_id
   CREEM_WEBHOOK_SECRET=your_creem_webhook_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:9003
   ```

4. **Setup Services**
   
   **Firebase Setup (Database only):**
   - Create a new Firebase project
   - Enable Firestore Database
   - Update Firebase configuration in your `.env.local`
   
   **Stack Auth Setup (Authentication):**
   - Create a Stack Auth project at [stack-auth.com](https://stack-auth.com)
   - Configure authentication providers
   - Update Stack Auth configuration in your `.env.local`
   
   **Creem Setup (Payment Gateway):**
   - Create a Creem account at [creem.io](https://creem.io)
   - Create products for your subscription plans
   - Get your API key and product IDs
   - Update Creem configuration in your `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:9003](http://localhost:9003)

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign up/login
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Environment Variables**
   Add the following environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_client_key
   STACK_SECRET_SERVER_KEY=your_stack_server_key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   MINIO_ENDPOINT=your_minio_endpoint
   MINIO_ACCESS_KEY=your_access_key
   MINIO_SECRET_KEY=your_secret_key
   ```

3. **Deploy**
   - Click "Deploy" and Vercel will build and deploy your application
   - Your app will be available at `https://your-project.vercel.app`

## 🎯 Usage

### Creating Your First Form

1. **Sign up/Login** to your AlurAI account
2. **Describe your form** in natural language (e.g., "Create a customer feedback form with rating and comments")
3. **Review the AI-generated form** and make any necessary adjustments
4. **Customize the design** to match your brand
5. **Share your form** using the generated URL
6. **Monitor responses** in real-time through the analytics dashboard

### Form Types
- Customer feedback surveys
- Lead generation forms
- Event registration
- Job applications
- Product orders
- Contact forms
- And much more!

## 🏗️ Project Structure

```
src/
├── ai/                 # AI/ML logic and Genkit configuration
├── app/                # Next.js app router pages
│   ├── admin/         # Admin dashboard
│   ├── api/           # API routes
│   ├── form/          # Form display and submission
│   └── ...
├── components/         # Reusable React components
│   ├── ui/            # UI components (buttons, inputs, etc.)
│   └── ...
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
└── ...
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow the existing component structure
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Stack Auth](https://stack-auth.com/) for modern authentication solutions
- [Vercel](https://vercel.com/) for seamless deployment and hosting
- [Firebase](https://firebase.google.com/) for Firestore database
- [Google AI](https://ai.google.dev/) for powerful AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@alurai.com
- 💬 Discord: [Join our community](https://discord.gg/alurai)
- 📖 Documentation: [docs.alurai.com](https://docs.alurai.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/alur-ai/issues)

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced form logic and branching
- [ ] Integration with popular CRM systems
- [ ] White-label solutions
- [ ] Mobile app
- [ ] Advanced analytics and reporting

---

**Made with ❤️ by the AlurAI Team**
