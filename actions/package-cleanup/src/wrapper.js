const github = require("@actions/github");

class OctokitWrapper {

  constructor(authToken) {
    this.octokit = github.getOctokit(authToken);
  }

  async getUser(username) {
    try {
      const response = await this.octokit.rest.users.getByUsername({ username });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      throw error;
    }
  }

  // This method is used to list packages for a Organization type in the GitHub repository.
  async listPackagesForOrganization(org, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForOrganization({ org, package_type, });
    } catch (error) {
      console.error(`Error fetching packages for organization ${org}:`, error);
      throw error;
    }
  }

  // List packages for a user
  // This method is used to list packages for a User type in the GitHub repository.
  async listPackagesForUser(username, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForUser({ username, package_type });
      return response.data;
    } catch (error) {
      console.error(`Error fetching packages for user ${username}:`, error);
      throw error;
    }
  }



}