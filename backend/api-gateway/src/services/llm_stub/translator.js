/**
 * Mock NL → DSL translator
 * Deterministic stub (NO real LLM)
 */

function translateNLToDSL(query) {
  const q = query.toLowerCase();

  // 1️⃣ PE < N or PE less than N
  if (q.includes('pe') && (q.includes('<') || q.includes('less than'))) {
    const valueMatch = q.match(/(?:<|less than)\s*(\d+)/);
    const value = valueMatch ? Number(valueMatch[1]) : 30;
    return {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '<', value }
        ]
      }
    };
  }

  // 1b️⃣ PE > N or PE greater than N
  if (q.includes('pe') && (q.includes('>') || q.includes('greater than'))) {
    const valueMatch = q.match(/(?:>|greater than)\s*(\d+)/);
    const value = valueMatch ? Number(valueMatch[1]) : 10;
    return {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '>', value }
        ]
      }
    };
  }

  // 2️⃣ PE < N AND revenue growth > M
  if (q.includes('pe') && q.includes('revenue')) {
    return {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '<', value: 30 },
          { field: 'revenue_growth_yoy', operator: '>', value: 10 }
        ]
      }
    };
  }

  // 3️⃣ PEG < N AND EPS growth > M  ✅ REQUIRED
  if (q.includes('peg') && q.includes('eps')) {
    // Extract PEG value if specified
    const pegMatch = q.match(/peg\s*[<>]\s*(\d+)/);
    const pegValue = pegMatch ? Number(pegMatch[1]) : 3;
    
    // Extract EPS growth value if specified  
    const epsMatch = q.match(/eps.*growth\s*>\s*(\d+)/);
    const epsValue = epsMatch ? Number(epsMatch[1]) : 10;
    
    return {
      filter: {
        and: [
          {
            field: 'peg_ratio',
            operator: '<',
            value: pegValue
          },
          {
            field: 'eps_cagr',
            operator: '>',
            value: epsValue,
            window: {
              type: 'years',
              length: 3
            }
          }
        ]
      }
    };
  }

  // 4️⃣ EPS positive last 4 quarters
  if (q.includes('positive') && q.includes('eps')) {
    return {
      filter: {
        and: [
          {
            field: 'eps',
            operator: '>',
            value: 0,
            window: {
              type: 'quarters',
              length: 4,
              aggregation: 'avg'
            }
          }
        ]
      }
    };
  }

  // Default fallback - return a simple PE filter
  console.warn(`Unsupported query format: "${query}", using default PE < 30`);
  return {
    filter: {
      and: [
        { field: 'pe_ratio', operator: '<', value: 30 }
      ]
    }
  };
}

module.exports = translateNLToDSL;