#!/bin/bash

# --- Environment Setup: Source the .env file ---
# Path goes UP one level (..) to find the .env file.
ENV_FILE="$(dirname "$0")/../.env"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# --- SQL Command ---
SQL_COMMAND="
    INSERT INTO inventory (BranchID, Date)
    SELECT 
        b.BranchID, 
        DATE_FORMAT(CURDATE(), '%Y-%m-01')
    FROM 
        branch b 
    ON DUPLICATE KEY UPDATE 
        Date = VALUES(Date);
"

# --- Execute the SQL (CRITICAL MODIFICATION HERE) ---
echo "Running monthly inventory creation script..."
# Now includes the -h flag using the DB_HOST variable
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -e"$SQL_COMMAND" 

if [ $? -eq 0 ]; then
    echo "Inventory headers created successfully."
else
    echo "ERROR: Inventory creation failed! Check DB_HOST, credentials, and firewall settings."
    exit 1
fi