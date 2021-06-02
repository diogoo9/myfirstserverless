"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const https_1 = __importDefault(require("https"));
exports.lambdaHandler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    let data = '';
    let last = yield getBitCOinValue();
    let requestID = context.awsRequestId;
    let currentDate = String(new Date().toLocaleString('pt-BR'));
    const params = {
        TableName: 'bitcoin_values',
        Item: {
            id: requestID,
            "value": last,
            "created_at": currentDate
        }
    };
    yield insertValue(params);
    function getBitCOinValue() {
        return new Promise((resolve, reject) => {
            https_1.default.get("https://www.mercadobitcoin.net/api/BTC/ticker/", (res) => {
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
            });
        });
    }
    function insertValue(params) {
        return __awaiter(this, void 0, void 0, function* () {
            aws_sdk_1.default.config.update({ region: 'sa-east-1' });
            let docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
            try {
                yield docClient.put(params).promise();
                response = {
                    'statusCode': 200,
                    'body': JSON.stringify({
                        message: 'object successfully registered',
                        item: params.Item
                    })
                };
                return response;
            }
            catch (error) {
                response = {
                    'statusCode': 403,
                    'body': JSON.stringify({
                        error
                    })
                };
                return response;
            }
        });
    }
});
