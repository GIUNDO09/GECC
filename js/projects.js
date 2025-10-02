/**
 * ========================================
 * GESTION DES PROJETS - LOGIQUE MÉTIER
 * ========================================
 * Rôle : Gestion complète des projets
 * - Affichage de la liste des projets
 * - Création de nouveaux projets
 * - Filtrage et recherche
 * - Navigation vers le détail
 * ========================================
 */

// Import supprimé pour compatibilité directe
// const localRepository = window.localRepository;
// Les classes et constantes sont maintenant disponibles globalement

class ProjectsManager {
    constructor() {
        this.repository = localRepository;
        this.currentUser = null;
        this.projects = [];
        this.filteredProjects = [];
        
        
        this.init();
    }


    init() {
        console.log('🏗️ Initialisation du gestionnaire de projets...');
        
        this.currentUser = this.repository.getCurrentUser();
        if (!this.currentUser) {
            console.warn('⚠️ Aucun utilisateur connecté pour la gestion des projets');
            window.location.href = 'landing.html';
            return;
        }

        console.log('🔧 Configuration des event listeners...');
        this.setupEventListeners();
        this.loadProjects();
        this.setupFilters();
        
        // Configurer le formulaire de projet
        setTimeout(() => {
            this.setupProjectForm();
        }, 500);
        
        // S'assurer que la modal est fermée au démarrage
        this.closeCreateProjectModal();
        
        console.log('✅ Gestionnaire de projets initialisé');
    }

    setupEventListeners() {
        // Bouton "Nouveau Projet"
        const createProjectBtn = document.getElementById('createProjectBtn');
        console.log('🔍 Bouton createProjectBtn trouvé:', createProjectBtn);
        if (createProjectBtn) {
            console.log('✅ Ajout de l\'event listener au bouton Nouveau Projet');
            createProjectBtn.addEventListener('click', (e) => {
                console.log('🖱️ Clic sur le bouton Nouveau Projet détecté');
                e.preventDefault();
                this.showCreateProjectModal();
            });
        } else {
            console.error('❌ Bouton createProjectBtn non trouvé dans le DOM');
        }

        // Modal de création de projet
        const createProjectModal = document.getElementById('createProjectModal');
        if (createProjectModal) {
            // Fermer la modal en cliquant à l'extérieur
            createProjectModal.addEventListener('click', (e) => {
                if (e.target === createProjectModal) {
                    this.closeCreateProjectModal();
                }
            });
        }

        // Recherche
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Filtres
        const statusFilter = document.getElementById('statusFilter');
        const roleFilter = document.getElementById('roleFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    loadProjects() {
        console.log('📋 Chargement des projets...');
        
        // Récupérer tous les projets de l'utilisateur
        this.projects = this.repository.getUserProjects(this.currentUser.id);
        this.filteredProjects = [...this.projects];
        
        this.displayProjects();
        this.updateEmptyState();
        
        console.log(`✅ ${this.projects.length} projets chargés`);
    }

    displayProjects() {
        const tableBody = document.getElementById('projectsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.filteredProjects.length === 0) {
            return;
        }

        // Trier les projets par date de création (plus récents en premier)
        const sortedProjects = this.filteredProjects.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        sortedProjects.forEach(project => {
            const row = this.createProjectRow(project);
            tableBody.appendChild(row);
        });
    }

    createProjectRow(project) {
        const row = document.createElement('tr');
        row.className = 'project-row';
        row.dataset.projectId = project.id;

        const statusLabel = this.getStatusLabel(project.status);
        const statusClass = this.getStatusClass(project.status);
        const createdDate = this.formatDate(project.createdAt);

        row.innerHTML = `
            <td>
                <span class="project-code">${project.code}</span>
            </td>
            <td>
                <div class="project-name">${project.name}</div>
                ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
            </td>
            <td>
                <span class="project-location">${project.location || 'Non définie'}</span>
            </td>
            <td>
                <span class="project-client">${project.client || 'Non défini'}</span>
            </td>
            <td>
                <span class="badge badge-${statusClass}">${statusLabel}</span>
            </td>
            <td>
                <span class="project-date">${createdDate}</span>
            </td>
            <td>
                <div class="project-actions">
                    <a href="project.html?id=${project.id}" class="btn btn-sm btn-primary">
                        Ouvrir
                    </a>
                </div>
            </td>
        `;

        return row;
    }

    getStatusLabel(status) {
        const labels = {
            'draft': 'Brouillon',
            'active': 'Actif',
            'on_hold': 'En attente',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return labels[status] || status;
    }

    getStatusClass(status) {
        const classes = {
            'draft': 'warning',
            'active': 'success',
            'completed': 'info',
            'on_hold': 'secondary',
            'cancelled': 'danger'
        };
        return classes[status] || 'secondary';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    updateEmptyState() {
        const table = document.getElementById('projectsTable');
        const emptyState = document.getElementById('projectsEmpty');
        
        if (!table || !emptyState) return;

        if (this.filteredProjects.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            table.style.display = 'table';
            emptyState.style.display = 'none';
        }
    }

    showCreateProjectModal() {
        console.log('📝 Ouverture de la modale de création de projet');
        
        const modal = document.getElementById('createProjectModal');
        console.log('🔍 Modal createProjectModal trouvée:', modal);
        if (!modal) {
            console.error('❌ Modal createProjectModal non trouvée dans le DOM');
            // Créer une modal temporaire pour tester
            this.createTemporaryModal();
            return;
        }

        // Générer un code de projet suggéré
        const suggestedCode = this.generateProjectCode();
        const codeInput = document.getElementById('project-code');
        if (codeInput) {
            codeInput.value = suggestedCode;
        }

        // Afficher la modale
        modal.style.display = 'flex'; // Forcer l'affichage
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('show');
        console.log('✅ Modal affichée avec display: flex et classe show');
        
        // Test direct dans la console
        console.log('🔧 Test direct - Exécutez dans la console:');
        console.log('document.getElementById("createProjectModal").style.display = "flex"');
        
        // Vérification visuelle
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(modal);
            console.log('🔍 Vérification de la modal:');
            console.log('  - display:', computedStyle.display);
            console.log('  - visibility:', computedStyle.visibility);
            console.log('  - opacity:', computedStyle.opacity);
            console.log('  - z-index:', computedStyle.zIndex);
        }, 100);
        
        // Focus sur le premier champ
        const nameInput = document.getElementById('project-name');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
            console.log('✅ Focus mis sur le champ nom du projet');
        } else {
            console.warn('⚠️ Champ project-name non trouvé');
        }
    }

