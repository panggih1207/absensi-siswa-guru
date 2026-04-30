import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ClipboardList, BookOpen, ChevronRight, Star, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useUIStore from '@/store/uiStore';
import translations from '@/lib/i18n';

const features = [
  {
    icon: Users,
    key: 'userManagement',
    descKey: 'userManagementDesc',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: ClipboardList,
    key: 'testAssessment',
    descKey: 'testAssessmentDesc',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: BookOpen,
    key: 'trainingPrograms',
    descKey: 'trainingProgramsDesc',
    color: 'bg-green-100 text-green-600',
  },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Courses' },
  { value: '200+', label: 'Teachers' },
  { value: '98%', label: 'Satisfaction' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { language, setLanguage } = useUIStore();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Studies</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#stats" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                {t.login}
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                {t.register}
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-600 py-2">Features</a>
            <a href="#stats" className="block text-sm text-gray-600 py-2">About</a>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/login')}>
                {t.login}
              </Button>
              <Button size="sm" className="flex-1" onClick={() => navigate('/register')}>
                {t.register}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-8 border border-white/30">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Trusted by 10,000+ learners worldwide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {language === 'ar' ? (
              <>حوّل التعلم<br /><span className="text-blue-200">مع Studies</span></>
            ) : (
              <>Transform<br /><span className="text-blue-200">Learning</span> with Studies</>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 shadow-lg"
              onClick={() => navigate('/register')}
            >
              {t.getStarted}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 font-semibold px-8"
              onClick={() => navigate('/login')}
            >
              {t.login}
            </Button>
          </div>

          {/* Hero image placeholder */}
          <div className="mt-16 relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 max-w-4xl mx-auto shadow-2xl">
              <div className="bg-gray-900/80 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Active Students', value: '2,847', color: 'text-blue-400' },
                  { label: 'Courses', value: '156', color: 'text-green-400' },
                  { label: 'Pass Rate', value: '94%', color: 'text-yellow-400' },
                  { label: 'Trainings', value: '89', color: 'text-purple-400' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t[feature.key]}</h3>
                <p className="text-gray-600 leading-relaxed">{t[feature.descKey]}</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start learning?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join thousands of students and teachers on the Studies platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-10"
              onClick={() => navigate('/register')}
            >
              {t.register} — It's Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 font-semibold px-10"
              onClick={() => navigate('/login')}
            >
              {t.login}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">Studies</span>
            </div>
            <p className="text-sm">© 2024 Studies LMS. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
