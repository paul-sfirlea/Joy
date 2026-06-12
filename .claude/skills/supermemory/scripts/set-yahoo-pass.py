#!/usr/bin/env python3
# Salvează app password-ul Yahoo în siguranță, cu validare pe loc.
# Rulează:  python3 set-yahoo-pass.py
# Lipești codul de 16 litere de la Yahoo (input ascuns) și Enter.
import getpass, re
from pathlib import Path

raw = getpass.getpass("Lipeste app password-ul Yahoo (16 litere) si apasa Enter: ")
code = raw.strip().replace(" ", "")

if re.fullmatch(r"[a-z]{16}", code):
    p = Path.home() / ".config" / "supermemory" / "yahoo_app_pass"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(code)
    p.chmod(0o600)
    print("✅ SALVAT corect — 16 litere mici. Scrie-i lui Claude: gata parola yahoo")
else:
    reasons = []
    if len(code) != 16:
        reasons.append(f"are {len(code)} caractere (trebuie EXACT 16)")
    if not code.isalpha():
        reasons.append("conține cifre/simboluri (app password = doar litere)")
    if code != code.lower():
        reasons.append("are majuscule (trebuie doar litere mici)")
    print("❌ NU e un app password Yahoo valid:")
    for r in reasons:
        print("   -", r)
    print("\nApp password-ul Yahoo = EXACT 16 litere mici (ex: abcd efgh ijkl mnop),")
    print("afișat în caseta de la Account Security > Generate app password.")
    print("NU e parola cu care te loghezi. Generează unul și reia.")