    closeCreateProjectModal() {
        const modal = document.getElementById('createProjectModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            console.log('✅ Modal fermée');
        }
    }

    createTemporaryModal() {
        console.log('🔧 Création d\'une modal temporaire pour test');
        
        // Créer une modal simple
        const tempModal = document.createElement('div');
        tempModal.id = 'tempProjectModal';
        tempModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        tempModal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-top: 0; color: #333;">Nouveau Projet (Modal de test)</h2>
                <p>Cette modal temporaire confirme que le JavaScript fonctionne.</p>
                <p>Le problème vient probablement du CSS ou de la structure HTML.</p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                ">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(tempModal);
        console.log('✅ Modal temporaire créée et affichée');
    }

    // ========================================
    // GESTION DU FORMULAIRE DE PROJET
    // ========================================

    setupProjectForm() {
        console.log('🔧 Configuration du formulaire de projet moderne...');
        
        // S'assurer que la modal est fermée
        this.closeCreateProjectModal();
        
        const form = document.getElementById('projectForm');
        if (!form) {
            console.error('❌ Formulaire projectForm non trouvé');
            return;
        }

        // Récupérer les éléments
        const elements = {
            code: document.getElementById('project-code'),
            name: document.getElementById('project-name'),
            address: document.getElementById('project-address'),
            type: document.getElementById('project-type'),
            surface: document.getElementById('project-surface'),
            owner: document.getElementById('project-owner'),
            description: document.getElementById('project-description'),
            saveBtn: document.getElementById('saveProjectBtn'),
            cancelBtn: document.getElementById('cancelProjectBtn')
        };

        // Vérifier que tous les éléments existent
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.error('❌ Éléments manquants:', missingElements);
            return;
        }

