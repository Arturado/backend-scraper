import axios from "axios";
import { RawJobSource } from "./source.interface";

export class ArbeitnowAdapter implements RawJobSource {
  name = "arbeitnow";

  async fetchRawJobs(): Promise<any[]> {
    const response = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api"
    );

    return response.data.data;
  }
}
