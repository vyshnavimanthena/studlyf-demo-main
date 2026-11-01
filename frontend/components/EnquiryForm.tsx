import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Loader2, ShieldCheck, GraduationCap, Briefcase, Handshake, Sparkles } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const roles = [
    { value: 'learner', label: 'Student', icon: GraduationCap },
    { value: 'professional', label: 'Professional', icon: Briefcase },
    { value: 'partner', label: 'Partner', icon: Handshake },
    { value: 'other', label: 'Other', icon: Sparkles },
];

const fieldClass = 'mt-2 h-12 bg-white';

const EnquiryForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        country: '',
        phone: '',
        description: '',
        questions: ''
    });
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.description) {
            setError('Please choose what describes you best.');
            return;
        }
        if (!isVerified) {
            setError('Please complete the human verification to proceed.');
            return;
        }

        setIsSubmitting(true);

        const serviceId = import.meta.env.VITE_EMAIL_JS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAIL_JS_USER_ID;

        // Clean any potential whitespace from environment variables
        const cleanServiceId = serviceId?.trim();
        const cleanTemplateId = templateId?.trim();
        const cleanPublicKey = publicKey?.trim();

        if (!cleanServiceId || !cleanTemplateId || !cleanPublicKey) {
            console.error('Missing EmailJS Configuration! Please check your .env file.', { 
                serviceId: cleanServiceId, 
                templateId: cleanTemplateId, 
                publicKey: cleanPublicKey ? '***' : undefined 
            });
            setError('Sending is not set up yet. Please email support@studlyf.com instead.');
            setIsSubmitting(false);
            return;
        }

        const templateParams = {
            to_email: 'vishnumaxpolla32@gmail.com',
            from_name: formData.name,
            from_email: formData.email,
            country: formData.country,
            phone: formData.phone,
            description: formData.description,
            questions: formData.questions,
            // Fallbacks in case the template uses different variable names
            name: formData.name,
            email: formData.email,
            message: formData.questions
        };

        try {
            await emailjs.send(cleanServiceId, cleanTemplateId, templateParams, {
                publicKey: cleanPublicKey
            });
            
            setIsSubmitted(true);
            setFormData({
                name: '',
                email: '',
                country: '',
                phone: '',
                description: '',
                questions: ''
            });
            setIsVerified(false);
                    } catch (err: any) {
            try { console.error('Failed to send email. Status:', err?.status, 'Text:', err?.text, 'Error:', err); } catch (_) {}
            setError('We could not send your inquiry. Please try again or email support@studlyf.com.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="enquiry-form" aria-labelledby="enquiry-heading" className="studlyf-ds bg-ds-background pb-[72px] md:pb-[96px] lg:pb-[120px]">
            <div className="ds-container">
                <div className="relative mx-auto grid max-w-[1120px] overflow-hidden rounded-ds-panel bg-white ring-1 ring-ds-border shadow-ds-md lg:grid-cols-[2fr_3fr]">
                    {/* Left: the invitation, with the mascot waiting for your message */}
                    <div className="relative flex flex-col overflow-hidden bg-ds-lavender p-8 sm:p-10">
                        <div aria-hidden="true" className="absolute -right-24 -bottom-24 size-80 rounded-full bg-ds-lavender-strong" />
                        <header className="relative">
                            <p className="ds-eyebrow mb-4">Contact</p>
                            <h2 id="enquiry-heading" className="ds-h2 text-ds-foreground lg:!text-[38px]">
                                Let&rsquo;s get to know <br className="hidden lg:block" /><span className="ds-gradient-text">each other</span>
                            </h2>
                            <p className="ds-subline mt-4">Whether you&rsquo;re learning, hiring or hosting, tell us what you have in mind.</p>
                        </header>
                        <div aria-hidden="true" className="pointer-events-none relative mt-10 hidden flex-1 items-end justify-center lg:flex">
                            <InteractiveCreature targetButtonText="Submit inquiry" />
                        </div>
                    </div>

                    {/* Right: the form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-10 lg:p-12">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <Label htmlFor="enquiry-name">Full name <span className="text-ds-primary">*</span></Label>
                                <Input id="enquiry-name" name="name" type="text" autoComplete="name" placeholder="Your name" value={formData.name} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div>
                                <Label htmlFor="enquiry-email">Email address <span className="text-ds-primary">*</span></Label>
                                <Input id="enquiry-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div>
                                <Label htmlFor="enquiry-country">Country <span className="text-ds-primary">*</span></Label>
                                <Input id="enquiry-country" name="country" type="text" autoComplete="country-name" placeholder="India" value={formData.country} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div>
                                <Label htmlFor="enquiry-phone">Phone number</Label>
                                <Input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" placeholder="Optional" value={formData.phone} onChange={handleChange} className={fieldClass} />
                            </div>
                        </div>

                        <fieldset>
                            <legend className="text-sm font-medium text-ds-foreground">What describes you best? <span className="text-ds-primary">*</span></legend>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {roles.map((r) => {
                                    const on = formData.description === r.value;
                                    return (
                                        <label
                                            key={r.value}
                                            className={cn(
                                                'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-ds-control border text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ds-ring',
                                                on ? 'border-ds-primary bg-ds-primary text-white' : 'border-ds-border bg-white text-ds-muted-foreground hover:border-ds-primary/50 hover:text-ds-foreground',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="description"
                                                value={r.value}
                                                checked={on}
                                                onChange={() => { setFormData({ ...formData, description: r.value }); setError(''); }}
                                                className="sr-only"
                                            />
                                            <r.icon className="size-4" aria-hidden="true" />
                                            {r.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <div>
                            <Label htmlFor="enquiry-questions">Any questions for us?</Label>
                            <Textarea id="enquiry-questions" name="questions" rows={3} placeholder="Tell us a little more" value={formData.questions} onChange={handleChange} className="mt-2 min-h-24 resize-none bg-white" />
                        </div>

                        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2.5">
                                <Checkbox id="enquiry-verify" checked={isVerified} onCheckedChange={(v) => { setIsVerified(v === true); setError(''); }} />
                                <Label htmlFor="enquiry-verify" className="cursor-pointer text-sm font-normal text-ds-muted-foreground">I&rsquo;m a human</Label>
                                <ShieldCheck className="size-4 text-ds-primary" aria-hidden="true" />
                            </div>
                            <Button type="submit" size="lg" disabled={isSubmitting} className="group">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" aria-hidden="true" />
                                        Sending…
                                    </>
                                ) : (
                                    <>
                                        Submit inquiry
                                        <Send className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
                    </form>

                    <AnimatePresence>
                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                role="status"
                                className="absolute inset-0 z-20 flex items-center justify-center bg-white/95"
                            >
                                <div className="space-y-5 px-10 text-center">
                                    <h3 className="text-3xl font-bold text-ds-foreground">Inquiry sent</h3>
                                    <p className="text-ds-muted-foreground">Thank you for reaching out.</p>
                                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Submit another</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default EnquiryForm;
