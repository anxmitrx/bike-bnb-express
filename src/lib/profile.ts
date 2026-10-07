import { supabase } from "@/integrations/supabase/client";

export async function fetchMyProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export const bikeImages = [
  () => import("@/assets/bike1.jpg"),
  () => import("@/assets/bike2.jpg"),
];
