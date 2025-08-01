export function createTextResponse(
  text: string,
  options: {
    isError?: boolean;
    metadata?: Record<string, any>; // or define a stricter type if preferred
  } = {}
): {
  content: { type: "text"; text: string }[];
  isError?: boolean;
  metadata?: Record<string, any>;
} {
  return {
    content: [{ type: "text", text }],
    ...(options.isError !== undefined && { isError: options.isError }),
    ...(options.metadata && { metadata: options.metadata }),
  };
}
