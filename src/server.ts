import app from "./app";
import "dotenv/config";
import { startEtlInterval } from "./services/etl.service";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start the background ETL job (running every 1 minute for testing)
  startEtlInterval(60000);
});
