#!/usr/bin/env python3
"""Waits for the main scraper (pid 44836) to finish, then re-scrapes electronics with clean IDs."""
import sys, time, subprocess
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

pid = 44836
print(f"Watching for pid {pid} to finish...", flush=True)

import psutil
while True:
    try:
        p = psutil.Process(pid)
        p.status()  # raises NoSuchProcess if done
        time.sleep(10)
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        break

print("Main scraper finished! Starting electronics re-scrape...", flush=True)
import subprocess, sys
from pathlib import Path
script = Path(__file__).parent / "rescrape_electronics.py"
subprocess.run([sys.executable, str(script)], check=True)
print("Electronics re-scrape complete.", flush=True)
