# Advanced Screener User Guide

## Overview

The Advanced Stock Screener allows you to filter stocks using natural language queries and advanced financial metrics. This guide explains how to use the screener, understand results, view company fundamentals, and manage your screening results.

---

## Table of Contents

1. [Running Advanced Filters](#running-advanced-filters)
2. [Understanding Screener Results](#understanding-screener-results)
3. [Viewing Company Fundamentals](#viewing-company-fundamentals)
4. [Exporting Results](#exporting-results)
5. [Saving Results Temporarily](#saving-results-temporarily)
6. [Advanced Metrics Explained](#advanced-metrics-explained)
7. [Known Limitations](#known-limitations)

---

## Running Advanced Filters

### Basic Usage

1. Navigate to the **Screener Query** screen
2. Enter your screening query in natural language
3. Tap **Run Screener** to execute

### Supported Query Patterns

#### Simple Filters
- `PE less than 20`
- `Revenue growth greater than 10`
- `EPS greater than 2`

#### Combined Filters (AND)
- `PE less than 20 AND revenue growth greater than 15`
- `PEG less than 3 AND EPS growth positive`

#### Advanced Derived Metrics
- `PEG less than 3` - Filters by Price-to-Earnings Growth ratio
- `Debt to FCF less than 5` - Filters by Debt-to-Free-Cash-Flow ratio

#### Temporal Filters
- `Positive EPS last 4 quarters` - Checks EPS trend over time
- `Revenue growth last 2 years` - Analyzes growth over multiple periods

### Query Examples

**Example 1: Value Stocks**
```
PE less than 15 AND PEG less than 2
```

**Example 2: Growth Stocks**
```
Revenue growth greater than 20 AND EPS growth positive
```

**Example 3: Financial Health**
```
Debt to FCF less than 3 AND positive earnings last 4 quarters
```

---

## Understanding Screener Results

### Result Card Components

Each result card displays:

1. **Company Symbol & Name**
   - Ticker symbol (e.g., TCS, INFY)
   - Full company name

2. **Core Metrics**
   - Basic financial ratios (PE, PB, etc.)
   - Displayed as badges for quick scanning

3. **Derived Metrics**
   - Advanced calculated metrics (PEG, Debt-to-FCF, etc.)
   - Shows why the stock matched your advanced filters

4. **Matched Conditions**
   - Lists all filter conditions that the stock satisfied
   - Provides transparency on why each stock appears in results

5. **Time Context**
   - Indicates temporal windows used (e.g., "Last 4 quarters")
   - Shows the time period analyzed

### Interpreting Results

- **Tap any result card** to view detailed company fundamentals
- **Green checkmarks** indicate matched conditions
- **Derived metrics** show computed values used in filtering

---

## Viewing Company Fundamentals

### Accessing Company Details

1. From the **Results** screen, tap any company card
2. Navigate to the **Company Detail** screen

### Available Information

#### Trailing Twelve Month (TTM) Metrics
- **Revenue (TTM)** - Sum of last 4 quarters
- **EPS (TTM)** - Trailing twelve months earnings per share
- **EBITDA (TTM)** - Trailing twelve months EBITDA
- **Net Income (TTM)** - Trailing twelve months net income
- **PE Ratio** - Price-to-Earnings ratio
- **PEG Ratio** - Price-to-Earnings Growth ratio (if calculable)

#### Growth Trends
- **QoQ (Quarter-over-Quarter)** - Growth compared to previous quarter
- **YoY (Year-over-Year)** - Growth compared to same quarter last year
- Visual indicators:
  - ↑ Green arrow = Positive growth
  - ↓ Red arrow = Negative growth
  - → Gray arrow = No change

#### Quarterly Metrics
- View up to 8 quarters of historical data
- Includes:
  - Revenue
  - EBITDA
  - Net Income
  - EPS
  - PE Ratio (when available)

### Expandable Sections

All sections can be expanded/collapsed:
- Tap section headers to toggle visibility
- Helps focus on specific metrics

---

## Exporting Results

### How to Export

1. From the **Results** screen, tap **Export CSV**
2. Choose your sharing method (email, file manager, etc.)
3. CSV file will be generated with all result data

### Exported Data Includes

- Company symbol and name
- All core metrics
- Derived metrics used in filtering
- Matched conditions
- Original query
- Timestamp of screener run

### CSV Format

The exported CSV includes:
- Headers in first row
- One row per company
- All metrics as separate columns
- Matched conditions as semicolon-separated list

---

## Saving Results Temporarily

### How to Save

1. From the **Results** screen, tap **Save**
2. Results are saved locally on your device
3. No login required

### Saved Results Features

- **Survives app navigation** - Results persist when navigating away
- **Survives short restarts** - Available after closing/reopening app
- **Last 10 searches** - Automatically manages storage (keeps most recent 10)

### Limitations

- **Not persistent across app updates** - May be cleared
- **Device-specific** - Not synced across devices
- **No authentication** - Local storage only

---

## Advanced Metrics Explained

### PEG Ratio (Price-to-Earnings Growth)

**Formula:** `PEG = PE Ratio / EPS Growth Rate`

**Interpretation:**
- PEG < 1: Potentially undervalued
- PEG = 1: Fairly valued
- PEG > 1: Potentially overvalued

**Safety Rules:**
- Only calculated when EPS growth is positive
- Requires valid PE ratio and EPS growth data

### Debt-to-Free-Cash-Flow (Debt-to-FCF)

**Formula:** `Debt-to-FCF = Total Debt / Free Cash Flow`

**Interpretation:**
- Lower values indicate better financial health
- < 3: Strong financial position
- > 5: Higher debt burden relative to cash generation

**Safety Rules:**
- Only calculated when Free Cash Flow > 0
- Returns null if FCF is negative or zero

### EPS Growth

**Calculation:** `((Current EPS - Previous EPS) / Previous EPS) × 100`

**Temporal Windows:**
- **QoQ**: Quarter-over-quarter growth
- **YoY**: Year-over-year growth
- **CAGR**: Compound Annual Growth Rate (for multi-year periods)

---

## Temporal Rules

### "Last N Quarters"

When you use temporal filters like "positive earnings last 4 quarters":

1. System fetches last N quarters of data
2. Validates each quarter meets the condition
3. Only includes stocks where ALL quarters pass

### Example

**Query:** `Positive EPS last 4 quarters`

**Process:**
1. Fetch last 4 quarters of EPS data
2. Check each quarter: EPS > 0
3. Only return stocks where all 4 quarters have positive EPS

---

## Known Limitations

### Data Availability

- **Missing Data**: Some companies may not have complete quarterly data
- **Data Freshness**: Fundamentals updated quarterly (may lag current date)
- **Coverage**: Not all stocks have all metrics available

### Derived Metrics

- **PEG Ratio**: Requires positive EPS growth (excludes negative growth stocks)
- **Debt-to-FCF**: Requires positive Free Cash Flow (excludes companies with negative FCF)
- **Temporal Metrics**: Requires sufficient historical data (minimum 2 quarters for QoQ, 4 for YoY)

### Query Limitations

- **Natural Language**: Supports common patterns but not all variations
- **Complex Logic**: OR conditions and nested logic may not be fully supported
- **Ambiguous Queries**: Vague terms like "cheap" or "good growth" are rejected

### Export Limitations

- **Mobile Share**: Uses device share functionality (may vary by platform)
- **File Size**: Large result sets may have performance impact
- **Format**: CSV format only (no Excel or PDF export)

### Storage Limitations

- **Temporary Only**: Saved results are not permanent
- **No Cloud Sync**: Results stored locally only
- **Storage Limit**: Maximum 10 saved searches

---

## Best Practices

1. **Be Specific**: Use exact metrics and thresholds (e.g., "PE < 20" not "cheap stocks")
2. **Combine Filters**: Use AND conditions to narrow results effectively
3. **Check Fundamentals**: Always review detailed fundamentals before making decisions
4. **Export Important Results**: Export results you want to keep long-term
5. **Understand Metrics**: Familiarize yourself with derived metrics before using them

---

## Troubleshooting

### No Results Found

- **Check Query**: Ensure query syntax is correct
- **Relax Filters**: Try less restrictive conditions
- **Verify Data**: Some stocks may not have required data

### Missing Fundamentals

- **Data Availability**: Not all companies have complete data
- **Try Different Stock**: Some stocks have limited coverage
- **Check Backend**: Data may be updating

### Export Not Working

- **Check Permissions**: Ensure app has file/share permissions
- **Try Share Method**: Use device share functionality
- **Check Storage**: Ensure device has available storage

---

## Support

For issues or questions:
- Check query syntax against examples
- Review known limitations
- Verify data availability for specific stocks

---

## Version Information

- **Module**: Advanced Screener UI Enhancements, Results Management & Documentation
- **Milestone**: M3 - Advanced Filtering Logic Checkpoint
- **Last Updated**: 2025
