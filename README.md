# Split Yourself Into Stems 🧠❤️😈

A unique AI-powered debate platform where your inner voices (Heart, Logic, and Shadow) engage in meaningful discussions about life's dilemmas. Experience your thoughts come to life through animated avatars and natural text-to-speech voices.

## ✨ Features

### 🎭 Three Distinct Personas
- **Heart** ❤️ - Empathetic, emotional, and caring perspective
- **Logic** 🧠 - Analytical, rational, and systematic thinking  
- **Shadow** 😈 - Intuitive, mysterious, and deeper insights

### 🎬 Immersive Experience
- **Animated Avatars** - Each persona has unique 8-frame animations
- **Natural TTS Voices** - OpenAI-powered text-to-speech with distinct feminine voices
- **Perfect Synchronization** - Audio, animation, and transcript appear in perfect sync
- **Real-time Debate** - 10-11 messages of back-and-forth conversation

### 🎛️ Interactive Controls
- **Participation Bars** - Adjust how much each persona contributes (0-100%)
- **Global Mute/Unmute** - Control audio playback
- **Synthesize Wisdom** - Get AI-generated insights after each debate

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended) or Node.js 16+ with polyfills
- npm or pnpm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kalkidantw/split-yourself-stems.git
   cd split-yourself-stems
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   ```
   
   Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start backend (port 3001)
   cd backend
   npm start
   
   # Terminal 2: Start frontend (port 3000)
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### 1. Submit Your Dilemma
- Enter any life question, decision, or dilemma you're facing
- Examples:
  - "Should I move to a new city for a job opportunity?"
  - "How do I balance work and personal relationships?"
  - "What should I do about this difficult situation?"

### 2. Watch the Debate Unfold
- Your three inner voices will automatically start debating
- Each persona speaks for 2-3 sentences maximum
- Total debate lasts 60-80 seconds with 10-11 messages
- Perfect synchronization between voice, animation, and transcript

### 3. Adjust Participation (Optional)
- Use the volume bars to control how much each persona contributes
- Set to 0% to silence a persona completely
- All personas start at 100% by default

### 4. Get AI Insights
- After the debate concludes, click "Synthesize Wisdom"
- Receive AI-generated insights and recommendations
- Save your dilemma and debate for future reference

## 🛠️ Technical Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Audio**: Web Audio API for TTS playback
- **Animations**: CSS keyframes for avatar animations

### Backend (Express.js)
- **Framework**: Express.js with Node.js
- **AI Integration**: OpenAI GPT-4 and TTS APIs
- **Database**: Supabase for storing dilemmas and debates
- **Audio Processing**: OpenAI TTS with voice mapping

### Key Files
```
├── app/
│   ├── page.tsx              # Homepage with dilemma input
│   └── debate/page.tsx       # Debate interface
├── backend/
│   ├── server.js             # Express server setup
│   ├── routes/
│   │   └── debate.js         # Debate API endpoints
│   └── services/
│       ├── debateEngine.js   # Core debate logic
│       └── ttsService.js     # Text-to-speech service
└── components/
    └── ui/                   # Reusable UI components
```

## 🎨 Voice Mapping

Each persona has a distinct OpenAI TTS voice:
- **Heart** → `nova` (warm, empathetic, feminine)
- **Logic** → `coral` (clear, analytical, feminine)  
- **Shadow** → `shimmer` (mysterious, intuitive, feminine)

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=sk-...          # Required: OpenAI API key
PORT=3001                      # Optional: Backend port (default: 3001)
```

### Customization
- **Avatar Animations**: Modify frames in `public/avatars/`
- **Voice Selection**: Change voice mapping in `backend/services/ttsService.js`
- **Debate Length**: Adjust `TOTAL_MESSAGES` in `backend/services/debateEngine.js`
- **Styling**: Customize Tailwind classes in components

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Heroku (Backend)
1. Connect your repository
2. Set `OPENAI_API_KEY` environment variable
3. Deploy and update frontend API URL

### Environment Variables for Production
```bash
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

**"fetch is not defined" error**
- Upgrade to Node.js 18+ (recommended)
- Or ensure polyfills are loaded in `backend/server.js`

**Audio not playing**
- Check browser autoplay policies
- Ensure OpenAI API key is valid
- Verify TTS service is working

**Debate not starting**
- Check backend server is running on port 3001
- Verify API endpoints are accessible
- Check browser console for errors

**Avatar animations not working**
- Ensure all frame images are in `public/avatars/`
- Check CSS animation classes are applied

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- **OpenAI** for GPT-4 and TTS APIs
- **Next.js** for the frontend framework
- **Tailwind CSS** for styling
- **Supabase** for database services

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/kalkidantw/split-yourself-stems/issues)
- **Email**: kalkidantibebuw@gmail.com
- **Documentation**: Check the `/docs` folder for detailed guides

---

**Created with ❤️ by Kalkidan Wubshet**

*"Split yourself into stems and let your inner voices guide you to wisdom."*
