"""Upload an AAB to a Google Play track with a resumable, chunked upload.

r0adkll/upload-google-play sends the whole bundle in one request; Play answered
"Internal error encountered" (HTTP 500) for our ~75 MB AAB every time (v1.1.0,
2026-10-31), while the same file went through in 8 MB resumable chunks.

Usage: python play_upload.py <aab> <package> <track> <release name>
The service account JSON is read from the PLAY_SERVICE_ACCOUNT_JSON environment variable.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account

CHUNK = 8 * 1024 * 1024
RETRIES = 5

aab, package, track, release_name = sys.argv[1:5]
credentials = service_account.Credentials.from_service_account_info(
    json.loads(os.environ["PLAY_SERVICE_ACCOUNT_JSON"]),
    scopes=["https://www.googleapis.com/auth/androidpublisher"],
)
credentials.refresh(google.auth.transport.requests.Request())

base = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{package}/edits"
upload_base = f"https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/{package}/edits"


def call(method, url, data=None, headers=None, timeout=120):
    all_headers = {"Authorization": f"Bearer {credentials.token}", "Content-Type": "application/json"}
    all_headers.update(headers or {})
    request = urllib.request.Request(url, method=method, data=data, headers=all_headers)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.headers, json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as error:
        return error.code, error.headers, json.loads(error.read() or b"{}")


def message(body):
    return body.get("error", {}).get("message", "")


def with_retries(label, fn):
    """Retry on 5xx and network errors, which Play returns intermittently."""
    for attempt in range(1, RETRIES + 1):
        try:
            status, headers, body = fn()
        except (urllib.error.URLError, TimeoutError) as error:
            status, headers, body = 0, {}, {"error": {"message": str(error)}}
        if status < 500 and status != 0:
            return status, headers, body
        print(f"{label}: {status} {message(body)} (attempt {attempt}/{RETRIES})")
        time.sleep(10 * attempt)
    sys.exit(f"{label} failed after {RETRIES} attempts")


status, _, edit = with_retries("edits.insert", lambda: call("POST", base, b"{}"))
if status >= 300:
    sys.exit(f"edits.insert: {status} {message(edit)}")
edit_id = edit["id"]


def abort(text):
    call("DELETE", f"{base}/{edit_id}")
    sys.exit(text)


size = os.path.getsize(aab)
status, headers, body = with_retries(
    "upload session",
    lambda: call(
        "POST",
        f"{upload_base}/{edit_id}/bundles?uploadType=resumable",
        b"",
        {"X-Upload-Content-Type": "application/octet-stream", "X-Upload-Content-Length": str(size)},
    ),
)
session = headers.get("Location") if status < 300 else None
if not session:
    abort(f"upload session: {status} {message(body)}")

bundle = None
offset = 0
with open(aab, "rb") as file:
    while bundle is None:
        file.seek(offset)
        chunk = file.read(CHUNK)
        end = offset + len(chunk) - 1
        status, headers, body = with_retries(
            f"chunk {offset}-{end}",
            lambda: call(
                "PUT",
                session,
                chunk,
                {"Content-Type": "application/octet-stream", "Content-Range": f"bytes {offset}-{end}/{size}"},
                timeout=600,
            ),
        )
        if status in (200, 201):
            bundle = body
        elif status == 308:
            received = headers.get("Range")
            offset = int(received.split("-")[1]) + 1 if received else 0
        else:
            abort(f"bundle upload: {status} {message(body)}")

version_code = str(bundle["versionCode"])
print(f"Bundle uploaded: versionCode {version_code}")

release = {"track": track, "releases": [{"name": release_name, "versionCodes": [version_code], "status": "completed"}]}
status, _, body = with_retries(
    "tracks.update", lambda: call("PUT", f"{base}/{edit_id}/tracks/{track}", json.dumps(release).encode())
)
if status >= 300:
    abort(f"tracks.update: {status} {message(body)}")

status, _, body = with_retries("edits.commit", lambda: call("POST", f"{base}/{edit_id}:commit", b""))
if status >= 300:
    abort(f"edits.commit: {status} {message(body)}")
print(f"Published {release_name} (versionCode {version_code}) to the {track} track")
