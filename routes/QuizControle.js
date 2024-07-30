require('dotenv').config();
const router = require("express").Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Question, validateQuestion } = require('../models/question');
const { parseFile } = require('../helpers/parse');
const { Quiz, validateQuiz } = require('../models/quizz');
const { log } = require('console');
const { KillMistake, validateKillMistake } = require('../models/killmistake');
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

    // Validate the quiz data
    const { error: quizError } = validateQuiz(req.body);
    if (quizError) return res.status(400).json({ error: quizError.details[0].message });

    // Filter out incorrectly answered questions
    const killMistakeQuestions = questions.filter(q => !q.checked);

    try {
        // Save the quiz
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


module.exports = router;