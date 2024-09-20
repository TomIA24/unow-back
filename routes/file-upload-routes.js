'use strict';

const express = require('express');
const { upload } = require('../helpers/filehelper');
const {
    multipleFileUpload,
    getallSingleFiles,
    getallMultipleFiles,
    singleFileUpload,
    multipleFilesUploadWithName
} = require('../controllers/fileuploaderController');
const router = express.Router();

router.post('/singleFilewithTitle', upload.single('file'), singleFileUpload);
router.post('/multipleFiles', upload.array('files'), multipleFileUpload);
router.post('/multipleFileswithTitle', upload.array('files'), multipleFilesUploadWithName);
router.post('/getSingleFiles', getallSingleFiles);
router.post('/getMultipleFiles', getallMultipleFiles);


module.exports = {
    routes: router
}