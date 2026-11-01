import React from 'react';

export const partners = [
    { name: 'Angel One', logo: '/images-optimized/angel one.webp', scale: 1.36 },
    { name: 'AOL', logo: '/images-optimized/aol.webp', scale: 1.24 },
    { name: 'Bajaj', logo: '/images-optimized/bajaj.webp', scale: 1.44 },
    { name: 'IBM', logo: '/images-optimized/ibm.webp', scale: 1.32 },
    { name: 'IIM B', logo: '/images-optimized/iim b.webp', scale: 1.32 },
    { name: 'Infosys', logo: '/images-optimized/infosys.webp', scale: 1.23 },
    { name: 'ISB', logo: '/images-optimized/isb.webp', scale: 1.5 },
    { name: 'Isha', logo: '/images-optimized/isha.webp' },
    { name: 'LIC', logo: '/images-optimized/lic.webp', scale: 1.4 },
    { name: 'Optum', logo: '/images-optimized/optum.webp', scale: 1.23 },
    { name: 'Stanford', logo: '/images-optimized/stanford.webp' },
    { name: 'TCS', logo: '/images-optimized/tcs.webp', scale: 1.37 },
    { name: 'Wharton', logo: '/images-optimized/wharton.webp', scale: 1.32 },
];

const OurPartners: React.FC = () => {
    // Triple for a seamless infinite loop
    const allPartners = [...partners, ...partners, ...partners];

    return (
        <section className="bg-white py-10 sm:py-16 overflow-hidden relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scroll-marquee {
                    0% { transform: translateX(calc(-100% / 3)); }
                    100% { transform: translateX(0); }
                }
                .marquee-track {
                    display: flex;
                    gap: 5rem;
                    width: max-content;
                    animation: scroll-marquee 50s linear infinite;
                }
                .marquee-track:hover {
                    animation-play-state: paused;
                }
                .partner-logo {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.02));
                }
                .partner-card {
                    transition: all 0.4s ease;
                }
                .partner-card:hover .partner-logo {
                    transform: scale(1.12) translateY(-4px);
                    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.15));
                }
            ` }} />

            {/* Section Title */}
            <div className="text-center mb-12 px-4">
                <h2 className="text-3xl md:text-5xl font-['Poppins'] font-extrabold text-black mb-4 tracking-tight uppercase">
                    Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">People From</span>
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-['Poppins'] font-medium max-w-3xl mx-auto">
                    Learners, professionals, and aspirants from leading companies, institutions, and ecosystems grow with STUDLYF.
                </p>
            </div>

            <div className="relative max-w-[1400px] mx-auto">
                {/* Edge Fades for Premium Look */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                <div className="marquee-track py-6 px-8">
                    {allPartners.map((partner, index) => (
                        <div
                            key={`${partner.name}-${index}`}
                            className="partner-card flex-shrink-0 w-40 h-16 flex items-center justify-center cursor-pointer"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="partner-logo max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `<span class="text-sm font-['Poppins'] font-semibold text-gray-400">${partner.name}</span>`;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurPartners;

