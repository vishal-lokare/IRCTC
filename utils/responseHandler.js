const BadRequestError = (res, msg) => {
    res.status(400).json({ message: msg });
}

const UnauthorizedError = (res, msg) => {
    res.status(401).json({ message: msg });
}

const CreatedResponse = (res, msg) => {
    res.status(201).json({ message: msg });
}

const OkResponse = (res, msg) => {
    res.status(200).json({ message: msg });
}

const ForbiddenError = (res, msg) => {
    res.status(403).json({ message: msg });
}

const NotFoundError = (res, msg) => {
    res.status(404).json({ message: msg });
}

module.exports = { BadRequestError, UnauthorizedError, CreatedResponse, OkResponse, ForbiddenError, NotFoundError }