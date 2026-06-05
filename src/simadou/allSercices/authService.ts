import { apiClient, tokenManager } from "@/axios/api";
import { toast } from "sonner";


export interface LoginCredentials {
  id_personnel_perso: string;
  password: string;
}

export interface ResetLinkCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  new_password: string;
  confirm_new_password: string;
  token: string;
  uid: string;
}

interface User {
  id?: string;
  name?: string;
  id_personnel_perso?: string;
  personnel?: unknown;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  // Login function
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.request<LoginResponse>("/token/", {
      method: "POST",
      data: credentials,
    });

    return response;
  },

  async reset_link(credentials: ResetLinkCredentials): Promise<LoginResponse> {
    const response = await apiClient.request<LoginResponse>("/password/reset/", {
      method: "POST",
      data: credentials,
    });

    return response;
  },

  async reset_password(credentials: ResetPasswordCredentials): Promise<LoginResponse> {
    const response = await apiClient.request<LoginResponse>("/password/set/", {
      method: "POST",
      data: credentials,
    });

    return response;
  },



  async loginWithGoogle(code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.request<LoginResponse>("/auth/google/", {
        method: "POST",
        data: { code }
      });

      toast.success("Connexion Google réussie");
      return response;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Erreur de connexion Google";
      toast.error(errorMessage);
      throw error;
    }
  },

  // Logout function
  async logout(): Promise<void> {

    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        // Call logout endpoint to invalidate token on server
        await apiClient.request("/token/logout/", {
          method: "POST",
          data: { refresh: refreshToken },
        });
      }
      toast.success("Déconnexion réussie");
    } catch {
      // Continue with logout even if server call fails
      toast.success("Déconnexion locale effectuée");
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return false;
  
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await apiClient.request<{ access: string }>(
        "/token/refresh/",
        {
          method: "POST",
          data: { refresh: refreshToken },
        }
      );

    

      const { access } = response;
      tokenManager.setTokens(access, refreshToken);

      return true;
    } catch {
      // If refresh fails, logout user
      toast.error("Session expirée, veuillez vous reconnecter");
      tokenManager.clearTokens();
      return false;
    }
  },

  // Change password function
  async changePassword(
    id: number,
    data: ChangePasswordData
  ): Promise<void> {
    await apiClient.request(`/personnel/${id}/password/`, {
      method: "PUT",
      data: {
        old_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_new_password: data.confirmPassword,
      },
    });
  }
};
