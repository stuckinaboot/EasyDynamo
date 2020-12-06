const { EasyDynamo } = require("../dist/index");

const dynamo = new EasyDynamo({
  accessKeyId: "Enter yours here",
  secretAccessKey: "Enter yours here",
});

(async () => {
  const myItem = {
    myString: "abc",
    myNum: 1,
    myList: ["foo", "bar"],
    myNested: { nestedString: "abc", nestedNum: 2 },
  };
  await dynamo.put({});
})();
