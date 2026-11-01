export interface ResumeData {
  name?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    links?: { label?: string; url?: string }[];
  };
  education?: Array<{ institution?: string; degree?: string; year?: string; gpa?: string }>;
  experience?: Array<{ company?: string; role?: string; range?: string; location?: string; points?: string }>;
  skills?: {
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
    databases?: string[];
  };
  projects?: Array<{ name?: string; tech?: string; desc?: string; link?: string }>;
  certifications?: string[];
  additional?: { honorsAndAwards?: string[] };
}

export function generatePdfHtml(data: ResumeData, template: string = 'classic') {
  if (!data) return "";
  const p = data.personalInfo || { firstName: "", lastName: "", email: "", phone: "", address: "", links: [] };
  const edu = data.education || [];
  const exp = data.experience || [];
  const skills = data.skills || { languages: [], frameworks: [], tools: [], databases: [] };
  const projs = data.projects || [];
  const certs = data.certifications || [];
  const add = data.additional || { honorsAndAwards: [] };
  const name = ((p.firstName || "") + " " + (p.lastName || "")).trim() || data.name || "YOUR NAME";

  if (template === 'modern') {
    const pHtml = `
            <div style="text-align:center;margin-bottom:30px">
                <h1 style="font-family:'Poppins',sans-serif;font-size:32pt;font-weight:300;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;color:#1e293b">
                    ${p.firstName || "FIRST"} <span style="font-weight:600">${p.lastName || "LAST"}</span>
                </h1>
                <div style="font-family:'Poppins',sans-serif;font-size:10pt;color:#64748b;letter-spacing:1px;margin-bottom:15px">
                    ${p.email || ""} ${p.phone ? ` • ${p.phone}` : ""} ${p.address ? ` • ${p.address}` : ""}
                </div>
                <div style="border-bottom:1px solid #e2e8f0;width:100%"></div>
            </div>`;
    const sectionHeader = (title: string) => `
            <div style="display:flex;align-items:center;margin:20px 0 12px 0">
                <h2 style="font-family:'Poppins',sans-serif;font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0f172a;margin-right:15px;white-space:nowrap">${title}</h2>
                <div style="height:1px;background:#f1f5f9;width:100%"></div>
            </div>`;
    const eduHtml = edu.map((e: any) => `
            <div style="margin-bottom:12px;font-family:'Poppins',sans-serif">
                <div style="display:flex;justify-content:space-between;align-items:baseline">
                    <span style="font-weight:700;font-size:11pt;color:#1e293b">${e.institution || ""}</span>
                    <span style="font-size:9pt;color:#64748b;font-weight:500">${e.year || ""}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:2px">
                    <span style="font-size:10pt;color:#475569">${e.degree || ""}</span>
                    <span style="font-size:9pt;font-weight:600;color:#059669">${e.gpa ? `GPA: ${e.gpa}` : ""}</span>
                </div>
            </div>`).join("");
    const expHtml = exp.map((ex: any) => `
            <div style="margin-bottom:18px;font-family:'Poppins',sans-serif">
                <div style="display:flex;justify-content:space-between;align-items:baseline">
                    <span style="font-weight:700;font-size:11pt;color:#1e293b">${ex.company || ""}</span>
                    <span style="font-size:9pt;color:#64748b;font-weight:500">${ex.range || ""}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:2px;margin-bottom:6px">
                    <span style="font-size:10pt;font-weight:600;color:#475569">${ex.role || ""}</span>
                    <span style="font-size:9pt;color:#64748b">${ex.location || ""}</span>
                </div>
                <ul style="padding-left:14px;margin:0">
                    ${ex.points.split('\n').filter((pt: string) => pt.trim()).map((pt: string) => `<li style="font-size:9.5pt;color:#334155;margin-bottom:4px;line-height:1.4">${pt}</li>`).join("")}
                </ul>
            </div>`).join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"/><style>
            body { font-family: 'Poppins', sans-serif; line-height: 1.5; color: #1e293b; margin: 0; padding: 45px; }
            * { box-sizing: border-box; }
            @page { size: A4; margin: 0; }
        </style></head><body>
            ${pHtml}
            ${edu.length ? sectionHeader("Education") + eduHtml : ""}
            ${exp.length ? sectionHeader("Experience") + expHtml : ""}
        </body></html>`;
  }

  const linksHtml = p.links?.length > 0
    ? `<div style="font-size:9pt;text-align:center;margin-top:-8pt;margin-bottom:12pt;color:#475569;">
            ${p.links.map((l, i) => `${i > 0 ? " | " : ""}<span style="font-weight:700;">${l.label}:</span> ${l.url}`).join("")}
          </div>` : "";
  const eduHtml = edu.length > 0
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Education</h2>
            ${edu.map(e => `
                <div style="margin-bottom:8pt">
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10pt;"><span>${e.institution || "University"}</span><span>${e.year || ""}</span></div>
                    <div style="display:flex;justify-content:space-between;font-style:italic;font-size:9pt;margin-top:2pt;margin-bottom:2pt"><span>${e.degree || ""}</span><span>${e.gpa ? `GPA: ${e.gpa}` : ""}</span></div>
                </div>`).join("")}</div>` : "";
  const expHtml = exp.length > 0
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Experience</h2>
            ${exp.map(ex => `
                <div style="margin-bottom:10pt">
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10pt;"><span>${ex.company || "Company"}</span><span>${ex.range || ""}</span></div>
                    <div style="display:flex;justify-content:space-between;font-style:italic;font-size:9pt;margin-top:2pt;margin-bottom:2pt"><span>${ex.role || ""}</span><span>${ex.location || ""}</span></div>
                    <ul style="padding-left:14pt;margin:0;">${ex.points.split('\n').filter(pt => pt.trim()).map(pt => `<li style="font-size:9pt;margin-bottom:2pt">${pt}</li>`).join("")}</ul>
                </div>`).join("")}</div>` : "";
  const skillsHtml = (skills.languages?.length > 0 || skills.frameworks?.length > 0 || skills.tools?.length > 0 || skills.databases?.length > 0)
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Skills</h2>
            ${skills.languages?.length > 0 ? `<div style="font-size:9pt;margin-bottom:4pt"><span style="font-weight:bold">Programming Languages: </span>${skills.languages.join(", ")}</div>` : ""}
            ${skills.frameworks?.length > 0 ? `<div style="font-size:9pt;margin-bottom:4pt"><span style="font-weight:bold">Libraries/Frameworks: </span>${skills.frameworks.join(", ")}</div>` : ""}
            ${skills.tools?.length > 0 ? `<div style="font-size:9pt;margin-bottom:4pt"><span style="font-weight:bold">Tools/Platforms: </span>${skills.tools.join(", ")}</div>` : ""}
            ${skills.databases?.length > 0 ? `<div style="font-size:9pt;margin-bottom:4pt"><span style="font-weight:bold">Databases: </span>${skills.databases.join(", ")}</div>` : ""}
          </div>` : "";
  const projHtml = projs.length > 0
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Projects / Open Source</h2>
            ${projs.map(pr => `
                <div style="margin-bottom:8pt">
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10pt;"><span>${pr.name?.toUpperCase() || ""} ${pr.link ? `<span style="font-weight:400;font-size:9pt">| ${pr.link}</span>` : ""}</span>
                        <span style="font-weight:400;font-size:9pt;font-style:italic">${pr.tech || ""}</span>
                    </div>
                    <div style="font-size:9pt;color:#334155;margin-top:2pt;line-height:1.3">${pr.desc || ""}</div>
                </div>`).join("")}</div>` : "";
  const certHtml = certs.length > 0
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Certifications</h2>
            <ul style="padding-left:14pt;margin:0;">${certs.map(c => `<li style="font-size:9pt;margin-bottom:2pt">${c}</li>`).join("")}</ul></div>` : "";
  const honorsHtml = add.honorsAndAwards?.length > 0
    ? `<div><h2 style="font-size:10pt;font-weight:bold;border-bottom:1px solid black;margin:12pt 0 6pt 0;text-transform:uppercase;">Honors & Awards</h2>
            <ul style="padding-left:14pt;margin:0;">${add.honorsAndAwards.map(h => `<li style="font-size:9pt;margin-bottom:2pt">${h}</li>`).join("")}</ul></div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
        body { font-family: 'Poppins', sans-serif; line-height: 1.5; color: black; margin: 0; padding: 40px; }
        * { box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        h1, h2, div, p, span, ul, li { margin: 0; padding: 0; }
    </style></head><body>
        <h1 style="font-size:24pt;font-weight:400;text-align:center;margin-bottom:4pt;text-transform:uppercase;">${name}</h1>
        <div style="font-size:9pt;text-align:center;margin-bottom:12pt;">
            ${p.email ? `<span>${p.email}</span>` : ""}
            ${p.phone ? `<span> | ${p.phone}</span>` : ""}
            ${p.address ? `<span> | ${p.address}</span>` : ""}
        </div>
        ${linksHtml}${eduHtml}${expHtml}${skillsHtml}${projHtml}${certHtml}${honorsHtml}
    </body></html>`;
}
