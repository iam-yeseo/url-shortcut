import { LinkHub } from "./link-hub";
import { DEFAULT_SITE_SETTINGS } from "./types";

export default function Home() {
  return <LinkHub initialSettings={DEFAULT_SITE_SETTINGS} />;
}
