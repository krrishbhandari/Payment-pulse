import { useState, useEffect } from 'react';
import { 
  ArrowRight, Brain, TrendingUp, Sparkles, Star, Target,
  CheckCircle, MessageSquare, Globe, X, Menu, Sun, Moon,
  Users as UsersIcon, Mail, Phone, MapPin, Github, Twitter, Linkedin,
  Crown, Award, Gem, Castle, Scroll, ShieldCheck, Trophy, Diamond,
  DollarSign, Building, BarChart3 as ChartBar, Clock as ClockIcon
} from 'lucide-react';
import { sendToGemini } from '../utils/geminiClient';

// Color palette
const COLORS = {
  primary: '#1b4079',
  secondary: '#4d7c8a',
  accent1: '#7f9c96',
  accent2: '#8fad88',
  accent3: '#cbdf90',
  gold: '#f6c84c',
  lightGold: '#ffefc2',
  dark: '#0a1931',
  light: '#f8f9fa',
};

const stats = [
  { value: "35%", label: "Higher Recovery Rate", icon: TrendingUp, suffix: "+" },
  { value: "60%", label: "Faster Collections", icon: ClockIcon, suffix: " faster" },
  { value: "92%", label: "Prediction Accuracy", icon: Target, suffix: "%" },
  { value: "45%", label: "Cost Reduction", icon: ChartBar, suffix: " saved" },
];

interface TimelineItem {
  milestone: string;
  title: string;
  description: string;
  icon: any;
}

const timelineData: TimelineItem[] = [
  { milestone: 'Founded', title: 'The Foundation', description: 'Payment Pulse established with a vision to revolutionize debt recovery', icon: Castle },
  { milestone: 'Innovation', title: 'AI Intelligence Launch', description: 'Introduced our proprietary emotion-detection AI system', icon: Brain },
  { milestone: 'Growth', title: 'Bank Partnership Era', description: 'Secured partnerships with 3 major banking institutions', icon: Building },
  { milestone: 'Expansion', title: 'Global Expansion', description: 'Expanded operations to Europe and Asia-Pacific regions', icon: Globe },
  { milestone: 'Award', title: "Industry Recognition", description: "Awarded 'FinTech Innovation of the Year'", icon: Trophy },
  { milestone: 'Scale', title: 'Enterprise Launch', description: 'Launched enterprise suite for Fortune 500 companies', icon: Award }
];

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Marcus Rodriguez',
    role: 'Operations Director, BankPlus',
    content: 'Excellent solution for modern finance. Reduced customer complaints by 60% while improving collections.',
    avatar: 'MR',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Risk, CreditUnion',
    content: 'The AI predictions are 92% accurate. A truly premium experience from start to finish.',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Amir Khan',
    role: 'CFO, FinBank',
    content: 'Payment Pulse reduced our delinquency by 40% in three months — excellent analytics and support.',
    avatar: 'AK',
    rating: 5,
  }
];

const features = [
  { 
    icon: Brain, 
    title: "Intelligent AI", 
    desc: "AI that is precise, strategic, and always forward-thinking",
    color: COLORS.gold
  },
  { 
    icon: Gem, 
    title: "Diamond Analytics", 
    desc: "Crystal-clear insights with multi-faceted reporting and predictions",
    color: COLORS.primary
  },
  { 
    icon: ShieldCheck, 
    title: "Fortress Security", 
    desc: "Bank-grade security with enterprise-level compliance standards",
    color: COLORS.secondary
  },
  { 
    icon: Trophy, 
    title: "Elite Performance", 
    desc: "Consistently achieve top-tier recovery rates and customer satisfaction",
    color: COLORS.gold
  },
  { 
    icon: Castle, 
    title: "Scalable Kingdom", 
    desc: "From startups to financial empires - scale without limits",
    color: COLORS.accent1
  },
  { 
    icon: Scroll, 
    title: "Automated Documentation", 
    desc: "Automated compliance reporting that meets regulatory standards",
    color: COLORS.accent2
  }
];

interface LandingPageProps {
  onGetStarted?: () => void;
}

