import os
import json
import base64
from typing import Dict, Any
from openai import AsyncOpenAI
from pydantic_settings import BaseSettings
from PIL import Image
import io


class GroqSettings(BaseSettings):
    groq_api_key: str = ""
    openai_api_key: str = ""
    model: str = "llama-3.1-8b-instant"
    vision_model: str = "gpt-4o"
    
    class Config:
        env_file = ".env"


settings = GroqSettings()


class DataParser:
    def __init__(self):
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model = settings.model
        
        # Initialize OpenAI client for vision tasks
        if settings.openai_api_key:
            self.vision_client = AsyncOpenAI(api_key=settings.openai_api_key)
        else:
            self.vision_client = None
    
    async def parse_data(self, input_text: str) -> Dict[str, Any]:
        system_prompt = """You are an expert at parsing personal information from unstructured text. 
        Extract personal information and structure it into the following specific fields:

        Required fields to extract (use null if not found):
        - name: Full name of the person
        - street: Street address including number and street name
        - city: City name
        - state: State or province
        - country: Country name
        - zip_code: ZIP or postal code
        - phone_number: Phone number in any format
        - email: Email address if present
        - confidence: Your confidence level (0.0 to 1.0) in the parsing accuracy

        Respond with ONLY a valid JSON object using these exact field names.
        
        Example input: "my name is Lewis Hamilton, I live in 2944 Monaco dr, Manchester, Colorado, USA, 92223. My phone number is 893-366-8888"
        Example output: {"name": "Lewis Hamilton", "street": "2944 Monaco dr", "city": "Manchester", "state": "Colorado", "country": "USA", "zip_code": "92223", "phone_number": "893-366-8888", "email": null, "confidence": 0.95}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Parse this text: {input_text}"}
                ],
                temperature=0.1,
                max_tokens=300
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(result)
                
                # Ensure confidence is present and valid
                if "confidence" not in parsed_data:
                    parsed_data["confidence"] = 0.8
                
                confidence = parsed_data.get("confidence", 0.8)
                if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
                    parsed_data["confidence"] = 0.8
                else:
                    parsed_data["confidence"] = float(confidence)
                
                return parsed_data
                
            except json.JSONDecodeError:
                print(f"Failed to parse JSON response: {result}")
                return self._get_default_response(input_text)
            
        except Exception as e:
            print(f"Error parsing data: {e}")
            return self._get_default_response(input_text)
    
    def _get_default_response(self, input_text: str) -> Dict[str, Any]:
        return {
            "original_input": input_text,
            "parsed_data": None,
            "confidence": 0.0,
            "error": "Failed to parse input"
        }
    
    async def parse_id_card(self, image_data: bytes, filename: str) -> Dict[str, Any]:
        if not self.vision_client:
            raise ValueError("OpenAI API key not configured for vision tasks")
        
        # Convert image to base64
        try:
            # Optimize image size if needed
            image = Image.open(io.BytesIO(image_data))
            if image.size[0] > 1024 or image.size[1] > 1024:
                image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save optimized image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr = img_byte_arr.getvalue()
            
            # Encode to base64
            base64_image = base64.b64encode(img_byte_arr).decode('utf-8')
            
        except Exception as e:
            return self._get_default_id_response(filename, f"Image processing error: {str(e)}")
        
        system_prompt = """You are an expert at extracting information from ID cards, driver's licenses, passports, and other identification documents. 

        Analyze the image and extract ALL visible information into the following structured format. Use null for any fields not found or not visible:

        Required fields to extract:
        - full_name: Complete name as shown on the document
        - first_name: First/given name only
        - last_name: Last/family name only  
        - date_of_birth: Date of birth in any format found
        - id_number: Any identification number (license number, ID number, etc.)
        - license_number: Specific license number if it's a driver's license
        - address: Complete address as shown
        - city: City name
        - state: State or province
        - zip_code: ZIP or postal code
        - country: Country if visible
        - issue_date: Date the document was issued
        - expiration_date: Date the document expires
        - gender: Gender designation (M/F/etc.)
        - height: Height if shown
        - weight: Weight if shown
        - eye_color: Eye color if shown
        - document_type: Type of document (Driver's License, Passport, National ID, etc.)
        - issuing_authority: Organization that issued the document
        - confidence: Your confidence level (0.0 to 1.0) in the extraction accuracy

        Respond with ONLY a valid JSON object using these exact field names. Be thorough and extract every piece of visible text information."""

        try:
            response = await self.vision_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": system_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            result = response.choices[0].message.content.strip()
            
            # Clean up markdown formatting if present
            if result.startswith('```json'):
                result = result.replace('```json', '').replace('```', '').strip()
            elif result.startswith('```'):
                result = result.replace('```', '').strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(result)
                
                # Ensure confidence is present and valid
                if "confidence" not in parsed_data:
                    parsed_data["confidence"] = 0.8
                
                confidence = parsed_data.get("confidence", 0.8)
                if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
                    parsed_data["confidence"] = 0.8
                else:
                    parsed_data["confidence"] = float(confidence)
                
                return parsed_data
                
            except json.JSONDecodeError:
                print(f"Failed to parse JSON response: {result}")
                return self._get_default_id_response(filename, "Failed to parse AI response")
            
        except Exception as e:
            print(f"Error parsing ID card: {e}")
            return self._get_default_id_response(filename, f"AI processing error: {str(e)}")
    
    def _get_default_id_response(self, filename: str, error: str = "Failed to parse ID card") -> Dict[str, Any]:
        return {
            "filename": filename,
            "parsed_data": {
                "full_name": None,
                "first_name": None,
                "last_name": None,
                "date_of_birth": None,
                "id_number": None,
                "license_number": None,
                "address": None,
                "city": None,
                "state": None,
                "zip_code": None,
                "country": None,
                "issue_date": None,
                "expiration_date": None,
                "gender": None,
                "height": None,
                "weight": None,
                "eye_color": None,
                "document_type": None,
                "issuing_authority": None,
                "confidence": 0.0
            },
            "confidence": 0.0,
            "error": error
        }


# Singleton instance
parser = None

def get_parser() -> DataParser:
    global parser
    if parser is None:
        parser = DataParser()
    return parser