
-- will need to be ran again if adding new table with update_at attribute
-- trigger functionality for updated_at attributes
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in
    select table_name
    from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format('drop trigger if exists trg_%I_updated_at on %I;', t, t);
    execute format('create trigger trg_%I_updated_at before update on %I
                    for each row execute function set_updated_at();', t, t);
  end loop;
end $$;
