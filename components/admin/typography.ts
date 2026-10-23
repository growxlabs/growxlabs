import { Geist } from "next/font/google";

// One font instance for the admin shell and its portaled navigation.
export const adminGeist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-admin-geist",
  display: "swap",
});