export default function LandingPage({ onGetStarted = () => {} }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((v) => !v);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const THEME = {
    bg: isDarkMode ? COLORS.dark : COLORS.light,
    text: isDarkMode ? '#e6eef8' : COLORS.dark,
    muted: isDarkMode ? '#9aa6b2' : COLORS.secondary,
    heading: isDarkMode ? '#ffffff' : COLORS.dark,
    cardBg: isDarkMode ? COLORS.primary + '15' : 'white',
    navBg: isDarkMode ? COLORS.dark + 'ee' : COLORS.light + 'ee',
    navBorder: isDarkMode ? COLORS.primary + '40' : COLORS.accent1 + '30'
  };

  // Chat widget state and simple simulated bot
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [messageText, setMessageText] = useState('');

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user' as const, text };
    setMessages((m) => [...m, userMsg]);
    setMessageText('');

    // optimistic bot placeholder
    const placeholder = { from: 'bot' as const, text: 'Thinking...' };
    setMessages((m) => [...m, placeholder]);

    // Attempt Gemini API reply; fall back to a simulated reply if not configured or fails
    const reply = await sendToGemini(text);
    const botText = reply || `Thanks — I received: "${text}". A human will reach out shortly.`;

    // replace last placeholder with real bot reply
    setMessages((prev) => {
      const idx = prev.map((p) => p.text).lastIndexOf(placeholder.text);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { from: 'bot' as const, text: botText };
        return copy;
      }
      return [...prev, { from: 'bot' as const, text: botText }];
    });
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Enhanced Background Pattern
  const BackgroundPattern = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Geometric Pattern Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(45deg, ${COLORS.primary} 2%, transparent 2.5%),
                          linear-gradient(-45deg, ${COLORS.primary} 2%, transparent 2.5%),
                          linear-gradient(45deg, transparent 97%, ${COLORS.primary} 97.5%),
                          linear-gradient(-45deg, transparent 97%, ${COLORS.primary} 97.5%)`,
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0',
        opacity: isDarkMode ? 0.03 : 0.05
      }} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b4079]/20 via-transparent to-[#cbdf90]/10" />
      
      {/* Floating Elements */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ background: COLORS.primary }} />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full blur-[120px] opacity-15 animate-pulse-slow" style={{ background: COLORS.gold }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-10" style={{ background: COLORS.accent3 }} />
    </div>
  );

  return (
    <div 
      className="min-h-screen overflow-hidden font-serif transition-colors duration-300 relative"
      style={{ 
        backgroundColor: THEME.bg,
        color: THEME.text
      }}
    >
      <BackgroundPattern />
      
      {/* Navigation */}
      <nav 
        className="fixed top-0 w-full z-50 transition-all duration-500 backdrop-blur-xl"
        style={{ 
          backgroundColor: THEME.navBg,
          borderBottom: `1px solid ${THEME.navBorder}`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => scrollToSection('home')}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  boxShadow: `0 4px 20px ${COLORS.primary}40`
                }}
              >
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight" style={{ color: COLORS.primary }}>
                  Payment Pulse
                </span>
                <span className="text-xs tracking-widest uppercase opacity-70" style={{ color: THEME.muted }}>
                  Debt Solutions
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              {[
                { id: 'home', label: 'Home' },
                  { id: 'features', label: 'Features' },
                  { id: 'how-it-works', label: 'Strategy' },
                  { id: 'testimonials', label: 'Testimonials' },
                  { id: 'integrations', label: 'Integrations' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 group"
                  style={{ 
                    color: activeSection === item.id ? COLORS.primary : (isDarkMode ? THEME.muted : COLORS.secondary)
                  }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <div 
                    className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      activeSection === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ backgroundColor: COLORS.primary + '15' }}
                  />
                </button>
              ))}
              
              <div className="h-6 w-px mx-4" style={{ backgroundColor: COLORS.accent1 + '40' }} />

              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ 
                      backgroundColor: isDarkMode ? COLORS.primary + '20' : COLORS.accent3 + '20',
                      color: isDarkMode ? COLORS.lightGold : COLORS.primary
                    }}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={onGetStarted}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    color: 'white',
                    boxShadow: `0 4px 20px ${COLORS.primary}40`
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center space-x-3 lg:hidden">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-lg"
                style={{ 
                  backgroundColor: isDarkMode ? COLORS.primary + '20' : COLORS.accent3 + '20',
                  color: isDarkMode ? COLORS.lightGold : COLORS.primary
                }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ color: COLORS.primary }}
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
          <div 
            className="lg:hidden absolute top-full w-full"
            style={{ 
              backgroundColor: THEME.bg,
              borderBottom: `1px solid ${COLORS.accent1 + '30'}`,
              boxShadow: `0 20px 40px ${COLORS.primary}20`
            }}
          >
            <div className="px-6 py-8 space-y-1">
              {[ 
                { id: 'home', label: 'Home' },
                { id: 'features', label: 'Features' },
                { id: 'how-it-works', label: 'Strategy' },
                { id: 'testimonials', label: 'Testimonials' },
                { id: 'integrations', label: 'Integrations' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 text-lg font-medium rounded-lg transition-colors"
                  style={{ 
                    color: activeSection === item.id ? COLORS.primary : 'inherit',
                    backgroundColor: activeSection === item.id ? COLORS.primary + '15' : 'transparent'
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={onGetStarted}
                className="w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02]"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: 'white',
                  boxShadow: `0 4px 20px ${COLORS.primary}40`
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-28 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 opacity-20">
            <Crown className="w-24 h-24" style={{ color: COLORS.gold }} />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20">
            <Gem className="w-32 h-32" style={{ color: COLORS.primary }} />
          </div>
          
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div 
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-8 mx-auto border"
              style={{ 
                backgroundColor: COLORS.primary + '10',
                borderColor: COLORS.primary + '30',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.gold }}>
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: COLORS.primary }}>
                Premium Debt Recovery Platform
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-none">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.gold})`
                }}
              >
                Payment Pulse
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: THEME.muted }}>
              Transform your debt collection with AI-powered intelligence and smart scheduling. 
              Recover more while maintaining excellent customer relationships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <button
                onClick={onGetStarted}
                className="group px-10 py-5 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-3"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: 'white',
                  boxShadow: `0 10px 30px ${COLORS.primary}40`
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button
                onClick={() => scrollToSection('features')}
                className="px-10 py-5 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 border"
                style={{ 
                  borderColor: COLORS.accent1,
                  color: COLORS.accent1,
                  backgroundColor: COLORS.accent1 + '10'
                }}
              >
                Explore Features
              </button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  style={{ 
                    backgroundColor: isDarkMode ? COLORS.primary + '15' : 'white',
                    border: `1px solid ${COLORS.accent1}30`,
                    boxShadow: `0 4px 20px ${COLORS.primary}10`
                  }}
                >
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.gold + '20' }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: COLORS.gold }} />
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2" style={{ color: COLORS.primary }}>
                    {stat.value}
                    <span className="text-lg" style={{ color: COLORS.gold }}>{stat.suffix}</span>
                  </div>
                  <div className="text-sm font-medium opacity-75" style={{ color: THEME.muted }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.gold }} />
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: THEME.heading }}>
                Our Journey
              </h2>
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.gold }} />
            </div>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: THEME.muted }}>
              A timeline of excellence, innovation, and achievements
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 hidden lg:block"
              style={{ backgroundColor: COLORS.gold + '40' }}
            />
            
            <div className="space-y-12 lg:space-y-0">
              {timelineData.map((item, index) => (
                <div 
                  key={index}
                  className={`relative lg:flex lg:items-center lg:justify-between ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                  onMouseEnter={() => setHoveredYear(item.milestone)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {/* Year Marker */}
                  <div className="lg:w-1/2 flex justify-center lg:justify-end mb-8 lg:mb-0 relative">
                    <div 
                      className={`relative transition-all duration-500 ${
                        hoveredYear === item.milestone ? 'scale-125' : 'scale-100'
                      }`}
                    >
                          <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 border-4"
                        style={{ 
                          backgroundColor: COLORS.primary,
                          borderColor: COLORS.gold,
                          boxShadow: `0 0 40px ${COLORS.gold}${hoveredYear === item.milestone ? '80' : '40'}`
                        }}
                      >
                        <item.icon className="w-10 h-10 text-white" />
                      </div>
                      <div 
                        className="absolute inset-0 rounded-full blur-lg transition-opacity duration-500"
                        style={{ 
                          backgroundColor: COLORS.gold,
                          opacity: hoveredYear === item.milestone ? 0.6 : 0.3
                        }}
                      />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="lg:w-1/2 lg:px-12">
                    <div 
                      className="p-8 rounded-2xl transition-all duration-500 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: isDarkMode ? COLORS.primary + '15' : 'white',
                        border: `1px solid ${COLORS.accent1}30`,
                        boxShadow: `0 10px 40px ${COLORS.primary}20`,
                        transform: hoveredYear === item.milestone ? 'translateY(-5px)' : 'none'
                      }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div 
                          className="p-3 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: COLORS.gold + '20' }}
                        >
                          <item.icon className="w-6 h-6" style={{ color: COLORS.gold }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold" style={{ color: THEME.heading }}>
                              {item.title}
                            </h3>
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                              style={{ 
                                backgroundColor: COLORS.accent3 + '30',
                                color: COLORS.accent2
                              }}
                            >
                              {item.milestone}
                            </span>
                          </div>
                          <p className="opacity-80" style={{ color: THEME.muted }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: THEME.heading }}>
              Powerful <span style={{ color: COLORS.primary }}>Features</span> for
              <br />
              <span className="flex items-center justify-center gap-4 mt-2">
                <Diamond className="w-8 h-8" style={{ color: COLORS.gold }} />
                Exceptional Results
                <Diamond className="w-8 h-8" style={{ color: COLORS.gold }} />
              </span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: THEME.muted }}>
              Experience the best of debt recovery technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden"
                style={{ 
                  backgroundColor: isDarkMode ? COLORS.primary + '10' : 'white',
                  border: `1px solid ${feature.color}30`,
                  boxShadow: `0 10px 30px ${feature.color}15`
                }}
              >
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}40, transparent 50%)` }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border"
                    style={{ 
                      backgroundColor: feature.color + '15',
                      borderColor: feature.color + '30'
                    }}
                  >
                    <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: THEME.heading }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: THEME.muted }}>
                    {feature.desc}
                  </p>
                  <div 
                    className="mt-6 flex items-center text-sm font-semibold transition-all duration-300 group-hover:translate-x-2"
                    style={{ color: feature.color }}
                  >
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 relative">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.primary}05, ${COLORS.accent3}05)`
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-6">
              <Trophy className="w-8 h-8" style={{ color: COLORS.gold }} />
              <h2 className="text-4xl md:text-5xl font-bold" style={{ color: THEME.heading }}>
                Testimonials
              </h2>
              <Trophy className="w-8 h-8" style={{ color: COLORS.gold }} />
            </div>
            <p className="text-xl" style={{ color: THEME.muted }}>
              Praised by financial institutions worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative p-8 rounded-2xl transition-all duration-500 hover:scale-[1.02] group"
                style={{ 
                  backgroundColor: isDarkMode ? COLORS.primary + '15' : 'white',
                  border: `1px solid ${COLORS.gold}30`,
                  boxShadow: `0 10px 40px ${COLORS.primary}15`
                }}
              >
                {/* Quote Mark */}
                <div 
                  className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ color: COLORS.gold }}
                >
                  <MessageSquare className="w-12 h-12" />
                </div>
                
                <div className="flex items-start space-x-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                    style={{ 
                      backgroundColor: COLORS.primary + '15',
                      borderColor: COLORS.gold
                    }}
                  >
                    <span className="text-lg font-bold" style={{ color: COLORS.primary }}>
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1" style={{ color: THEME.heading }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm opacity-75" style={{ color: THEME.muted }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <p 
                  className="text-lg italic mb-6 leading-relaxed"
                  style={{ color: THEME.text }}
                >
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: COLORS.gold }} />
                    ))}
                  </div>
                  <div className="flex items-center text-sm font-medium" style={{ color: COLORS.primary }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified Client
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section (replaces FAQ) */}
      <section id="integrations" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: THEME.heading }}>
              Integrations
            </h2>
            <p className="text-lg" style={{ color: THEME.muted }}>
              Connect Payment Pulse with the tools you already use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Stripe', icon: DollarSign, desc: 'Payments & reconciliation' },
              { name: 'QuickBooks', icon: ChartBar, desc: 'Accounting sync' },
              { name: 'Salesforce', icon: UsersIcon, desc: 'CRM & workflows' },
              { name: 'Plaid', icon: Globe, desc: 'Bank account connections' }
            ].map((intg) => (
              <div key={intg.name} className="p-6 rounded-2xl border transition hover:shadow-lg" style={{ backgroundColor: isDarkMode ? COLORS.primary + '10' : 'white' }}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.gold + '15' }}>
                    <intg.icon className="w-6 h-6" style={{ color: COLORS.gold }} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: THEME.heading }}>{intg.name}</div>
                    <div className="text-sm" style={{ color: THEME.muted }}>{intg.desc}</div>
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: COLORS.primary }}>Learn integration</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            opacity: 0.95
          }}
        />
        
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${COLORS.gold}20 2%, transparent 2.5%)`,
            backgroundSize: '60px 60px',
            opacity: 0.3
          }}
        />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Transform Your Debt Collection Today
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Elevate your debt recovery with AI-powered intelligence. Experience the future of 
              intelligent collections with Payment Pulse.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group px-12 py-5 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-3"
              style={{ 
                backgroundColor: COLORS.lightGold,
                color: COLORS.primary,
                boxShadow: `0 10px 40px ${COLORS.gold}40`
              }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button
              onClick={() => window.location.href = 'mailto:support@paymentpulse.com?subject=Contact%20Sales'}
              className="px-12 py-5 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
              style={{ 
                borderColor: COLORS.lightGold,
                color: COLORS.lightGold,
                backgroundColor: 'transparent'
              }}
            >
              Contact Sales
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-white/80">
            <div className="flex flex-col items-center">
              <UsersIcon className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm">Clients</div>
            </div>
            <div className="flex flex-col items-center">
              <ChartBar className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">$2.5B+</div>
              <div className="text-sm">Recovered</div>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm">Countries</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 mb-2" />
              <div className="text-2xl font-bold">25+</div>
              <div className="text-sm">Awards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: THEME.bg }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
                  }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold" style={{ color: THEME.heading }}>Payment Pulse</span>
                  <p className="text-sm opacity-60" style={{ color: THEME.muted }}>Intelligent Debt Solutions</p>
                </div>
              </div>
              <p className="leading-relaxed mb-8 max-w-md" style={{ color: THEME.text }}>
                The leading debt recovery technology platform, combining intelligent precision 
                with cutting-edge AI to transform collections.
              </p>
              <div className="flex space-x-4">
                {[Twitter, Linkedin, Github].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: COLORS.primary + '30',
                      color: 'white'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6" style={{ color: THEME.heading }}>Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Case Studies', 'Documentation', 'Partners'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="transition-colors text-sm"
                      style={{ color: THEME.muted }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-lg mb-6" style={{ color: THEME.heading }}>Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Press', 'Legal', 'Contact'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="transition-colors text-sm"
                      style={{ color: THEME.muted }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-6" style={{ color: THEME.heading }}>Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Mail className="w-4 h-4 mr-3 mt-1 flex-shrink-0 opacity-60" style={{ color: COLORS.lightGold }} />
                  <span className="text-sm" style={{ color: THEME.text }}>support@paymentpulse.com</span>
                </li>
                <li className="flex items-start">
                  <Phone className="w-4 h-4 mr-3 mt-1 flex-shrink-0 opacity-60" style={{ color: COLORS.lightGold }} />
                  <span className="text-sm" style={{ color: THEME.text }}>+1 (888) PAY-PULSE</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0 opacity-60" style={{ color: COLORS.lightGold }} />
                  <span className="text-sm" style={{ color: THEME.text }}>100 Finance Blvd<br />San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              &copy; 2024 Payment Pulse. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a 
                  key={item}
                  href="#" 
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(true)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, color: 'white' }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>

        {chatOpen && (
          <div className="mt-3 w-80 max-w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: isDarkMode ? COLORS.dark : 'white' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.accent1 + '20' }}>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5" style={{ color: COLORS.primary }} />
                <div style={{ color: THEME.heading }} className="font-semibold">Support Chat</div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1 rounded-md">
                <X className="w-4 h-4" style={{ color: THEME.muted }} />
              </button>
            </div>

            <div className="p-3 h-64 overflow-auto" style={{ backgroundColor: isDarkMode ? COLORS.dark : 'white' }}>
              {messages.length === 0 && (
                <div className="text-sm text-center" style={{ color: THEME.muted }}>Ask a question — we're here to help.</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`mb-3 flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl max-w-[75%]`} style={{ backgroundColor: m.from === 'user' ? COLORS.primary : (isDarkMode ? '#0f1330' : COLORS.gold + '10'), color: m.from === 'user' ? 'white' : THEME.text }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t" style={{ borderColor: COLORS.accent1 + '20' }}>
              <div className="flex items-center gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(messageText); } }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: isDarkMode ? '#081227' : '#f8fafc', color: THEME.text }}
                />
                <button onClick={() => sendMessage(messageText)} className="px-3 py-2 rounded-lg" style={{ backgroundColor: COLORS.primary, color: 'white' }}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      <button
        onClick={() => scrollToSection('home')}
        className="fixed bottom-8 left-8 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-80 hover:opacity-100"
        style={{ 
          backgroundColor: COLORS.gold,
          color: 'white'
        }}
      >
        <ArrowRight className="w-5 h-5 -rotate-90" />
      </button>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 12s ease-in-out infinite; }
        
        html {
          scroll-behavior: smooth;
        }
        
        .font-serif {
          font-family: 'Playfair Display', 'Times New Roman', serif;
        }
      `}} />
    </div>
  );
}
