import psycopg2
import json

def check_alerts():
    conn = psycopg2.connect("...") # Use config
    cur = conn.cursor()
    
    # 1. Fetch active alerts
    cur.execute("SELECT id, user_id, ticker, condition_json FROM user_alerts WHERE is_active = TRUE")
    alerts = cur.fetchall()
    
    for alert in alerts:
        alert_id, user_id, ticker, condition = alert
        
        # 2. Fetch current market data (Mocked)
        # current_price = market_data_service.get_price(ticker)
        current_price = 145.00 # Example
        
        # 3. Evaluate Logic
        # Condition structure example: {"operator": "<", "value": 150}
        triggered = False
        if condition['operator'] == '<' and current_price < condition['value']:
            triggered = True
        elif condition['operator'] == '>' and current_price > condition['value']:
            triggered = True
            
        # 4. Trigger Notification
        if triggered:
            print(f"ALERT TRIGGERED for User {user_id} on {ticker}")
            # Insert into notifications table or send Push Notification via Firebase
            
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_alerts()