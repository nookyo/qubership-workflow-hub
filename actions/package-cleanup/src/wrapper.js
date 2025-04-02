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


  async listPackages(owner, package_type, type) {
    return type ? this.listPackagesForUser(owner, package_type) : this.listPackagesForOrganization(owner, package_type);
  }

  async listVersionsForPackage(owner, package_type, package_name, type) {
    return type ? this.listPackageVersionsForUser(owner, package_type, package_name) : this.listPackageVersionsForOrganization(owner, package_type, package_name);
  }


  async listPackagesForOrganization(org, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForOrganization({ org, package_type, });
    } catch (error) {
      console.error(`Error fetching packages for organization ${org}:`, error);
      throw error;
    }
  }

  async listPackagesForUser(username, package_type) {
    try {
      const response = await this.octokit.rest.packages.listPackagesForUser({ username, package_type });
      return response.data;
    } catch (error) {
      console.error(`Error fetching packages for user ${username}:`, error);
      throw error;
    }
  }



  async getPackageVersionsForUser(owner, package_type, package_name) {
    try {
      const response = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
        package_type,
        package_name,
        username: owner,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching package versions for ${owner}/${package_name}:`, error);
      throw error;
    }
  }


  async getPackageVersionsForOrganization(org, package_type, package_name) {
    try {
      const response = await this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({
        package_type,
        package_name,
        org,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching package versions for ${org}/${package_name}:`, error);
      throw error;
    }
  }

  async listPackagesForRepository(owner, repo) {
    try {
      const response = await octokit.rest.packages.listPackagesForRepository({
        owner,
        repo,
        package_type: 'container'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  async getContainerPackages(owner, repo) {
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/packages', {
        owner,
        repo,
        package_type: 'container',
        headers: {
          accept: 'application/vnd.github.package-deletes-preview+json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


}

module.exports = OctokitWrapper;