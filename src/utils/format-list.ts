export const formatList = (list: string[]): string => {
  let formattedList = "n/a";
  if (list.length > 0) {
    const shown = list.slice(0, 5).join(", ");
    const extra = list.length > 5 ? `, +${list.length - 5} more` : "";
    formattedList = shown + extra;
  }
  return formattedList;
};
