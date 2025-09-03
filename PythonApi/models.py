from pydantic import BaseModel
from typing import Optional


class DataParseRequest(BaseModel):
    input_text: str


class PersonalInfoResponse(BaseModel):
    name: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    confidence: float


class DataParseResponse(BaseModel):
    original_input: str
    parsed_data: PersonalInfoResponse
    confidence: float


class IdCardInfoResponse(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    id_number: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    eye_color: Optional[str] = None
    document_type: Optional[str] = None
    issuing_authority: Optional[str] = None
    confidence: float


class IdCardParseResponse(BaseModel):
    filename: str
    parsed_data: IdCardInfoResponse
    confidence: float