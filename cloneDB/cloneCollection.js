const mongoose = require('mongoose');

// Source database connection
const sourceDbUri = 'mongodb+srv://unowelearning:dF2L2v4Az0gjX4zO@cluster0.rlwqghs.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';


// Target database connection
const targetDbUri = 'mongodb+srv://unow:cTkFZErgOB6M9Bh7@unow-main.g7gfu.mongodb.net/unow_production?retryWrites=true&w=majority&appName=unow-main&tls=true&tlsInsecure=true';


// Liste des collections à cloner
const collections = [
    'admins', 'candidats', 'categories', 'courses', 'evaluations',
    'killmistakes', 'multiplefiles', 'newsletterclients', 'notifications',
    'programs', 'questions', 'quizzes', 'rooms', 'singlefiles', 'slider',
    'trainernotifs', 'trainers', 'trainings'
];

async function cloneCollections() {
    try {
        // Connexion à la base de données source
        const sourceConnection = await mongoose.createConnection(sourceDbUri);
        console.log("Connected to source DB");

        // Connexion à la base de données cible
        const targetConnection = await mongoose.createConnection(targetDbUri);
        console.log("Connected to target DB");

        // Cloner chaque collection
        for (let collectionName of collections) {
            console.log(`Cloning collection: ${collectionName}`);
            
            const sourceModel = sourceConnection.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
            const targetModel = targetConnection.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);

            // Extraire tous les documents de la collection source
            const documents = await sourceModel.find({});
            if (documents.length > 0) {
                // Insérer dans la collection cible
                await targetModel.insertMany(documents);
                console.log(`${documents.length} documents cloned in ${collectionName}`);
            } else {
                console.log(`No documents found in ${collectionName}`);
            }
        }

        // Fermer les connexions
        await sourceConnection.close();
        await targetConnection.close();
        console.log('Cloning completed!');
    } catch (error) {
        console.error('Error during cloning:', error);
    }
}

cloneCollections();
