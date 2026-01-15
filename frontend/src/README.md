\# Frontend UI/UX Improvements \& Company Detail Page



\## UI State Flow

Each screen follows a consistent async flow:



loading → success → no-data → error



\### States

\- Loading: spinner shown while API fetch runs

\- Success: render data

\- No Data: friendly fallback text

\- Error: retry button + message



---



\## Company Detail Page



\### Navigation

Screener Results → Company Detail



```ts

navigation.navigate("CompanyDetail", { ticker: "TCS" });



