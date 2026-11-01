document.addEventListener('DOMContentLoaded', () => {
    // 1. Load initial data
    const dataEl = document.getElementById('portfolio-data');
    if (!dataEl) return;
    
    let portfolioData = {};
    try {
        portfolioData = JSON.parse(dataEl.textContent);
    } catch (e) {
        console.error('Failed to parse portfolio data:', e);
        return;
    }

    // Ensure lists are defined
    portfolioData.skills = portfolioData.skills || [];
    portfolioData.experience = portfolioData.experience || [];
    portfolioData.projects = portfolioData.projects || [];
    portfolioData.certifications = portfolioData.certifications || [];

    // 2. Add floating edit button
    const editBtn = document.createElement('button');
    editBtn.id = 'portfolio-edit-trigger';
    editBtn.innerHTML = '⚙️ Edit Site';
    document.body.appendChild(editBtn);

    // 3. Create Modal / Drawer HTML Structure
    const overlay = document.createElement('div');
    overlay.id = 'portfolio-editor-overlay';
    overlay.style.display = 'none';

    overlay.innerHTML = `
        <div id="portfolio-editor-drawer">
            <div class="drawer-header">
                <h2>Edit Portfolio</h2>
                <button type="button" class="close-drawer-btn">&times;</button>
            </div>
            
            <div class="drawer-tabs">
                <button type="button" class="tab-btn active" data-tab="personal">Personal Info</button>
                <button type="button" class="tab-btn" data-tab="skills">Skills</button>
                <button type="button" class="tab-btn" data-tab="experience">Experience</button>
                <button type="button" class="tab-btn" data-tab="projects">Projects</button>
                <button type="button" class="tab-btn" data-tab="certifications">Certifications</button>
            </div>

            <div class="drawer-content">
                <!-- PERSONAL TAB -->
                <div class="tab-content active" id="tab-personal">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="edit-name" value="">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="edit-email" value="">
                    </div>
                    <div class="form-group">
                        <label>Professional Role</label>
                        <input type="text" id="edit-role" value="">
                    </div>
                    <div class="form-group">
                        <label>Professional Summary</label>
                        <textarea id="edit-summary" rows="5"></textarea>
                    </div>
                </div>

                <!-- SKILLS TAB -->
                <div class="tab-content" id="tab-skills">
                    <div class="form-group">
                        <label>Skills (Comma-separated)</label>
                        <textarea id="edit-skills" rows="6" placeholder="e.g. React, TypeScript, Python, FastAPI"></textarea>
                        <small class="help-text">Separate each skill with a comma.</small>
                    </div>
                </div>

                <!-- EXPERIENCE TAB -->
                <div class="tab-content" id="tab-experience">
                    <div id="experience-items-container"></div>
                    <button type="button" class="add-item-btn" id="add-experience-btn">+ Add Position</button>
                </div>

                <!-- PROJECTS TAB -->
                <div class="tab-content" id="tab-projects">
                    <div id="projects-items-container"></div>
                    <button type="button" class="add-item-btn" id="add-project-btn">+ Add Project</button>
                </div>

                <!-- CERTIFICATIONS TAB -->
                <div class="tab-content" id="tab-certifications">
                    <div id="certifications-items-container"></div>
                    <button type="button" class="add-item-btn" id="add-certification-btn">+ Add Certification</button>
                </div>
            </div>

            <div class="drawer-footer">
                <button type="button" class="btn-secondary" id="cancel-edit-btn">Cancel</button>
                <button type="button" class="btn-primary" id="save-portfolio-btn">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 4. Modal Event Listeners and Tab Switching
    const closeBtn = overlay.querySelector('.close-drawer-btn');
    const cancelBtn = overlay.querySelector('#cancel-edit-btn');
    const saveBtn = overlay.querySelector('#save-portfolio-btn');
    const tabs = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');

    const openDrawer = () => {
        // Load data into forms
        overlay.querySelector('#edit-name').value = portfolioData.name || '';
        overlay.querySelector('#edit-email').value = portfolioData.email || '';
        overlay.querySelector('#edit-role').value = portfolioData.role || '';
        overlay.querySelector('#edit-summary').value = portfolioData.summary || '';
        overlay.querySelector('#edit-skills').value = (portfolioData.skills || []).join(', ');

        renderExperienceList();
        renderProjectsList();
        renderCertificationsList();

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    };

    editBtn.onclick = openDrawer;
    closeBtn.onclick = closeDrawer;
    cancelBtn.onclick = closeDrawer;

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            overlay.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
        };
    });

    // 5. Render lists
    function renderExperienceList() {
        const container = overlay.querySelector('#experience-items-container');
        container.innerHTML = '';
        const list = portfolioData.experience || [];
        
        list.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'list-item-card';
            card.innerHTML = `
                <div class="card-header">
                    <h4>Position ${idx + 1}</h4>
                    <button type="button" class="remove-item-btn" data-type="experience" data-index="${idx}">&times; Delete</button>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group col">
                            <label>Company</label>
                            <input type="text" class="exp-company" data-index="${idx}" value="${item.company || ''}">
                        </div>
                        <div class="form-group col">
                            <label>Role</label>
                            <input type="text" class="exp-role" data-index="${idx}" value="${item.role || ''}">
                        </div>
                        <div class="form-group col-short">
                            <label>Year</label>
                            <input type="text" class="exp-year" data-index="${idx}" value="${item.year || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Responsibilities & Details</label>
                        <textarea class="exp-details" data-index="${idx}" rows="2">${item.details || ''}</textarea>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add input listeners to keep object updated
        container.querySelectorAll('input, textarea').forEach(input => {
            input.onchange = (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.classList.contains('exp-company')) list[idx].company = e.target.value;
                if (e.target.classList.contains('exp-role')) list[idx].role = e.target.value;
                if (e.target.classList.contains('exp-year')) list[idx].year = e.target.value;
                if (e.target.classList.contains('exp-details')) list[idx].details = e.target.value;
            };
        });

        // Setup delete handlers
        container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                portfolioData.experience.splice(idx, 1);
                renderExperienceList();
            };
        });
    }

    function renderProjectsList() {
        const container = overlay.querySelector('#projects-items-container');
        container.innerHTML = '';
        const list = portfolioData.projects || [];
        
        list.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'list-item-card';
            card.innerHTML = `
                <div class="card-header">
                    <h4>Project ${idx + 1}</h4>
                    <button type="button" class="remove-item-btn" data-type="projects" data-index="${idx}">&times; Delete</button>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group col">
                            <label>Project Name</label>
                            <input type="text" class="proj-name" data-index="${idx}" value="${item.name || ''}">
                        </div>
                        <div class="form-group col">
                            <label>Technologies (Comma-separated)</label>
                            <input type="text" class="proj-tech" data-index="${idx}" value="${item.technologies || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="proj-desc" data-index="${idx}" rows="2">${item.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Project Link / URL</label>
                        <input type="url" class="proj-link" data-index="${idx}" value="${item.link || ''}">
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('input, textarea').forEach(input => {
            input.onchange = (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.classList.contains('proj-name')) list[idx].name = e.target.value;
                if (e.target.classList.contains('proj-tech')) list[idx].technologies = e.target.value;
                if (e.target.classList.contains('proj-desc')) list[idx].description = e.target.value;
                if (e.target.classList.contains('proj-link')) list[idx].link = e.target.value;
            };
        });

        container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                portfolioData.projects.splice(idx, 1);
                renderProjectsList();
            };
        });
    }

    function renderCertificationsList() {
        const container = overlay.querySelector('#certifications-items-container');
        container.innerHTML = '';
        const list = portfolioData.certifications || [];
        
        list.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'list-item-card';
            card.innerHTML = `
                <div class="card-header">
                    <h4>Certification ${idx + 1}</h4>
                    <button type="button" class="remove-item-btn" data-type="certifications" data-index="${idx}">&times; Delete</button>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group col">
                            <label>Certification Name</label>
                            <input type="text" class="cert-name" data-index="${idx}" value="${item.name || ''}">
                        </div>
                        <div class="form-group col">
                            <label>Issuer</label>
                            <input type="text" class="cert-issuer" data-index="${idx}" value="${item.issuer || ''}">
                        </div>
                        <div class="form-group col-short">
                            <label>Date</label>
                            <input type="text" class="cert-date" data-index="${idx}" value="${item.date || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Verification Link / URL</label>
                        <input type="url" class="cert-link" data-index="${idx}" value="${item.link || ''}">
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('input, textarea').forEach(input => {
            input.onchange = (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (e.target.classList.contains('cert-name')) list[idx].name = e.target.value;
                if (e.target.classList.contains('cert-issuer')) list[idx].issuer = e.target.value;
                if (e.target.classList.contains('cert-date')) list[idx].date = e.target.value;
                if (e.target.classList.contains('cert-link')) list[idx].link = e.target.value;
            };
        });

        container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                portfolioData.certifications.splice(idx, 1);
                renderCertificationsList();
            };
        });
    }

    // 6. Adding new items
    overlay.querySelector('#add-experience-btn').onclick = () => {
        portfolioData.experience.push({ company: '', role: '', year: '', details: '' });
        renderExperienceList();
    };

    overlay.querySelector('#add-project-btn').onclick = () => {
        portfolioData.projects.push({ name: '', description: '', technologies: '', link: '' });
        renderProjectsList();
    };

    overlay.querySelector('#add-certification-btn').onclick = () => {
        portfolioData.certifications.push({ name: '', issuer: '', date: '', link: '' });
        renderCertificationsList();
    };

    // 7. Save portfolio
    saveBtn.onclick = () => {
        saveBtn.innerText = 'Saving...';
        saveBtn.disabled = true;

        // Retrieve values from inputs directly
        portfolioData.name = overlay.querySelector('#edit-name').value;
        portfolioData.email = overlay.querySelector('#edit-email').value;
        portfolioData.role = overlay.querySelector('#edit-role').value;
        portfolioData.summary = overlay.querySelector('#edit-summary').value;
        
        const skillsRaw = overlay.querySelector('#edit-skills').value;
        portfolioData.skills = skillsRaw.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Send changes back to backend
        const filename = window.location.pathname.split('/').pop();

        fetch('/update-portfolio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                data: portfolioData
            })
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.status === 'success') {
                alert('Portfolio saved successfully! Reloading site...');
                window.location.reload();
            } else {
                alert('Error saving portfolio: ' + (resData.error || 'Unknown error'));
                saveBtn.innerText = 'Save Changes';
                saveBtn.disabled = false;
            }
        })
        .catch(err => {
            alert('Network error saving portfolio: ' + err.message);
            saveBtn.innerText = 'Save Changes';
            saveBtn.disabled = false;
        });
    };
});
