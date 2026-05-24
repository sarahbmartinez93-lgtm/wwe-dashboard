"""Hand-written seed data. Idempotent: drops & recreates tables."""
from datetime import date
from db import engine, SessionLocal
from models import (
    Base, Brand, Wrestler, Championship, Event, Match, TitleReign,
)


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    s = SessionLocal()

    raw = Brand(name="Raw")
    sd = Brand(name="SmackDown")
    nxt = Brand(name="NXT")
    s.add_all([raw, sd, nxt])
    s.flush()

    wrestlers = [
        Wrestler(name="Roman Reigns", brand=sd, debut_date=date(2012, 8, 19)),
        Wrestler(name="Cody Rhodes", brand=raw, debut_date=date(2006, 10, 2)),
        Wrestler(name="Seth Rollins", brand=raw, debut_date=date(2010, 7, 30)),
        Wrestler(name="Drew McIntyre", brand=raw, debut_date=date(2007, 11, 15)),
        Wrestler(name="LA Knight", brand=sd, debut_date=date(2021, 6, 22)),
        Wrestler(name="Gunther", brand=raw, debut_date=date(2009, 5, 1)),
        Wrestler(name="Bron Breakker", brand=raw, debut_date=date(2021, 9, 14)),
        Wrestler(name="Damian Priest", brand=sd, debut_date=date(2018, 8, 22)),
        Wrestler(name="Jey Uso", brand=raw, debut_date=date(2010, 5, 25)),
        Wrestler(name="Jimmy Uso", brand=sd, debut_date=date(2010, 5, 25)),
        Wrestler(name="Solo Sikoa", brand=sd, debut_date=date(2021, 7, 6)),
        Wrestler(name="Rhea Ripley", brand=raw, debut_date=date(2017, 8, 24)),
        Wrestler(name="Bianca Belair", brand=sd, debut_date=date(2016, 4, 29)),
        Wrestler(name="Iyo Sky", brand=sd, debut_date=date(2022, 7, 25)),
        Wrestler(name="Liv Morgan", brand=raw, debut_date=date(2014, 11, 18)),
        Wrestler(name="Carmelo Hayes", brand=nxt, debut_date=date(2021, 6, 15)),
    ]
    s.add_all(wrestlers)
    s.flush()
    by_name = {w.name: w for w in wrestlers}

    titles = [
        Championship(name="World Heavyweight Championship", brand=raw, weight_class="heavyweight"),
        Championship(name="Undisputed WWE Championship", brand=sd, weight_class="heavyweight"),
        Championship(name="Intercontinental Championship", brand=raw, weight_class="midcard"),
        Championship(name="United States Championship", brand=sd, weight_class="midcard"),
        Championship(name="Women's World Championship", brand=raw, weight_class="women"),
        Championship(name="WWE Women's Championship", brand=sd, weight_class="women"),
        Championship(name="NXT Championship", brand=nxt, weight_class="heavyweight"),
    ]
    s.add_all(titles)
    s.flush()
    by_title = {t.name: t for t in titles}

    events = [
        Event(name="WrestleMania 40", date=date(2024, 4, 7), venue="Lincoln Financial Field", brand=None),
        Event(name="SummerSlam 2024", date=date(2024, 8, 3), venue="Cleveland Browns Stadium", brand=None),
        Event(name="Bad Blood 2024", date=date(2024, 10, 5), venue="State Farm Arena", brand=raw),
        Event(name="Crown Jewel 2024", date=date(2024, 11, 2), venue="Kingdom Arena", brand=None),
        Event(name="Survivor Series 2024", date=date(2024, 11, 30), venue="Rogers Arena", brand=None),
    ]
    s.add_all(events)
    s.flush()
    by_event = {e.name: e for e in events}

    matches = [
        Match(
            event=by_event["WrestleMania 40"],
            match_type="singles",
            championship=by_title["Undisputed WWE Championship"],
            winner=by_name["Cody Rhodes"],
            participants=[by_name["Cody Rhodes"], by_name["Roman Reigns"]],
            notes="Cody finishes the story.",
        ),
        Match(
            event=by_event["WrestleMania 40"],
            match_type="singles",
            championship=by_title["World Heavyweight Championship"],
            winner=by_name["Damian Priest"],
            participants=[by_name["Damian Priest"], by_name["Drew McIntyre"]],
            notes="MITB cash-in.",
        ),
        Match(
            event=by_event["WrestleMania 40"],
            match_type="singles",
            championship=by_title["Women's World Championship"],
            winner=by_name["Rhea Ripley"],
            participants=[by_name["Rhea Ripley"], by_name["Liv Morgan"]],
            notes="",
        ),
        Match(
            event=by_event["SummerSlam 2024"],
            match_type="singles",
            championship=by_title["World Heavyweight Championship"],
            winner=by_name["Gunther"],
            participants=[by_name["Gunther"], by_name["Damian Priest"]],
            notes="Gunther's first world title.",
        ),
        Match(
            event=by_event["SummerSlam 2024"],
            match_type="singles",
            championship=by_title["Women's World Championship"],
            winner=by_name["Liv Morgan"],
            participants=[by_name["Liv Morgan"], by_name["Rhea Ripley"]],
            notes="",
        ),
        Match(
            event=by_event["Bad Blood 2024"],
            match_type="tag",
            championship=None,
            winner=by_name["Cody Rhodes"],
            participants=[by_name["Cody Rhodes"], by_name["Jey Uso"], by_name["Roman Reigns"], by_name["Solo Sikoa"]],
            notes="Cody & Jey vs. Bloodline.",
        ),
        Match(
            event=by_event["Crown Jewel 2024"],
            match_type="singles",
            championship=by_title["Undisputed WWE Championship"],
            winner=by_name["Cody Rhodes"],
            participants=[by_name["Cody Rhodes"], by_name["Gunther"]],
            notes="Crown Jewel champion vs champion.",
        ),
        Match(
            event=by_event["Survivor Series 2024"],
            match_type="singles",
            championship=by_title["Intercontinental Championship"],
            winner=by_name["Bron Breakker"],
            participants=[by_name["Bron Breakker"], by_name["Jey Uso"]],
            notes="",
        ),
        Match(
            event=by_event["Survivor Series 2024"],
            match_type="singles",
            championship=by_title["United States Championship"],
            winner=by_name["LA Knight"],
            participants=[by_name["LA Knight"], by_name["Carmelo Hayes"]],
            notes="",
        ),
    ]
    s.add_all(matches)
    s.flush()

    reigns = [
        TitleReign(championship=by_title["Undisputed WWE Championship"], wrestler=by_name["Roman Reigns"],
                   won_at=date(2020, 8, 30), lost_at=date(2024, 4, 7)),
        TitleReign(championship=by_title["Undisputed WWE Championship"], wrestler=by_name["Cody Rhodes"],
                   won_at=date(2024, 4, 7), lost_at=None),
        TitleReign(championship=by_title["World Heavyweight Championship"], wrestler=by_name["Damian Priest"],
                   won_at=date(2024, 4, 7), lost_at=date(2024, 8, 3)),
        TitleReign(championship=by_title["World Heavyweight Championship"], wrestler=by_name["Gunther"],
                   won_at=date(2024, 8, 3), lost_at=None),
        TitleReign(championship=by_title["Women's World Championship"], wrestler=by_name["Rhea Ripley"],
                   won_at=date(2023, 4, 1), lost_at=date(2024, 8, 3)),
        TitleReign(championship=by_title["Women's World Championship"], wrestler=by_name["Liv Morgan"],
                   won_at=date(2024, 8, 3), lost_at=None),
        TitleReign(championship=by_title["Intercontinental Championship"], wrestler=by_name["Bron Breakker"],
                   won_at=date(2024, 11, 30), lost_at=None),
        TitleReign(championship=by_title["United States Championship"], wrestler=by_name["LA Knight"],
                   won_at=date(2024, 11, 30), lost_at=None),
        TitleReign(championship=by_title["WWE Women's Championship"], wrestler=by_name["Bianca Belair"],
                   won_at=date(2024, 5, 4), lost_at=None),
        TitleReign(championship=by_title["NXT Championship"], wrestler=by_name["Carmelo Hayes"],
                   won_at=date(2023, 9, 12), lost_at=date(2024, 6, 9)),
    ]
    s.add_all(reigns)
    s.commit()
    print(f"Seeded: {len(wrestlers)} wrestlers, {len(titles)} titles, "
          f"{len(events)} events, {len(matches)} matches, {len(reigns)} reigns")


if __name__ == "__main__":
    seed()
