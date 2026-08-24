import os
import time

import requests


BC_BASE_URL = "https://api.businesscentral.dynamics.com/v2.0"

SESSION = requests.Session()

_token_cache = {
    "access_token": None,
    "expires_at": 0,
}

_company_id_cache = None


def get_access_token():
    now = time.time()

    # Reuse cached token if it is still valid.
    # Keep 60 seconds safety margin before expiry.
    if (
        _token_cache["access_token"]
        and now < _token_cache["expires_at"] - 60
    ):
        return _token_cache["access_token"]

    tenant_id = os.getenv("TENANT_ID")
    client_id = os.getenv("CLIENT_ID")
    client_secret = os.getenv("CLIENT_SECRET")

    if not tenant_id or not client_id or not client_secret:
        raise RuntimeError(
            "TENANT_ID, CLIENT_ID and CLIENT_SECRET must be configured."
        )

    token_url = (
        f"https://login.microsoftonline.com/"
        f"{tenant_id}/oauth2/v2.0/token"
    )

    token_data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://api.businesscentral.dynamics.com/.default",
        "grant_type": "client_credentials",
    }

    response = SESSION.post(
        token_url,
        data=token_data,
        timeout=30,
    )

    response.raise_for_status()

    token_response = response.json()

    access_token = token_response["access_token"]
    expires_in = token_response.get("expires_in", 3600)

    _token_cache["access_token"] = access_token
    _token_cache["expires_at"] = now + expires_in

    return access_token


def get_headers():
    return {
        "Authorization": f"Bearer {get_access_token()}",
        "Accept": "application/json",
    }


def get_company_id():
    global _company_id_cache

    # If we already resolved the company once,
    # reuse it for the lifetime of this backend process.
    if _company_id_cache:
        return _company_id_cache

    environment = os.getenv(
        "BC_ENVIRONMENT",
        "production",
    )

    company_name = os.getenv("BC_COMPANY_NAME")

    if not company_name:
        raise RuntimeError(
            "BC_COMPANY_NAME must be configured."
        )

    url = (
        f"{BC_BASE_URL}/"
        f"{environment}/api/v2.0/companies"
    )

    response = SESSION.get(
        url,
        headers=get_headers(),
        timeout=30,
    )

    response.raise_for_status()

    companies = response.json().get("value", [])

    for company in companies:
        if company.get("name") == company_name:
            _company_id_cache = company["id"]
            return _company_id_cache

    raise RuntimeError(
        f"Business Central company not found: {company_name}"
    )


def search_customers(query=None):
    environment = os.getenv(
        "BC_ENVIRONMENT",
        "production",
    )

    company_id = get_company_id()

    url = (
        f"{BC_BASE_URL}/"
        f"{environment}/api/v2.0/"
        f"companies({company_id})/customers"
    )

    params = {
        "$top": 25,
        "$orderby": "displayName",
        "$schemaversion": "2.1",
        "$select": (
            "id,"
            "number,"
            "displayName,"
            "addressLine1,"
            "addressLine2,"
            "city,"
            "state,"
            "country,"
            "postalCode,"
            "phoneNumber,"
            "email"
        ),
    }

    if query:
        safe_query = query.lower().replace("'", "''")

        params["$filter"] = (
            f"contains(tolower(displayName),'{safe_query}')"
        )

    response = SESSION.get(
        url,
        headers=get_headers(),
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    customers = response.json().get("value", [])

    return [
        {
            "id": customer.get("id"),
            "number": customer.get("number"),
            "name": customer.get("displayName"),
            "address": customer.get("addressLine1"),
            "address2": customer.get("addressLine2"),
            "postalCode": customer.get("postalCode"),
            "city": customer.get("city"),
            "state": customer.get("state"),
            "country": customer.get("country"),
            "phone": customer.get("phoneNumber"),
            "email": customer.get("email"),
        }
        for customer in customers
    ]