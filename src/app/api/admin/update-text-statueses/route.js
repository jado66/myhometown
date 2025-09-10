// Create /api/admin/update-text-statuses/route.js

import { updateTextLogStatuses } from "@/util/communication/update-text-logs-statues";

export async function POST() {
  try {
    const result = await updateTextLogStatuses();
    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
