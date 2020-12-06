# Easy Dynamo DB

The idiot-proof way to interact with AWS DynamoDB from JS/TS

## Overview

Easy Dynamo was made so that you don't have to think about the AWS wrappers when
dealing with DynamoDB at all. All interactions will give you JSON
objects that look the way they did in your code when they were added to dynamo,
so you can move data back and forth to dynamo effortlessly.

## Getting Started

## Quick pointers

- Look at the example, it should make everything obvious
- All functions are async
- For write operations (`put, update, updateAddToSet, incrementValue, etc.`), the return type is promise resolving to void unless an error occurs, in which case
  the promise will reject with that error
- For read operations (`get, query, scan, queryOnSecondaryIndex, etc.`), the return type is promise resolving to the item
  (or null if item is not found), a list of items, a count of the items (if `onlyCount` is true) unless an error occurs, in which case the promise will reject with that error

## Functions

```
put: Add an item to a dynamo table
get: Get an item from a dynamo table
delete: Delete an item from a dynamo table
update: Update an item in a dynamo table (adding the item if it does not yet exist)
query: Query a dynamo table
queryOnSecondaryIndex: Query a dynamo table on its secondary index
scan: Scan a dynamo table
clearTable: Clear a dynamo table
updateAddToSet: Add element to a set in a dynamo table
updateDeleteFromSet: Delete element from a set in a dynamo table
incrementValue: Increment the value of a particular attribute of a particular entry
decrementValue: Decrement the value of a particular attribute of a particular entry.
```
