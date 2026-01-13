\# LLM Stub Integration Notes



\## Flow

Frontend NL Query →

LLM Stub →

DSL Validation →

Screener Compiler →

SQL Execution



\## Guarantees

\- Stub returns deterministic DSL

\- No unsafe execution

\- Real LLM can replace stub without API changes



\## Assumptions

\- DSL schema already finalized

\- Screener accepts same DSL format



