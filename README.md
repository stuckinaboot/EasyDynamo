# Easy Dynamo DB

The idiot-proof way to interact with AWS DynamoDB from JS/TS

## Overview

Easy Dynamo was made so that you don't have to think about the AWS wrappers when
dealing with DynamoDB at all. All interactions will give you JSON
objects that look the way they did in your code when they were added to dynamo,
so you can move data back and forth to dynamo effortlessly.

## Getting Started

For simplicity, here's example code and example output so you can
building right away

#### Code

```
// Assume the keys to MyTable are
// Hash key: myHashKey of type string
// Range key: myRangeKey of type string
const tableName = "MyTable";

const dynamo = new EasyDynamo({
  accessKeyId: "Enter yours here",
  secretAccessKey: "Enter yours here",
  region: "Enter yours here",
  // Uncomment endpoint if you are testing with the local dynamodb server
  // endpoint: "http://localhost:8000",
});

(async () => {
  const keys = { myHashKey: "abc", myRangeKey: "def" };
  const myItem1 = {
    myHashKey: "abc",
    myRangeKey: "def",
    myNum: 1,
    myList: ["foo", "bar"],
    myNested: { nestedString: "abc", nestedNum: 2 },
  };
  await dynamo.put({ item: myItem1, tableName });
  console.log("After put myItem1", await dynamo.get({ keys, tableName }));

  const myItem2 = {
    myHashKey: "abc",
    myRangeKey: "woah",
    isFriend: true,
  };
  await dynamo.put({ item: myItem2, tableName });
  console.log(
    "Query after put of myItem2",
    await dynamo.query({
      keyName: "myHashKey",
      value: "abc",
      tableName,
    })
  );

  await dynamo.update({
    keys,
    propsToUpdate: { myNum: 3, poptartType: "Smores" },
    tableName,
  });
  console.log(
    "Get myItem1 after update",
    await dynamo.get({ keys, tableName })
  );
  await dynamo.incrementValue({ keys, attrNames: ["myNum"], tableName });
  console.log(
    "Get myItem1 after increment attribute",
    await dynamo.get({ keys, tableName })
  );

  await dynamo.incrementValue({
    keys,
    attrNames: ["myNested", "nestedNum"],
    tableName,
  });
  console.log(
    "Get myItem1 after increment nested attribute",
    await dynamo.get({ keys, tableName })
  );

  const gotItemAfterIncr = await dynamo.get({ keys, tableName });
  console.log("Get myItem1 after increment nested attribute", gotItemAfterIncr);
})();
```

#### Output

```
After put myItem1 {
  myHashKey: 'abc',
  myNum: 1,
  myNested: { nestedNum: 2, nestedString: 'abc' },
  myRangeKey: 'def',
  myList: [ 'bar', 'foo' ]
}
Query after put of myItem2 [
  {
    myHashKey: 'abc',
    myNum: 1,
    myNested: { nestedNum: 2, nestedString: 'abc' },
    myRangeKey: 'def',
    myList: [ 'bar', 'foo' ]
  },
  { myHashKey: 'abc', myRangeKey: 'woah', isFriend: true }
]
Get myItem1 after update {
  myHashKey: 'abc',
  myNested: { nestedNum: 2, nestedString: 'abc' },
  myNum: 3,
  myRangeKey: 'def',
  poptartType: 'Smores',
  myList: [ 'bar', 'foo' ]
}
Get myItem1 after increment attribute {
  myHashKey: 'abc',
  myNested: { nestedNum: 2, nestedString: 'abc' },
  myNum: 4,
  myRangeKey: 'def',
  poptartType: 'Smores',
  myList: [ 'bar', 'foo' ]
}
Get myItem1 after increment nested attribute {
  myHashKey: 'abc',
  myNested: { nestedNum: 3, nestedString: 'abc' },
  myNum: 4,
  myRangeKey: 'def',
  poptartType: 'Smores',
  myList: [ 'bar', 'foo' ]
}
Get myItem1 after increment nested attribute {
  myHashKey: 'abc',
  myNested: { nestedNum: 3, nestedString: 'abc' },
  myNum: 4,
  myRangeKey: 'def',
  poptartType: 'Smores',
  myList: [ 'bar', 'foo' ]
}
```

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
