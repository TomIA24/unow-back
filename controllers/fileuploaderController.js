'use strict';
const SingleFile = require('../models/singlefile');
const MultipleFile = require('../models/multiplefile');
const ObjectId = require('mongodb').ObjectID;
const { v4: uuidv4 } = require('uuid');
const { Trainer, validate } = require("../models/Trainer");
const { Candidat } = require("../models/Candidat");
const { Training } = require("../models/Training");
const { Course } = require("../models/course");

/*Upload Single File*/
const singleFileUpload = async (req, res, next) => {
 
  const id = req.headers["id"].split("/")[1];

  try {

    const file = new SingleFile({
      id: uuidv4(),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2), // 0.00
    });
    console.log(file);
    await file.save();
    console.log("id:", id);
    const course = await Course.findOne({ _id: ObjectId(id) });
    const training = await Training.findOne({ _id: ObjectId(id) });

    if (course) {
      await Course.updateOne(
        { _id: course._id },
        { $set: { Thumbnail: file } }
      );
    }

    if (training) {
      await Training.updateOne(
        { _id: training._id },
        { $set: { Thumbnail: file } }
      );
    }
    res.status(201).send("File Uploaded Successfully");
    
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

const multipleFileUpload = async (req, res, next) => {
  const id = req.headers["authorization"].split(" ")[1];
  const name = req.headers["name"].split("/")[1];
  console.log(req.headers);
  const courseId = req.headers["courseid"].split("/")[1];
  try {
    let filesArray = [];
    req.files.forEach((element) => {
      const file = {
        id: uuidv4(),
        fileName: element.originalname,
        filePath: element.path,
        fileType: element.mimetype,
        fileSize: fileSizeFormatter(element.size, 2),
      };
      const fileSave = new SingleFile(file);
      fileSave.save();
      filesArray.push(file);
    });
    const multipleFiles = new MultipleFile({
      title: req.body.title,
      files: filesArray,
    });

    const existFiles = await MultipleFile.findOne({ title: name });
    console.log("exists: ", existFiles);

    if (existFiles) {
      await MultipleFile.updateOne(
        { title: name },
        { $push: { files: filesArray } }
      );
    } else {
      await multipleFiles.save();
    }

    const course = await Course.findOne({ _id: courseId });

    const training = await Training.findOne({ _id: courseId });
    console.log(training);

    if (course) {
      console.log("course: ", course);
      course.Videos.pushValues(filesArray);
      await Course.updateOne(
        { _id: course._id },
        { $set: { Videos: course.Videos } }
      );
    }

    if (training) {
      console.log("training updated");
      await training.Ressources.forEach(async (e) => {
        filesArray.push(e);
      });
      await Training.updateOne(
        { _id: training._id },
        { $set: { Ressources: filesArray } }
      );
    }

    res.status(201).send("Files Uploaded Successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

const multipleFilesUploadWithName = async (req, res, next) => {
  console.log("here Multiple videos from router file");
  console.log(req.headers);
  console.log("//name:", req.headers["name"].split("/")[1]);
  const name = req.headers["name"].split("/")[1];
  console.log("//type:", req.headers["type"].split("/")[1]);
  const type = req.headers["type"].split("/")[1];
  try {
    let filesArray = [];
    req.files.forEach(async (element) => {
      const file = {
        id: uuidv4(),
        fileName: element.originalname,
        filePath: element.path,
        fileType: element.mimetype,
        fileSize: fileSizeFormatter(element.size, 2),
      };
      const fileSave = new SingleFile({
        id: uuidv4(),
        fileName: element.originalname,
        filePath: element.path,
        fileType: element.mimetype,
        fileSize: fileSizeFormatter(element.size, 2),
      });
      await fileSave.save();
      filesArray.push(file);
    });
    const multipleFiles = new MultipleFile({
      title: name,
      files: filesArray,
    });

    await multipleFiles.save();

    const course = await Course.findOne({ Title: name });
    console.log("course: ", course);
    const training = await Training.findOne({ Title: name });
    console.log("training: ", training);

    if (course) {
      console.log("course: ", course);
      if (type === "Ressources") {
        await Course.updateOne(
          { _id: course._id },
          { $set: { Ressources: filesArray } }
        );
      }
      if (type === "Videos") {
        await Course.updateOne(
          { _id: course._id },
          { $set: { Videos: filesArray } }
        );
      }
    }

    if (training) {
      await Training.updateOne(
        { _id: training._id },
        { $set: { Ressources: filesArray } }
      );
    }
    res.status(201).send("Files Uploaded Successfully");
    console.log("done");
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};









const getallSingleFiles = async (req, res, next) => {
    try{
        const files = await SingleFile.find();
        res.status(200).send(files);
    }catch(error) {
        res.status(400).send(error.message);
    }
}
const getallMultipleFiles = async (req, res, next) => {
    try{
        const files = await MultipleFile.find();
        res.status(200).send(files);
    }catch(error) {
        res.status(400).send(error.message);
    }
}

const fileSizeFormatter = (bytes, decimal) => {
    if(bytes === 0){
        return '0 Bytes';
    }
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB', 'ZB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];

}

module.exports = {
    multipleFileUpload,
    getallSingleFiles,
    getallMultipleFiles,
    singleFileUpload,
    multipleFilesUploadWithName
}
