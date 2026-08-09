import { redirect } from "next/navigation";

import { DOUYIN_RANKINGS_PATH } from "@/lib/douyin";

export default function DouyinIndexPage() {
  redirect(DOUYIN_RANKINGS_PATH);
}
