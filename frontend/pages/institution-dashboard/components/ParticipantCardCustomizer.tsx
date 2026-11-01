import React, { useState, useEffect } from 'react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { Loader2, Save, Eye, Plus, Trash2, Upload } from 'lucide-react';

interface CardStyle {
  backgroundFrom: string;
  backgroundTo: string;
  textColor: string;
  accentColor: string;
}

interface PosterStyle {
  background: string;
  accentColor: string;
  headerText: string;
}

interface Sponsor {
  name: string;
  label: string;
  logo?: string;
}

interface CardLink {
  label: string;
  url: string;
}

interface CardConfig {
  cardStyle: CardStyle;
  posterStyle: PosterStyle;
  sponsors: Sponsor[];
  links: CardLink[];
  participantName: string;
  eventName: string;
  institutionName: string;
  teamName: string;
  registrationId: string;
  designation: string;
  achievements: string;
  hashtags: string;
}

const DESIGNATION_OPTIONS = ['Participant', 'Shortlisted', 'Winner', 'Volunteer', 'Judge'];

const DEFAULT_CONFIG: CardConfig = {
  cardStyle: {
    backgroundFrom: '#2A1758',
    backgroundTo: '#7c154b',
    textColor: '#ffffff',
    accentColor: '#6C3BFF',
  },
  posterStyle: {
    background: '#fdfae7',
    accentColor: '#ea580c',
    headerText: "India's Largest Summer AI Hackathon",
  },
  sponsors: [],
  links: [],
  participantName: 'John Doe',
  eventName: 'Event Name',
  institutionName: 'University Name',
  teamName: 'Team Alpha',
  registrationId: '123456',
  designation: 'Participant',
  achievements: 'Built an AI-powered solution\nWon Best Innovation award',
  hashtags: '#Innovation #Hackathon #Studlyf',
};

