-- Add nickname column to staff_members table
ALTER TABLE "staff_members" ADD COLUMN "nickname" TEXT;

-- Add comment
COMMENT ON COLUMN "staff_members"."nickname" IS 'Display name for appointments and bookings';
