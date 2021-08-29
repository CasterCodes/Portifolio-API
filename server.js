import app from "./app.js";
process.on("unhandledRejection", function (error) {
  console.log("UNHANDLED REJECTION...Shutting down");
  console.log("ErrorName", error.name);
  console.log("ErrorMessage", error.message);
  process.exit();
});

const PORT = process.env.PORT;

import connection from "./config/Database.js";

// Database connection
connection();
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

process.on("unhandledRejection", function (error) {
  console.log("unhandledRejection");
  console.log("ErrorName", error.name);
  console.log("ErrorMessage", error.message);
  server.close(() => process.exit(1));
});