        // Fonction de validation avancée avec feedback visuel
        const validateField = (field, value) => {
            const messageEl = document.getElementById(`${field.id.replace('project-', '')}-message`);
            let isValid = true;
            let message = '';

            switch (field.id) {
                case 'project-code':
                    const codePattern = /^[A-Z]{3,4}-[0-9]{4}-[0-9]{3}$/;
                    if (!value) {
                        message = 'Le code est obligatoire';
                        isValid = false;
                    } else if (!codePattern.test(value)) {
                        message = 'Format: XXX-YYYY-ZZZ (ex: PROJ-2024-001)';
                        isValid = false;
                    } else {
                        message = '✓ Code valide';
                    }
                    break;

                case 'project-name':
                    if (!value) {
                        message = 'Le nom est obligatoire';
                        isValid = false;
                    } else if (value.length < 3) {
                        message = 'Minimum 3 caractères';
                        isValid = false;
                    } else if (value.length > 100) {
                        message = 'Maximum 100 caractères';
                        isValid = false;
                    } else {
                        message = '✓ Nom valide';
                    }
                    break;

                case 'project-address':
                    if (!value) {
                        message = 'L\'adresse est obligatoire';
                        isValid = false;
                    } else if (value.length < 10) {
                        message = 'Minimum 10 caractères';
                        isValid = false;
                    } else {
                        message = '✓ Adresse valide';
                    }
                    break;

                case 'project-type':
                    if (!value) {
                        message = 'Le type est obligatoire';
                        isValid = false;
                    } else {
                        message = '✓ Type sélectionné';
                    }
                    break;

                case 'project-surface':
                    const surface = parseInt(value);
                    if (!value) {
                        message = 'La surface est obligatoire';
                        isValid = false;
                    } else if (isNaN(surface) || surface < 1) {
                        message = 'Surface invalide';
                        isValid = false;
                    } else if (surface > 999999) {
                        message = 'Surface trop importante';
                        isValid = false;
                    } else {
                        message = '✓ Surface valide';
                    }
                    break;

                case 'project-owner':
                    if (!value) {
                        message = 'Le maître d\'ouvrage est obligatoire';
                        isValid = false;
                    } else if (value.length < 2) {
                        message = 'Minimum 2 caractères';
                        isValid = false;
                    } else {
                        message = '✓ Maître d\'ouvrage valide';
                    }
                    break;

                case 'project-description':
                    if (value.length > 300) {
                        message = 'Maximum 300 caractères';
                        isValid = false;
                    } else {
                        message = `${value.length}/300 caractères`;
                    }
                    break;
            }

            // Appliquer le style visuel
            if (field.id !== 'project-description') {
                field.classList.remove('error', 'success');
                if (value) {
                    field.classList.add(isValid ? 'success' : 'error');
                }
            }

            // Afficher le message
            if (messageEl) {
                messageEl.textContent = message;
                messageEl.className = `validation-message ${isValid ? 'success' : 'error'}`;
            }

            return isValid;
        };

        // Fonction de validation globale
        const validateForm = () => {
            const fields = [elements.code, elements.name, elements.address, elements.type, elements.surface, elements.owner];
            const allValid = fields.every(field => validateField(field, field.value));
            
            elements.saveBtn.disabled = !allValid;
            return allValid;
        };

