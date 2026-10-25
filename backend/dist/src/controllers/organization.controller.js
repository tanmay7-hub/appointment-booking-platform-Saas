import { createOrganizationSchema } from "../validations/organization.validation.js";
import { createOrganization, getUserOrganization, getOrganizationById } from "../services/organization.service.js";
export async function getOrganization(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication Required" });
        }
        const organization = await getUserOrganization(req.user.userId);
        return res.status(200).json({ message: "Organization  Fetched", organization });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export async function createOrganizationMember(req, res) {
    try {
        const result = createOrganizationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(401).json({ message: "Invalid input" });
        }
        if (!req.user) {
            return res.status(400).json({ message: "Authentication Required" });
        }
        const organization = await createOrganization(result.data, req.user?.userId);
        return res.status(201).json({ message: "Organization Created ", organization: organization.org });
    }
    catch (err) {
        if (err instanceof Error && err.message === "Organization already exists") {
            return res.status(409).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export async function getOrganizationFromId(req, res) {
    try {
        const { organizationId } = req.params;
        if (typeof organizationId !== "string") {
            return res.status(422).json({ message: "Unprocessable entity" });
        }
        const organization = await getOrganizationById(organizationId);
        if (!organization) {
            return res.status(403).json({ message: "Organization not found" });
        }
        return res.status(200).json({ message: "Organization Fetched", organization });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
//# sourceMappingURL=organization.controller.js.map