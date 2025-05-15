# test_concurrent_transfers.py
import threading
import requests
import time

A_TO_B_URL = "http://localhost:8000/api/transactions/transfer"
B_TO_A_URL = "http://localhost:8000/api/transactions/transfer"

TRANSFER_COUNT = 10  # 반복 횟수
TRANSFER_AMOUNT = 100  # 송금 금액

def get_access_token():
    response = requests.post("http://localhost:8000/api/authentication/login", json={
        "email": "rohanu.dev@gmail.com",
        "password": "Test1234!"
    })

    # print(f"로그인 응답: {response.status_code}, {response.json()}")
    return response.json()["access_token"]

ACCESS_TOKEN = get_access_token()

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}


def transfer(from_acc, to_acc):
    response = requests.post(A_TO_B_URL, json={
        "from_account": from_acc,
        "to_account": to_acc,
        "amount": TRANSFER_AMOUNT
    }, headers=HEADERS)
    print(f"{from_acc} → {to_acc}: {response.status_code}, {response.json()}")

def run_concurrent_transfers():
    threads = []

    for _ in range(TRANSFER_COUNT):
        t1 = threading.Thread(target=transfer, args=("8624213481567", "4662683630251"))
        t2 = threading.Thread(target=transfer, args=("4662683630251", "8624213481567"))
        threads.extend([t1, t2])

    start = time.time()

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    end = time.time()
    print(f"총 실행 시간: {end - start:.2f}초")

if __name__ == "__main__":
    run_concurrent_transfers()