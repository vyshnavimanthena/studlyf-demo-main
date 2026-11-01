import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Rocket,
    Cpu,
    Globe,
    ArrowRight,
    Zap,
    Users,
    Layers,
    Code
} from 'lucide-react';

interface Project {
    id: number;
    title: string;
    shortDesc: string;
    longDesc: string;
    tag: string;
    skills: string[];
    techStack: string[];
    image: string;
    icon: React.ReactNode;
}

const projects: Project[] = [
    {
        id: 1,
        title: "AI-Powered Medical Diagnosis System",
        shortDesc: "Building a neural network to detect diseases from medical imaging with 98% accuracy.",
        longDesc: "This project involves developing a sophisticated deep learning model using Convolutional Neural Networks (CNNs) to analyze medical imagery. You will work with large-scale datasets, implement data augmentation techniques, and deploy the model using AWS SageMaker.",
        tag: "Artificial Intelligence",
        skills: ["Computer Vision", "Deep Learning", "Cloud Deployment"],
        techStack: ["Python", "PyTorch", "AWS", "Docker"],
        image: "https://images.unsplash.com/photo-1576091160550-2173599211d0?auto=format&fit=crop&q=80&w=800",
        icon: <Cpu className="w-5 h-5" />
    },
    {
        id: 2,
        title: "Next-Gen Fintech Trading Engine",
        shortDesc: "High-performance microservices architecture for real-time stock market data processing.",
        longDesc: "Build a low-latency trading engine capable of processing millions of transactions per second. Focus on event-driven architecture, distributed systems, and real-time data streaming using Kafka and Go.",
        tag: "Backend Engineering",
        skills: ["System Design", "Concurrency", "Message Queues"],
        techStack: ["Go", "Kafka", "Redis", "Kubernetes"],
        image: "https://images.unsplash.com/photo-1611974717482-aa8a2993880c?auto=format&fit=crop&q=80&w=800",
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: 3,
        title: "Web3 Decentralized Identity Protocol",
        shortDesc: "Designing a privacy-first identity solution on the Ethereum blockchain.",
        longDesc: "Implement a decentralized identity system using Zero-Knowledge Proofs. Explore blockchain security, smart contract audit processes, and cross-chain interoperability.",
        tag: "Blockchain",
        skills: ["Smart Contracts", "Cryptography", "Soliditry"],
        techStack: ["Solidity", "Hardhat", "Ethers.js", "IPFS"],
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
        icon: <Globe className="w-5 h-5" />
    },
    {
        id: 4,
        title: "Real-time Collaborative IDE",
        shortDesc: "Building a browser-based code editor with live collaboration features.",
        longDesc: "Create a rich-text editing experience with operational transforms or CRDTs for seamless multi-user collaboration. Implement terminal integration and file system virtualization.",
        tag: "Fullstack",
        skills: ["WebSockets", "Conflict Resolution", "WASM"],
        techStack: ["Next.js", "Node.js", "Socket.io", "Monaco Editor"],
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800",
        icon: <Rocket className="w-5 h-5" />
    }
];

