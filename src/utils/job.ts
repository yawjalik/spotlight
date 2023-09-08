import { client_id, client_secret } from "../config.js";
import redisClient from "../clients/redisClient.js";
import octokitClient from "../clients/octokitClient.js";

export default async function job() {
  console.log("Running job");

  // Get access token
  let access_token = await redisClient.get("access_token");
  if (access_token === null) {
    // Refresh token
    const refresh_token = await redisClient.get("refresh_token");
    if (refresh_token === null) {
      console.error("No refresh token found");
      return;
    }

    const refreshTokenRes = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`,
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (refreshTokenRes.status !== 200) {
      console.error(
        "Error refreshing access token, status code: ",
        refreshTokenRes.status,
      );
      return;
    }

    const refreshTokenData: { access_token: string } =
      await refreshTokenRes.json();
    access_token = refreshTokenData.access_token;

    // Store access token in Redis with 30 minute expiry
    await redisClient.setEx(`access_token`, 1800, access_token);
  }

  // Get current song
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    },
  );

  const now = new Date();
  const lastUpdated = `last updated on ${now.getDate()} ${
    now.toLocaleString("default", { month: "short" }) // TODO: replace with moment.js
  } ${now.getFullYear()} at ${now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })}`;

  if (response.status === 204) {
    await octokitClient.request("PATCH /user", {
      bio: `🎵 Currently listening to nothing on Spotify. 😢 (${lastUpdated})`,
    });
    return console.log("Updated bio!");
  }

  if (response.status !== 200) {
    console.error("Error getting current song, status code: ", response.status);
    return;
  }

  const data = await response.json();
  const { is_playing, item } = data;
  const { name, artists } = item;

  const bio = is_playing
    ? `🎵 Currently listening to ${name} by ${artists[0].name} on Spotify (${lastUpdated})`
    : `🎵 Currently listening to nothing on Spotify. 😢 (${lastUpdated})`;

  await octokitClient.request("PATCH /user", {
    bio,
  });

  console.log("Updated bio!");
}
