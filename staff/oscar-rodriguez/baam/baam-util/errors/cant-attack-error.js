module.exports = class CantAttackError extends Error {
    constructor(message) {
        super(message)

        Error.captureStackTrace(this, CantAttackError)

        this.name = CantAttackError.name
    }
}