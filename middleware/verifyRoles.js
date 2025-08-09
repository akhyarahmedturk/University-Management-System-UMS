function verifyRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.body || !req.body.role) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasRole = allowedRoles.includes(req.body.role);
        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
}
module.exports = verifyRoles;
