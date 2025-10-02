// ========================================
// CLIENT API PROJETS GECC
// ========================================
// Client API pour la gestion des projets

class ProjectsApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // ========================================
    // MÉTHODES PROJETS
    // ========================================

    async getProjects(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.type) queryParams.append('type', filters.type);

            const endpoint = `/projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.apiClient.request(endpoint);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    projects: data.projects,
                    pagination: data.pagination
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des projets',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async createProject(projectData) {
        try {
            const response = await this.apiClient.request('/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    project: data.project,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la création du projet',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async getProject(projectId) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    project: data.project
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération du projet',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async updateProject(projectId, updateData) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    project: data.project,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la mise à jour du projet',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    // ========================================
    // MÉTHODES MEMBRES DE PROJET
    // ========================================

    async getProjectMembers(projectId) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/members`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    members: data.members
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des membres',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async addProjectMember(projectId, memberData) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/members`, {
                method: 'POST',
                body: JSON.stringify(memberData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    member: data.member,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de l\'ajout du membre',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async removeProjectMember(projectId, userId) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/members/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la suppression du membre',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    generateProjectCode() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PROJ-${year}-${random}`;
    }

    getProjectTypeDisplayName(type) {
        const typeNames = {
            'residentiel': 'Résidentiel',
            'commercial': 'Commercial',
            'industriel': 'Industriel',
            'tertiaire': 'Tertiaire',
            'equipement': 'Équipement',
            'renovation': 'Rénovation',
            'autre': 'Autre'
        };
        return typeNames[type] || type;
    }

    getProjectStatusDisplayName(status) {
        const statusNames = {
            'draft': 'Brouillon',
            'active': 'Actif',
            'on_hold': 'En attente',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return statusNames[status] || status;
    }

    getRoleInProjectDisplayName(role) {
        const roleNames = {
            'owner': 'Propriétaire',
            'admin': 'Administrateur',
            'architect': 'Architecte',
            'engineer': 'Ingénieur',
            'contractor': 'Entrepreneur',
            'bet': 'BET',
            'client': 'Client',
            'member': 'Membre'
        };
        return roleNames[role] || role;
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale du client API projets
window.projectsApiClient = new ProjectsApiClient(window.apiClient);

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsApiClient;
}
