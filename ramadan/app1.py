from flask import Flask, render_template, request, redirect, url_for
import json
import os
from datetime import datetime, timedelta, timezone

app = Flask(__name__)

# ===== APP BRAND =====
APP_NAME = "রমজান সময়সূচী BD 2026"

# ===== BANGLADESH TIME (UTC+6) =====
BD_TIMEZONE = timezone(timedelta(hours=6))

def bd_now():
    return datetime.now(BD_TIMEZONE)

# ===== RAMADAN AUTO CLOSE (30 DAYS → EID) =====
RAMADAN_START = datetime(2026, 2, 18, tzinfo=BD_TIMEZONE)
RAMADAN_DAYS = 30

def is_ramadan_over():
    today = bd_now()
    end_date = RAMADAN_START + timedelta(days=RAMADAN_DAYS)
    return today >= end_date


# ===== LOAD JSON DATA =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "data", "divisions.json"), "r", encoding="utf-8") as f:
    divisions = json.load(f)

with open(os.path.join(BASE_DIR, "data", "ramadan_times.json"), "r", encoding="utf-8") as f:
    ramadan_times = json.load(f)


# ===== TIME FORMAT (24H → 12H) =====
def to_12_hour(time_str):
    hour, minute = map(int, time_str.split(":"))
    suffix = "AM"
    if hour >= 12:
        suffix = "PM"
    if hour > 12:
        hour -= 12
    if hour == 0:
        hour = 12
    return f"{hour:02d}:{minute:02d} {suffix}"


# ===== BANGLA WEEK =====
def get_bangla_week(date_obj):
    weeks = [
        "সোমবার", "মঙ্গলবার", "বুধবার",
        "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"
    ]
    return weeks[date_obj.weekday()]


# ===== DISTRICT OFFSET =====
district_offsets = {
    "ঢাকা": (0, 0),
    "খুলনা": (3, 2),
    "যশোর": (4, 3),
    "চট্টগ্রাম": (-3, -2),
    "সিলেট": (-5, -4),
    "রাজশাহী": (2, 2),
    "রংপুর": (4, 3),
    "বরিশাল": (2, 2),
    "ময়মনসিংহ": (2, 2),
}

division_offsets = {
    "ঢাকা": (0, 0),
    "চট্টগ্রাম": (-3, -2),
    "সিলেট": (-5, -4),
    "রাজশাহী": (2, 2),
    "রংপুর": (4, 3),
    "খুলনা": (3, 2),
    "বরিশাল": (2, 2),
    "ময়মনসিংহ": (2, 2),
}


def adjust_time(base_time, offset_min):
    dt = datetime.strptime(base_time, "%H:%M")
    dt += timedelta(minutes=offset_min)
    return dt.strftime("%H:%M")


# ===== HOME =====
@app.route("/")
def home():
    if is_ramadan_over():
        return render_template("eid.html", app_name=APP_NAME)
    return render_template("welcome.html", app_name=APP_NAME)


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", divisions=divisions, app_name=APP_NAME)


# ===== RESULT (SMART DATE SYSTEM - BD TIME FIXED) =====
@app.route("/result", methods=["POST"])
def result():
    division = request.form.get("division")
    district = request.form.get("district")
    selected_date = request.form.get("date")

    if not division or not district or not selected_date:
        return redirect(url_for("dashboard"))

    try:
        date_obj = datetime.strptime(selected_date, "%Y-%m-%d")
    except:
        return redirect(url_for("dashboard"))

    # ===== BANGLADESH CURRENT DATE (REAL FIX) =====
    today_real = bd_now().date()
    selected_real = date_obj.date()
    tomorrow_real = today_real + timedelta(days=1)

    # ===== RAMADAN DAY CALCULATION =====
    diff_days = (date_obj.replace(tzinfo=BD_TIMEZONE) - RAMADAN_START).days
    tarabi = max(0, min(30, diff_days + 1))
    roza = max(0, min(30, diff_days))

    # 🔴 PAST DATE
    if selected_real < today_real:
        msg = "সময় শেষ হয়েছে"
        return render_template(
            "result.html",
            app_name=APP_NAME,
            division=division,
            district=district,
            date_bn=date_obj.strftime("%d %B %Y"),
            week=get_bangla_week(date_obj),
            tarabi=tarabi,
            roza=roza,
            sehri=msg,
            iftar=msg,
            fajar_12=msg,
            zohor_12=msg,
            asor_12=msg,
            magrib_12=msg,
            esha_12=msg,
        )

    # 🟡 TOMORROW
    if selected_real == tomorrow_real:
        msg = "আগামীকাল শুরু হবে"
        return render_template(
            "result.html",
            app_name=APP_NAME,
            division=division,
            district=district,
            date_bn=date_obj.strftime("%d %B %Y"),
            week=get_bangla_week(date_obj),
            tarabi=tarabi,
            roza=roza,
            sehri=msg,
            iftar=msg,
            fajar_12=msg,
            zohor_12=msg,
            asor_12=msg,
            magrib_12=msg,
            esha_12=msg,
        )

    # 🔵 FUTURE DATE
    if selected_real > tomorrow_real:
        future_text = f"{date_obj.strftime('%d %B')} তারিখ শুরু হবে"
        return render_template(
            "result.html",
            app_name=APP_NAME,
            division=division,
            district=district,
            date_bn=date_obj.strftime("%d %B %Y"),
            week=get_bangla_week(date_obj),
            tarabi=tarabi,
            roza=roza,
            sehri=future_text,
            iftar=future_text,
            fajar_12=future_text,
            zohor_12=future_text,
            asor_12=future_text,
            magrib_12=future_text,
            esha_12=future_text,
        )

    # 🟢 TODAY (LIVE TIME SYSTEM)
    base_times = ramadan_times.get("ঢাকা", [])
    day_index = max(0, min(29, diff_days if diff_days >= 0 else 0))

    if day_index < len(base_times):
        today_data = base_times[day_index]
        sehri_base = today_data.get("sehri", "04:50")
        iftar_base = today_data.get("iftar", "18:10")
    else:
        sehri_base = "04:50"
        iftar_base = "18:10"

    # Offset apply
    if district in district_offsets:
        offset = district_offsets[district]
    else:
        offset = division_offsets.get(division, (0, 0))

    sehri_raw = adjust_time(sehri_base, offset[0])
    iftar_raw = adjust_time(iftar_base, offset[1])

    fajar_raw = sehri_raw
    zohor_raw = "12:15"
    asor_raw = "16:30"
    magrib_raw = iftar_raw
    esha_raw = "19:45"

    return render_template(
        "result.html",
        app_name=APP_NAME,
        division=division,
        district=district,
        date_bn=date_obj.strftime("%d %B %Y"),
        week=get_bangla_week(date_obj),
        tarabi=tarabi,
        roza=roza,
        sehri=to_12_hour(sehri_raw),
        iftar=to_12_hour(iftar_raw),
        fajar_12=to_12_hour(fajar_raw),
        zohor_12=to_12_hour(zohor_raw),
        asor_12=to_12_hour(asor_raw),
        magrib_12=to_12_hour(magrib_raw),
        esha_12=to_12_hour(esha_raw),
    )


# ===== RENDER PRODUCTION RUN (PORT FIXED) =====
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render auto port
    app.run(host="0.0.0.0", port=port, debug=False)
