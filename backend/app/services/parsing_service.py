import os
import io
import fitz  # PyMuPDF
import docx  # python-docx

class ParsingService:
    @staticmethod
    def parse_pdf(file_content: bytes) -> dict:
        """
        Parses a PDF file content and extracts the text and page count.
        """
        try:
            # Open PDF from bytes
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            page_count = len(doc)
            doc.close()
            return {
                "raw_text": text.strip(),
                "page_count": page_count or 1
            }
        except Exception as e:
            raise ValueError(f"Error parsing PDF file: {str(e)}")

    @staticmethod
    def parse_docx(file_content: bytes) -> dict:
        """
        Parses a DOCX file content and extracts the text and approximate page count.
        """
        try:
            # Open DOCX from bytes
            doc = docx.Document(io.BytesIO(file_content))
            paragraphs = [p.text for p in doc.paragraphs]
            text = "\n".join(paragraphs)
            
            # DOCX does not have an explicit page count property easily accessible without rendering.
            # We estimate pages based on character count (approx 3000 chars per page).
            char_count = len(text)
            page_count = max(1, char_count // 3000)
            
            return {
                "raw_text": text.strip(),
                "page_count": page_count
            }
        except Exception as e:
            raise ValueError(f"Error parsing DOCX file: {str(e)}")

    @classmethod
    def parse_resume(cls, filename: str, file_content: bytes) -> dict:
        """
        Detects the file extension and routes it to the appropriate parser.
        """
        ext = os.path.splitext(filename.lower())[1]
        if ext == ".pdf":
            return cls.parse_pdf(file_content)
        elif ext in [".docx", ".doc"]:
            return cls.parse_docx(file_content)
        else:
            raise ValueError(f"Unsupported file type: {ext}. Only PDF and DOCX are allowed.")