const ParticipantCardCustomizer: React.FC<{ eventId: string; institutionId: string }> = ({ eventId, institutionId }) => {
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewTab, setPreviewTab] = useState<'card' | 'poster'>('card');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/institution/events/${eventId}/card-config`,
          { headers: authHeaders() }
        );
        if (res.ok) {
          const data = await res.json();
          setConfig({
            ...DEFAULT_CONFIG,
            cardStyle: { ...DEFAULT_CONFIG.cardStyle, ...data.cardStyle },
            posterStyle: { ...DEFAULT_CONFIG.posterStyle, ...data.posterStyle },
            sponsors: data.sponsors || [],
            links: data.links || [],
            eventName: data.eventName || DEFAULT_CONFIG.eventName,
            institutionName: data.institutionName || DEFAULT_CONFIG.institutionName,
            designation: data.designation || DEFAULT_CONFIG.designation,
            hashtags: data.hashtags || DEFAULT_CONFIG.hashtags,
          });
        }
      } catch (e) {
        console.error('Error fetching card config:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [eventId]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        cardStyle: config.cardStyle,
        posterStyle: config.posterStyle,
        sponsors: config.sponsors,
        links: config.links,
        eventName: config.eventName,
        institutionName: config.institutionName,
        designation: config.designation,
        hashtags: config.hashtags,
      };
      const res = await fetch(
        `${API_BASE_URL}/api/v1/institution/events/${eventId}/card-config`,
        {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Error saving card config:', e);
    } finally {
      setSaving(false);
    }
  };

  const addSponsor = () => {
    setConfig(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { name: '', label: '', logo: '' }],
    }));
  };

  const updateSponsor = (idx: number, field: keyof Sponsor, value: string) => {
    setConfig(prev => {
      const sponsors = [...prev.sponsors];
      sponsors[idx] = { ...sponsors[idx], [field]: value };
      return { ...prev, sponsors };
    });
  };

  const removeSponsor = (idx: number) => {
    setConfig(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== idx),
    }));
  };

  const addLink = () => {
    setConfig(prev => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }],
    }));
  };

  const updateLink = (idx: number, field: keyof CardLink, value: string) => {
    setConfig(prev => {
      const links = [...prev.links];
      links[idx] = { ...links[idx], [field]: value };
      return { ...prev, links };
    });
  };

  const removeLink = (idx: number) => {
    setConfig(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const cs = config.cardStyle;
  const ps = config.posterStyle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Participant Card Customization</h3>
          <p className="text-sm text-slate-500">Customize colors, themes, and sponsors for the participant card.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div className="space-y-6">
          {/* Card Style */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Card Style (Badge)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Background From</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={cs.backgroundFrom}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, backgroundFrom: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cs.backgroundFrom}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, backgroundFrom: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Background To</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={cs.backgroundTo}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, backgroundTo: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cs.backgroundTo}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, backgroundTo: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Text Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={cs.textColor}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, textColor: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cs.textColor}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, textColor: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Accent Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={cs.accentColor}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, accentColor: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cs.accentColor}
                    onChange={e => setConfig(prev => ({ ...prev, cardStyle: { ...prev.cardStyle, accentColor: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Poster Style */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Poster Style</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Poster Background</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={ps.background}
                    onChange={e => setConfig(prev => ({ ...prev, posterStyle: { ...prev.posterStyle, background: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={ps.background}
                    onChange={e => setConfig(prev => ({ ...prev, posterStyle: { ...prev.posterStyle, background: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Poster Accent Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={ps.accentColor}
                    onChange={e => setConfig(prev => ({ ...prev, posterStyle: { ...prev.posterStyle, accentColor: e.target.value } }))}
                    className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={ps.accentColor}
                    onChange={e => setConfig(prev => ({ ...prev, posterStyle: { ...prev.posterStyle, accentColor: e.target.value } }))}
                    className="flex-1 p-2 text-xs border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Header Text</label>
                <input
                  type="text"
                  value={ps.headerText}
                  onChange={e => setConfig(prev => ({ ...prev, posterStyle: { ...prev.posterStyle, headerText: e.target.value } }))}
                  className="mt-1 w-full p-2 text-sm border border-slate-200 rounded"
                  placeholder="India's Largest Summer AI Hackathon"
                />
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-1">Preview Content</h4>
            <p className="text-xs text-slate-400 mb-4">Fields marked <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded">Preview only</span> are for sample display and won't be saved.</p>

            <div className="mb-4 pb-3 border-b border-slate-100">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saved with config</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Event Name</label>
                  <input type="text" value={config.eventName}
                    onChange={e => setConfig(prev => ({ ...prev, eventName: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Institution Name</label>
                  <input type="text" value={config.institutionName}
                    onChange={e => setConfig(prev => ({ ...prev, institutionName: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Designation</label>
                  <select value={config.designation}
                    onChange={e => setConfig(prev => ({ ...prev, designation: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded bg-white">
                    {DESIGNATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Hashtags</label>
                  <input type="text" value={config.hashtags}
                    onChange={e => setConfig(prev => ({ ...prev, hashtags: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" placeholder="#Innovation #Hackathon" />
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview only <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded ml-1">Preview only</span></h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Participant Name</label>
                  <input type="text" value={config.participantName}
                    onChange={e => setConfig(prev => ({ ...prev, participantName: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Team Name</label>
                  <input type="text" value={config.teamName}
                    onChange={e => setConfig(prev => ({ ...prev, teamName: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Registration ID</label>
                  <input type="text" value={config.registrationId}
                    onChange={e => setConfig(prev => ({ ...prev, registrationId: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Achievements (one per line)</label>
                  <textarea rows={3} value={config.achievements}
                    onChange={e => setConfig(prev => ({ ...prev, achievements: e.target.value }))}
                    className="mt-1 w-full p-2 text-xs border border-slate-200 rounded font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Sponsors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Sponsors</h4>
              <button
                onClick={addSponsor}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Sponsor
              </button>
            </div>
            {config.sponsors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No sponsors added yet.</p>
            ) : (
              <div className="space-y-3">
                {config.sponsors.map((sponsor, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Name</label>
                        <input
                          type="text"
                          value={sponsor.name}
                          onChange={e => updateSponsor(idx, 'name', e.target.value)}
                          className="mt-0.5 w-full p-1.5 text-xs border border-slate-200 rounded"
                          placeholder="Sponsor name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Label</label>
                        <input
                          type="text"
                          value={sponsor.label}
                          onChange={e => updateSponsor(idx, 'label', e.target.value)}
                          className="mt-0.5 w-full p-1.5 text-xs border border-slate-200 rounded"
                          placeholder="Display label"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Logo URL</label>
                        <input
                          type="text"
                          value={sponsor.logo || ''}
                          onChange={e => updateSponsor(idx, 'logo', e.target.value)}
                          className="mt-0.5 w-full p-1.5 text-xs border border-slate-200 rounded"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeSponsor(idx)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Links */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">Links</h4>
              <button
                onClick={addLink}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
              </button>
            </div>
            {config.links.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No links added yet.</p>
            ) : (
              <div className="space-y-3">
                {config.links.map((link, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Label</label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={e => updateLink(idx, 'label', e.target.value)}
                          className="mt-0.5 w-full p-1.5 text-xs border border-slate-200 rounded"
                          placeholder="Register Now"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">URL</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={e => updateLink(idx, 'url', e.target.value)}
                          className="mt-0.5 w-full p-1.5 text-xs border border-slate-200 rounded"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeLink(idx)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded mt-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setPreviewTab('card')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${previewTab === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Card Preview
            </button>
            <button
              onClick={() => setPreviewTab('poster')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${previewTab === 'poster' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Poster Preview
            </button>
          </div>

          <div className="sticky top-6">
            {previewTab === 'card' ? (
              <div
                className="rounded-[2rem] p-6 shadow-2xl space-y-4"
                style={{
                  background: `linear-gradient(135deg, ${cs.backgroundFrom}, ${cs.backgroundTo})`,
                  color: cs.textColor,
                }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em]"
                  style={{ background: cs.accentColor, color: '#fff' }}
                >
                  <Eye size={14} /> {config.designation}
                </div>
                <div>
                  <p className="text-sm" style={{ opacity: 0.7 }}>{config.participantName}</p>
                  <h2 className="text-3xl font-black tracking-tight mt-1">{config.eventName}</h2>
                  <p className="mt-2 text-sm" style={{ opacity: 0.8 }}>{config.institutionName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-4 rounded-2xl" style={{ background: `${cs.textColor}10`, borderColor: `${cs.textColor}20` }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ opacity: 0.6 }}>Team</p>
                    <p className="font-bold mt-1">{config.teamName}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: `${cs.textColor}10`, borderColor: `${cs.textColor}20` }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ opacity: 0.6 }}>Reg ID</p>
                    <p className="font-bold mt-1">{config.registrationId}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: `${cs.textColor}10`, borderColor: `${cs.textColor}20` }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ opacity: 0.6 }}>Sponsors</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {config.sponsors.length > 0 ? config.sponsors.map((s, idx) => (
                      s.logo ? (
                        <img key={idx} src={s.logo} alt={s.name} className="h-8 max-w-24 object-contain bg-white rounded-lg px-2 py-1" style={{ border: `1px solid ${cs.textColor}20` }} />
                      ) : (
                        <span key={idx} className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold">{s.name || s.label || 'Sponsor'}</span>
                      )
                    )) : <span className="text-sm" style={{ opacity: 0.7 }}>No sponsors configured.</span>}
                  </div>
                </div>
                {config.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {config.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors hover:opacity-80"
                         style={{ background: cs.accentColor, color: '#fff' }}>
                        {link.label || 'Link'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden border border-slate-200 p-4 space-y-3 text-center mx-auto max-w-sm"
                style={{ background: ps.background, fontFamily: 'Poppins, sans-serif' }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: ps.accentColor }}>{ps.headerText}</div>
                <div className="text-2xl font-black tracking-tighter text-slate-900">{config.eventName}</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white" />
                  <div className="text-left">
                    <div className="font-black" style={{ color: ps.accentColor }}>{config.participantName}</div>
                    <div className="text-xs font-semibold text-slate-600">{config.institutionName}</div>
                    <div className="text-xs font-bold text-slate-500">{config.designation}</div>
                  </div>
                </div>
                <div className="text-left space-y-1 text-sm text-slate-700">
                  {config.achievements.split('\n').filter(Boolean).map((a, i) => (
                    <div key={i} className="flex items-start gap-2"><span style={{ color: ps.accentColor }}>•</span><span>{a}</span></div>
                  ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{config.hashtags}</div>
                {config.sponsors.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-center gap-3 items-center">
                    {config.sponsors.map((s, idx) => (
                      s.logo ? (
                        <img key={idx} src={s.logo} alt={s.name} className="h-6 max-w-20 object-contain" />
                      ) : (
                        <span key={idx} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.name}</span>
                      )
                    ))}
                  </div>
                )}
                {config.links.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-col items-center gap-2">
                    {config.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                         className="inline-block px-4 py-2 rounded-full text-xs font-bold transition-colors"
                         style={{ background: ps.accentColor, color: '#fff' }}>
                        {link.label || link.url}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCardCustomizer;
