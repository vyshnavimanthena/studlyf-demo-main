import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowLeft, Target, ExternalLink, Globe, Landmark, BookOpen, Award, Compass, Search, Share2, Check, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const scholarshipCategories = [
  { id: 'all', label: 'All Scholarships', icon: Target },
  { id: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
  { id: 'india', label: 'India', icon: Landmark },
  { id: 'abroad', label: 'Abroad / International', icon: Globe }
];

const allScholarships = [
  {
    id: 1,
    categoryId: 'india',
    name: 'Reliance Foundation Undergraduate Scholarships',
    explanation: 'Aims to support meritorious students from all corners of India to continue their education in any stream.',
    eligibility: 'First-year UG students with familial income < ₹15 LPA. Aptitude test score is considered.',
    benefit: 'Up to ₹2,00,000 over the duration of the degree course.',
    provider: 'Reliance Foundation',
    link: 'https://scholarships.reliancefoundation.org/',
    icon: GraduationCap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    btnHover: 'hover:bg-blue-500/20'
  },
  {
    id: 2,
    categoryId: 'india',
    name: 'HDFC Bank Parivartan ECSS Scholarship',
    explanation: 'Supports meritorious and needy students belonging to underprivileged sections of society.',
    eligibility: 'School students (Class 6-12) and those pursuing UG/PG/Diploma courses facing financial hardship.',
    benefit: 'Up to ₹75,000 per year depending on the course of study.',
    provider: 'HDFC Bank',
    link: 'https://www.buddy4study.com/page/hdfc-bank-parivartan-ecss-scholarship',
    icon: Landmark,
    color: 'text-[#6C2BFF]',
    bg: 'bg-[#6C2BFF]/10',
    btnHover: 'hover:bg-[#6C2BFF]/20'
  },
  {
    id: 3,
    categoryId: 'india',
    name: 'Aditya Birla Capital Scholarship Scheme',
    explanation: 'Provides financial support to meritorious students to ensure they do not drop out due to economic issues.',
    eligibility: 'Students of Class 9 to 12 and General Graduation/Professional Graduation in recognized institutions.',
    benefit: 'One-time scholarship grant of up to ₹60,000.',
    provider: 'Aditya Birla Capital Foundation',
    link: 'https://www.buddy4study.com/page/aditya-birla-capital-scholarship',
    icon: Award,
    color: 'text-[#EC4899]',
    bg: 'bg-[#EC4899]/10',
    btnHover: 'hover:bg-[#EC4899]/20'
  },
  {
    id: 4,
    categoryId: 'india',
    name: 'Tata Trust Education Grants (UG/PG)',
    explanation: 'Need-based assistance for students pursuing higher studies in India.',
    eligibility: 'Indian students currently enrolled in recognized colleges or institutes in India.',
    benefit: 'Partial or full waiver of tuition and academic fees.',
    provider: 'Tata Trusts',
    link: 'https://www.tatatrusts.org/our-work/individual-grants-program/education-grants',
    icon: BookOpen,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    btnHover: 'hover:bg-orange-50'
  },
  {
    id: 5,
    categoryId: 'india',
    name: 'INSPIRE Fellowship / Scholarship',
    explanation: 'Scholarship for Higher Education (SHE) to attract talent to the study of natural and basic sciences.',
    eligibility: 'Top 1% students in class 12 board exams pursuing B.Sc./M.Sc. in natural or physical sciences.',
    benefit: '₹80,000 per year (₹60,000 cash + ₹20,000 mentorship project grant).',
    provider: 'Department of Science and Technology, Govt of India',
    link: 'https://online-inspire.gov.in/',
    icon: Compass,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    btnHover: 'hover:bg-emerald-50'
  },
  {
    id: 6,
    categoryId: 'india',
    name: 'Kotak Kanya Scholarship',
    explanation: 'Empowers meritorious girl students from underprivileged families to pursue professional graduation courses.',
    eligibility: 'Female class 12 passed students who scored 85%+ and secured admission in professional courses (Engineering, Medical, Law, etc.).',
    benefit: '₹1,50,000 per year till completion of the professional degree.',
    provider: 'Kotak Education Foundation',
    link: 'https://kotakeducation.org/kotak-kanya-scholarship/',
    icon: GraduationCap,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    btnHover: 'hover:bg-pink-50'
  },
  {
    id: 7,
    categoryId: 'india',
    name: 'L\'Oréal India For Young Women in Science',
    explanation: 'A highly selective program assisting young women to pursue science education at university level.',
    eligibility: 'Female class 12 passed in Science stream with minimum 85% marks. Family income < ₹6 LPA.',
    benefit: 'Up to ₹2,50,000 for undergraduate studies in a science field.',
    provider: 'L\'Oréal India',
    link: 'https://www.buddy4study.com/page/loreal-india-for-young-women-in-science-scholarships',
    icon: Award,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    btnHover: 'hover:bg-indigo-50'
  },
  {
    id: 8,
    categoryId: 'india',
    name: 'LIC Golden Jubilee Scholarship',
    explanation: 'Aims to provide scholarships to meritorious students from economically weaker sections.',
    eligibility: 'Passed Class 12 (or equivalent) with at least 60% marks and pursuing UG courses, vocational courses, or diplomas.',
    benefit: '₹20,000 per annum paid in regular installments.',
    provider: 'Life Insurance Corporation of India (LIC)',
    link: 'https://licindia.in/Bottom-Links/Golden-Jubilee-Foundation',
    icon: Landmark,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    btnHover: 'hover:bg-amber-50'
  },
  {
    id: 9,
    categoryId: 'india',
    name: 'Sitaram Jindal Foundation Scholarship',
    explanation: 'Merit-cum-means scholarship program supporting underprivileged students from high school to postgraduation.',
    eligibility: 'Students pursuing Class 11, Class 12, ITI, Diploma, UG, PG, Engineering, or Medical courses.',
    benefit: 'Monthly stipend of up to ₹3,200 depending on course and location.',
    provider: 'Sitaram Jindal Foundation',
    link: 'https://www.sitaramjindalfoundation.org/scholarships.php',
    icon: BookOpen,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    btnHover: 'hover:bg-teal-50'
  },
  {
    id: 10,
    categoryId: 'india',
    name: 'Avasar Girls Scholarship Program',
    explanation: 'Supports underprivileged girl children with education, professional grooming, and computer skills training.',
    eligibility: 'Meritorious girl students from economically backward backgrounds in urban & semi-urban areas.',
    benefit: '100% funding for tuition, books, uniform, transportation, and soft-skills mentoring.',
    provider: 'Avasar Foundation',
    link: 'https://avasar.ngo/',
    icon: Award,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    btnHover: 'hover:bg-purple-50'
  },
  {
    id: 11,
    categoryId: 'abroad',
    name: 'Chevening Scholarships (United Kingdom)',
    explanation: 'The UK government’s international awards programme for developing global leaders.',
    eligibility: 'Graduates with 2+ years of work experience, applying for a 1-year Master’s degree at a UK university.',
    benefit: 'Full tuition fees, monthly living allowance, return economy flights, and visa application costs.',
    provider: 'UK Foreign, Commonwealth & Development Office',
    link: 'https://www.chevening.org/',
    icon: Globe,
    color: 'text-blue-600',
    bg: 'bg-blue-600/10',
    btnHover: 'hover:bg-blue-600/20'
  },
  {
    id: 12,
    categoryId: 'abroad',
    name: 'Fulbright-Nehru Master\'s Fellowships (USA)',
    explanation: 'Enables outstanding Indian students to pursue master’s degree programs at selected US colleges and universities.',
    eligibility: 'Indian citizens with a completed Bachelor’s degree, 3+ years of professional experience, and leadership credentials.',
    benefit: 'Tuition fees, J-1 visa support, monthly living stipend, round-trip travel, and health coverage.',
    provider: 'US-India Educational Foundation (USIEF)',
    link: 'https://www.usief.org.in/',
    icon: Compass,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    btnHover: 'hover:bg-red-50'
  },
  {
    id: 13,
    categoryId: 'abroad',
    name: 'DAAD Scholarships (Germany)',
    explanation: 'Offers funding for graduates and postgraduates from developing countries to complete postgrad courses in Germany.',
    eligibility: 'Bachelor’s degree holders with at least two years of professional experience.',
    benefit: 'Monthly stipend (€934 to €1,200), travel subsidy, health insurance, and academic research allowance.',
    provider: 'German Academic Exchange Service (DAAD)',
    link: 'https://www.daad.de/en/',
    icon: Landmark,
    color: 'text-cyan-600',
    bg: 'bg-cyan-600/10',
    btnHover: 'hover:bg-cyan-600/20'
  },
  {
    id: 14,
    categoryId: 'abroad',
    name: 'Eiffel Excellence Scholarship (France)',
    explanation: 'Designed to attract top international master’s and PhD students to French higher education institutions.',
    eligibility: 'Non-French citizens up to 25 (for Master’s) or 30 (for PhD) applying for eligible programs in France.',
    benefit: 'Monthly allowance of €1,181 (Master’s) or €1,800 (PhD), return travel, social security, and culture guide benefits.',
    provider: 'French Ministry for Europe and Foreign Affairs',
    link: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
    icon: Globe,
    color: 'text-indigo-600',
    bg: 'bg-indigo-600/10',
    btnHover: 'hover:bg-indigo-600/20'
  },
  {
    id: 15,
    categoryId: 'abroad',
    name: 'Commonwealth Scholarship (United Kingdom)',
    explanation: 'Aims to contribute to the UK’s international development aims by supporting outstanding Commonwealth citizens.',
    eligibility: 'Citizens or permanent residents of developing Commonwealth countries pursuing Master\'s or PhD programs.',
    benefit: 'Fully funded tuition fees, return airfare, examination fees, personal allowance, and study travel grants.',
    provider: 'Commonwealth Scholarship Commission',
    link: 'https://cscuk.fcdo.gov.uk/',
    icon: GraduationCap,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    btnHover: 'hover:bg-violet-50'
  },
  {
    id: 16,
    categoryId: 'abroad',
    name: 'Gates Cambridge Scholarship (United Kingdom)',
    explanation: 'Awarded to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree at Cambridge.',
    eligibility: 'Academic excellence, leadership potential, and commitment to improving the lives of others.',
    benefit: 'Full cost of studying at Cambridge: University fees, maintenance allowance (approx. £20,000/year), airfare, and visa fees.',
    provider: 'Bill & Melinda Gates Foundation',
    link: 'https://www.gatescambridge.org/',
    icon: Award,
    color: 'text-emerald-600',
    bg: 'bg-emerald-600/10',
    btnHover: 'hover:bg-emerald-600/20'
  },
  {
    id: 17,
    categoryId: 'abroad',
    name: 'Schwarzman Scholars Program (China)',
    explanation: 'Designed to prepare the next generation of global leaders with a fully-funded Master’s in Global Affairs at Tsinghua University.',
    eligibility: 'Applicants of any nationality aged 18 to 28 with a completed undergraduate degree.',
    benefit: 'Full tuition, room and board, travel, a study tour inside China, health insurance, and personal stipend ($4,000).',
    provider: 'Schwarzman Foundation',
    link: 'https://www.schwarzmanscholars.org/',
    icon: Compass,
    color: 'text-yellow-600',
    bg: 'bg-yellow-600/10',
    btnHover: 'hover:bg-yellow-600/20'
  },
  {
    id: 18,
    categoryId: 'abroad',
    name: 'Knight-Hennessy Scholars at Stanford (USA)',
    explanation: 'A multidisciplinary community of graduate students at Stanford University aiming to solve complex challenges.',
    eligibility: 'Applicants of any nationality applying to any graduate degree program at Stanford.',
    benefit: 'Funding for up to three years of graduate tuition, plus a stipend for living and academic expenses.',
    provider: 'Stanford University',
    link: 'https://knight-hennessy.stanford.edu/',
    icon: GraduationCap,
    color: 'text-red-600',
    bg: 'bg-red-600/10',
    btnHover: 'hover:bg-red-600/20'
  },
  {
    id: 19,
    categoryId: 'abroad',
    name: 'Japanese Government MEXT Scholarships',
    explanation: 'Supports foreign students wishing to study at Japanese universities under the Ministry of Education, Culture, Sports, Science and Technology.',
    eligibility: 'International students seeking undergraduate or research-based postgraduate courses in Japan.',
    benefit: '100% tuition waiver, monthly living allowance, and round-trip economy class travel.',
    provider: 'Government of Japan (MEXT)',
    link: 'https://www.studyinjapan.go.jp/en/planning/scholarships/',
    icon: Landmark,
    color: 'text-rose-600',
    bg: 'bg-rose-600/10',
    btnHover: 'hover:bg-rose-600/20'
  },
  {
    id: 20,
    categoryId: 'abroad',
    name: 'Erasmus Mundus Joint Masters Scholarships (Europe)',
    explanation: 'Prestigious, integrated international study programmes, jointly delivered by an international consortium of HEIs.',
    eligibility: 'Bachelor’s degree holders from any country in the world who secure admission in an Erasmus Mundus joint master program.',
    benefit: 'Full tuition waiver, travel allowance, installation grant, and a monthly subsistence allowance of €1,00,000 / €1,000.',
    provider: 'European Union (EU)',
    link: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters-scholarships',
    icon: Globe,
    color: 'text-violet-600',
    bg: 'bg-violet-600/10',
    btnHover: 'hover:bg-violet-600/20'
  }
];

import { X } from 'lucide-react';

const Scholarships: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSchId, setCopiedSchId] = useState<number | null>(null);
  const [bookmarkedSchIds, setBookmarkedSchIds] = useState<number[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<any | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('studlyf_bookmarked_scholarships');
    if (saved) {
      try {
        setBookmarkedSchIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleToggleBookmark = (id: number) => {
    setBookmarkedSchIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('studlyf_bookmarked_scholarships', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredScholarships = allScholarships.filter(scholarship => {
    const matchesCategory = activeCategory === 'all' 
      ? true 
      : activeCategory === 'bookmarked'
        ? bookmarkedSchIds.includes(scholarship.id)
        : scholarship.categoryId === activeCategory;
    const matchesSearch = scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scholarship.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent, url: string, id: number) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSchId(id);
      setTimeout(() => setCopiedSchId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-800 pt-28 font-sans selection:bg-emerald-500/20 flex flex-col">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-24 flex-grow w-full relative z-10">
        
        {/* Back Button */}
        <Link 
          to="/studhub" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#1A1A1A] hover:border-gray-300 hover:shadow-sm transition-all mb-10 font-bold text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to STUDHub
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-500/20 relative z-10 shadow-sm">
            <GraduationCap className="w-4 h-4" /> Higher Education Support
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-[#1A1A1A] relative z-10 leading-[1.1]">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Scholarships</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-500 font-medium relative z-10">
            Explore 20 verified elite scholarships from India and across the globe to fund your academic aspirations and research.
          </p>
        </div>

        {/* Search & Filtering Control Center */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-12 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
          {/* Categories Tab */}
          <div className="flex flex-wrap items-center gap-2">
            {scholarshipCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all border ${
                    isActive 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:shadow-sm hover:text-gray-800'
                  }`}
                >
                  <cat.icon className="w-4 h-4" /> {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search scholarships..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9FC] border border-gray-200 focus:border-emerald-500/50 focus:bg-white rounded-full text-sm font-semibold outline-none transition-all"
            />
          </div>
        </div>

        {/* Scholarship Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {filteredScholarships.map((sch) => (
              <motion.div 
                key={sch.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedScholarship(sch)}
                className="bg-white border border-gray-200 rounded-[2rem] p-4 sm:p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full cursor-pointer relative overflow-hidden"
              >
                {/* Category Badge & Share & Bookmark */}
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(sch.id);
                    }}
                    className="p-1.5 bg-[#F8F9FC] hover:bg-gray-100 text-gray-400 hover:text-amber-500 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center transition-all duration-200"
                    title={bookmarkedSchIds.includes(sch.id) ? "Remove Bookmark" : "Bookmark Scholarship"}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedSchIds.includes(sch.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => handleShare(e, sch.link, sch.id)}
                    className="p-1.5 bg-[#F8F9FC] hover:bg-gray-100 text-gray-400 hover:text-emerald-600 rounded-lg border border-gray-100 hover:border-gray-200 flex items-center justify-center transition-all duration-200"
                    title="Share Scholarship"
                  >
                    {copiedSchId === sch.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-100 ${sch.color} ${sch.bg}`}>
                    {scholarshipCategories.find(c => c.id === sch.categoryId)?.label}
                  </span>
                </div>

                {/* Icon wrapper */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${sch.bg} group-hover:scale-110 transition-transform duration-300 mb-6 shrink-0 shadow-sm`}>
                  <sch.icon className={`w-7 h-7 ${sch.color}`} />
                </div>
                
                {/* Scholarship Info */}
                <div className="mb-6 flex-grow">
                  <h3 className="text-xl font-black text-[#1A1A1A] group-hover:text-emerald-600 transition-colors leading-tight mb-2 pr-12">
                    {sch.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {sch.explanation}
                  </p>
                </div>

                {/* Requirements / Benefits Card */}
                <div className="space-y-4 mb-8 bg-[#F8F9FC] rounded-2xl p-5 border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Eligibility</span>
                    <p className="text-sm text-gray-700 font-semibold leading-snug">{sch.eligibility}</p>
                  </div>
                  <div className="w-full h-px bg-gray-200" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Benefits & Value</span>
                    <p className="text-sm text-emerald-600 font-black leading-snug">{sch.benefit}</p>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Provider</span>
                      <span className="text-sm font-black text-gray-800 block truncate max-w-[150px]">{sch.provider}</span>
                    </div>
                    <button 
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border border-transparent ${sch.bg} ${sch.color} ${sch.btnHover}`}
                    >
                      Apply Now <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredScholarships.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-white rounded-[2rem] border border-gray-200 border-dashed flex flex-col items-center justify-center"
              >
                <Target className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-black text-gray-800 mb-2">No scholarships found</h3>
                <p className="text-gray-500 text-sm font-medium">Try broadening your category search or search terms.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Scholarship Detail Modal */}
      <AnimatePresence>
        {selectedScholarship && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedScholarship(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar">
                <button 
                  onClick={() => setSelectedScholarship(null)}
                  className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedScholarship.bg} mb-6`}>
                  <selectedScholarship.icon className={`w-8 h-8 ${selectedScholarship.color}`} />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 pr-12 leading-tight">
                  {selectedScholarship.name}
                </h2>
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {selectedScholarship.provider}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-100 ${selectedScholarship.color} ${selectedScholarship.bg}`}>
                    {scholarshipCategories.find(c => c.id === selectedScholarship.categoryId)?.label}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">About the Scholarship</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">{selectedScholarship.explanation}</p>
                  </div>
                  
                  <div className="bg-[#F8F9FC] rounded-2xl p-6 border border-gray-100 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Eligibility Criteria</h3>
                      <p className="text-gray-800 font-semibold">{selectedScholarship.eligibility}</p>
                    </div>
                    <div className="w-full h-px bg-gray-200" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Benefits & Rewards</h3>
                      <p className="text-emerald-600 font-black text-lg">{selectedScholarship.benefit}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto shrink-0">
                <button 
                  onClick={(e) => handleShare(e, selectedScholarship.link, selectedScholarship.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  {copiedSchId === selectedScholarship.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                  {copiedSchId === selectedScholarship.id ? 'Copied Link!' : 'Share'}
                </button>
                <button 
                  onClick={() => handleLinkClick(selectedScholarship.link)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 ${selectedScholarship.color.replace('text-', 'bg-')} hover:opacity-90`}
                >
                  Apply on Official Site <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Scholarships;
