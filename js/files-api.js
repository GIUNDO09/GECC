// ========================================
// CLIENT API FICHIERS GECC
// ========================================
// Client API pour la gestion des fichiers

class FilesApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // ========================================
    // MÉTHODES FICHIERS
    // ========================================

    async uploadFile(projectId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.apiClient.request(`/projects/${projectId}/files`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Ne pas définir Content-Type, laissez le navigateur le faire
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    document: data.document,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de l\'upload du fichier',
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

    async getProjectFiles(projectId) {
        try {
            const response = await this.apiClient.request(`/projects/${projectId}/files`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    documents: data.documents
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des fichiers',
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

    async downloadFile(fileId) {
        try {
            const response = await this.apiClient.request(`/files/${fileId}/download`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    downloadUrl: data.downloadUrl,
                    document: data.document
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la génération du lien de téléchargement',
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

    async getFileInfo(fileId) {
        try {
            const response = await this.apiClient.request(`/files/${fileId}/info`);

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    document: data.document
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des informations du fichier',
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

    async deleteFile(fileId) {
        try {
            const response = await this.apiClient.request(`/files/${fileId}`, {
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
                    error: error.error || 'Erreur lors de la suppression du fichier',
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

    async getUploadUrl(projectId, fileName, mimeType) {
        try {
            const response = await this.apiClient.request('/files/upload-url', {
                method: 'POST',
                body: JSON.stringify({
                    projectId,
                    fileName,
                    mimeType
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    uploadUrl: data.uploadUrl,
                    filePath: data.filePath,
                    uniqueFileName: data.uniqueFileName,
                    expiresIn: data.expiresIn
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la génération de l\'URL d\'upload',
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return '🖼️';
        } else if (mimeType === 'application/pdf') {
            return '📄';
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return '📝';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return '📊';
        } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
            return '📦';
        } else if (mimeType.startsWith('text/')) {
            return '📄';
        } else {
            return '📎';
        }
    }

    getFileTypeDisplayName(mimeType) {
        const types = {
            'image/jpeg': 'Image JPEG',
            'image/png': 'Image PNG',
            'image/gif': 'Image GIF',
            'image/webp': 'Image WebP',
            'application/pdf': 'Document PDF',
            'application/msword': 'Document Word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document Word',
            'application/vnd.ms-excel': 'Feuille Excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Feuille Excel',
            'text/plain': 'Fichier texte',
            'application/zip': 'Archive ZIP',
            'application/x-rar-compressed': 'Archive RAR'
        };
        return types[mimeType] || 'Fichier';
    }

    isImageFile(mimeType) {
        return mimeType.startsWith('image/');
    }

    isPdfFile(mimeType) {
        return mimeType === 'application/pdf';
    }

    isDocumentFile(mimeType) {
        return mimeType.includes('word') || 
               mimeType.includes('excel') || 
               mimeType.includes('powerpoint') ||
               mimeType === 'application/pdf';
    }

    isArchiveFile(mimeType) {
        return mimeType.includes('zip') || mimeType.includes('rar');
    }

    // ========================================
    // MÉTHODES D'UPLOAD AVANCÉES
    // ========================================

    async uploadFileWithProgress(projectId, file, onProgress) {
        try {
            // Générer une URL d'upload presignée
            const urlResult = await this.getUploadUrl(projectId, file.name, file.type);
            
            if (!urlResult.success) {
                return urlResult;
            }

            // Upload direct vers S3 avec suivi de progression
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable && onProgress) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        resolve({
                            success: true,
                            message: 'Fichier uploadé avec succès',
                            filePath: urlResult.filePath
                        });
                    } else {
                        resolve({
                            success: false,
                            error: 'Erreur lors de l\'upload du fichier',
                            code: 'UPLOAD_ERROR'
                        });
                    }
                });

                xhr.addEventListener('error', () => {
                    resolve({
                        success: false,
                        error: 'Erreur de connexion lors de l\'upload',
                        code: 'NETWORK_ERROR'
                    });
                });

                xhr.open('PUT', urlResult.uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

        } catch (error) {
            return {
                success: false,
                error: 'Erreur lors de l\'upload du fichier',
                code: 'UPLOAD_ERROR'
            };
        }
    }

    // ========================================
    // MÉTHODES DE TÉLÉCHARGEMENT
    // ========================================

    async downloadFileDirect(fileId, fileName) {
        try {
            const result = await this.downloadFile(fileId);
            
            if (result.success) {
                // Créer un lien de téléchargement temporaire
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.download = fileName || result.document.name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                return { success: true };
            } else {
                return result;
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur lors du téléchargement',
                code: 'DOWNLOAD_ERROR'
            };
        }
    }

    // ========================================
    // MÉTHODES DE VALIDATION
    // ========================================

    validateFile(file, options = {}) {
        const {
            maxSize = 50 * 1024 * 1024, // 50MB par défaut
            allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
            ]
        } = options;

        if (!file) {
            return { valid: false, error: 'Aucun fichier sélectionné' };
        }

        if (file.size > maxSize) {
            return { 
                valid: false, 
                error: `Le fichier est trop volumineux. Taille maximale: ${this.formatFileSize(maxSize)}` 
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}` 
            };
        }

        return { valid: true };
    }

    // ========================================
    // MÉTHODES D'AFFICHAGE
    // ========================================

    createFilePreview(file, container) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        if (this.isImageFile(file.type)) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            preview.appendChild(img);
        } else {
            const icon = document.createElement('div');
            icon.textContent = this.getFileIcon(file.type);
            icon.style.fontSize = '48px';
            icon.style.textAlign = 'center';
            preview.appendChild(icon);
        }
        
        const info = document.createElement('div');
        info.innerHTML = `
            <div><strong>${file.name}</strong></div>
            <div>${this.formatFileSize(file.size)}</div>
            <div>${this.getFileTypeDisplayName(file.type)}</div>
        `;
        preview.appendChild(info);
        
        container.appendChild(preview);
        
        return preview;
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale du client API fichiers
window.filesApiClient = new FilesApiClient(window.apiClient);

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilesApiClient;
}
