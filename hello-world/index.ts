import AWS from "aws-sdk";
import https from "https";

export const lambdaHandler = async (event: any, context: any) => {
    let response;
    let data = '';

    let last = await getBitCOinValue();
    let requestID = context.awsRequestId;
    let currentDate = String(new Date().toLocaleString('pt-BR'));
    const params = {
        TableName: 'bitcoin_values',
        Item: {
            id: requestID,
            "value": last,
            "created_at": currentDate
        }
    }
    await insertValue(params);




    function getBitCOinValue() {
        return new Promise((resolve, reject) => {
            https.get("https://www.mercadobitcoin.net/api/BTC/ticker/", (res) => {
                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    let temp = JSON.parse(data);
                    resolve(temp.ticker.last);
                });

                res.on('error', (err) => {
                    reject(err);
                });
            })
        })
    }

    async function insertValue(params: any) {
        AWS.config.update({ region: 'sa-east-1' });

        let docClient = new AWS.DynamoDB.DocumentClient();

        try {
            await docClient.put(params).promise();
            response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: 'object successfully registered',
                    item: params.Item
                })
            }
            return response;
        } catch (error) {
            response = {
                'statusCode': 403,
                'body': JSON.stringify({
                    error
                })
            }
            return response;
        }
    }

};