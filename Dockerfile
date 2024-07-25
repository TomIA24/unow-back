from node:18-alpine3.18 
workdir /app
copy  package.json /app
run npm i --f --verbose
copy . /app
# List the contents of /app directory to verify the copy (optional)
RUN ls -la
cmd ["node","server.js"]
