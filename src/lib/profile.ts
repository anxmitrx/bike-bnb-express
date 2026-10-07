import { supabase } from "@/integrations/supabase/client";
import bike1 from "@/assets/bike1.jpg";
import bike2 from "@/assets/bike2.jpg";

export async function fetchMyProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  if (error) throw error;
  return data;
}

const imgs = [bike1, bike2];
export function bikeImage(id: string) {
  let h = 0;
  for (const c of id) h = (h + c.charCodeAt(0)) % imgs.length;
  return imgs[h];
}

export const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
