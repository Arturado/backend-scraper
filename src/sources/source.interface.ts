export interface RawJobSource {
  name: string;
  fetchRawJobs(): Promise<any[]>;
}
