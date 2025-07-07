import { supabase } from "../supabase";

export interface Missionary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  city_id?: string;
  community_id?: string;
  assignment_status: "active" | "inactive" | "unassigned";
  contact_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface MissionarySession {
  id: string;
  missionary_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

export class MissionaryAuth {
  static async sendLoginEmail(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if missionary exists
      const { data: missionary, error } = await supabase
        .from("missionaries")
        .select("*")
        .eq("email", email)
        .eq("assignment_status", "active")
        .single();

      if (error || !missionary) {
        return { success: false, message: "Missionary not found or inactive" };
      }

      // Generate a secure token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store session token
      const { error: sessionError } = await supabase
        .from("missionary_sessions")
        .insert({
          missionary_id: missionary.id,
          session_token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return { success: false, message: "Failed to create session" };
      }

      // In a real app, you would send an email with the login link
      // For now, we'll just return the token (in production, remove this)
      console.log(
        `Login link for ${email}: /missionary/auth/verify?token=${token}`
      );

      return { success: true, message: "Login email sent successfully" };
    } catch (error) {
      console.error("Login email error:", error);
      return { success: false, message: "Failed to send login email" };
    }
  }

  static async verifyToken(
    token: string
  ): Promise<{ success: boolean; missionary?: Missionary }> {
    try {
      const { data: session, error } = await supabase
        .from("missionary_sessions")
        .select(
          `
          *,
          missionaries (*)
        `
        )
        .eq("session_token", token)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !session) {
        return { success: false };
      }

      // Update last login
      await supabase
        .from("missionaries")
        .update({ last_login: new Date().toISOString() })
        .eq("id", session.missionary_id);

      return { success: true, missionary: session.missionaries as Missionary };
    } catch (error) {
      console.error("Token verification error:", error);
      return { success: false };
    }
  }

  static async getCurrentMissionary(
    sessionToken?: string
  ): Promise<Missionary | null> {
    if (!sessionToken) return null;

    try {
      const { data: session, error } = await supabase
        .from("missionary_sessions")
        .select(
          `
          *,
          missionaries (*)
        `
        )
        .eq("session_token", sessionToken)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !session) {
        return null;
      }

      return session.missionaries as Missionary;
    } catch (error) {
      console.error("Get current missionary error:", error);
      return null;
    }
  }

  static async logout(sessionToken: string): Promise<void> {
    try {
      await supabase
        .from("missionary_sessions")
        .delete()
        .eq("session_token", sessionToken);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}
