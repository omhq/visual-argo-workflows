export const calculateGroupSize = (childCount: number) => {
  const childHeight = 60;
  const childWidth = 150;
  const padding = 20;
  const groupHeight = childHeight * childCount + padding * 2 * childCount;
  const groupWidth = childWidth + padding * 2;
  return { groupHeight, groupWidth };
};
