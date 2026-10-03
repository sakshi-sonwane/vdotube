class ApiError extends Error {
  constructor(
    statusCode,
    msg = "something went wrong",
    errors = [],
    stack = "",
  ) {
    super(msg);
    this.statusCode = statusCode;
    this.data = null;
    this.msg = msg;
    this.success = false;
    this.errors = errors;
  }
}

export {ApiError}