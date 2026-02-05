export function useAuth() {
  return {
    user: null as null | { id: string; email: string },
    isAuthenticated: false,
  };
}
