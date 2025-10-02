/**
 * ========================================
 * SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES
 * ========================================
 * Script pour initialiser la base de données
 * et créer des données de test
 * ========================================
 */

require('dotenv').config();
const { initDatabase, closeDatabase } = require('../database/init');
const { createUser } = require('../models/User');
const { createProject } = require('../models/Project');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Initialisation des tables
    await initDatabase();
    console.log('✅ Tables créées avec succès');

    // Création d'utilisateurs de test
    console.log('👥 Création des utilisateurs de test...');
    
    const users = [
      {
        name: 'Marie Dubois',
        email: 'marie.dubois@architecte.fr',
        password: await bcrypt.hash('password123', 12),
        role: 'architect'
      },
      {
        name: 'Jean Martin',
        email: 'jean.martin@bct.fr',
        password: await bcrypt.hash('password123', 12),
        role: 'bct'
      },
      {
        name: 'Sophie Leroy',
        email: 'sophie.leroy@bet.fr',
        password: await bcrypt.hash('password123', 12),
        role: 'bet'
      },
      {
        name: 'Pierre Durand',
        email: 'pierre.durand@contractor.fr',
        password: await bcrypt.hash('password123', 12),
        role: 'contractor'
      },
      {
        name: 'Admin GECC',
        email: 'admin@gecc.fr',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      try {
        const user = await createUser(userData);
        createdUsers.push(user);
        console.log(`✅ Utilisateur créé: ${user.name} (${user.email})`);
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          console.log(`⚠️  Utilisateur existe déjà: ${userData.email}`);
        } else {
          throw error;
        }
      }
    }

    // Création d'un projet de test
    console.log('🏗️  Création d\'un projet de test...');
    
    const architect = createdUsers.find(u => u.role === 'architect');
    if (architect) {
      try {
        const project = await createProject({
          code: 'DEMO-2024-001',
          name: 'Résidence Les Jardins',
          description: 'Projet de résidence de 20 logements avec espaces verts',
          address: '15 rue de la République, 75001 Paris',
          type: 'residentiel',
          surface: 2500,
          owner: 'SCI Les Jardins',
          ownerId: architect.id
        });
        console.log(`✅ Projet créé: ${project.name} (${project.code})`);
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          console.log('⚠️  Projet de test existe déjà');
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 Initialisation terminée avec succès !');
    console.log('\n📋 Comptes de test créés :');
    console.log('   👩‍💼 Architecte: marie.dubois@architecte.fr / password123');
    console.log('   🏗️  BCT: jean.martin@bct.fr / password123');
    console.log('   ⚙️  BET: sophie.leroy@bet.fr / password123');
    console.log('   🏢 Entrepreneur: pierre.durand@contractor.fr / password123');
    console.log('   👨‍💼 Admin: admin@gecc.fr / admin123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Exécution du script
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };