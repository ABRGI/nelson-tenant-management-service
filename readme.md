# Tenant management service code for Nelson
* This code contains the tenant management service code that will be deployed to lambda functions
* More information about the service can be found here <a href="https://projectnelson.atlassian.net/wiki/spaces/NELS/pages/2222325761/MS2+-+Tenant+Management">MS2 - Tenant Management</a>

## Build instructions
### Dependencies
* The service depends on tables existing in Dynamo DB (local or cloud)
* Service depends on S3 bucket to push the projected client configuration files
* Service depends on PG database for tenant configurations
* To deploy dynamo DB locally, follow the aws docs. Or use the cloud tables with the proper access keys in the launch commands
* Running the aws-infrastructure project can help create the Dynamo DB tables and S3 bucket automatically in the cloud. psql script will have to be run manually

### DB configurations
* 1 table is required in Dynamo DB with Partition Key id(String). No sort key requiured for the table
* To create a new DB with base configurations, run the clear-psql.sh script. To run updates on existing DB, run the upgrade-psql.sh script. Make sure you update the parameters inside the scripts before running them
* To make changes to the psql db (modify tables, etc.), follow instructions in the upgrade-psql.sh script

### Local deployment
* Sort the dependencies and build/create any required tables in the respective databases
* Install any required node js dependencies by running command <code>npm install</code>. Use sudo permissions if required
* To run this code as proxy to actual lambda function, run the following commands <code>npm run remote</code>
* To run this code as proxy with local function, run the following commands
<code>ACCESSKEY=AKIAXXXXXXXXXXXXXXXX SECRETKEY=XXXXX npm run local</code>
* <b>Note:</b> In both cases, make sure the environment variables are updated to the correct values in package.json before running the commands
* To debug, use the vs code launch config and add the env vars there

### Prod deployment
* Write the deployment project to copy the lambda scripts to the appropriate production lambda function
* The deployment project needs to run the upgrade-psql.sh script with the appropriate credentials to keep the DB updated
* When deploying a new environment, the deployment script needs to run the clear-psql.sh script first with the appropriate credentials

## Disable cors on chrome
When accessing the api through proxy, you may run into cors issues. Follow steps below to overcome
* Run chrome with flag --disable-web-security
* Follow https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome for more info
* Command for windows: ```chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security```
* Command for mac: ```open -na Google\ Chrome --args --user-data-dir=/tmp/temporary-chrome-profile-dir --disable-web-security``` or ```open /Applications/Google\ Chrome.app --args --user-data-dir="/var/tmp/Chrome dev session" --disable-web-security``` 