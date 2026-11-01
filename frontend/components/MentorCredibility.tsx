import React from 'react';

const companyLogos = [
    // --- FAR LEFT COLUMN (x: 2% | y: 10, 30, 50, 70, 90) ---
    { name: 'Google', fileName: 'google.webp', position: { top: '10%', left: '2%' }, size: 'large', delay: 0 },
    { name: 'Uber', fileName: 'uber.webp', position: { top: '30%', left: '2%' }, size: 'medium', delay: 0.6 },
    { name: 'Adobe', fileName: 'adobe.webp', position: { top: '50%', left: '2%' }, size: 'small', delay: 0.8 },
    { name: 'Airbnb', fileName: 'airbnb.webp', position: { top: '70%', left: '2%' }, size: 'medium', delay: 1.2 },
    { name: 'Intel', fileName: 'intel.webp', position: { top: '90%', left: '2%' }, size: 'small', delay: 1.4 },

    // --- INNER LEFT COLUMN (x: 9% | y: 20, 40, 60, 80) ---
    { name: 'Microsoft', fileName: 'microsoft.webp', position: { top: '20%', left: '9%' }, size: 'medium', delay: 0.2 },
    { name: 'IBM', fileName: 'ibm.webp', position: { top: '40%', left: '9%' }, size: 'large', delay: 1.0 },
    { name: 'Oracle', fileName: 'oracle.webp', position: { top: '60%', left: '9%' }, size: 'medium', delay: 1.6 },
    { name: 'Amazon', fileName: 'amazon.webp', position: { top: '80%', left: '9%' }, size: 'small', delay: 0.4 },

    // --- FAR RIGHT COLUMN (x: 2% | y: 10, 30, 50, 70, 90) ---
    { name: 'Apple', fileName: 'apple.webp', position: { top: '10%', right: '2%' }, size: 'large', delay: 0.1 },
    { name: 'Infosys', fileName: 'infosys.webp', position: { top: '30%', right: '2%' }, size: 'medium', delay: 0.7 },
    { name: 'Tesla', fileName: 'tesla.webp', position: { top: '50%', right: '2%' }, size: 'small', delay: 0.9 },
    { name: 'LinkedIn', fileName: 'linkedin.webp', position: { top: '70%', right: '2%' }, size: 'medium', delay: 1.3 },
    { name: 'NVIDIA', fileName: 'nvidia.webp', position: { top: '90%', right: '2%' }, size: 'small', delay: 1.5 },

    // --- INNER RIGHT COLUMN (x: 9% | y: 20, 40, 60, 80) ---
    { name: 'Meta', fileName: 'meta.webp', position: { top: '20%', right: '9%' }, size: 'medium', delay: 0.3 },
    { name: 'Wipro', fileName: 'wipro.webp', position: { top: '40%', right: '9%' }, size: 'large', delay: 1.1 },
    { name: 'Salesforce', fileName: 'salesforce.webp', position: { top: '60%', right: '9%' }, size: 'medium', delay: 1.7 },
    { name: 'Netflix', fileName: 'netflix.webp', position: { top: '80%', right: '9%' }, size: 'small', delay: 0.5 },

    // --- TOP SHELF (Stay near the ceiling) ---
    { name: 'Stripe', fileName: 'stripe.webp', position: { top: '4%', left: '25%' }, size: 'small', delay: 1.9 },
    { name: 'Flipkart', fileName: 'flipkart.webp', position: { top: '4%', left: '50%' }, size: 'small', delay: 2.3 },
    { name: 'PayPal', fileName: 'paypal.webp', position: { top: '4%', right: '25%' }, size: 'small', delay: 2.1 },

    // --- BOTTOM SHELF (Stay near the floor) ---
    { name: 'TCS', fileName: 'tcs.webp', position: { bottom: '4%', left: '25%' }, size: 'medium', delay: 2.5 },
    { name: 'Accenture', fileName: 'accenture.webp', position: { bottom: '4%', left: '42%' }, size: 'small', delay: 2.7 },
    { name: 'JPMorgan', fileName: 'jpmorgan.webp', position: { bottom: '4%', right: '42%' }, size: 'small', delay: 2.9 },
    { name: 'Goldman Sachs', fileName: 'goldman-sachs.webp', position: { bottom: '4%', right: '25%' }, size: 'small', delay: 3.1 },
];




const MentorCredibility: React.FC = () => {
    return (
        <section aria-labelledby="mentors-heading" className="studlyf-ds ds-section ds-band relative overflow-hidden">
            <div className="ds-container">
                <header className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
                    <p className="ds-eyebrow mb-4">Mentor network</p>
                    <h2 id="mentors-heading" className="ds-h2 text-ds-foreground">
                        Our mentors are from <span className="ds-gradient-text">50+ MNCs</span>
                    </h2>
                    <p className="ds-subline mx-auto mt-4 max-w-2xl">
                        Guided by professionals shaping the world&rsquo;s leading organizations.
                    </p>
                </header>

                <ul className="mx-auto flex max-w-[1040px] flex-wrap justify-center gap-3 sm:gap-4 md:gap-5" aria-label="Companies our mentors come from">
                    {companyLogos.map((logo) => (
                        <li
                            key={logo.name}
                            className="flex size-[76px] items-center justify-center rounded-full border border-ds-border bg-white shadow-ds-sm sm:size-[88px] md:size-24"
                        >
                            <img
                                src={`/images-optimized/${logo.fileName}`}
                                alt={logo.name}
                                title={logo.name}
                                className="h-7 w-[58%] object-contain sm:h-8 md:h-9"
                                decoding="async"
                                loading="lazy"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default MentorCredibility;
