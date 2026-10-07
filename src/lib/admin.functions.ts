import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdmin } from "./admin.server";

const creds = z.object({ id: z.string().max(50), pass: z.string().max(50) });

export const adminListBikes = createServerFn({ method: "POST" })
  .inputValidator((d) => creds.parse(d))
  .handler(async ({ data }) => {
    assertAdmin(data.id, data.pass);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: bikes, error } = await supabaseAdmin
      .from("bikes")
      .select("id, model, owner_name, price_per_day, location, status, created_at, bookings(start_date, days, profiles(full_name, phone))")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return bikes;
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    creds.extend({ bikeId: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.id, data.pass);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bikes").update({ status: data.status }).eq("id", data.bikeId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
