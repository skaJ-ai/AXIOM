alter table "promoted_assets"
  add column if not exists "bucket_scope" text;

update "promoted_assets"
set "bucket_scope" = 'workspace'
where "bucket_scope" is null;

alter table "promoted_assets"
  alter column "bucket_scope" set default 'workspace';

alter table "promoted_assets"
  alter column "bucket_scope" set not null;

create index if not exists "idx_promoted_assets_bucket_scope"
  on "promoted_assets" ("bucket_scope");
