"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyDynamo = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var AWS_ERROR_ITEM_NOT_FOUND = "ResourceNotFoundException";
var ddb;
var EasyDynamo = /** @class */ (function () {
    // TODO add type
    function EasyDynamo(config) {
        aws_sdk_1.default.config.update(config);
        ddb = new aws_sdk_1.default.DynamoDB.DocumentClient();
    }
    EasyDynamo.prototype.get = function (keys, tableName, convertSetsToArrays) {
        var params = {
            TableName: tableName,
            Key: keys,
        };
        return new Promise(function (resolve, reject) {
            ddb.get(params, function (err, data) {
                if (err) {
                    if (err.code === AWS_ERROR_ITEM_NOT_FOUND) {
                        // Resolve null if item was not found
                        return resolve(null);
                    }
                    reject(err);
                }
                else {
                    var item_1 = data.Item;
                    if (item_1 == null) {
                        return resolve(null);
                    }
                    if (convertSetsToArrays) {
                        // Convert each set in res to an array
                        Object.keys(item_1).forEach(function (key) {
                            return item_1[key] != null && item_1[key].wrapperName === "Set"
                                ? (item_1[key] = item_1[key].values)
                                : null;
                        });
                    }
                    resolve(item_1);
                }
            });
        });
    };
    EasyDynamo.prototype.update = function (keys, objToInsert, tableName, convertArraysToSets) {
        // Remove table keys from object (as update does not accept these)
        Object.keys(keys).forEach(function (key) { return delete objToInsert[key]; });
        if (convertArraysToSets) {
            // Convert each array in item to be an AWS set
            Object.keys(objToInsert).forEach(function (key) {
                return Array.isArray(objToInsert[key])
                    ? objToInsert[key].length > 0
                        ? (objToInsert[key] = ddb.createSet(objToInsert[key]))
                        : // Make array null if empty as we can't store empty sets in dynamo
                            (objToInsert[key] = null)
                    : null;
            });
        }
        var expressionAttributeValues = {};
        var expressionAttributeNames = {};
        Object.entries(objToInsert).forEach(function (_a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            expressionAttributeValues[":" + k] = v;
            expressionAttributeNames["#" + k] = k;
        });
        var updateExpression = "set " +
            Object.keys(objToInsert)
                .map(function (objKey) { return "#" + objKey + "=:" + objKey; })
                .join(", ");
        var params = {
            TableName: tableName,
            Key: keys,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            UpdateExpression: updateExpression,
        };
        return new Promise(function (resolve, reject) {
            ddb.update(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    EasyDynamo.prototype.updateAddToSet = function (keys, setAttrName, itemsToInsert, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                params = {
                    TableName: tableName,
                    Key: keys,
                    ExpressionAttributeValues: { ":c": ddb.createSet(itemsToInsert) },
                    UpdateExpression: "ADD " + setAttrName + " :c",
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ddb.update(params, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EasyDynamo.prototype.updateDeleteFromSet = function (keys, setAttrName, itemsToRemove, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                params = {
                    TableName: tableName,
                    Key: keys,
                    ExpressionAttributeValues: { ":c": ddb.createSet(itemsToRemove) },
                    UpdateExpression: "DELETE " + setAttrName + " :c",
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ddb.update(params, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    /**
     * Increment value (handles nested objects)
     * @param keys keys to identify the entry
     * @param attrNames sequence of (possibly nested) attr names identifying val to increment
     * @param tableName table name
     */
    EasyDynamo.prototype.incrementValue = function (keys, attrNames, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateValueByOne(keys, attrNames, tableName, true)];
            });
        });
    };
    /**
     * Decrement value (handles nested objects)
     * @param keys keys to identify the entry
     * @param attrNames sequence of (possibly nested) attr names identifying val to decrement
     * @param tableName table name
     */
    EasyDynamo.prototype.decrementValue = function (keys, attrNames, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateValueByOne(keys, attrNames, tableName, false)];
            });
        });
    };
    EasyDynamo.prototype.updateValueByOne = function (keys, attrNames, tableName, shouldIncrement) {
        return __awaiter(this, void 0, void 0, function () {
            var i, expressionAttributeNames, absoluteNestedAttrName, params;
            return __generator(this, function (_a) {
                i = 0;
                expressionAttributeNames = {};
                attrNames.forEach(function (attrName) { return (expressionAttributeNames["#" + ++i] = attrName); });
                absoluteNestedAttrName = Object.keys(expressionAttributeNames).join(".");
                params = {
                    TableName: tableName,
                    Key: keys,
                    ExpressionAttributeValues: { ":c": shouldIncrement ? 1 : -1 },
                    ExpressionAttributeNames: expressionAttributeNames,
                    UpdateExpression: "ADD " + absoluteNestedAttrName + " :c",
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ddb.update(params, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EasyDynamo.prototype.put = function (item, tableName, convertArraysToSets) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                if (convertArraysToSets) {
                    // Convert each array in item to be an AWS set
                    Object.keys(item).forEach(function (key) {
                        return Array.isArray(item[key]) ? (item[key] = ddb.createSet(item[key])) : null;
                    });
                }
                params = {
                    TableName: tableName,
                    Item: item,
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ddb.put(params, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EasyDynamo.prototype.delete = function (keys, tableName) {
        var params = {
            TableName: tableName,
            Key: keys,
        };
        return new Promise(function (resolve, reject) {
            ddb.delete(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    EasyDynamo.prototype.scan = function (tableName) {
        return new Promise(function (resolve, reject) {
            ddb.scan({
                TableName: tableName,
            }, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Items);
                }
            });
        });
    };
    EasyDynamo.prototype.query = function (keyName, value, tableName, convertSetsToArrays, scanBackward) {
        var params = {
            TableName: tableName,
            KeyConditionExpression: "#key = :id",
            ExpressionAttributeNames: {
                "#key": keyName,
            },
            ExpressionAttributeValues: {
                ":id": value,
            },
        };
        if (scanBackward) {
            // Refers to ScanIndexForward, sometimes may want to scan
            // backward if sorting timestamp range key in descending
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
            params["ScanIndexForward"] = false;
        }
        return new Promise(function (resolve, reject) {
            ddb.query(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    var items = data.Items;
                    if (items == null) {
                        return resolve([]);
                    }
                    if (convertSetsToArrays) {
                        // Convert each set in res to an array
                        items.forEach(function (item) {
                            return Object.keys(item).forEach(function (key) {
                                return item[key] != null && item[key].wrapperName === "Set"
                                    ? (item[key] = item[key].values)
                                    : null;
                            });
                        });
                        return resolve(items);
                    }
                    resolve(data.Items);
                }
            });
        });
    };
    // Returns either an array or a number (if onlyCount is true)
    EasyDynamo.prototype.queryOnSecondaryIndex = function (indexName, keyName, value, tableName, 
    // Only get the count of the items
    onlyCount, rangeKey) {
        var params = __assign({ TableName: tableName, IndexName: indexName }, (rangeKey == null
            ? {
                KeyConditionExpression: "#key = :id",
                ExpressionAttributeValues: {
                    ":id": value,
                },
                ExpressionAttributeNames: {
                    "#key": keyName,
                },
            }
            : {
                KeyConditionExpression: "#key = :id and #rangeKey = :rangeKey",
                ExpressionAttributeValues: {
                    ":id": value,
                    ":rangeKey": rangeKey.rangeKeyValue,
                },
                ExpressionAttributeNames: {
                    "#key": keyName,
                    "#rangeKey": rangeKey.rangeKeyName,
                },
            }));
        if (onlyCount) {
            // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-Select
            params["Select"] = "COUNT";
        }
        return new Promise(function (resolve, reject) {
            ddb.query(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else if (onlyCount) {
                    resolve(data.Count);
                }
                else {
                    resolve(data.Items || []);
                }
            });
        });
    };
    EasyDynamo.prototype.clearTable = function (tableName, keysToKeep) {
        return __awaiter(this, void 0, void 0, function () {
            var elts, _a, _b, _i, i, data, j, key, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.scan(tableName)];
                    case 1:
                        elts = _c.sent();
                        _a = [];
                        for (_b in elts)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        i = _a[_i];
                        data = {};
                        for (j in keysToKeep) {
                            key = keysToKeep[j];
                            data[key] = elts[i][key];
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.delete(data, tableName)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        throw error_1;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return EasyDynamo;
}());
exports.EasyDynamo = EasyDynamo;
