// HTTP error with a status code, thrown from services/controllers and
// translated to the JSON error envelope by the error handler.
export class HttpError extends Error {
  statusCode: number;
  detail?: unknown;
  constructor(message: string, statusCode = 500, detail?: unknown) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const BadRequest = (m: string, d?: unknown) => new HttpError(m, 400, d);
export const Unauthorized = (m = "Unauthorized", d?: unknown) => new HttpError(m, 401, d);
export const Forbidden = (m = "Forbidden", d?: unknown) => new HttpError(m, 403, d);
export const NotFound = (m = "Not found", d?: unknown) => new HttpError(m, 404, d);
export const Conflict = (m: string, d?: unknown) => new HttpError(m, 409, d);
