from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Femme.Fibre Catalog Service")

# This is the vital security clearance line that tells your browser
# it is allowed to display the catalog cards on your HTML page!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomizationRequest(BaseModel):
    item_id: str
    custom_fabric: str
    notes: str

@app.get("/")
def read_root():
    return {"brand": "Femme.Fibre", "service": "Catalog Service", "status": "Online"}

@app.get("/catalog/collection")
def get_collection():
    return [
        {"id": "item_01", "name": "Bonnet", "base_price": 120, "category": "Bonnets"},
        {"id": "item_02", "name": "Top", "base_price": 295.00, "category": "Outerwear"}
    ]

@app.post("/catalog/customize")
def request_customization(request: CustomizationRequest):
    return {
        "request_id": "cust_req_777",
        "status": "Reviewing Fabric Availability",
        "item_id": request.item_id,
        "customizations": {
            "fabric_requested": request.custom_fabric,
            "tailor_notes": request.notes
        }
    }