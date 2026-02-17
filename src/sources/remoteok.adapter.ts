import axios from "axios";
import { RawJobSource } from "./source.interface";

export class RemoteOKAdapter implements RawJobSource {
  name = "remoteok";

  async fetchRawJobs(): Promise<any[]> {
    const response = await axios.get("https://remoteok.com/api");

    const data = response.data;

    return data.slice(1); // quitar metadata
  }
}
