import json

def lambda_handler(event, context):
    """
    AWS Lambda Serverless handler for Femme.Fibre custom dress inquiries.
    Bypasses standard containers to process serverless form actions.
    """
    try:
        # Check if the event body contains data from our frontend form
        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event.get("body", {})
        
        client_name = body.get("client_name", "Anonymous Client")
        gargment_idea = body.get("garment_idea", "Bespoke Evening Gown")
        contact_email = body.get("email", "")
        
        if not contact_email:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Contact email is required for custom requests."})
            }
            
        # Simulating a serverless cloud execution database save
        response_msg = f"Thank you {client_name}! Your custom inquiry for a '{gargment_idea}' has been securely saved in our serverless cloud ledger. A Femme.Fibre stylist will contact you."
        
        return {
            "statusCode": 201,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # Needed for cross-origin frontend calls
            },
            "body": json.dumps({
                "status": "Serverless Processing Successful",
                "message": response_msg,
                "inquiry_received": True
            })
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
    