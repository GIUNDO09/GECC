/**
 * Script pour forcer la mise à jour du cache CSS
 * et vérifier que les corrections de compatibilité sont appliquées
 */

// Fonction pour forcer le rechargement des styles CSS
function forceCSSReload() {
    console.log('🔄 Forçage du rechargement des styles CSS...');
    
    // Récupérer tous les liens CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    
    cssLinks.forEach((link, index) => {
        const href = link.href;
        const newHref = href.includes('?') 
            ? href + '&v=' + Date.now() 
            : href + '?v=' + Date.now();
        
        console.log(`📄 Mise à jour CSS ${index + 1}: ${href} -> ${newHref}`);
        link.href = newHref;
    });
    
    console.log('✅ Rechargement CSS forcé terminé');
}

// Fonction pour vérifier les propriétés CSS
function verifyCSSProperties() {
    console.log('🔍 Vérification des propriétés CSS...');
    
    // Vérifier text-size-adjust
    const htmlElement = document.documentElement;
    const htmlStyles = window.getComputedStyle(htmlElement);
    
    console.log('📊 Propriétés détectées:');
    console.log('- text-size-adjust:', htmlStyles.textSizeAdjust || 'non détecté');
    console.log('- -webkit-text-size-adjust:', htmlStyles.webkitTextSizeAdjust || 'non détecté');
    
    // Vérifier user-select
    const testElements = document.querySelectorAll('.btn, .checkbox-text');
    if (testElements.length > 0) {
        const testStyles = window.getComputedStyle(testElements[0]);
        console.log('- user-select:', testStyles.userSelect || 'non détecté');
        console.log('- -webkit-user-select:', testStyles.webkitUserSelect || 'non détecté');
    }
    
    console.log('✅ Vérification CSS terminée');
}

// Fonction pour créer un élément de test
function createTestElement() {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #28a745;
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    testDiv.innerHTML = '✅ CSS Compatible';
    document.body.appendChild(testDiv);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        testDiv.remove();
    }, 3000);
}

// Fonction principale
function runCSSCompatibilityCheck() {
    console.log('🚀 Démarrage de la vérification CSS...');
    
    // Forcer le rechargement CSS
    forceCSSReload();
    
    // Attendre un peu puis vérifier
    setTimeout(() => {
        verifyCSSProperties();
        createTestElement();
    }, 1000);
    
    console.log('✅ Vérification CSS terminée');
}

// Exécuter automatiquement si le script est chargé
if (typeof window !== 'undefined') {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCSSCompatibilityCheck);
    } else {
        runCSSCompatibilityCheck();
    }
}

// Exporter les fonctions pour utilisation manuelle
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        forceCSSReload,
        verifyCSSProperties,
        runCSSCompatibilityCheck
    };
}
