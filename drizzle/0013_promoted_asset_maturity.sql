alter table "promoted_assets"
  add column if not exists "maturity" text;

update "promoted_assets"
set "maturity" = 'promoted'
where "maturity" is null;

alter table "promoted_assets"
  alter column "maturity" set default 'promoted';

alter table "promoted_assets"
  alter column "maturity" set not null;

alter table "promoted_assets"
  add column if not exists "verified_at" timestamp with time zone;

alter table "promoted_assets"
  add column if not exists "verified_by" uuid;

do $$
begin
  alter table "promoted_assets"
    add constraint "promoted_assets_verified_by_users_id_fk"
    foreign key ("verified_by") references "public"."users"("id")
    on delete set null
    on update no action;
exception
  when duplicate_object then null;
end $$;

create index if not exists "idx_promoted_assets_maturity"
  on "promoted_assets" ("maturity");

create index if not exists "idx_promoted_assets_verified_by"
  on "promoted_assets" ("verified_by");
