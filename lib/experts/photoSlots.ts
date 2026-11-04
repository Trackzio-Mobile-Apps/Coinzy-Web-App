/** Each side has independent required and optional photos. */
export type PhotoSlots<T> = [T | null, T | null];

export function replacePhotoSlot<T>(slots: PhotoSlots<T>, index: 0 | 1, value: T | null): PhotoSlots<T> {
  return index === 0 ? [value, slots[1]] : [slots[0], value];
}

export function photoSlotValues<T>(slots: PhotoSlots<T>): T[] {
  return slots.filter((value): value is T => value !== null);
}
