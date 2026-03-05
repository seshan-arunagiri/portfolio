from pypdf import PdfReader
reader = PdfReader("seshanResumeF.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"
with open("resume_text.txt", "w", encoding="utf-8") as f:
    f.write(text)
