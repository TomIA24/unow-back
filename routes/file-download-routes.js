'use strict';

const express = require('express');
//const { upload } = require('../helpers/filehelper');
//const MultipleFile = require('../models/multiplefile');
const SingleFile = require('../models/singlefile');
const path = require('path');
const ObjectId = require('mongodb').ObjectID;
const jwt = require("jsonwebtoken");
const { Training } = require("../models/Training");
const { Course } = require("../models/course");

const router = express.Router();

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = jwt.decode(token)
        //console.log(req.headers)
        // console.log(token)
        //console.log("decoded : ",decoded)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403)
        req.user = decoded
        next()
    })

}

router.post('/', authenticateToken, async(req, res) => {
    console.log("////////////////////", req.body.params.id)
    try {

        const file = await Training.findOne({ _id: ObjectId(req.body.params.id) });
        const fileCourse = await Course.findOne({ _id: ObjectId(req.body.params.id) });

        console.log("file: ", file)
        console.log("file course : ", fileCourse)
        if (file) {
            const ress = await file.Ressources.filter(e => e.id === req.body.params.fileId)
            res.set({
                'Content-Type': ress[0].fileType
            });

            const fileDirName = path.join(__dirname, '..', ress[0].filePath)
            res.sendFile(fileDirName);
        }

        if (fileCourse) {
            const ress = await fileCourse.Ressources.filter(e => e.id === req.body.params.fileId)
            res.set({
                'Content-Type': ress[0].fileType
            });

            const fileDirName = path.join(__dirname, '..', ress[0].filePath)
            res.sendFile(fileDirName);
        }


    } catch (error) {
        console.log(error)
        res.status(400).send('Error while downloading file. Try again later.');
    }
});


module.exports = {
    routes: router
}