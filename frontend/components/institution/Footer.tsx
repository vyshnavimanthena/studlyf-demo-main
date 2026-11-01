import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="h-10 bg-[#2C2C2C] text-white flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-bold fixed bottom-0 left-0 right-0 z-50">
            <div className="flex-1 text-left opacity-60">
                © {new Date().getFullYear()} Institution Dashboard System. All rights reserved.
            </div>
            
            <div className="flex-1 flex justify-center gap-8">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-400 transition-colors">About Us</a>
            </div>
            
            <div className="flex-1 text-right opacity-60">
                v1.0.4 | Support: {import.meta.env.VITE_SUPPORT_EMAIL || 'support@studlyf.com'}
            </div>
        </footer>
    );
};

export default Footer;

