require('dotenv').config();
const router = require("express").Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Question, validateQuestion } = require('../models/question');
const { parseFile } = require('../helpers/parse');
const { Quiz, validateQuiz } = require('../models/quizz');
const { log } = require('console');
const { KillMistake, validateKillMistake } = require('../models/KillMistake');
const upload = multer({ dest: path.join(__dirname, 'uploads') });


console.log('Environment Variables:', process.env);









router.get('/api/quiz/:quizSize', async (req, res) => {
    try {
        const quizSize = parseInt(req.params.quizSize, 10);
        const questions = await Question.aggregate([{ $sample: { size: quizSize } }]);

        if (questions.length === 0) {
            return res.status(404).json({ error: "No questions found" });
        }

        res.json(questions);
    } catch (err) {
        console.error("Error fetching quiz:", err);
        res.status(500).send("Server error");
    }
});

router.put('/api/mark/:id', async (req, res) => {
    const questionId = req.params.id;
    const { flag } = req.body;

    try {
        const question = await Question.findByIdAndUpdate(questionId, { flag }, { new: true });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        console.log(question)
        res.status(200).json(question);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'An error occurred while updating the question' });
    }
});

router.post('/upload', upload.fields([{ name: 'questions' }, { name: 'answers' }]), async (req, res) => {
    if (!req.files || !req.files.questions || !req.files.answers) {
        return res.status(400).send('Both questions and answers files must be uploaded.');
    }

    const questionFilePath = path.join(__dirname, 'uploads', req.files.questions[0].filename);
    const answerFilePath = path.join(__dirname, 'uploads', req.files.answers[0].filename);
    console.log(questionFilePath);
    try {
        const [questions, answers] = await Promise.all([
            parseFile(questionFilePath),
            parseFile(answerFilePath)
        ]);

        if (questions.length !== answers.length) {
            return res.status(400).send('Number of questions does not match number of answers.');
        }

        const extractAnswers = (answerLine) => {

            const parts = answerLine.split(/[\sA-Z]\.|[\sA-Z]\)/).filter(Boolean);


            const correctAnswers = [];
            const wrongAnswers = [];


            parts.forEach(part => {

                const trimmedPart = part.trim();

                if (trimmedPart.endsWith('(correct)')) {

                    correctAnswers.push(trimmedPart.replace('(correct)', '').trim());
                } else {

                    wrongAnswers.push(trimmedPart);
                }
            });

            return { correctAnswers, wrongAnswers };
        };
        const validatedData = questions.map((question, index) => {
            const { correctAnswers, wrongAnswers } = extractAnswers(answers[index]);
            return {
                question: question.trim(),
                correctAnswers,
                wrongAnswers,
                argument: 'Default Argument',
                checked: false
            };
        });

        const validationErrors = validatedData.map(data => validateQuestion(data).error).filter(error => error);

        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        const savedQuestions = await Question.insertMany(validatedData);

        console.log(savedQuestions);
        res.status(200).json(savedQuestions);
    } catch (err) {
        console.error('Error processing files:', err);
        res.status(500).send('Error processing files.');
    } finally {
        if (fs.existsSync(questionFilePath)) {
            fs.unlink(questionFilePath, (err) => {
                if (err) console.error('Error deleting question file:', err);
            });
        } else {
            console.error('Question file does not exist:', questionFilePath);
        }

        if (fs.existsSync(answerFilePath)) {
            fs.unlink(answerFilePath, (err) => {
                if (err) console.error('Error deleting answer file:', err);
            });
        } else {
            console.error('Answer file does not exist:', answerFilePath);
        }
    }
});


router.post('/api/saveQuiz', async (req, res) => {
    const { questions, quizName, score } = req.body;
    console.log(questions);


    const { error: quizError } = validateQuiz(req.body);
    if (quizError) return res.status(400).json({ error: quizError.details[0].message });

    const killMistakeQuestions = questions.filter(q => !q.checked);

    try {
    
        const newQuiz = new Quiz({ questions, quizName, score });
        await newQuiz.save();

        // Save the killMistakes if there are any
        if (killMistakeQuestions.length > 0) {
            const newKillMistake = new KillMistake({ questions: killMistakeQuestions });
            await newKillMistake.save();
        }

        res.status(200).json({ message: 'Quiz saved successfully', score });
    } catch (error) {
        console.error('Error saving quiz:', error);
        res.status(500).json({ error: 'An error occurred while saving the quiz' });
    }
});
router.put('/updateQuiz/:quizId', async (req, res) => {
    const { quizId } = req.params;
    const { questions, quizName, score } = req.body;
    
    console.log(questions);

    const { error: quizError } = validateQuiz(req.body);
    if (quizError) return res.status(400).json({ error: quizError.details[0].message });

    const killMistakeQuestions = questions.filter(q => !q.checked);

    try {
        // Find the existing quiz by its ID
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Update the quiz fields
        quiz.questions = questions;
        quiz.quizName = quizName;
        quiz.score = score;

        // Save the updated quiz
        await quiz.save();

        // Save the killMistakes if there are any
        if (killMistakeQuestions.length > 0) {
            // Optionally find or create a KillMistake entry
            const killMistake = await KillMistake.findOne({ quizId });
            if (killMistake) {
                killMistake.questions = killMistakeQuestions;
                await killMistake.save();
            } else {
                const newKillMistake = new KillMistake({ quizId, questions: killMistakeQuestions });
                await newKillMistake.save();
            }
        }

        res.status(200).json({ message: 'Quiz updated successfully', score });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ error: 'An error occurred while updating the quiz' });
    }
});
router.get('/api/quiz/:quizId/flaggedQuestions', async (req, res) => {
    const { quizId } = req.params;

    try {
        // Find the quiz by its ID
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Filter flagged questions
        const flaggedQuestions = quiz.questions.filter(question => question.flag);

        // Send the flagged questions as the response
        res.status(200).json(flaggedQuestions);
    } catch (error) {
        console.error('Error fetching flagged questions:', error);
        res.status(500).json({ error: 'An error occurred while fetching flagged questions' });
    }
});

