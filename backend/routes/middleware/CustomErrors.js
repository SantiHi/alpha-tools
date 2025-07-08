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

module.exports = { DoesNotExist, BadParams };
