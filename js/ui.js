/* 
========================================
MODULE INTERFACE UTILISATEUR - GECC
========================================
Rôle : Gestion de l'interface utilisateur
- Manipulation du DOM
- Gestion des événements
- Affichage des données
- Interactions utilisateur
========================================
*/

// Import supprimé pour compatibilité directe
// const localRepository = window.localRepository;

class UIManager {
    constructor() {
        this.repository = localRepository;
        this.init();
    }

    init() {
        console.log('🔧 Initialisation de l\'UIManager...');
        this.setupEventListeners();
        this.loadPageContent();
        console.log('✅ UIManager initialisé');
    }

    setupEventListeners() {
        console.log('🔧 Configuration des événements...');
        
        // Vérifier que les éléments existent
        const createBtn = document.getElementById('createProjectBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        console.log('📋 Bouton "Nouveau Projet":', createBtn ? '✅ Trouvé' : '❌ Non trouvé');
        console.log('📋 Bouton "Déconnexion":', logoutBtn ? '✅ Trouvé' : '❌ Non trouvé');
        
        // Attacher directement les événements aux boutons
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 Ouverture de la modale de création de projet');
                this.showCreateProjectModal();
            });
        }
        
        if (logoutBtn) {
            // Le lien redirigera naturellement vers landing.html
        }
        
        // Délégation d'événements pour les autres éléments
        document.addEventListener('click', (e) => {
            console.log('🖱️ Clic détecté sur:', e.target.id || e.target.className);
            
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    loadPageContent() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'project':
                this.loadProject();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('projects')) return 'projects';
        if (path.includes('project')) return 'project';
        return 'index';
    }

    loadDashboard() {
        this.updateDashboardStats();
    }

    updateDashboardStats() {
        const projects = this.repository.getAllProjects();
        document.getElementById('activeProjects').textContent = projects.length;
    }

    loadProjects() {
        console.log('📋 Chargement de la page projets...');
        const projects = this.repository.getAllProjects();
        const container = document.getElementById('projectsGrid');
        
        console.log('📊 Nombre de projets:', projects.length);
        console.log('📦 Container trouvé:', container ? '✅' : '❌');
        
        if (container) {
            container.innerHTML = projects.map(project => `
                <div class="project-card">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                </div>
            `).join('');
        }
    }

    loadProject() {
        const projectId = new URLSearchParams(window.location.search).get('id');
        if (!projectId) return;

        const project = this.repository.getProjectById(projectId);
        if (!project) return;

        document.getElementById('projectTitle').textContent = project.name;
        document.getElementById('projectDescription').textContent = project.description;
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    showCreateProjectModal() {
        console.log('🚀 showCreateProjectModal() appelée');
        
        // Vérifier s'il y a une modale existante dans le HTML
        let modal = document.getElementById('projectModal');
        
        if (modal) {
            console.log('✅ Utilisation de la modale existante');
            // Utiliser la modale existante
            modal.style.display = 'flex';
            
            // Réinitialiser le formulaire
            const form = modal.querySelector('#projectForm');
            if (form) {
                form.reset();
                const title = modal.querySelector('#modalTitle');
                if (title) title.textContent = 'Nouveau Projet';
            }
            
            // Configurer les événements si pas déjà fait
            this.setupExistingModalEvents(modal);
            
        } else {
            console.log('⚠️ Aucune modale existante, création d\'une nouvelle');
            // Créer une nouvelle modale (fallback)
            modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'createProjectModal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Nouveau Projet</h3>
                        <button class="modal-close" id="modalCloseBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="createProjectForm">
                            <div class="form-group">
                                <label for="projectName">Nom du projet</label>
                                <input type="text" id="projectName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="projectDescription">Description</label>
                                <textarea id="projectDescription" name="description" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="projectClient">Client</label>
                                <input type="text" id="projectClient" name="client">
                            </div>
                            <div class="form-group">
                                <label for="projectLocation">Localisation</label>
                                <input type="text" id="projectLocation" name="location">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">Annuler</button>
                                <button type="submit" class="btn btn-primary">Créer le projet</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.setupNewModalEvents(modal);
        }
        
        // Focus sur le premier champ
        const nameInput = modal.querySelector('#projectName');
        if (nameInput) nameInput.focus();
    }

    setupExistingModalEvents(modal) {
        // Éviter de dupliquer les événements
        if (modal.dataset.eventsSetup) return;
        modal.dataset.eventsSetup = 'true';
        
        console.log('🔧 Configuration des événements pour la modale existante');
        
        // Gestion de la fermeture
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('🚪 Fermeture via bouton X');
                modal.style.display = 'none';
            });
        }
        
        const cancelBtn = modal.querySelector('#cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('🚪 Fermeture via bouton Annuler');
                modal.style.display = 'none';
            });
        }
        
        // Gestion du formulaire
        const form = modal.querySelector('#projectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Soumission du formulaire existant');
                this.createProject(new FormData(e.target));
                modal.style.display = 'none';
            });
        }
        
        // Fermeture en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('🚪 Fermeture via clic extérieur');
                modal.style.display = 'none';
            }
        });
    }

    setupNewModalEvents(modal) {
        console.log('🔧 Configuration des événements pour la nouvelle modale');
        
        const closeBtn = modal.querySelector('#modalCloseBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        const form = modal.querySelector('#createProjectForm');
        
        const closeModal = () => {
            console.log('🚪 Fermeture de la nouvelle modale');
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Gestion du formulaire
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('📝 Soumission du nouveau formulaire');
            this.createProject(new FormData(e.target));
            closeModal();
        });
    }

    createProject(formData) {
        try {
            const currentUser = this.repository.getCurrentUser();
            if (!currentUser) {
                alert('Vous devez être connecté pour créer un projet');
                return;
            }

            // Validation des données
            const name = formData.get('name');
            if (!name || name.trim().length < 2) {
                alert('Le nom du projet est requis (minimum 2 caractères)');
                return;
            }

            const projectData = {
                name: name.trim(),
                description: formData.get('description') || '',
                client: formData.get('client') || '',
                location: formData.get('location') || '',
                ownerId: currentUser.id,
                status: 'draft'
            };

            const project = this.repository.createProject(projectData);
            console.log('Projet créé:', project);
            
            // Recharger la liste des projets
            this.loadProjects();
            
            // Afficher un message de succès
            this.showSuccessMessage('Projet créé avec succès !');
            
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
            alert('Erreur lors de la création du projet: ' + error.message);
        }
    }

    showSuccessMessage(message) {
        // Créer un message de succès temporaire
        const successDiv = document.createElement('div');
        successDiv.className = 'message message-success';
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.zIndex = '9999';
        successDiv.style.padding = '15px 20px';
        successDiv.style.borderRadius = '5px';
        successDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Supprimer le message après 3 secondes
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Navigation vers l'accueil (remplace la déconnexion)
    navigateToHome() {
        window.location.href = 'landing.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UIManager();
});

// export { UIManager };