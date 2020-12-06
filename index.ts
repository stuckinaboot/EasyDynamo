import AWS from "aws-sdk";
import {
  EasyDynamoClearTableParams,
  EasyDynamoConfig,
  EasyDynamoDecrementValueParams,
  EasyDynamoDefaultResponse,
  EasyDynamoDeleteFromSetParams,
  EasyDynamoDeleteParams,
  EasyDynamoGetParams,
  EasyDynamoGetResponse,
  EasyDynamoIncrementValueParams,
  EasyDynamoPutParams,
  EasyDynamoQueryOnSecondaryIndexParams,
  EasyDynamoQueryOnSecondaryIndexResponse,
  EasyDynamoQueryParams,
  EasyDynamoQueryResponse,
  EasyDynamoScanParams,
  EasyDynamoScanResponse,
  EasyDynamoUpdateAddToSetParams,
  EasyDynamoUpdateParams,
} from "./typings";

const AWS_ERROR_ITEM_NOT_FOUND = "ResourceNotFoundException";

let ddb: AWS.DynamoDB.DocumentClient;

export class EasyDynamo {
  constructor(config: EasyDynamoConfig) {
    AWS.config.update(config);
    ddb = new AWS.DynamoDB.DocumentClient();
  }

  get({
    keys,
    tableName,
    convertSetsToArrays,
  }: EasyDynamoGetParams): Promise<EasyDynamoGetResponse> {
    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: keys,
    };

