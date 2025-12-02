# Screening Rule Engine Specification

The rule engine uses a lightweight DSL (domain-specific language) to evaluate customer attributes and flag them based on screening rules.

---

## 1. Rule Structure (DSL Format)

A rule follows the structure:

RULE <RULE_NAME>
IF <condition>
THEN <action>

## 2. Supported Operators

| Operator | Meaning |
|----------|---------|
| == | Equal |
| != | Not equal |
| > | Greater than |
| < | Less than |
| >= | Greater or equal |
| <= | Less or equal |
| AND | Logical AND |
| OR | Logical OR |

---

## 3. Available Attributes
- account_balance  
- transaction_count  
- last_login_date  
- risk_score  
- customer_id  
- phone_number  

---

## 4. Example Rules

### **1. Low Balance Frequent Trader**
RULE LOW_BAL_FREQ
IF account_balance < 1000 AND transaction_count > 30
THEN FLAG HIGH_RISK


### **2. Dormant Customer**
RULE DORMANT
IF last_login_date < TODAY - 60
THEN FLAG INACTIVE



### **3. High Net Worth**
RULE HNI
IF account_balance >= 1000000
THEN FLAG PRIORITY


## 5. Output Format

| Field | Example |
|--------|---------|
| rule_name | LOW_BAL_FREQ |
| triggered | TRUE |
| action | HIGH_RISK |
| timestamp | 2025-12-05 10:35:00 |

---

## 6. Evaluation Flow
1. Load customer attributes from data model  
2. Evaluate rules sequentially  
3. For each triggered rule → return flag  
4. Aggregate results for downstream use




