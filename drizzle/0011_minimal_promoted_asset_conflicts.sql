alter table "promoted_assets" add column if not exists "status" text;

update "promoted_assets"
set "status" = 'active'
where "status" is null;

alter table "promoted_assets" alter column "status" set default 'active';
alter table "promoted_assets" alter column "status" set not null;

create index if not exists "idx_promoted_assets_status"
  on "promoted_assets" ("status");

create table if not exists "promoted_asset_conflicts" (
  "id" uuid primary key default gen_random_uuid() not null,
  "workspace_id" uuid not null,
  "process_asset_id" uuid not null,
  "asset_a_id" uuid not null,
  "asset_b_id" uuid not null,
  "conflict_type" text not null,
  "status" text default 'detected' not null,
  "resolution_type" text,
  "resolved_by" uuid,
  "detected_at" timestamp with time zone default now() not null,
  "resolved_at" timestamp with time zone
);

do $$ begin
 alter table "promoted_asset_conflicts" add constraint "promoted_asset_conflicts_workspace_id_workspaces_id_fk"
 foreign key ("workspace_id") references "public"."workspaces"("id") on delete cascade on update no action;
exception
 when duplicate_object then null;
end $$;

do $$ begin
 alter table "promoted_asset_conflicts" add constraint "promoted_asset_conflicts_process_asset_id_process_assets_id_fk"
 foreign key ("process_asset_id") references "public"."process_assets"("id") on delete cascade on update no action;
exception
 when duplicate_object then null;
end $$;

do $$ begin
 alter table "promoted_asset_conflicts" add constraint "promoted_asset_conflicts_asset_a_id_promoted_assets_id_fk"
 foreign key ("asset_a_id") references "public"."promoted_assets"("id") on delete cascade on update no action;
exception
 when duplicate_object then null;
end $$;

do $$ begin
 alter table "promoted_asset_conflicts" add constraint "promoted_asset_conflicts_asset_b_id_promoted_assets_id_fk"
 foreign key ("asset_b_id") references "public"."promoted_assets"("id") on delete cascade on update no action;
exception
 when duplicate_object then null;
end $$;

do $$ begin
 alter table "promoted_asset_conflicts" add constraint "promoted_asset_conflicts_resolved_by_users_id_fk"
 foreign key ("resolved_by") references "public"."users"("id") on delete set null on update no action;
exception
 when duplicate_object then null;
end $$;

create index if not exists "idx_promoted_asset_conflicts_asset_a_id"
  on "promoted_asset_conflicts" ("asset_a_id");
create index if not exists "idx_promoted_asset_conflicts_asset_b_id"
  on "promoted_asset_conflicts" ("asset_b_id");
create index if not exists "idx_promoted_asset_conflicts_process_asset_id"
  on "promoted_asset_conflicts" ("process_asset_id");
create index if not exists "idx_promoted_asset_conflicts_status"
  on "promoted_asset_conflicts" ("status");
create index if not exists "idx_promoted_asset_conflicts_workspace_id"
  on "promoted_asset_conflicts" ("workspace_id");
create unique index if not exists "idx_promoted_asset_conflicts_pair_type"
  on "promoted_asset_conflicts" ("asset_a_id", "asset_b_id", "conflict_type");
