export function useBooking() {
  return {
    services: [] as Array<{ id: string; name: string }>,
    totalDuration: 0,
    totalPrice: 0,
  };
}
