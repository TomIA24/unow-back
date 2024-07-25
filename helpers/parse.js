const fs = require('fs');
const path = require('path');

const parseFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const lines = data.split('\n');
                const parsedData = lines.map(line => {
                    return line.trim();
                }).filter(item => item !== ''); 

                resolve(parsedData);
            }
        });
    });
};

module.exports = { parseFile };