        // Auto-format du code en majuscules
        elements.code.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            validateField(elements.code, e.target.value);
            validateForm();
        });

        // Validation en temps réel pour tous les champs
        Object.values(elements).forEach(element => {
            if (element && element !== elements.saveBtn && element !== elements.cancelBtn) {
                element.addEventListener('input', () => {
                    validateField(element, element.value);
                    validateForm();
                });
                element.addEventListener('change', () => {
                    validateField(element, element.value);
                    validateForm();
                });
            }
        });

        // Soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📝 Soumission du formulaire moderne...');
            
            if (!validateForm()) {
                this.showMessage('❌ Veuillez corriger les erreurs avant de continuer', 'error');
                return;
            }

            try {
                // Animation de chargement
                elements.saveBtn.disabled = true;
                elements.saveBtn.innerHTML = '⏳ Enregistrement...';
                elements.saveBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';

                // Créer le projet
                const projectData = {
                    code: elements.code.value.trim(),
                    name: elements.name.value.trim(),
                    address: elements.address.value.trim(),
                    type: elements.type.value,
                    surface: parseInt(elements.surface.value),
                    client: elements.owner.value.trim(), // Le champ "owner" devient "client"
                    location: elements.address.value.trim(), // L'adresse devient la localisation
                    description: elements.description.value.trim(),
                    status: 'active',
                    progress: 0,
                    ownerId: this.repository.getCurrentUser().id,
                    members: [
                        { userId: this.repository.getCurrentUser().id, role: 'architect' }
                    ]
                };

                const project = new Project(projectData);
                const savedProject = this.repository.createProject(project);

                // Animation de succès
                elements.saveBtn.innerHTML = '✓ Enregistré !';
                elements.saveBtn.style.background = 'linear-gradient(45deg, #48bb78, #68d391)';

                this.showMessage(`✅ Projet "${projectData.name}" créé avec succès !`, 'success');

                // Attendre un peu puis fermer la modal
                setTimeout(() => {
                    this.closeCreateProjectModal();
                    form.reset();
                    elements.saveBtn.innerHTML = '💾 Enregistrer';
                    elements.saveBtn.style.background = '';
                    elements.saveBtn.disabled = true;
                    
                    // Rediriger vers le projet créé
                    window.location.href = `project.html?id=${savedProject.id}`;
                }, 2000);

            } catch (error) {
                console.error('Erreur lors de la création du projet:', error);
                this.showMessage('❌ Erreur lors de la création du projet', 'error');
                
                elements.saveBtn.disabled = false;
                elements.saveBtn.innerHTML = '💾 Enregistrer';
                elements.saveBtn.style.background = '';
            }
        });

        // Bouton d'annulation
        elements.cancelBtn.addEventListener('click', () => {
            this.closeCreateProjectModal();
        });

        // Validation initiale
        validateForm();

        console.log('✅ Formulaire de projet moderne configuré');
    }

    generateProjectCode() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const existingProjects = this.projects.filter(p => p && p.code && p.code.startsWith(`PROJ-${year}-${month}`));
        const nextNumber = String(existingProjects.length + 1).padStart(3, '0');
        
        return `PROJ-${year}-${month}-${nextNumber}`;
    }

    async saveProject() {
        console.log('💾 Sauvegarde du projet...');
        
        const form = document.getElementById('projectForm');
        if (!form) return;

        const formData = new FormData(form);
        const code = formData.get('code')?.trim();
        const name = formData.get('name')?.trim();

        // Validation
        if (!code || !name) {
            this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (code.length < 3) {
            this.showMessage('Le code du projet doit contenir au moins 3 caractères', 'error');
            return;
        }

        if (name.length < 2) {
            this.showMessage('Le nom du projet doit contenir au moins 2 caractères', 'error');
            return;
        }

        // Vérifier l'unicité du code
        const existingProject = this.projects.find(p => p.code.toLowerCase() === code.toLowerCase());
        if (existingProject) {
            this.showMessage('Un projet avec ce code existe déjà', 'error');
            return;
        }

        try {
            // Créer le projet
            const projectData = {
                code: code,
                name: name,
                description: '',
                status: PROJECT_STATUS.DRAFT,
                ownerId: this.currentUser.id,
                members: [
                    {
                        userId: this.currentUser.id,
                        role: ROLES.ADMIN,
                        joinedAt: new Date()
                    }
                ]
            };

            const newProject = this.repository.createProject(projectData);
            console.log('✅ Projet créé:', newProject);

            // Fermer la modale
            this.hideProjectModal();

            // Recharger la liste
            this.loadProjects();

            // Afficher un message de succès
            this.showMessage(`Projet "${name}" créé avec succès !`, 'success');

            // Rediriger vers le projet créé
            setTimeout(() => {
                window.location.href = `project.html?id=${newProject.id}`;
            }, 1500);

        } catch (error) {
            console.error('❌ Erreur lors de la création du projet:', error);
            this.showMessage('Erreur lors de la création du projet: ' + error.message, 'error');
        }
    }

    setupFilters() {
        // Initialiser les filtres avec les valeurs par défaut
        this.applyFilters();
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                project.code.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }

        this.displayProjects();
        this.updateEmptyState();
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const roleFilter = document.getElementById('roleFilter');
        
        if (!statusFilter || !roleFilter) return;

        const selectedStatus = statusFilter.value;
        const selectedRole = roleFilter.value;

        let filtered = [...this.projects];

        // Filtrer par statut
        if (selectedStatus) {
            filtered = filtered.filter(project => project.status === selectedStatus);
        }

        // Filtrer par rôle de l'utilisateur dans le projet
        if (selectedRole) {
            filtered = filtered.filter(project => {
                const userMember = project.members?.find(member => member.userId === this.currentUser.id);
                return userMember && userMember.role === selectedRole;
            });
        }

        this.filteredProjects = filtered;
        this.displayProjects();
        this.updateEmptyState();
    }

    showMessage(message, type = 'info') {
        // Créer un élément de message temporaire
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageDiv);

        // Supprimer le message après 5 secondes
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialiser le gestionnaire de projets quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
});

// export default ProjectsManager;
