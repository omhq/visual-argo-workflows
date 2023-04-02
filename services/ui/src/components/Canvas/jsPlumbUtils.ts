export const calculateGroupSize = (childCount: number) => {
  const childHeight = 60;
  const childWidth = 150;
  const padding = 20;
  const groupHeight = childHeight * childCount + 10 * 2 * childCount + padding;
  const groupWidth = childWidth + padding * 2;
  return { groupHeight, groupWidth };
};
