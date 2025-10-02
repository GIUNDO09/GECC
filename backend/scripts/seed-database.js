/*
 * GECC Backend - Script de seed de la base de données
 * 
 * Ce script ajoute des données de test à la base de données
 * pour faciliter le développement et les tests
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');

async function seedDatabase() {
    console.log('🌱 Ajout des données de test...');
    
    const db = getDatabase();
    
    try {
        // Créer les utilisateurs de test
        const users = await createTestUsers(db);
        console.log(`✅ ${users.length} utilisateurs créés`);
        
        // Créer un projet de test
        const project = await createTestProject(db, users);
        console.log(`✅ Projet "${project.name}" créé`);
        
        // Créer des documents de test
        const documents = await createTestDocuments(db, project, users);
        console.log(`✅ ${documents.length} documents créés`);
        
        // Créer des tâches de test
        const tasks = await createTestTasks(db, project, users);
        console.log(`✅ ${tasks.length} tâches créées`);
        
        // Créer des commentaires de test
        const comments = await createTestComments(db, project, users);
        console.log(`✅ ${comments.length} commentaires créés`);
        
        // Créer des notifications de test
        const notifications = await createTestNotifications(db, project, users);
        console.log(`✅ ${notifications.length} notifications créées`);
        
        console.log('🎉 Données de test ajoutées avec succès !');
        console.log('\n📋 Comptes de test créés :');
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.role}): ${user.email} / motdepasse123`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des données de test:', error);
        throw error;
    } finally {
        db.close();
    }
}

async function createTestUsers(db) {
    const users = [
        {
            name: 'Marie Dubois',
            email: 'marie.dubois@architecte.fr',
            role: 'architect',
            password: 'motdepasse123'
        },
        {
            name: 'Pierre Martin',
            email: 'pierre.martin@bct.fr',
            role: 'bct',
            password: 'motdepasse123'
        },
        {
            name: 'Sophie Bernard',
            email: 'sophie.bernard@bet.fr',
            role: 'bet',
            password: 'motdepasse123'
        },
        {
            name: 'Jean Durand',
            email: 'jean.durand@contractor.fr',
            role: 'contractor',
            password: 'motdepasse123'
        },
        {
            name: 'Admin GECC',
            email: 'admin@gecc.fr',
            role: 'admin',
            password: 'motdepasse123'
        }
    ];

    const createdUsers = [];
    
    for (const userData of users) {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [userData.email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            console.log(`   ⚠️  Utilisateur ${userData.email} existe déjà`);
            continue;
        }

        // Hacher le mot de passe
        const passwordHash = await bcrypt.hash(userData.password, 12);
        
        // Créer l'utilisateur
        const userId = uuidv4();
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                [userId, userData.name, userData.email, passwordHash, userData.role],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        createdUsers.push({ ...userData, id: userId });
    }

    return createdUsers;
}

async function createTestProject(db, users) {
    const architect = users.find(u => u.role === 'architect');
    const projectId = uuidv4();
    const teamJson = JSON.stringify(users.map(u => u.id));

    await new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO projects (
                id, name, code, description, manager_id, team, status, 
                progress, start_date, end_date, budget, location
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectId,
                'Résidence Les Jardins du Soleil',
                'RJS-2024-001',
                'Construction d\'une résidence de 24 logements avec parking souterrain et espaces verts',
                architect.id,
                teamJson,
                'active',
                35,
                '2024-01-15',
                '2024-12-31',
                2500000,
                'Lyon, France'
            ],
            function(err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });

    return {
        id: projectId,
        name: 'Résidence Les Jardins du Soleil',
        code: 'RJS-2024-001'
    };
}

async function createTestDocuments(db, project, users) {
    const architect = users.find(u => u.role === 'architect');
    const bct = users.find(u => u.role === 'bct');
    const bet = users.find(u => u.role === 'bet');
    const contractor = users.find(u => u.role === 'contractor');

    const documents = [
        {
            title: 'Plans d\'architecture - RDC',
            type: 'Plans',
            description: 'Plans d\'architecture du rez-de-chaussée avec aménagements commerciaux',
            targets: ['bct', 'bet'],
            state: 'validated'
        },
        {
            title: 'Étude de structure - Fondations',
            type: 'Études',
            description: 'Étude de structure pour les fondations et infrastructure',
            targets: ['bct', 'contractor'],
            state: 'in-review'
        },
        {
            title: 'Cahier des charges techniques',
            type: 'Spécifications',
            description: 'Cahier des charges techniques détaillé pour l\'appel d\'offres',
            targets: ['bct', 'bet', 'contractor'],
            state: 'observations'
        }
    ];

    const createdDocuments = [];

    for (const docData of documents) {
        const docId = uuidv4();
        const targetsJson = JSON.stringify(docData.targets);

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO documents (
                    id, title, type, description, targets, state, author_id, project_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [docId, docData.title, docData.type, docData.description, targetsJson, docData.state, architect.id, project.id],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Ajouter l'historique
        const historyId = uuidv4();
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO document_history (id, document_id, action, author_id, description) VALUES (?, ?, ?, ?, ?)',
                [historyId, docId, 'created', architect.id, 'Document créé'],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Ajouter l'historique selon l'état
        if (docData.state === 'submitted' || docData.state === 'in-review' || docData.state === 'validated') {
            const submitHistoryId = uuidv4();
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO document_history (id, document_id, action, author_id, description) VALUES (?, ?, ?, ?, ?)',
                    [submitHistoryId, docId, 'submitted', architect.id, 'Document soumis pour validation'],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        if (docData.state === 'in-review') {
            const reviewHistoryId = uuidv4();
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO document_history (id, document_id, action, author_id, description) VALUES (?, ?, ?, ?, ?)',
                    [reviewHistoryId, docId, 'review_started', bct.id, 'Début de la revue par le BCT'],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        if (docData.state === 'validated') {
            const validateHistoryId = uuidv4();
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO document_history (id, document_id, action, author_id, description) VALUES (?, ?, ?, ?, ?)',
                    [validateHistoryId, docId, 'validated', bct.id, 'Document validé par le BCT'],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        if (docData.state === 'observations') {
            const obsHistoryId = uuidv4();
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO document_history (id, document_id, action, author_id, description) VALUES (?, ?, ?, ?, ?)',
                    [obsHistoryId, docId, 'observations', bet.id, 'Observations formulées par le BET'],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        createdDocuments.push({ ...docData, id: docId });
    }

    return createdDocuments;
}

async function createTestTasks(db, project, users) {
    const architect = users.find(u => u.role === 'architect');
    const contractor = users.find(u => u.role === 'contractor');

    const tasks = [
        {
            title: 'Finaliser les plans d\'exécution',
            description: 'Compléter les plans d\'exécution pour le lot gros œuvre',
            status: 'todo',
            priority: 'high',
            assigneeId: architect.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            title: 'Commander les matériaux',
            description: 'Lancer les commandes pour les matériaux de gros œuvre',
            status: 'in-progress',
            priority: 'medium',
            assigneeId: contractor.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            title: 'Préparer le chantier',
            description: 'Installation des équipements et signalisation du chantier',
            status: 'in-progress',
            priority: 'high',
            assigneeId: contractor.id,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            title: 'Validation des devis',
            description: 'Examen et validation des devis fournisseurs',
            status: 'in-review',
            priority: 'medium',
            assigneeId: architect.id,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            title: 'Installation électricité',
            description: 'Installation du réseau électrique principal',
            status: 'completed',
            priority: 'high',
            assigneeId: contractor.id,
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
            title: 'Contrôle qualité',
            description: 'Contrôle qualité des travaux de gros œuvre',
            status: 'completed',
            priority: 'medium',
            assigneeId: architect.id,
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
    ];

    const createdTasks = [];

    for (const taskData of tasks) {
        const taskId = uuidv4();

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO tasks (
                    id, title, description, status, priority, assignee_id, project_id, due_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [taskId, taskData.title, taskData.description, taskData.status, taskData.priority, taskData.assigneeId, project.id, taskData.dueDate],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        createdTasks.push({ ...taskData, id: taskId });
    }

    return createdTasks;
}

async function createTestComments(db, project, users) {
    const architect = users.find(u => u.role === 'architect');
    const bct = users.find(u => u.role === 'bct');
    const bet = users.find(u => u.role === 'bet');
    const contractor = users.find(u => u.role === 'contractor');

    const comments = [
        {
            text: 'Bonjour à tous, je vous informe que les plans d\'architecture sont maintenant disponibles. N\'hésitez pas à me faire vos retours.',
            authorId: architect.id,
            isInternal: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            text: 'Merci Marie, j\'ai examiné les plans. Tout semble conforme aux normes. Je valide.',
            authorId: bct.id,
            isInternal: false,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            text: 'Pour l\'étude de structure, j\'ai quelques questions sur les fondations. Peux-tu me rappeler ?',
            authorId: bet.id,
            isInternal: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            text: 'Note interne : Prévoir une réunion avec l\'équipe pour faire le point sur l\'avancement.',
            authorId: architect.id,
            isInternal: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            text: 'Les travaux de préparation du chantier avancent bien. Nous devrions pouvoir commencer les fondations la semaine prochaine.',
            authorId: contractor.id,
            isInternal: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const createdComments = [];

    for (const commentData of comments) {
        const commentId = uuidv4();

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO comments (
                    id, text, author_id, project_id, is_internal, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [commentId, commentData.text, commentData.authorId, project.id, commentData.isInternal ? 1 : 0, commentData.createdAt],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        createdComments.push({ ...commentData, id: commentId });
    }

    return createdComments;
}

async function createTestNotifications(db, project, users) {
    const architect = users.find(u => u.role === 'architect');
    const bct = users.find(u => u.role === 'bct');
    const bet = users.find(u => u.role === 'bet');
    const contractor = users.find(u => u.role === 'contractor');

    const notifications = [
        {
            userId: bct.id,
            title: 'Nouveau document à valider',
            message: 'Marie Dubois a soumis le document "Plans d\'architecture - RDC" pour validation',
            type: 'info',
            category: 'document',
            relatedId: project.id,
            relatedType: 'project',
            actionUrl: `/project/${project.id}#documents`,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            userId: bet.id,
            title: 'Document en attente de validation',
            message: 'Marie Dubois a soumis le document "Étude de structure - Fondations" pour validation',
            type: 'info',
            category: 'document',
            relatedId: project.id,
            relatedType: 'project',
            actionUrl: `/project/${project.id}#documents`,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            userId: architect.id,
            title: 'Document validé',
            message: 'Pierre Martin a validé le document "Plans d\'architecture - RDC"',
            type: 'success',
            category: 'document',
            relatedId: project.id,
            relatedType: 'project',
            actionUrl: `/project/${project.id}#documents`,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            isRead: true
        },
        {
            userId: architect.id,
            title: 'Observations formulées',
            message: 'Sophie Bernard a formulé des observations sur le document "Cahier des charges techniques"',
            type: 'warning',
            category: 'document',
            relatedId: project.id,
            relatedType: 'project',
            actionUrl: `/project/${project.id}#documents`,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            userId: architect.id,
            title: 'Tâche terminée',
            message: 'Jean Durand a terminé la tâche "Installation électricité"',
            type: 'success',
            category: 'task',
            relatedId: project.id,
            relatedType: 'project',
            actionUrl: `/project/${project.id}#tasks`,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    const createdNotifications = [];

    for (const notificationData of notifications) {
        const notificationId = uuidv4();

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO notifications (
                    id, user_id, title, message, type, category, 
                    related_id, related_type, action_url, is_read, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    notificationId, notificationData.userId, notificationData.title, 
                    notificationData.message, notificationData.type, notificationData.category,
                    notificationData.relatedId, notificationData.relatedType, notificationData.actionUrl,
                    notificationData.isRead ? 1 : 0, notificationData.createdAt
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        createdNotifications.push({ ...notificationData, id: notificationId });
    }

    return createdNotifications;
}

// Exécuter le script si appelé directement
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Script de seed terminé avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur lors de l\'exécution du script de seed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
