import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, User, Mail, Globe, Phone, MessageSquare, HelpCircle, Loader2, ShieldCheck, type LucideIcon } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Fields sit on the purple panel: translucent white surface, white text, left-aligned placeholder after the icon.
const fieldClass =
    'h-12 border-white/40 bg-ds-ink/20 pl-11 text-white shadow-none placeholder:text-white focus-visible:border-white focus-visible:ring-white/30';

const FieldIcon: React.FC<{ icon: LucideIcon; top?: boolean }> = ({ icon: Icon, top }) => (
    <Icon aria-hidden="true" className={cn('pointer-events-none absolute left-4 size-[18px] text-white/90', top ? 'top-3.5' : 'top-1/2 -translate-y-1/2')} />
);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isVerified) {
            alert('Please complete the human verification to proceed.');
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
            alert('Email service is not configured properly.');
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
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error: any) {
            try { console.error('Failed to send email. Status:', error?.status, 'Text:', error?.text, 'Error:', error); } catch (_) {}
            alert(`Failed to send inquiry: ${error?.text || 'Unknown error. Check console.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="enquiry-form" aria-labelledby="enquiry-heading" className="studlyf-ds bg-ds-background pb-[72px] md:pb-[96px] lg:pb-[120px]">
            <div className="ds-container">
                <div className="relative mx-auto max-w-[880px] overflow-hidden rounded-ds-panel bg-ds-primary px-5 py-12 shadow-ds-lg sm:px-10 md:px-14 md:py-16">
                    <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-24 h-80 w-80 rounded-full bg-white/15 blur-[100px]" />

                    <header className="relative mb-10 text-center text-white">
                        <p className="ds-eyebrow mb-4 text-white/90">Contact</p>
                        <h2 id="enquiry-heading" className="ds-h2">Let&rsquo;s get to know each other</h2>
                        <p className="ds-subline mx-auto mt-3 max-w-xl text-white/90">Elevate your vision with our AI-driven expertise.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="relative">
                                <Label htmlFor="enquiry-name" className="sr-only">Full name (required)</Label>
                                <FieldIcon icon={User} />
                                <Input id="enquiry-name" name="name" type="text" autoComplete="name" placeholder="Full name *" value={formData.name} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div className="relative">
                                <Label htmlFor="enquiry-email" className="sr-only">Email address (required)</Label>
                                <FieldIcon icon={Mail} />
                                <Input id="enquiry-email" name="email" type="email" autoComplete="email" placeholder="Email address *" value={formData.email} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div className="relative">
                                <Label htmlFor="enquiry-country" className="sr-only">Your country (required)</Label>
                                <FieldIcon icon={Globe} />
                                <Input id="enquiry-country" name="country" type="text" autoComplete="country-name" placeholder="Your country *" value={formData.country} onChange={handleChange} required className={fieldClass} />
                            </div>
                            <div className="relative">
                                <Label htmlFor="enquiry-phone" className="sr-only">Phone number</Label>
                                <FieldIcon icon={Phone} />
                                <Input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" value={formData.phone} onChange={handleChange} className={fieldClass} />
                            </div>
                        </div>

                        <div className="relative">
                            <Label htmlFor="enquiry-description" className="sr-only">What describes you best? (required)</Label>
                            <FieldIcon icon={MessageSquare} />
                            <Select
                                name="description"
                                required
                                value={formData.description}
                                onValueChange={(value) => setFormData({ ...formData, description: value })}
                            >
                                <SelectTrigger id="enquiry-description" className={cn(fieldClass, 'data-[placeholder]:text-white [&>svg]:text-white [&>svg]:opacity-100')}>
                                    <SelectValue placeholder="What describes you best? *" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="learner">Student / Learner</SelectItem>
                                    <SelectItem value="professional">Industry Professional</SelectItem>
                                    <SelectItem value="partner">Strategic Partner</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative">
                            <Label htmlFor="enquiry-questions" className="sr-only">Any questions for us?</Label>
                            <FieldIcon icon={HelpCircle} top />
                            <Textarea id="enquiry-questions" name="questions" rows={4} placeholder="Any questions for us?" value={formData.questions} onChange={handleChange} className={cn(fieldClass, 'h-auto min-h-28 resize-none')} />
                        </div>

                        <div className="flex items-center gap-3 rounded-ds-control border border-white/40 bg-ds-ink/20 px-4 py-3 text-white sm:w-fit">
                            <Checkbox
                                id="enquiry-verify"
                                checked={isVerified}
                                onCheckedChange={(v) => setIsVerified(v === true)}
                                className="border-white/70 bg-transparent data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-ds-primary"
                            />
                            <Label htmlFor="enquiry-verify" className="cursor-pointer text-[15px] text-white">Secured by human verification</Label>
                            <ShieldCheck className="size-4 text-white" aria-hidden="true" />
                        </div>

                        <div className="flex flex-col items-center pt-3">
                            <Button type="submit" variant="white" size="lg" disabled={isSubmitting} className="group min-w-56">
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
                            <div className="pointer-events-none relative mt-2">
                                <InteractiveCreature targetButtonText="Submit inquiry" />
                            </div>
                        </div>
                    </form>

                    <AnimatePresence>
                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                role="status"
                                className="absolute inset-0 z-20 flex items-center justify-center bg-ds-primary/95"
                            >
                                <div className="space-y-5 px-10 text-center text-white">
                                    <h3 className="text-3xl font-bold">Inquiry sent</h3>
                                    <p className="text-white/90">Thank you for reaching out.</p>
                                    <Button variant="white" onClick={() => setIsSubmitted(false)}>Submit another</Button>
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
