import AWS from "aws-sdk";

/**
 * Types
 */

/**
 * General
 */
export type EasyDynamoKeyValue = string | number;
export type EasyDynamoKeys = { [keyName: string]: EasyDynamoKeyValue };

/**
 * Function parameters
 */
export type EasyDynamoConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  // Include endpoint if you are testing locally with local dynamodb,
  // e.g. "endpoint": "http://localhost:8000",
  endpoint?: string;
};

export type EasyDynamoGetParams = {
  keys: EasyDynamoKeys;
  tableName: string;
};

export type EasyDynamoUpdateParams = {
  keys: EasyDynamoKeys;
  propsToUpdate: any;
  tableName: string;
};

export type EasyDynamoUpdateAddToSetParams = {
  keys: EasyDynamoKeys;
  setAttrName: string;
  itemsToInsert: any[];
  tableName: string;
};

export type EasyDynamoDeleteFromSetParams = {
  keys: EasyDynamoKeys;
  setAttrName: string;
  itemsToRemove: any[];
  tableName: string;
};

export type EasyDynamoIncrementValueParams = {
  // keys to identify the entry
  keys: EasyDynamoKeys;
  // sequence of (possibly nested) attribute names identifying value to increment
  attrNames: string[];
  // table name
  tableName: string;
};

export type EasyDynamoDecrementValueParams = {
  // keys to identify the entry
  keys: EasyDynamoKeys;
  // sequence of (possibly nested) attribute names identifying value to decrement
  attrNames: string[];
  // table name
  tableName: string;
};

export type EasyDynamoPutParams = {
  item: EasyDynamoKeys & any;
  tableName: string;
};

export type EasyDynamoDeleteParams = {
  keys: EasyDynamoKeys;
  tableName: string;
};

export type EasyDynamoScanParams = {
  tableName: string;
};

export type EasyDynamoQueryParams = {
  keyName: string;
  value: EasyDynamoKeyValue;
  tableName: string;
  scanBackward?: boolean;
};

export type EasyDynamoQueryOnSecondaryIndexParams = {
  indexName: string;
  keyName: string;
  value: EasyDynamoKeyValue;
  tableName: string;
  rangeKey?: { rangeKeyName: string; rangeKeyValue: EasyDynamoKeyValue };
  // Only get the count of the items
  onlyCount?: boolean;
};

export type EasyDynamoClearTableParams = {
  keyNames: string[];
  tableName: string;
};

/**
 * Responses
 */

export type EasyDynamoGetResponse = (any | null) | AWS.AWSError;
export type EasyDynamoQueryResponse = any[] | AWS.AWSError;
// List of items or a single number (if only returning the count)
export type EasyDynamoQueryOnSecondaryIndexResponse =
  | (any[] | number)
  | AWS.AWSError;
export type EasyDynamoScanResponse = any[] | AWS.AWSError;

export type EasyDynamoDefaultResponse = void | AWS.AWSError;
