import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");

            set({ authUser: response.data })
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set ({ isSigningUp: true });
        try {
            const response = await axiosInstance.post("/auth/signup", data);

            set({ authUser: response.data });

            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set ({ isSigningUp: false });
        }
    },

    login: async (data) =>
    {
        set ({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post("/auth/login", data);

            set({ authUser: response.data });

            toast.success("Signed In successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set ({ isLoggingIn: false });
        }
    },

    logout: async () =>
    {
        try {
            await axiosInstance.post("/auth/logout");

            set({ authUser: null});
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Something went wrong.", error);
        }
    }
}));
