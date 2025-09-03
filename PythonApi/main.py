from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from models import DataParseRequest, DataParseResponse, PersonalInfoResponse, IdCardParseResponse, IdCardInfoResponse
from openai_service import get_parser

app = FastAPI(
    title="Personal Information Parser API", 
    version="v1", 
    docs_url="/swagger", 
    redoc_url="/redoc",
    description="AI-powered Personal Information Parser using Groq LLaMA model. Parse unstructured text containing personal information into structured fields."
)

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Send interactive user to swagger page by default
@app.get("/")
async def redirect_to_swagger():
    return RedirectResponse(url="/swagger")

# Data parsing endpoint
@app.post("/api/todos/classify", response_model=DataParseResponse, 
         summary="Parse Personal Information",
         description="Extract personal information from unstructured text and return structured fields including name, address, phone, email, etc.")
async def parse_personal_info(request: DataParseRequest):
    """
    Parse unstructured text containing personal information into structured fields.
    
    **Example Input:** 
    "my name is Lewis Hamilton, I live in 2944 Monaco dr, Manchester, Colorado, USA, 92223. My phone number is 893-366-8888"
    
    **Example Output:**
    - Name: Lewis Hamilton
    - Street: 2944 Monaco dr  
    - City: Manchester
    - State: Colorado
    - Country: USA
    - ZIP Code: 92223
    - Phone Number: 893-366-8888
    """
    try:
        parser = get_parser()
        parsed_result = await parser.parse_data(request.input_text)
        
        # Create structured personal info response
        personal_info = PersonalInfoResponse(
            name=parsed_result.get("name"),
            street=parsed_result.get("street"),
            city=parsed_result.get("city"),
            state=parsed_result.get("state"),
            country=parsed_result.get("country"),
            zip_code=parsed_result.get("zip_code"),
            phone_number=parsed_result.get("phone_number"),
            email=parsed_result.get("email"),
            confidence=parsed_result.get("confidence", 0.0)
        )
        
        return DataParseResponse(
            original_input=request.input_text,
            parsed_data=personal_info,
            confidence=parsed_result.get("confidence", 0.0)
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personal information parsing failed: {str(e)}")


# ID Card parsing endpoint
@app.post("/api/idcard/parse", response_model=IdCardParseResponse,
         summary="Parse ID Card Information", 
         description="Extract structured information from ID card, driver's license, or passport images using AI vision.")
async def parse_id_card(file: UploadFile = File(...)):
    """
    Upload an image of an ID card, driver's license, or passport to extract structured information.
    
    **Supported formats:** JPEG, PNG, WebP
    **Maximum file size:** 10MB
    
    **Extracted information includes:**
    - Full name, first name, last name
    - Date of birth, ID numbers  
    - Address information
    - Issue and expiration dates
    - Physical characteristics (height, weight, eye color)
    - Document type and issuing authority
    """
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
    
    try:
        parser = get_parser()
        parsed_result = await parser.parse_id_card(file_content, file.filename or "uploaded_image")
        
        # Create structured ID card info response
        id_card_info = IdCardInfoResponse(
            full_name=parsed_result.get("full_name"),
            first_name=parsed_result.get("first_name"),
            last_name=parsed_result.get("last_name"),
            date_of_birth=parsed_result.get("date_of_birth"),
            id_number=parsed_result.get("id_number"),
            license_number=parsed_result.get("license_number"),
            address=parsed_result.get("address"),
            city=parsed_result.get("city"),
            state=parsed_result.get("state"),
            zip_code=parsed_result.get("zip_code"),
            country=parsed_result.get("country"),
            issue_date=parsed_result.get("issue_date"),
            expiration_date=parsed_result.get("expiration_date"),
            gender=parsed_result.get("gender"),
            height=parsed_result.get("height"),
            weight=parsed_result.get("weight"),
            eye_color=parsed_result.get("eye_color"),
            document_type=parsed_result.get("document_type"),
            issuing_authority=parsed_result.get("issuing_authority"),
            confidence=parsed_result.get("confidence", 0.0)
        )
        
        return IdCardParseResponse(
            filename=file.filename or "uploaded_image",
            parsed_data=id_card_info,
            confidence=parsed_result.get("confidence", 0.0)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ID card parsing failed: {str(e)}")