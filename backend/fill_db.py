import requests

counter = 0
# Make sure you have a file named 'test.txt' in the same directory
# with one URL per line.
try:
    with open("test.txt", "r") as f:
        for line in f:
            line = line.strip()
            if line:
                # The main change is here: use the 'json' parameter instead of 'data'.
                # This sends the payload as 'application/json', which FastAPI expects.
                payload = {"url": line}
                try:
                    response = requests.post(
                        "http://localhost:8000/api/upload", json=payload, timeout=10
                    )

                    # Corrected the status code check logic.
                    # The original `or` condition would always evaluate to true.
                    # We check if the status code is NOT one of the expected successful codes.
                    if response.status_code not in [200, 409]:
                        print(
                            f"FAILED for {line} | STATUS_CODE: {response.status_code} | ERROR: {response.text}"
                        )
                    else:
                        status_message = (
                            "Accepted"
                            if response.status_code == 200
                            else "Already Exists"
                        )
                        print(
                            f"[{response.status_code} - {status_message}] Submitted: {line}"
                        )

                except requests.exceptions.RequestException as e:
                    print(f"Request failed for {line}: {e}")
                    continue

                counter += 1
    print(f"\nFinished processing {counter} URLs.")

except FileNotFoundError:
    print("Error: 'test.txt' not found. Please create this file and add URLs to it.")
