import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./src/db/index.js";

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongoDb connection error", err);
  });
