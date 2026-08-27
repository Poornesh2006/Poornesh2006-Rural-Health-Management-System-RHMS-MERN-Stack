export function apiResponse(message, data) {
  return {
    success: true,
    message,
    data,
  };
}
