const { EasyDynamo } = require("../dist/index");

// Assume the keys to MyTable are
// Hash key: myHashKey of type string
// Range key: myRangeKey of type string
const tableName = "MyTable";

const dynamo = new EasyDynamo({
  accessKeyId: "Enter yours here",
  secretAccessKey: "Enter yours here",
});

(async () => {
  const keys = { myHashKey: "abc", myRangeKey: "def" };
  const myItem = {
    myHashKey: "abc",
    myRangeKey: "def",
    myNum: 1,
    myList: ["foo", "bar"],
    myNested: { nestedString: "abc", nestedNum: 2 },
  };
  await dynamo.put({ item: myItem, tableName });

  const gotItem = await dynamo.get({ keys, tableName });
  console.log(gotItem);

  const queriedItems = await dynamo.query({
    keyName: "myHashKey",
    value: "abc",
    tableName,
  });
  console.log(queriedItems);

  await dynamo.update({
    keys,
    propsToUpdate: { myNum: 3, poptartType: "Smores" },
    tableName,
  });
  await dynamo.incrementValue({ keys, attrNames: ["myNum"], tableName });
  await dynamo.incrementValue({
    keys,
    attrNames: ["myNested", "nestedNum"],
    tableName,
  });
  const gotItemAfterIncr = await dynamo.get({ keys, tableName });
  console.log(gotItemAfterIncr);
})();
