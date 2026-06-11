from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Femme.Fibre Client Service")

# This middleware configuration tells your browser that it is 100% safe 
# to pull data from this container to your frontend HTML file.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_CLIENT_PROFILE = {
    "id": "client_101",
    "name": "Amara Diallo",
    "measurements": {
        "bust": "36 inches",
        "waist": "28 inches",
        "hips": "39 inches",
        "height": "5'8\""
    },
    "style_notes": "Prefers sustainable linen and bold silhouettes."
}

MOCK_ORDERS = [
    {
        "order_id": "ff_901", 
        "item": "Signature Fibre Jumpsuit", 
        "status": "Pattern Cutting", 
        "estimated_delivery": "2026-08-12"
    }
]

@app.get("/")
def read_root():
    return {"brand": "Femme.Fibre", "service": "Client Service", "status": "Online"}

@app.get("/client/profile")
def get_profile():
    return MOCK_CLIENT_PROFILE

@app.get("/client/orders")
def get_orders():
    return MOCK_ORDERS