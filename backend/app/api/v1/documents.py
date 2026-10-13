from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.schemas.document import DocumentVerifyResponse
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post(
    "/verify",
    response_model=DocumentVerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Document ka OCR Pre-Screening & Quality Audit karein"
)
async def verify_document(
    file: UploadFile = File(..., description="Uploaded document (JPG, PNG, or PDF)"),
    document_type: str = Form("income", description="Type of document (income, aadhaar, caste, ration)")
):
    """
    DPDP Act 2023 Compliant In-Memory Document Audit:
    - File clarity, resolution, QR stamp aur validity check karta hai
    - RAM me audit karke masked identifier return karta hai (Zero permanent storage)
    - Expired Tehsil certificates ya blurry scans ko pehle hi warn karta hai
    """
    try:
        file_bytes = await file.read()
        return ocr_service.verify_document(
            file_bytes=file_bytes,
            filename=file.filename or "uploaded_document",
            document_type=document_type
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document OCR audit me takneeki samasya aayi: {str(e)}"
        )
