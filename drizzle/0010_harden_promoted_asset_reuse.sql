alter table "promoted_assets" add column if not exists "source_sensitivity" text;

update "promoted_assets" as pa
set "source_sensitivity" = wc."sensitivity"
from "work_cards" as wc
where pa."source_work_card_id" = wc."id"
  and pa."source_sensitivity" is null;

update "promoted_assets"
set "source_sensitivity" = 'general'
where "source_sensitivity" is null;

alter table "promoted_assets" alter column "source_sensitivity" set default 'general';
alter table "promoted_assets" alter column "source_sensitivity" set not null;

with ranked_assets as (
  select
    "id",
    row_number() over (
      partition by "source_intent_id"
      order by "created_at" asc, "id" asc
    ) as "row_num"
  from "promoted_assets"
)
delete from "promoted_assets" as pa
using ranked_assets
where pa."id" = ranked_assets."id"
  and ranked_assets."row_num" > 1;

drop index if exists "idx_promoted_assets_source_intent_id";
create unique index if not exists "idx_promoted_assets_source_intent_id"
  on "promoted_assets" ("source_intent_id");
