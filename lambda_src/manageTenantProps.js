/*
    Method updates or retrieves the tenant/environment properties based on the HTTP method
*/
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Props = { region: process.env.ENV_REGION };
if (process.env.LOCAL) {
    s3Props.credentials = {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETKEY
    };
}
const s3Client = new S3Client(s3Props);

exports.handler = async (event) => {
    const { environmentname, tenantname } = event.pathParameters;
    var response = {};
    if (environmentname == null || tenantname == null) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing parameters"
            })
        };
    }

    if (event.httpMethod == 'GET') {
        try {
            //Get the tenant property from S3
            const getObjectCmd = new GetObjectCommand({
                Bucket: process.env.TENANT_PROPS_BUCKET,
                Key: `${tenantname}/${environmentname}/config.json`
            });
            const s3Response = await s3Client.send(getObjectCmd);
            const data = await s3Response.Body.transformToString();
            response = JSON.parse(data);
        }
        catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: err.message
                })
            };
        }
    }
    else if (event.httpMethod == 'POST') {
        try {
            if(event.body == null) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: "Missing body"
                    })
                }; 
            }
            //Update the tenant property to S3
            var buf = Buffer.from(event.body);
            const putObjectCmd = new PutObjectCommand({
                Bucket: process.env.TENANT_PROPS_BUCKET,
                Key: `${tenantname}/${environmentname}/config.json`,
                ContentType: 'application/json',
                Body: buf
            });
            await s3Client.send(putObjectCmd);
            response.message = "Config updated successfully";
        }
        catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: err.message
                })
            };
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
};