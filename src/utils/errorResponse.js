class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture la pile d'appels pour le débogage
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
