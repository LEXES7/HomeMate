import { errorHandler } from './error.js';

export const verifyAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to access this resource. Admin access required.'));
    }
    next();
};