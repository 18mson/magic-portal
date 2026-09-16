import { createXRStore } from "@react-three/xr";

// Singleton store untuk WebXR
export const xrStore = createXRStore({
  emulate: false,
});

export type ARSupportStatus =
  | "CHECKING"
  | "SUPPORTED"
  | "INSECURE_CONTEXT"
  | "NO_XR"
  | "NO_AR_SESSION";

export async function checkARSupport(): Promise<ARSupportStatus> {
  if (typeof window === "undefined") return "CHECKING";

  // WebXR membutuhkan Secure Context (HTTPS atau localhost)
  if (!window.isSecureContext) {
    return "INSECURE_CONTEXT";
  }

  // Cek apakah API navigator.xr tersedia
  if (!navigator.xr) {
    return "NO_XR";
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    return isSupported ? "SUPPORTED" : "NO_AR_SESSION";
  } catch (err) {
    console.warn("Gagal mengecek dukungan WebXR AR:", err);
    return "NO_AR_SESSION";
  }
}
