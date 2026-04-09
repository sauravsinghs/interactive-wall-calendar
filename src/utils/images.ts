const MONTH_IMAGES: Record<number, string> = {
  0: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&h=500&fit=crop",
  1: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1462143338528-eca9936a4d09?w=800&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
  7: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=500&fit=crop",
  8: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=500&fit=crop",
  9: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=500&fit=crop",
  10: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=500&fit=crop",
  11: "https://images.unsplash.com/photo-1457269449834-928af64c684d?w=800&h=500&fit=crop",
};

export function getMonthImage(monthIndex: number): string {
  return MONTH_IMAGES[monthIndex] ?? MONTH_IMAGES[0];
}
