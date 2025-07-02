class DoesNotExist extends Error {
  constructor(message) {
    super(message);
    this.name = "DoesNotExist";
    this.statusCode = 404;
  }
}
class BadParams extends Error {
  constructor(message) {
    super(message);
    this.name = "BadParameters";
    this.statusCode = 400;
  }
}

class NotAuthorized extends Error {
  constructor(message) {
    super(message);
    this.name = "Unauthorized";
    this.statusCode = 401;
  }
}

module.exports = { DoesNotExist, BadParams, NotAuthorized };
