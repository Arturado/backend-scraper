import axios from "axios";

export class GetOnBoardAdapter {
  private categories = [
    "programming",
    "data-science-analytics",
    "sysadmin-devops-qa",
    "machine-learning-ai",
    "design-ux",
    "mobile-developer",
    "digital-marketing"
  ];

  async fetchRawJobs() {
    let allJobs: any[] = [];

    for (const category of this.categories) {
      const response = await axios.get(
        `https://www.getonbrd.com/api/v0/categories/${category}/jobs`,
        {
            params: {
            per_page: 20,
            page: 1,
            expand: '["company"]'
            }
        }
        );

      const jobs = response.data.data;

      allJobs.push(...jobs);
    }

    return allJobs;
  }
}
