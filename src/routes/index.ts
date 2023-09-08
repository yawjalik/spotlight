import express from "express";
import { client_id, client_secret, redirect_uri } from "../config.js";
import schedule from "node-schedule";
import redisClient from "../clients/redisClient.js";
import generateRandomString from "../utils/generateRandomString.js";
import job from "../utils/job.js";

const router = express.Router();

router.get("/_healthcheck", async (req, res) => {
  const refresh_token = await redisClient.get("refresh-token"); // FIXME
  res.status(200).send(`OK, ${refresh_token ? "logged in" : "not logged in"}`);
});

router.get("/login", async (req, res) => {
  console.log("Running login"); // TODO: replace with logger

  const scope =
    "user-read-private user-read-email user-top-read user-read-currently-playing";

  const state = generateRandomString(16);
  await redisClient.setEx(state, 60 * 5, "valid");

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`,
  );
});

router.get("/callback", async (req, res) => {
  console.log("Running callback");

  const { code, state } = req.query;

  if (!state) return res.status(400).send("Missing state");

  const saved_state = await redisClient.get(state as string);
  if (saved_state === null) return res.status(400).send("Invalid state");

  // Get access token
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`,
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.status !== 200) {
    console.error("Error getting access token, status code: ", response.status);
    return res.send(
      "Error getting access token, status code: " + response.status,
    );
  }

  const data: { access_token: string; refresh_token: string } =
    await response.json();

  const { access_token, refresh_token } = data;

  // Store access token in Redis with 30 minute expiry
  await redisClient.setEx(`access_token`, 1800, access_token);

  // Store refresh token in Redis
  await redisClient.set(`refresh_token`, refresh_token);

  // Every 3 minutes, refresh access token and run job
  await schedule.gracefulShutdown(); // Shutdown all previous jobs
  await job(); // Run job immediately
  schedule.scheduleJob("*/3 * * * *", job);

  return res.send("Logged in to Spotify");
});

router.post("/run-job", async (req, res) => {
  await job();
  return res.send("Done");
});

export default router;
