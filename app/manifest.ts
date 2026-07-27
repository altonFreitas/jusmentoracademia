import type { MetadataRoute } from "next";
import { defaultSettings } from "@/lib/defaults";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: defaultSettings.name,
    short_name: defaultSettings.shortName,
    description: defaultSettings.heroDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#0e1a33",
    icons: [
      { src: "/icon.png", sizes: "500x500", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "500x500", type: "image/png", purpose: "maskable" },
    ],
  };
}
