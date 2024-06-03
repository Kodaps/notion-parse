const NotionParse = require("../lib");

const go = async () => {
  await NotionParse.parseNotion(
    "YOUR_SECRET",
    "./tests/content",
    [
      {
        databaseId: "YOUR_DATABASE_ID",
        contentType: "posts",
        filterFields: ["Authors", "people"],
      },
    ],
    true
  );
};

go().then(() => {
  console.log("Done");
});