//add this to when creating a course 
router.post('/api/quiz/create/:numberOfQuestions', async (req, res) => {
    try {
        const { numberOfQuestions } = req.params;
        const { quizName, courseID } = req.body; // Accept courseID from request body

        // Validate the input
        if (!quizName) {
            return res.status(400).json({ error: 'Quiz name is required' });
        }

        if (!courseID) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const numberOfQuestionsInt = parseInt(numberOfQuestions, 10);

        if (isNaN(numberOfQuestionsInt) || numberOfQuestionsInt <= 0) {
            return res.status(400).json({ error: 'Invalid number of questions' });
        }

        const count = await Question.countDocuments();

        if (count < numberOfQuestionsInt) {
            return res.status(400).json({ error: 'Not enough questions available' });
        }

        const randomQuestions = await Question.aggregate([
            { $sample: { size: numberOfQuestionsInt } }
        ]);

        const newQuiz = new Quiz({
            questions: randomQuestions,
            quizName: quizName,
            score: 0,
            courseID: courseID // Save the courseID in the quiz
        });

        await newQuiz.save();

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'An error occurred while creating the quiz' });
    }
});

router.get('/api/randomkillmistakes/:nbre/:time', async (req, res) => {
    try {
        const { nbre } = req.params;
        const nbreInt = parseInt(nbre, 10);
        
        const count = await KillMistake.countDocuments();
        if (count === 0) {
            return res.status(200).json([]); // Return empty array if no documents are found
        }

        const randomKillMistakes = await KillMistake.aggregate([
            { $sample: { size: nbreInt } },
            { $project: { questions: 1 } } // Project only the 'questions' field
        ]);
        const allQuestions = randomKillMistakes.flatMap(item => item.questions);
console.log(  allQuestions);
        res.status(200).json( allQuestions);
    } catch (error) {
        console.error('Error fetching random KillMistakes:', error);
        res.status(500).json({ error: 'An error occurred while fetching random KillMistakes' });
    }
});
router.get('/api/questionwithkillmistakes', async (req, res) => {
    try {
   
        const questions = await Question.find();

        const killMistakes = await KillMistake.find();

 
        let allKillMistakeQuestions = [];
        killMistakes.forEach(km => {
            allKillMistakeQuestions = allKillMistakeQuestions.concat(km.questions);
        });

       
        const questionTexts = new Set(questions.map(q => q.question));

    
        const uniqueKillMistakeQuestions = allKillMistakeQuestions.filter(q => !questionTexts.has(q.question));

        const combinedData = {
            questions,
            killMistakeQuestions: uniqueKillMistakeQuestions
        };

        res.status(200).json(combinedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred while fetching the data' });
    }
});

router.get('/api/checkillmistakempty', async (req, res) => {
    try {
        const isEmpty = await KillMistake.countDocuments() === 0;

        res.status(200).json({ isEmpty });
    } catch (error) {
        console.error('Error checking KillMistake collection:', error);
        res.status(500).json({ error: 'An error occurred while checking the KillMistake collection' });
    }
});
router.post('/createquiz/:numberOfQuestions', async (req, res) => {
    try {
        const { numberOfQuestions } = req.params;
        const { quizName } = req.body;
        const numberOfQuestionsInt = parseInt(numberOfQuestions, 10);

        // Validate the input
        if (!quizName) {
            return res.status(400).json({ error: 'Quiz name is required' });
        }

        if (isNaN(numberOfQuestionsInt) || numberOfQuestionsInt <= 0) {
            return res.status(400).json({ error: 'Invalid number of questions' });
        }

        const killMistakeCount = await KillMistake.countDocuments();
        let randomKillMistakeQuestions = [];

        if (killMistakeCount > 0) {
            randomKillMistakeQuestions = await KillMistake.aggregate([
                { $sample: { size: Math.min(numberOfQuestionsInt, killMistakeCount) } },
                { $project: { questions: 1 } }
            ]).then(result => result.flatMap(item => item.questions));
        }

        const remainingQuestionsCount = numberOfQuestionsInt - randomKillMistakeQuestions.length;
        let randomQuestions = [];

        if (remainingQuestionsCount > 0) {
            randomQuestions = await getRandomDocuments(Question, remainingQuestionsCount);
        }

        const allQuestions = [...randomKillMistakeQuestions, ...randomQuestions];

        const newQuiz = new Quiz({
            questions: allQuestions,
            quizName,
            score: 0
        });

        await newQuiz.save();

        res.status(201).json({ quizId: newQuiz._id, quiz: newQuiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'An error occurred while creating the quiz' });
    }
});
router.put('/:quizId/question/:questionId', async (req, res) => {
    const { quizId, questionId } = req.params;
    const { flag } = req.body;

    try {
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const question = quiz.questions.id(questionId);

        if (!question) {
            return res.status(404).json({ error: 'Question not found in quiz' });
        }

        question.flag = flag;

 
        await quiz.save();

        res.status(200).json(question);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'An error occurred while updating the question' });
    }
});





router.get('/api/quiz/:quizId/questions', async (req, res) => {
    try {
        const { quizId } = req.params;

       
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.status(200).json(quiz.questions);
    } catch (error) {
        console.error('Error fetching questions in quiz:', error);
        res.status(500).json({ error: 'An error occurred while fetching the questions in the quiz' });
    }
});



module.exports = router;
