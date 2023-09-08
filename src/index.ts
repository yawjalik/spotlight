import app from "./app.js";
import schedule from "node-schedule";
import redisClient from "./clients/redisClient.js";
import job from "./utils/job.js";
import { port } from "./config.js";

app.listen(port, async () => {
  console.log(`App listening at http://localhost:${port}`);

  const refresh_token = await redisClient.get("refresh_token");
  if (refresh_token) {
    console.log("Found refresh token in Redis, starting job");
    await job();
    schedule.scheduleJob("*/3 * * * *", job);
    console.log(schedule.scheduledJobs);
  }
});
