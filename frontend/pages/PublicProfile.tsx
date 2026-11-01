import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';
import {
  ArrowLeft, Award, Briefcase, Code, FileText,
  Github, Globe, Linkedin, MapPin, Share2, Sparkles,
  Star, Twitter, User, GraduationCap, Settings, Copy, Eye, Download, Link as LinkIcon, ShieldCheck
} from 'lucide-react';
import AvatarImage from '../components/AvatarImage';
import { ContributionSummary, type Contribution } from '../components/talent/ProjectContributions';

type PublicContribution = Contribution & { project_ref: string; project_title: string; source: 'profile' | 'sdl' };
const normTitle = (t: unknown) => String(t || '').trim().toLowerCase().replace(/\s+/g, ' ');

const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [contributions, setContributions] = useState<PublicContribution[]>([]);

  const publicUrl = useMemo(() => {
    if (!userId || typeof window === 'undefined') return '';
    return `${window.location.origin}/#/profile/${userId}`;
  }, [userId]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('Profile link is missing a user id.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/user/${userId}/profile`);
        if (!res.ok) {
          throw new Error('Profile not found');
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  useEffect(() => {
    // "My contribution" (404 while the feature is off on the server: nothing is shown)
    if (!userId) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/v1/contributions/users/${encodeURIComponent(userId)}`)
      .then(res => (res.ok ? res.json() : { contributions: [] }))
      .then(data => { if (!cancelled) setContributions(Array.isArray(data?.contributions) ? data.contributions : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareProfile = async () => {
    if (!publicUrl) return;
    const payload = {
      title: `${profile?.full_name || 'Studlyf Profile'}`,
      text: `View ${profile?.full_name || 'this profile'} on Studlyf.`,
      url: publicUrl,
    };

    if (navigator.share) {
      await navigator.share(payload);
      return;
    }

    await copyLink();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] px-4 py-8 sm:px-6 lg:px-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-[3rem] border border-gray-100 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Profile unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">{error || 'The profile you requested could not be loaded.'}</p>
          <div className="mt-6 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#7C3AED]/20">
              <ArrowLeft className="h-4 w-4" /> Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const achievements = Array.isArray(profile?.achievements) ? profile.achievements : [];
  const profileProjects = Array.isArray(profile?.projects) ? profile.projects : [];
  const profileContribution = (title: unknown) =>
    contributions.find(c => c.source === 'profile' && normTitle(c.project_title) === normTitle(title)) || null;
  // Team projects only appear here through the builder's own contribution
  const projects = [
    ...profileProjects.map((proj: any) => (proj && typeof proj === 'object' ? { ...proj, contribution: profileContribution(proj.title) } : proj)),
    ...contributions.filter(c => c.source === 'sdl').map(c => ({ title: c.project_title, description: '', team: true, contribution: c })),
  ];
  const experience = Array.isArray(profile?.experienceList) ? profile.experienceList : [];
  const certifications = Array.isArray(profile?.certifications) ? profile.certifications : [];
  const education = Array.isArray(profile?.educationList) ? profile.educationList : [];
  const isVisible = profile?.profileVisible ?? true;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.full_name || 'Contributor Profile';
  const role = profile?.userType || profile?.role || 'Contributor';
  const headline = profile?.bio || profile?.careerGoal || 'Contributor profile on Studlyf';
  const resume = profile?.resume;
  const preference = profile?.preferredWork;

  return (
      <div className="min-h-screen bg-[#F4F4F6] px-3 py-6 sm:px-4 sm:py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-700 shadow-sm transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED]">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 shadow-sm border border-gray-100">
            <Globe className="h-3 w-3 text-[#7C3AED]" /> Public Profile
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3rem] border border-gray-100 bg-white p-4 sm:p-8 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] w-full mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#06B6D4]/10 pointer-events-none" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between w-full">
            <div className="flex items-start gap-5 flex-1 w-full">
              <div className="flex h-16 w-16 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-white bg-gray-50 shadow-xl ring-4 ring-[#7C3AED]/10">
                {profile.profilePhoto ? <AvatarImage src={profile.profilePhoto} alt={name} className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-gray-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 flex-wrap">
                  <h1 className="break-words text-2xl sm:text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{name}</h1>
                  {/* Social Links */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    {typeof profile.github === 'string' && profile.github.trim() && <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"><Github className="w-5 h-5" /></a>}
                    {typeof profile.linkedin === 'string' && profile.linkedin.trim() && <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] transition"><Linkedin className="w-5 h-5" /></a>}
                    {typeof profile.leetcode === 'string' && profile.leetcode.trim() && <a href={profile.leetcode.startsWith('http') ? profile.leetcode : `https://${profile.leetcode}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#FFA116]/10 hover:bg-[#FFA116]/20 text-[#FFA116] transition"><Code className="w-5 h-5" /></a>}
                    {typeof profile.twitter === 'string' && profile.twitter.trim() && <a href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition"><Twitter className="w-5 h-5" /></a>}
                    {typeof profile.portfolio === 'string' && profile.portfolio.trim() && <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] transition"><Globe className="w-5 h-5" /></a>}
                  </div>
                </div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED]">
                  <Sparkles className="h-3 w-3" /> {role}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>}
                  {profile.domain && <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{profile.domain}</span>}
                  {!isVisible && <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 font-medium text-amber-700">Visibility limited</span>}
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-3 md:w-64 shrink-0">
              <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-900 transition hover:border-[#7C3AED]/30">
                <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button onClick={shareProfile} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#7C3AED] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#7C3AED]/20 transition hover:bg-[#6D28D9]">
                <Share2 className="h-4 w-4" /> Share Profile
              </button>
            </div>
          </div>
        </section>

        {/* Describe Yourself Section */}
        <section className="mb-8 rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-8 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
            <div className="bg-[#7C3AED]/10 p-2 rounded-xl text-[#7C3AED]">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Describe yourself</h3>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Bio</h4>
              <p className="text-sm leading-relaxed text-gray-700">{headline || <span className="text-gray-400 italic">No bio provided</span>}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Username</h4>
                <p className="text-sm font-bold text-gray-900">@{profile.username || profile.login || 'User'}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">One Strong Word</h4>
                {profile.oneStrongWord ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#1D4ED8]">
                    <Sparkles className="h-3 w-3" /> {profile.oneStrongWord}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">None</span>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Career Goal</h4>
                <p className="text-sm font-bold text-gray-900">{profile.careerGoal || <span className="text-gray-400 italic font-normal">Not specified</span>}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column */}
          <div className="space-y-8 lg:col-span-1">

            {/* Resume Section */}
            <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                <div className="bg-[#7C3AED]/10 p-2 rounded-xl text-[#7C3AED]">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Resume</h3>
              </div>
              <div>
                {resume?.fileName && resume.fileName !== 'No resume uploaded' ? (
                  <div>
                    <p className="text-sm font-bold text-gray-900 break-words" title={resume.fileName}>{resume.fileName}</p>
                    {resume.atsScore > 0 && <p className="text-xs text-gray-500 mt-1">ATS Score: {resume.atsScore}%</p>}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
                      <a
                        href={resume.filePath ? `${API_BASE_URL}${resume.filePath}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl transition border border-gray-200"
                      >
                        <Eye className="w-4 h-4" /> See
                      </a>
                      <a
                        href={resume.filePath ? `${API_BASE_URL}${resume.filePath}` : '#'}
                        download
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-[#7C3AED]/20"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 font-medium">No resume available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Experience Section */}
            <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Experience</h3>
              </div>
              <div className="space-y-5">
                {experience.length > 0 ? (
                  experience.map((exp: any, idx: number) => (
                    <div key={idx} className="bg-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-50">
                      <h4 className="text-base font-black text-gray-900">{exp.role || exp.title}</h4>
                      <p className="text-sm font-bold text-emerald-700 mt-1">{exp.company}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {exp.type && <span className="text-[10px] font-black uppercase tracking-wider bg-white px-2 py-1 rounded-md text-emerald-600 border border-emerald-100">{exp.type}</span>}
                        {exp.location && <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">{exp.location}</span>}
                      </div>
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No experience listed</p>
                )}
              </div>
            </section>

            {/* Skills Section */}
            <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Skills</h3>
                </div>
                <span className="bg-rose-50 text-rose-700 py-1 px-3 rounded-full text-[10px] font-black">{skills.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill: any, idx: number) => (
                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {skill.name || String(skill)}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic w-full">No skills added</p>
                )}
              </div>
            </section>

          </div>

          {/* Right Column */}
          <div className="space-y-8 lg:col-span-2">

            {/* Education Section */}
            <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="bg-sky-100 p-2 rounded-xl text-sky-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Education</h3>
              </div>
              <div className="space-y-4">
                {education.length > 0 ? (
                  education.map((edu: any, idx: number) => (
                    <div key={idx} className="bg-sky-50/40 p-5 rounded-2xl border border-sky-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-black text-gray-900">{edu.institution}</h4>
                        <p className="text-sm font-bold text-sky-700 mt-1">{edu.degree}</p>
                      </div>
                      {(edu.startYear || edu.endYear) && (
                        <div className="shrink-0 bg-white px-3 py-1.5 rounded-lg border border-sky-100 text-xs font-black text-sky-600 uppercase tracking-widest">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No education details</p>
                )}
              </div>
            </section>

            {/* Projects Section */}
            <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Projects</h3>
                </div>
                <span className="bg-amber-50 text-amber-700 py-1 px-3 rounded-full text-[10px] font-black">{projects.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {projects.length > 0 ? (
                  projects.map((proj: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-amber-200 transition">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-gray-900">{proj.title || proj.name}</h4>
                          {proj.team && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-500">Team project</span>
                          )}
                        </div>
                        {proj.description && <p className="text-sm text-gray-600 leading-relaxed">{proj.description}</p>}
                        {proj.contribution && (
                          <div className={`studlyf-ds grid gap-2 ${proj.description ? 'mt-4 border-t border-gray-100 pt-4' : ''}`}>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">My contribution</p>
                            <ContributionSummary contribution={proj.contribution} />
                          </div>
                        )}
                      </div>
                      {proj.link && (
                        <div className="shrink-0">
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black uppercase tracking-wider text-amber-600 hover:text-amber-700 hover:bg-amber-100 transition-colors">
                            <LinkIcon className="w-4 h-4" /> View Link
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No projects added</p>
                )}
              </div>
            </section>

            {/* Two columns for Certs & Accomplishments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">

              {/* Certificates Section */}
              <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Certificates</h3>
                  </div>
                  <span className="bg-cyan-50 text-cyan-700 py-1 px-3 rounded-full text-[10px] font-black">{certifications.length}</span>
                </div>
                <div className="space-y-4">
                  {certifications.length > 0 ? (
                    certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-50 hover:border-cyan-100 transition shadow-sm">
                        <div className="bg-cyan-50 p-3 rounded-xl shrink-0 border border-cyan-100/50">
                          <Award className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900">{cert.title || cert.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-cyan-700">{cert.issuer || cert.organization}</span>
                            {cert.date && <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-bold">{cert.date}</span>}
                          </div>
                          {cert.credentialId && <p className="text-[10px] text-gray-400 mt-2 font-mono">ID: {cert.credentialId}</p>}
                          {cert.link && (
                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-600 hover:text-cyan-700 bg-cyan-50/50 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition">
                              <LinkIcon className="w-3 h-3" /> View Credential
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No certificates uploaded</p>
                  )}
                </div>
              </section>

              {/* Accomplishments Section */}
              <section className="rounded-[2rem] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                      <Star className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Accomplishments</h3>
                  </div>
                  <span className="bg-violet-50 text-violet-700 py-1 px-3 rounded-full text-[10px] font-black">{achievements.length}</span>
                </div>
                <div className="space-y-4">
                  {achievements.length > 0 ? (
                    achievements.map((ach: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-50 hover:border-violet-100 transition shadow-sm">
                        <div className="bg-violet-50 p-3 rounded-xl shrink-0 border border-violet-100/50">
                          <Star className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900">{ach.title || ach.name}</h4>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {ach.organization && <span className="text-xs font-bold text-violet-700">{ach.organization}</span>}
                            {ach.category && <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-bold">{ach.category}</span>}
                            {(ach.month || ach.year || ach.date) && (
                              <span className="text-[10px] text-gray-400 font-bold">
                                {[ach.month, ach.year || ach.date].filter(Boolean).join(' ')}
                              </span>
                            )}
                          </div>

                          {ach.description && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{ach.description}</p>}

                          {ach.link && (
                            <a href={ach.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600 hover:text-violet-700 bg-violet-50/50 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition">
                              <LinkIcon className="w-3 h-3" /> View Detail
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No accomplishments to show</p>
                  )}
                </div>
              </section>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