    return new Promise((resolve, reject) => {
      ddb.get(params, (err, data) => {
        if (err) {
          if (err.code === AWS_ERROR_ITEM_NOT_FOUND) {
            // Resolve null if item was not found
            return resolve(null);
          }

          reject(err);
          return;
        }
        const item = data.Item;
        if (item == null) {
          return resolve(null);
        }
        if (convertSetsToArrays) {
          // Convert each set in res to an array
          Object.keys(item).forEach((key) =>
            item[key] != null && item[key].wrapperName === "Set"
              ? (item[key] = item[key].values)
              : null
          );
        }
        resolve(item);
      });
    });
  }

  update({
    keys,
    propsToUpdate,
    tableName,
    convertArraysToSets,
  }: EasyDynamoUpdateParams): Promise<EasyDynamoDefaultResponse> {
    // Remove table keys from object (as update does not accept these)
    Object.keys(keys).forEach((key) => delete propsToUpdate[key]);

    if (convertArraysToSets) {
      // Convert each array in item to be an AWS set
      Object.keys(propsToUpdate).forEach((key) =>
        Array.isArray(propsToUpdate[key])
          ? propsToUpdate[key].length > 0
            ? (propsToUpdate[key] = ddb.createSet(propsToUpdate[key]))
            : // Make array null if empty as we can't store empty sets in dynamo
              (propsToUpdate[key] = null)
          : null
      );
    }

    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    Object.entries(propsToUpdate).forEach(([k, v]) => {
      expressionAttributeValues[`:${k}`] = v;
      expressionAttributeNames[`#${k}`] = k;
    });

    const updateExpression =
      "set " +
      Object.keys(propsToUpdate)
        .map((objKey) => `#${objKey}=:${objKey}`)
        .join(", ");

    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: keys,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      UpdateExpression: updateExpression,
    };

    return new Promise((resolve, reject) => {
      ddb.update(params, (err, _data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async updateAddToSet({
    keys,
    setAttrName,
    itemsToInsert,
    tableName,
  }: EasyDynamoUpdateAddToSetParams): Promise<EasyDynamoDefaultResponse> {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: keys,
      ExpressionAttributeValues: { ":c": ddb.createSet(itemsToInsert) },
      UpdateExpression: `ADD ${setAttrName} :c`,
    };

    return new Promise((resolve, reject) => {
      ddb.update(params, function (err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async updateDeleteFromSet({
    keys,
    setAttrName,
    itemsToRemove,
    tableName,
  }: EasyDynamoDeleteFromSetParams): Promise<EasyDynamoDefaultResponse> {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: keys,
      ExpressionAttributeValues: { ":c": ddb.createSet(itemsToRemove) },
      UpdateExpression: `DELETE ${setAttrName} :c`,
    };

    return new Promise((resolve, reject) => {
      ddb.update(params, (err, _data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async incrementValue({
    keys,
    attrNames,
    tableName,
  }: EasyDynamoIncrementValueParams): Promise<EasyDynamoDefaultResponse> {
    return this.updateValueByOne(keys, attrNames, tableName, true);
  }

  async decrementValue({
    keys,
    attrNames,
    tableName,
  }: EasyDynamoDecrementValueParams): Promise<EasyDynamoDefaultResponse> {
    return this.updateValueByOne(keys, attrNames, tableName, false);
  }

  private async updateValueByOne(
    keys: any,
    attrNames: string[],
    tableName: string,
    shouldIncrement: boolean
  ): Promise<EasyDynamoDefaultResponse> {
    // Use numbers as attribute name variables since
    let i = 0;
    const expressionAttributeNames = {};
    attrNames.forEach(
      (attrName) => (expressionAttributeNames[`#${++i}`] = attrName)
    );

    // Create the nested attribute name from the list of attr names
    // Ex. ["a", "b"] for {"a": {"b": 1}} would be represented
    // as #1.#2, where #1 = "a" and #2 = "b" as defined in expressionAttributeNames
    const absoluteNestedAttrName = Object.keys(expressionAttributeNames).join(
      "."
    );
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: keys,
      ExpressionAttributeValues: { ":c": shouldIncrement ? 1 : -1 },
      ExpressionAttributeNames: expressionAttributeNames,
      UpdateExpression: `ADD ${absoluteNestedAttrName} :c`,
    };

    return new Promise((resolve, reject) => {
      ddb.update(params, (err, _data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async put({
    item,
    tableName,
    convertArraysToSets,
  }: EasyDynamoPutParams): Promise<EasyDynamoDefaultResponse> {
    if (convertArraysToSets) {
      // Convert each array in item to be an AWS set
      Object.keys(item).forEach((key) =>
        Array.isArray(item[key]) ? (item[key] = ddb.createSet(item[key])) : null
      );
    }

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: item,
    };

    return new Promise((resolve, reject) => {
      ddb.put(params, (err, _data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  delete({
    keys,
    tableName,
  }: EasyDynamoDeleteParams): Promise<EasyDynamoDefaultResponse> {
    const params = {
      TableName: tableName,
      Key: keys,
    };

    return new Promise((resolve, reject) => {
      ddb.delete(params, (err, _data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  scan({ tableName }: EasyDynamoScanParams): Promise<EasyDynamoScanResponse> {
    return new Promise((resolve, reject) => {
      ddb.scan({ TableName: tableName }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.Items);
      });
    });
  }

  query({
    keyName,
    value,
    tableName,
    convertSetsToArrays,
    scanBackward,
  }: EasyDynamoQueryParams): Promise<EasyDynamoQueryResponse> {
    const params = {
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

    return new Promise((resolve, reject) => {
      ddb.query(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        const items = data.Items;
        if (items == null) {
          return resolve([]);
        }
        if (convertSetsToArrays) {
          // Convert each set in res to an array
          items.forEach((item) =>
            Object.keys(item).forEach((key) =>
              item[key] != null && item[key].wrapperName === "Set"
                ? (item[key] = item[key].values)
                : null
            )
          );
          return resolve(items);
        }

        resolve(data.Items);
      });
    });
  }

  // Returns either an array or a number (if onlyCount is true)
  queryOnSecondaryIndex({
    indexName,
    keyName,
    value,
    tableName,
    onlyCount,
    rangeKey,
  }: EasyDynamoQueryOnSecondaryIndexParams): Promise<EasyDynamoQueryOnSecondaryIndexResponse> {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      ...(rangeKey == null
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
          }),
    };
    if (onlyCount) {
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-Select
      params["Select"] = "COUNT";
    }
    return new Promise((resolve, reject) => {
      ddb.query(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        if (onlyCount) {
          resolve(data.Count);
          return;
        }
        resolve(data.Items || []);
      });
    });
  }

  async clearTable({
    tableName,
    keyNames,
  }: EasyDynamoClearTableParams): Promise<EasyDynamoDefaultResponse> {
    const elts: any = await this.scan({ tableName });
    for (const i in elts) {
      const data = {};
      for (const j in keyNames) {
        const key = keyNames[j];
        data[key] = elts[i][key];
      }
      await this.delete({ keys: data, tableName });
    }
  }
}
