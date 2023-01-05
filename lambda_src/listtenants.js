/*
    Function lists all tenants for nelson
*/

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamoProps = { region: process.env.ENV_REGION }
if (process.env.LOCAL) {
    dynamoProps.credentials = {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETKEY
    };
}
const dynamoClient = new DynamoDB(dynamoProps);

exports.handler = async () => {
    try {
        var dynamoResponse = await dynamoClient.scan({
            TableName: process.env.TENANT_TABLE,
            ReturnConsumedCapacity: "INDEXES"
        });
        var unmarshalledData = [];
        dynamoResponse.Items.forEach(function (item) {
            unmarshalledData.push(unmarshall(item));
        });
        return {
            statusCode: 200,
            body: JSON.stringify({
                tenants: unmarshalledData,
                consumedcapacityUnits: dynamoResponse.ConsumedCapacity.CapacityUnits,
            })
        };
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