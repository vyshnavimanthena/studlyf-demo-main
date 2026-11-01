import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    title: 'Information Collection',
    content:
      'Studlyf collects information you provide directly, such as name, email, and registration details.',
  },
  {
    title: 'Usage Data',
    content:
      'We gather technical and usage data to improve platform performance and user experience.',
  },
  {
    title: 'Data Security',
    content:
      'Studlyf uses industry-standard safeguards to protect your personal information.',
  },
  {
    title: 'Third-Party Services',
    content:
      'We may share information with trusted service providers who support the operation of our platform.',
  },
  {
    title: 'Your Rights',
    content:
      'You can update your account information and request assistance if you have privacy concerns.',
  },
];

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Learn how we collect and protect your data.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="sticky top-28 h-fit bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-purple-700 mb-6">Overview</h2>
          <nav className="space-y-3">
            {items.map((item, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-12">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Studlyf Privacy Policy</h1>
            <p className="text-gray-500 leading-8 text-[15px]">
              This Privacy Policy explains what information we collect, how we use it, and your choices about your personal data.
            </p>
          </div>

          <div className="space-y-8">
            {items.map((item, index) => (
              <section
                key={index}
                id={`section-${index}`}
                className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-purple-700 mb-4">{item.title}</h2>
                <p className="text-gray-600 leading-8 text-[15px]">{item.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-500">
            <a href="#/" className="hover:text-purple-600 transition-colors">Home</a>
            <a href="#/terms" className="hover:text-purple-600 transition-colors">Terms & Conditions</a>
            <a href="#/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

