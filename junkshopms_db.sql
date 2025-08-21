-- DROP DATABASE IF EXISTS junkshopms_db;
-- CREATE DATABASE junkshopms_db;
-- GRANT ALL ON junkshopms_db.* TO 'owner'@'localhost';

-- USE junkshopms_db;

CREATE TABLE user (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    UserType ENUM('owner', 'employee') NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branch (
    BranchID INT AUTO_INCREMENT PRIMARY KEY,
    Location VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buyer (
    BuyerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seller (
    SellerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shift (
    ShiftID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    UserID INT NOT NULL,
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE transaction (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    BranchID INT NOT NULL,
    BuyerID INT NOT NULL,
    SellerID INT NOT NULL,
    UserID INT NOT NULL,
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BranchID) REFERENCES branch(BranchID),
    FOREIGN KEY (BuyerID) REFERENCES buyer(BuyerID),
    FOREIGN KEY (SellerID) REFERENCES seller(SellerID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE transaction_item (
    TransactionItemID INT AUTO_INCREMENT PRIMARY KEY,
    TransactionID INT NOT NULL,
    ItemName VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID)
);

CREATE TABLE inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transaction (
    InventoryTransactionID INT AUTO_INCREMENT PRIMARY KEY,
    InventoryID INT NOT NULL,
    TransactionID INT NOT NULL,
    Quantity INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryID) REFERENCES inventory(InventoryID),
    FOREIGN KEY (TransactionID) REFERENCES transaction(TransactionID)
);

CREATE TABLE pricelist (
    PriceListID INT AUTO_INCREMENT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pricelist_history (
    PriceListHistoryID INT AUTO_INCREMENT PRIMARY KEY,
    PriceListID INT NOT NULL,
    OldPrice DECIMAL(10, 2) NOT NULL,
    NewPrice DECIMAL(10, 2) NOT NULL,
    ChangeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PriceListID) REFERENCES pricelist(PriceListID)
);

CREATE TABLE user_activity (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ActivityType ENUM('login', 'logout', 'transaction', 'inventory_update') NOT NULL,
    ActivityDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

CREATE TABLE inventory_activity (
    ActivityID INT AUTO_INCREMENT PRIMARY KEY,
    InventoryID INT NOT NULL,
    ActivityType ENUM('add', 'remove', 'update') NOT NULL,
    ActivityDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryID) REFERENCES inventory(InventoryID)
);
