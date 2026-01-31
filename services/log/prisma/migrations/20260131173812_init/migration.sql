-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "message" TEXT,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "actor_roles" TEXT,
    "actor_ip" TEXT,
    "user_agent" TEXT,
    "resource" TEXT,
    "resource_id" TEXT,
    "action" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);
