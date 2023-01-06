/*
    Function lists all tenants for nelson
    Note: tenant uid is generated in JS using base64 value of the date function
        btoa(new Date().getTime())
    
    parameters:
    optional - tenantids: Comma separated query string paramter containing list of tenant ids. If not specified, all tenants are loaded
    optional - environmentids: Comma separated environment id. Tenant ids is preferred if environment id is specified
*/

const { DynamoDB, ReturnConsumedCapacity } = require("@aws-sdk/client-dynamodb");
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
    const { tenantids, environmentids } = event.queryStringParameters || '';
    var response = {};
    var tenants = [];
    try {
        if (!tenantids || tenantids == '') {
            var dynamoResponse = await dynamoClient.scan({
                TableName: process.env.TENANT_TABLE,
                ReturnConsumedCapacity: "INDEXES"
            });
            dynamoResponse.Items.forEach(function (item) {
                tenants.push(unmarshall(item));
            });
            response = {
                consumedcapacityUnits: dynamoResponse.ConsumedCapacity.CapacityUnits,
            };
        }
        else {
            var dynamoProps = {
                RequestItems: {
                    [process.env.TENANT_TABLE]: {},
                },
                ReturnConsumedCapacity: ReturnConsumedCapacity.INDEXES
            }
            var ids = [];
            tenantids.split(',').forEach(tenantid => {
                ids.push(marshall({
                    id: tenantid
                }));
            });
            dynamoProps.RequestItems[process.env.TENANT_TABLE].Keys = ids;
            var dynamoResponse = await dynamoClient.batchGetItem(dynamoProps);
            dynamoResponse.Responses[process.env.TENANT_TABLE].forEach(function (item) {
                tenants.push(unmarshall(item));
            });
            response = {
                consumedcapacityUnits: dynamoResponse.ConsumedCapacity.CapacityUnits
            };
        }
        if (environmentids && environmentids != '') {
            var filteredTenants = [];
            tenants.forEach(tenant => {
                var newTenant = {
                    id: tenant.id,
                    tenantname: tenant.tenantname,
                    environments: tenant.environments.filter(environment => environmentids.indexOf(environment.id) > -1)
                };
                if (newTenant.environments && newTenant.environments.length > 0) {
                    filteredTenants.push(newTenant);
                }
            });
            tenants = filteredTenants;
        }
        response.tenants = tenants;
    }
    catch (err) {
        console.log(err);
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