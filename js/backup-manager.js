/* 
========================================
GESTIONNAIRE DE SAUVEGARDE GECC
========================================
Rôle : Sauvegarde et restauration des données
- Sauvegarde automatique dans un fichier
- Restauration au démarrage
- Export/Import manuel
- Protection contre la perte de données
========================================
*/

// Remplacement de l'import par une référence directe
// import localRepository from './store.js';

class BackupManager {
    constructor() {
        this.backupKey = 'gecc_backup';
        this.autoBackupInterval = null;
        this.init();
    }

    init() {
        // Restaurer les données au démarrage
        this.restoreFromBackup();
        
        // Démarrer la sauvegarde automatique
        this.startAutoBackup();
        
        // Sauvegarder avant de quitter la page (sans télécharger de fichier)
        window.addEventListener('beforeunload', () => {
            this.createBackup(false); // false = pas de téléchargement automatique
        });
    }

    /**
     * Crée une sauvegarde des données actuelles
     */
    createBackup(downloadFile = false) {
        try {
            // Collecter toutes les données depuis localStorage
            const data = {
                userProfile: JSON.parse(localStorage.getItem('geccp-currentUser') || '{}'),
                userProfileDetails: JSON.parse(localStorage.getItem('userProfile') || '{}'),
                companyProfile: JSON.parse(localStorage.getItem('companyProfile') || '{}'),
                userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
                notificationPreferences: JSON.parse(localStorage.getItem('notificationPreferences') || '{}'),
                projects: JSON.parse(localStorage.getItem('projects') || '[]'),
                comments: JSON.parse(localStorage.getItem('comments') || '[]'),
                tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
                geccData: JSON.parse(localStorage.getItem('gecc_data') || '{}'),
                currentSession: JSON.parse(localStorage.getItem('currentSession') || '{}')
            };
            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: data
            };
            
            // Sauvegarder dans localStorage
            localStorage.setItem(this.backupKey, JSON.stringify(backup));
            
            // Sauvegarder dans un fichier téléchargeable SEULEMENT si demandé
            if (downloadFile) {
                this.downloadBackup(backup);
            }
            
            console.log('✅ Sauvegarde créée:', backup.timestamp);
            return backup;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return null;
        }
    }

    /**
     * Restaure les données depuis la sauvegarde
     */
    restoreFromBackup() {
        try {
            const backupStr = localStorage.getItem(this.backupKey);
            if (!backupStr) {
                console.log('ℹ️ Aucune sauvegarde trouvée');
                return false;
            }

            const backup = JSON.parse(backupStr);
            
            // Vérifier la validité de la sauvegarde
            if (!backup.data || !backup.timestamp) {
                console.error('❌ Sauvegarde invalide');
                return false;
            }

            // Restaurer les données
            this.importData(JSON.stringify(backup.data));
            
            console.log('✅ Données restaurées depuis:', backup.timestamp);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
            return false;
        }
    }

    /**
     * Télécharge une sauvegarde en fichier
     */
    downloadBackup(backup) {
        try {
            const blob = new Blob([JSON.stringify(backup, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gecc-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Erreur lors du téléchargement:', error);
        }
    }

    /**
     * Importe une sauvegarde depuis un fichier
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Vérifier la validité
                    if (!backup.data || !backup.timestamp) {
                        throw new Error('Fichier de sauvegarde invalide');
                    }

                    // Importer les données
                    this.importData(JSON.stringify(backup.data));
                    
                    // Sauvegarder la nouvelle sauvegarde
                    localStorage.setItem(this.backupKey, JSON.stringify(backup));
                    
                    console.log('✅ Données importées depuis:', backup.timestamp);
                    resolve(backup);
                } catch (error) {
                    console.error('❌ Erreur lors de l\'import:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }

    /**
     * Démarre la sauvegarde automatique
     */
    startAutoBackup() {
        // Sauvegarder toutes les 5 minutes (sans télécharger de fichier)
        this.autoBackupInterval = setInterval(() => {
            this.createBackup(false); // false = pas de téléchargement automatique
        }, 5 * 60 * 1000);
        
        console.log('🔄 Sauvegarde automatique activée (toutes les 5 minutes)');
    }

    /**
     * Arrête la sauvegarde automatique
     */
    stopAutoBackup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
            this.autoBackupInterval = null;
            console.log('⏹️ Sauvegarde automatique arrêtée');
        }
    }

    /**
     * Obtient les informations de la dernière sauvegarde
     */
    getBackupInfo() {
        try {
            const backupStr = localStorage.getItem(this.backupKey);
            if (!backupStr) return null;
            
            const backup = JSON.parse(backupStr);
            return {
                timestamp: backup.timestamp,
                version: backup.version,
                size: JSON.stringify(backup).length
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos:', error);
            return null;
        }
    }

    /**
     * Importe des données dans localStorage
     */
    importData(dataString) {
        try {
            const data = JSON.parse(dataString);
            
            // Restaurer chaque type de données
            if (data.userProfile) {
                localStorage.setItem('geccp-currentUser', JSON.stringify(data.userProfile));
            }
            if (data.userProfileDetails) {
                localStorage.setItem('userProfile', JSON.stringify(data.userProfileDetails));
            }
            if (data.companyProfile) {
                localStorage.setItem('companyProfile', JSON.stringify(data.companyProfile));
            }
            if (data.userPreferences) {
                localStorage.setItem('userPreferences', JSON.stringify(data.userPreferences));
            }
            if (data.notificationPreferences) {
                localStorage.setItem('notificationPreferences', JSON.stringify(data.notificationPreferences));
            }
            if (data.projects) {
                localStorage.setItem('projects', JSON.stringify(data.projects));
            }
            if (data.comments) {
                localStorage.setItem('comments', JSON.stringify(data.comments));
            }
            if (data.tasks) {
                localStorage.setItem('tasks', JSON.stringify(data.tasks));
            }
            if (data.geccData) {
                localStorage.setItem('gecc_data', JSON.stringify(data.geccData));
            }
            if (data.currentSession) {
                localStorage.setItem('currentSession', JSON.stringify(data.currentSession));
            }
            
            console.log('✅ Données importées avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'import des données:', error);
            return false;
        }
    }

    /**
     * Nettoie les anciennes sauvegardes
     */
    cleanupOldBackups() {
        // Garder seulement la dernière sauvegarde
        // (pour l'instant, on garde tout)
        console.log('🧹 Nettoyage des sauvegardes...');
    }
}

// Créer une instance globale
const backupManager = new BackupManager();

// Exporter pour utilisation dans d'autres modules
export default backupManager;

// Ajouter les fonctions globales pour l'interface utilisateur
window.GECC = window.GECC || {};
window.GECC.backup = {
    create: () => backupManager.createBackup(false), // Sauvegarde sans téléchargement
    restore: () => backupManager.restoreFromBackup(),
    download: () => backupManager.createBackup(true), // Sauvegarde AVEC téléchargement
    import: (file) => backupManager.importFromFile(file),
    info: () => backupManager.getBackupInfo()
};
