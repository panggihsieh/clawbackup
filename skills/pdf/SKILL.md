---
name: pdf
description: |
  Use this skill whenever the user wants to do anything with PDF files.
  This includes reading or extracting text/tables from PDFs, combining or merging
  multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks,
  creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images,
  and OCR on scanned PDFs to make them searchable.
  If the user mentions a .pdf file or asks to produce one, use this skill.
license: Proprietary
---

# PDF Processing Guide

## Overview

This guide covers essential PDF processing operations using Python libraries and command-line tools.

## Quick Start

```python
from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

### reportlab - Create PDFs

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Add text
c.drawString(100, height - 100, "Hello World!")

# Save
c.save()
```

## PDF Form Filling

### Check if PDF has fillable fields

```python
from pypdf import PdfReader

reader = PdfReader("form.pdf")
if "/AcroForm" in reader.trailer["/Root"]:
    print("This PDF has fillable form fields")
    for field in reader.get_fields():
        print(field)
```

### Fill form fields

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()

# Copy all pages
for page in reader.pages:
    writer.add_page(page)

# Fill fields
writer.add_annotation("/Tx", "field_name", "value")

with open("filled.pdf", "wb") as output:
    writer.write(output)
```

## OCR for Scanned PDFs

### Using pytesseract

```python
from pdf2image import convert_from_path
import pytesseract

# Convert PDF to images
images = convert_from_path("scanned.pdf")

# Perform OCR
text = ""
for image in images:
    text += pytesseract.image_to_string(image)
```

## Installation

```bash
pip install pypdf pdfplumber reportlab pdf2image pytesseract
```

For OCR, also install Tesseract:
```bash
# macOS
brew install tesseract

# Ubuntu
sudo apt-get install tesseract-ocr
```
