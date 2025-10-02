// Variables globales
let currentTheme = 'light';
let animationsEnabled = true;
const body = document.body;
const header = document.getElementById('header');

// Génération des particules de fond
function createParticles() {
    const bgAnimation = document.getElementById('bgAnimation');
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        bgAnimation.appendChild(particle);
    }
}

// Basculer le thème
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', currentTheme);
    
    const themeText = currentTheme === 'dark' ? 'sombre' : 'clair';
    showToast(`Thème ${themeText} activé ! 🎨`, 'success');
    
    localStorage.setItem('geccp-theme', currentTheme);
}

// Basculer les animations
function toggleAnimations() {
    animationsEnabled = !animationsEnabled;
    body.classList.toggle('animations-disabled', !animationsEnabled);
    
    const statusText = animationsEnabled ? 'activées' : 'désactivées';
    showToast(`Animations ${statusText} ! ✨`, 'info');
    
    localStorage.setItem('geccp-animations', animationsEnabled);
}

// Système de toasts
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Scroll effects pour le header
function handleScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 50);
}

// Smooth scroll pour les liens d'ancrage
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', function() {
    // Charger les préférences
    const savedTheme = localStorage.getItem('geccp-theme');
    const savedAnimations = localStorage.getItem('geccp-animations');
    
    if (savedTheme) {
        currentTheme = savedTheme;
        body.setAttribute('data-theme', currentTheme);
    }
    
    if (savedAnimations !== null) {
        animationsEnabled = savedAnimations === 'true';
        body.classList.toggle('animations-disabled', !animationsEnabled);
    }
    
    // Créer les particules
    createParticles();
    
    // Message de bienvenue
    setTimeout(() => {
        showToast('Bienvenue sur GECC Project ! 🚀', 'success');
    }, 1500);
});

// Event listeners pour le scroll
window.addEventListener('scroll', handleScroll);

// Event listeners pour les boutons de navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        smoothScroll(target);
    });
});

// Les liens redirigent maintenant naturellement vers dashboard.html
// Plus besoin d'event listeners qui interceptent les clics

document.getElementById('heroDemo').addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Lancement de la démo interactive... 📺', 'info');
    openVideoModal();
});

// Le lien ctaSignup redirige maintenant naturellement vers dashboard.html

document.getElementById('ctaContact').addEventListener('click', function(e) {
    showToast('Redirection vers WhatsApp... 💬', 'info');
    // Le lien WhatsApp s'ouvrira automatiquement
});

// Raccourcis clavier
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'd':
                e.preventDefault();
                toggleTheme();
                break;
            case 'h':
                e.preventDefault();
                smoothScroll('#hero');
                break;
        }
    }
});

// Intersection Observer pour les animations au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.querySelectorAll('.feature-card, .testimonial-card, .partner-logo').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Détection des préférences système
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches && animationsEnabled) {
    toggleAnimations();
}

prefersReducedMotion.addEventListener('change', function(e) {
    if (e.matches && animationsEnabled) {
        toggleAnimations();
        showToast('Animations désactivées selon vos préférences système 🎯', 'info');
    }
});

// Parallax léger pour le hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Gestion du modal vidéo
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('demoVideo');
    
    if (modal && video) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
        
        // Charger la vidéo
        video.load();
        
        // Lecture automatique après un court délai
        setTimeout(() => {
            video.play().catch(error => {
                console.log('Lecture automatique bloquée par le navigateur:', error);
                // Si la lecture automatique est bloquée, on affiche un message
                showToast('Cliquez sur play pour lancer la vidéo', 'info');
            });
        }, 500);
        
        // Analytics tracking (optionnel)
        console.log('🎬 Modal vidéo ouvert avec lecture automatique');
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('demoVideo');
    
    if (modal && video) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restaurer le scroll
        
        // Pause la vidéo
        video.pause();
        video.currentTime = 0;
        
        console.log('🎬 Modal vidéo fermé');
    }
}

// Event listeners pour le modal vidéo
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.getElementById('videoModalClose');
    const overlay = document.getElementById('videoModalOverlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideoModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeVideoModal);
    }
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeVideoModal();
        }
    });
    
    // Gérer la fin de la vidéo
    const video = document.getElementById('demoVideo');
    if (video) {
        video.addEventListener('ended', function() {
            showToast('Merci d\'avoir regardé la démo ! 🎉', 'success');
        });
        
        video.addEventListener('error', function() {
            showToast('Erreur lors du chargement de la vidéo. Vérifiez que le fichier demo.mp4 existe.', 'error');
        });
    }
});

// Fonction globale pour fermer le modal (utilisée dans le HTML)
window.closeVideoModal = closeVideoModal;
