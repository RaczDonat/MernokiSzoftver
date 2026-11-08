/**
 * Dinamikus árazási és kapacitáskezelő szabályok.
 */
export const LOW_AVAILABILITY_THRESHOLD = 0.2;
export const SURCHARGE_RATE = 0.15;
export function freeSeats(trip) {
    return Math.max(trip.maxCapacity - trip.bookedSeats, 0);
}
export function occupancyRatio(trip) {
    if (trip.maxCapacity <= 0)
        return 1;
    return trip.bookedSeats / trip.maxCapacity;
}
export function availabilityRatio(trip) {
    return 1 - occupancyRatio(trip);
}
export function isSoldOut(trip) {
    return freeSeats(trip) <= 0;
}
/**
 * Árajánlat `seats` darab helyre. A felárat a foglalás UTÁNI állapot dönti el,
 * pontosan úgy, ahogy a backend számolja.
 */
export function quotePrice(trip, seats = 1) {
    const seatsAfter = trip.bookedSeats + seats;
    const availabilityAfter = (trip.maxCapacity - seatsAfter) / trip.maxCapacity;
    const surchargeApplied = availabilityAfter < LOW_AVAILABILITY_THRESHOLD;
    const unitPrice = surchargeApplied
        ? Math.round(trip.basePrice * (1 + SURCHARGE_RATE))
        : trip.basePrice;
    return {
        basePrice: trip.basePrice * seats,
        finalPrice: unitPrice * seats,
        surchargeApplied,
        surchargeAmount: (unitPrice - trip.basePrice) * seats,
    };
}
export function formatHuf(value) {
    return `${new Intl.NumberFormat("hu-HU").format(Math.round(value))} Ft`;
}
export function formatDate(iso) {
    return new Intl.DateTimeFormat("hu-HU", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(new Date(iso));
}
