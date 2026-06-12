#!/usr/bin/env python3
# Free Supermemory - Yahoo Mail IMAP fetcher (robust + resumable). Python stdlib only.
# Reads APP PASSWORD from $YAHOO_APP_PASS or ~/.config/supermemory/yahoo_app_pass.
# Resumable: tracks done UIDs in data/yahoo/.done_uids, reconnects on timeout, skips poison messages.
# Re-run as many times as needed; it continues where it left off.
import imaplib, email, email.utils, os, re, sys, html, socket
from email.header import decode_header
from pathlib import Path

USER = os.environ.get("YAHOO_USER", "paul_sfirlea@yahoo.com")
PW = os.environ.get("YAHOO_APP_PASS")
if not PW:
    pf = Path.home() / ".config" / "supermemory" / "yahoo_app_pass"
    if pf.exists():
        PW = pf.read_text().strip()
if not PW:
    sys.exit("No app password. Set $YAHOO_APP_PASS or ~/.config/supermemory/yahoo_app_pass")
PW = PW.replace(" ", "")

FOLDERS = [f.strip() for f in os.environ.get("YAHOO_FOLDERS", "INBOX,Sent,Archive").split(",") if f.strip()]
TIMEOUT = int(os.environ.get("YAHOO_TIMEOUT", "45"))
OUT = Path(__file__).resolve().parent.parent / "data" / "yahoo"
OUT.mkdir(parents=True, exist_ok=True)
DONE_FILE = OUT / ".done_uids"
done = set(DONE_FILE.read_text().split()) if DONE_FILE.exists() else set()
donef = open(DONE_FILE, "a")

def dec(s):
    if not s:
        return ""
    out = ""
    for t, enc in decode_header(s):
        if isinstance(t, bytes):
            for c in (enc, "utf-8", "latin-1"):
                try:
                    out += t.decode(c or "utf-8", "ignore"); break
                except (LookupError, TypeError):
                    continue
        else:
            out += t
    return out

def slug(s):
    s = re.sub(r'[\\/:*?"<>|]+', " ", s or "no-subject").strip()
    return (re.sub(r"\s+", " ", s)[:70] or "email")

def body_text(msg):
    def grab(part):
        try:
            txt = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "ignore")
            if part.get_content_type() == "text/html":
                txt = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", txt, flags=re.S | re.I)
                txt = re.sub(r"<[^>]+>", " ", txt)
            return txt
        except Exception:
            return ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and "attachment" not in str(part.get("Content-Disposition")):
                t = grab(part)
                if t.strip():
                    return t
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                t = grab(part)
                if t.strip():
                    return t
        return ""
    return grab(msg)

def connect():
    M = imaplib.IMAP4_SSL("imap.mail.yahoo.com", 993, timeout=TIMEOUT)
    M.login(USER, PW)
    return M

seen = set(p.name for p in OUT.glob("*.md"))
total = 0
NET_ERRS = (imaplib.IMAP4.abort, imaplib.IMAP4.error, socket.timeout, socket.error, OSError)

for folder in FOLDERS:
    try:
        M = connect()
        typ, _ = M.select(f'"{folder}"', readonly=True)
        if typ != "OK":
            print(f"(skip folder {folder})", flush=True); continue
        typ, data = M.uid("search", None, "ALL")
        uids = data[0].split()
    except NET_ERRS as e:
        print(f"(folder {folder} setup failed: {e})", flush=True); continue
    todo = [u for u in uids if f"{folder}:{u.decode()}" not in done]
    print(f"{folder}: {len(uids)} total · {len(todo)} left to fetch", flush=True)
    i = 0; reconnects = 0
    while i < len(todo):
        u = todo[i]; key = f"{folder}:{u.decode()}"
        try:
            typ, d = M.uid("fetch", u, "(RFC822)")
            if typ == "OK" and d and d[0]:
                msg = email.message_from_bytes(d[0][1])
                subj = dec(msg.get("Subject")); frm = dec(msg.get("From")); date = dec(msg.get("Date"))
                try:
                    dt = email.utils.parsedate_to_datetime(date).strftime("%Y-%m-%d")
                except Exception:
                    dt = "0000-00-00"
                body = re.sub(r"\n{3,}", "\n\n", html.unescape(body_text(msg))).strip()
                fn = f"{dt}-{slug(subj)}.md"
                if (OUT / fn).exists():
                    done.add(key); donef.write(key + "\n"); donef.flush(); i += 1; continue
                (OUT / fn).write_text(
                    f"---\nsource: yahoo-mail\nfolder: {folder}\nfrom: {frm!r}\ndate: {dt}\nsubject: {subj!r}\n---\n\n"
                    f"# {subj}\n\n**From:** {frm}  \n**Date:** {date}  \n**Folder:** {folder}\n\n{body}\n")
                total += 1
                if total % 50 == 0:
                    print(f"  {total} saved...", flush=True)
            done.add(key); donef.write(key + "\n"); donef.flush(); i += 1
        except NET_ERRS as e:
            reconnects += 1
            print(f"  net error at {key} ({e}); reconnect #{reconnects}", flush=True)
            try: M.logout()
            except Exception: pass
            if reconnects > 40:
                print("  too many reconnects; stopping this run (re-run to continue)", flush=True); break
            try:
                M = connect(); M.select(f'"{folder}"', readonly=True)
            except NET_ERRS as e2:
                print(f"  reconnect failed: {e2}; stopping", flush=True); break
            done.add(key); donef.write(key + "\n"); donef.flush(); i += 1  # skip poison msg
        except Exception as e:
            print(f"  skip {key}: {e}", flush=True)
            done.add(key); donef.write(key + "\n"); donef.flush(); i += 1  # skip bad-encoding/parse msg
    try: M.logout()
    except Exception: pass

donef.close()
print(f"\nRun complete. {total} new emails this run. (re-run to fetch any remaining)", flush=True)
