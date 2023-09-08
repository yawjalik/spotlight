import { Octokit } from "octokit";
import { github_access_token } from "../config.js";

const octokitClient = new Octokit({
  auth: github_access_token,
});

export default octokitClient;
