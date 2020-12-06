const { EasyDynamo } = require("../dist/index");

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