const IndustryProjects: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const cardsToShow = 3;
    const totalProjects = projects.length;

    const nextProject = () => {
        setCurrentIndex((prev) => (prev + 1) % totalProjects);
    };

    const prevProject = () => {
        setCurrentIndex((prev) => (prev === 0 ? totalProjects - 1 : prev - 1));
    };

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
    };

    const handleCloseDetail = () => {
        setSelectedProject(null);
    };

    return (
        <section ref={containerRef} className="py-24 bg-[#F9FAFB] overflow-hidden relative font-poppins text-[#111827] min-h-[900px]">
            {/* Soft Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6C3BFF]/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6C3BFF]/5 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 h-full">
                {/* Header */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-none uppercase text-[#111827]">
                            Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C3BFF] to-[#9D7CFF]">Projects</span> Industry People Are Working On
                        </h2>
                        <p className="text-[#475569] text-lg font-medium max-w-2xl mx-auto">
                            Hands-on real-world projects designed with industry experts.
                        </p>
                    </motion.div>
                </div>

                {/* Main Content Area - Relative for positioning overlay */}
                <div className="relative min-h-[600px]">
                    <AnimatePresence mode="sync">
                        {!selectedProject ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="w-full"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                    {[...projects, ...projects].slice(currentIndex, currentIndex + 3).map((project, i) => (
                                        <motion.div
                                            key={`${project.id}-${i}`}
                                            layoutId={`card-${project.id}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: i * 0.1 }}
                                            whileHover={{ y: -10, boxShadow: "0 30px 60px -15px rgba(108, 59, 255, 0.15)" }}
                                            className="h-full bg-white rounded-[3.5rem] border border-gray-100 p-10 flex flex-col shadow-sm relative overflow-hidden group min-h-[480px] cursor-pointer"
                                            onClick={() => handleViewProject(project)}
                                        >
                                            <div className="relative z-20">
                                                <h3 className="text-3xl font-black mb-6 group-hover:text-[#6C3BFF] transition-colors leading-tight uppercase tracking-tighter text-[#111827]">
                                                    {project.title}
                                                </h3>
                                                <p className="text-[#475569] text-base mb-10 leading-relaxed line-clamp-4 font-medium">
                                                    {project.shortDesc}
                                                </p>
                                            </div>

                                            {/* Sublte Background Image */}
                                            <div className="absolute inset-0 z-0 opacity-[0.08] transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-110 pointer-events-none grayscale group-hover:grayscale-0">
                                                <img src={project.image} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/10" />
                                            </div>

                                            <div className="mt-auto relative z-20">
                                                <button
                                                    className="px-8 py-4 bg-[#6C3BFF] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#5A2EE5] transition-all shadow-lg shadow-[#6C3BFF]/20"
                                                >
                                                    View Project
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-6 mt-16">
                                    <div className="flex gap-2">
                                        {Array.from({ length: projects.length - 2 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-12 bg-[#6C3BFF]' : 'w-3 bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevProject(); }}
                                            className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-[#6C3BFF] hover:border-[#6C3BFF] hover:text-white transition-all group shadow-sm"
                                        >
                                            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextProject(); }}
                                            className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-[#6C3BFF] hover:border-[#6C3BFF] hover:text-white transition-all group shadow-sm"
                                        >
                                            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="overlay"
                                layoutId={`card-${selectedProject.id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute inset-x-0 inset-y-[-2rem] z-50 bg-white/95 backdrop-blur-3xl border border-gray-100 rounded-[4rem] p-12 md:p-16 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col"
                            >
                                <button
                                    onClick={handleCloseDetail}
                                    className="absolute top-10 right-10 p-4 bg-gray-50 hover:bg-[#6C3BFF] hover:text-white rounded-2xl transition-all group z-20 border border-gray-200"
                                >
                                    <ArrowRight className="w-6 h-6 rotate-180 group-hover:scale-110 transition-transform text-gray-500 group-hover:text-white" />
                                </button>

                                <div className="grid lg:grid-cols-2 gap-16 relative z-10 h-full">
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex flex-col justify-center"
                                    >
                                        <h3 className="text-4xl sm:text-5xl font-black mb-8 uppercase tracking-tighter text-[#6C3BFF] italic leading-tight">
                                            {selectedProject.title}
                                        </h3>
                                        <div className="space-y-8 mb-12">
                                            <p className="text-[#111827] text-xl leading-relaxed font-bold border-l-4 border-[#6C3BFF] pl-6">
                                                {selectedProject.shortDesc}
                                            </p>
                                            <p className="text-[#475569] text-lg leading-relaxed max-w-xl font-medium">
                                                {selectedProject.longDesc}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8 mb-12">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                                <div className="text-[#6C3BFF] scale-150">
                                                    {selectedProject.icon}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black uppercase tracking-[0.6em] text-[#6C3BFF]">Project Signature</span>
                                                <span className="text-sm text-[#111827] font-black tracking-widest uppercase">{selectedProject.tag}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <button className="px-16 py-6 bg-[#6C3BFF] text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm hover:scale-105 transition-all shadow-xl shadow-[#6C3BFF]/20 active:scale-95 border border-white/10">
                                                Collab Now
                                            </button>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative rounded-[4rem] overflow-hidden border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] group h-full min-h-[500px] flex flex-col"
                                    >
                                        <div className="flex-1 relative overflow-hidden">
                                            {/* High Visibility Image */}
                                            <img src={selectedProject.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />

                                            <div className="absolute top-8 left-8">
                                                <span className="px-6 py-2 bg-white/95 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-gray-100 text-[#6C3BFF] shadow-2xl">
                                                    In Development
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-10 bg-gray-50/50 backdrop-blur-3xl flex flex-wrap gap-4 border-t border-gray-100">
                                            {selectedProject.skills.map(skill => (
                                                <span key={skill} className="px-6 py-3 bg-white border border-gray-200 rounded-3xl text-[11px] font-black uppercase tracking-widest text-[#6C3BFF] shadow-sm hover:shadow-md transition-shadow">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#6C3BFF]/5 blur-[100px] rounded-full" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default IndustryProjects;

