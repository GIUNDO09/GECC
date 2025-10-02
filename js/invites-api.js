// ========================================
// CLIENT API INVITATIONS GECC
// ========================================
// Client API pour la gestion des invitations

class InvitesApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // ========================================
    // MÉTHODES INVITATIONS
    // ========================================

    async createInvite(projectId, inviteData) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/invites`, {
                method: 'POST',
                body: JSON.stringify(inviteData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    invite: data.invite,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la création de l\'invitation',
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

    async getProjectInvites(projectId) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/invites`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    invites: data.invites
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des invitations',
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

    async getInviteDetails(token) {
        try {
            const response = await fetch(`${this.apiClient.baseURL}/invites/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    invite: data.invite
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération de l\'invitation',
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

    async acceptInvite(token) {
        try {
            const response = await this.apiClient.request(`/invites/${token}/accept`, {
                method: 'POST'
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
                    error: error.error || 'Erreur lors de l\'acceptation de l\'invitation',
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

    async cancelInvite(inviteId) {
        try {
            const response = await this.apiClient.request(`/invites/${inviteId}/cancel`, {
                method: 'POST'
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
                    error: error.error || 'Erreur lors de l\'annulation de l\'invitation',
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

    getInviteStatusDisplayName(status) {
        const statusNames = {
            'pending': 'En attente',
            'accepted': 'Acceptée',
            'declined': 'Refusée',
            'cancelled': 'Annulée',
            'expired': 'Expirée'
        };
        return statusNames[status] || status;
    }

    getInviteStatusColor(status) {
        const colors = {
            'pending': '#ffc107',
            'accepted': '#28a745',
            'declined': '#dc3545',
            'cancelled': '#6c757d',
            'expired': '#fd7e14'
        };
        return colors[status] || '#6c757d';
    }

    isInviteExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    }

    getTimeUntilExpiry(expiresAt) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            return 'Expirée';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days} jour(s) restant(s)`;
        } else if (hours > 0) {
            return `${hours} heure(s) restante(s)`;
        } else {
            return `${minutes} minute(s) restante(s)`;
        }
    }

    generateInviteEmailContent(invite) {
        const inviteLink = `${window.location.origin}/project.html?invite=${invite.token}`;
        
        return {
            subject: `Invitation au projet ${invite.project.name} - GECC`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Invitation au projet GECC</h2>
                    
                    <p>Bonjour,</p>
                    
                    <p>Vous avez été invité(e) à rejoindre le projet <strong>${invite.project.name}</strong> (${invite.project.code}) en tant que <strong>${this.getRoleInProjectDisplayName(invite.role)}</strong>.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Détails du projet :</h3>
                        <p><strong>Nom :</strong> ${invite.project.name}</p>
                        <p><strong>Code :</strong> ${invite.project.code}</p>
                        <p><strong>Description :</strong> ${invite.project.description || 'Aucune description'}</p>
                        <p><strong>Votre rôle :</strong> ${this.getRoleInProjectDisplayName(invite.role)}</p>
                        <p><strong>Invité par :</strong> ${invite.invitedBy.name}</p>
                    </div>
                    
                    <p>Pour accepter cette invitation, cliquez sur le lien ci-dessous :</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            Accepter l'invitation
                        </a>
                    </div>
                    
                    <p><small>Ce lien expire le ${new Date(invite.expiresAt).toLocaleDateString('fr-FR')} à ${new Date(invite.expiresAt).toLocaleTimeString('fr-FR')}.</small></p>
                    
                    <p>Si vous ne souhaitez pas rejoindre ce projet, vous pouvez ignorer cet email.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        Cet email a été envoyé automatiquement par GECC - Gestion Électronique des Contrats de Construction
                    </p>
                </div>
            `,
            text: `
                Invitation au projet GECC
                
                Bonjour,
                
                Vous avez été invité(e) à rejoindre le projet "${invite.project.name}" (${invite.project.code}) en tant que ${this.getRoleInProjectDisplayName(invite.role)}.
                
                Détails du projet :
                - Nom : ${invite.project.name}
                - Code : ${invite.project.code}
                - Description : ${invite.project.description || 'Aucune description'}
                - Votre rôle : ${this.getRoleInProjectDisplayName(invite.role)}
                - Invité par : ${invite.invitedBy.name}
                
                Pour accepter cette invitation, cliquez sur le lien suivant :
                ${inviteLink}
                
                Ce lien expire le ${new Date(invite.expiresAt).toLocaleDateString('fr-FR')} à ${new Date(invite.expiresAt).toLocaleTimeString('fr-FR')}.
                
                Si vous ne souhaitez pas rejoindre ce projet, vous pouvez ignorer cet email.
                
                ---
                Cet email a été envoyé automatiquement par GECC - Gestion Électronique des Contrats de Construction
            `
        };
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

    copyInviteLinkToClipboard(inviteLink) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(inviteLink);
        } else {
            // Fallback pour les navigateurs non sécurisés
            const textArea = document.createElement('textarea');
            textArea.value = inviteLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale du client API invitations
window.invitesApiClient = new InvitesApiClient(window.apiClient);

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvitesApiClient;
}
