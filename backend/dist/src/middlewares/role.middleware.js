export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.organization) {
            return res.status(403).json({ message: "Organization Context Required" });
        }
        if (!allowedRoles.includes(req.organization.role)) {
            return res.status(401).json({ message: "You do not have the permission to perform this action" });
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map