/*
    Function lists all tenants for nelson
    Note: tenant uid is generated in JS using base64 value of the date function
        btoa(new Date().getTime())
    
    parameters:
    optional - tenantids: Comma separated query string paramter containing list of tenant ids. If not specified, all tenants are loaded
*/

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");

const dynamoProps = { region: process.env.ENV_REGION }
if (process.env.LOCAL) {
    dynamoProps.credentials = {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETKEY
    };
}
const dynamoClient = new DynamoDB(dynamoProps);

exports.handler = async (event) => {
    const { tenantids } = event.queryStringParameters || '';
    var response = {};
    try {
        if (!tenantids || tenantids == '') {
            var dynamoResponse = await dynamoClient.scan({
                TableName: process.env.TENANT_TABLE,
                ReturnConsumedCapacity: "INDEXES"
            });
            var unmarshalledData = [];
            dynamoResponse.Items.forEach(function (item) {
                unmarshalledData.push(unmarshall(item));
            });
            response = {
                tenants: unmarshalledData,
                consumedcapacityUnits: dynamoResponse.ConsumedCapacity.CapacityUnits,
            };
        }
        else {
            var ids = [];
            tenantids.split(',').forEach(tenantid => {
                ids.push(marshall({
                    id: tenantid
                }));
            });
            var dynamoResponse = await dynamoClient.batchGetItem({
                RequestItems: {
                    [process.env.TENANT_TABLE]: {
                        Keys: ids
                    },
                },
                ReturnConsumedCapacity: "INDEXES"
            });
            var unmarshalledData = [];
            dynamoResponse.Responses[process.env.TENANT_TABLE].forEach(function (item) {
                unmarshalledData.push(unmarshall(item));
            });
            response = {
                tenants: unmarshalledData,
                consumedcapacityUnits: dynamoResponse.ConsumedCapacity.CapacityUnits
            }
        }
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
}