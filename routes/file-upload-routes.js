'use strict';

const express = require('express');
const { upload } = require('../helpers/filehelper');
const {
    getallSingleFiles,
    getallMultipleFiles,
    singleFileUpload,
    singleImageUpload,
    multipleFilesUploadWithName
} = require('../controllers/fileuploaderController');
const router = express.Router();
router.post('/singleFile', upload.single('file'), singleImageUpload);
router.post('/singleFilewithTitle', upload.single('file'), singleFileUpload);
router.post('/multipleFileswithTitle', upload.array('files'), multipleFilesUploadWithName);
router.post('/getSingleFiles', getallSingleFiles);
router.post('/getMultipleFiles', getallMultipleFiles);


module.exports = {
    routes: router
}