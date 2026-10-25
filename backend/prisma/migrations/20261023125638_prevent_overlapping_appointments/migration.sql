

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "idActive",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_no_overlapping_active_staff_appointments"
EXCLUDE USING GIST (
    "staffMemberId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE ("status" IN ('PENDING', 'CONFIRMED'));