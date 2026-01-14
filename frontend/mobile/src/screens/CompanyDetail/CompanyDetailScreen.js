import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getCompanyFundamentals } from '../../services/api/fundamentals';

/**
 * Trend indicator component
 */
function TrendIndicator({ value, label }) {
  if (value === null || value === undefined) {
    return (
      <View style={styles.trendRow}>
        <Text style={styles.trendLabel}>{label}</Text>
        <Text style={styles.trendValue}>—</Text>
      </View>
    );
  }

  const isPositive = value > 0;
  const indicator = isPositive ? '↑' : value < 0 ? '↓' : '→';
  const color = isPositive ? '#4CAF50' : value < 0 ? '#F44336' : '#757575';

  return (
    <View style={styles.trendRow}>
      <Text style={styles.trendLabel}>{label}</Text>
      <View style={styles.trendValueContainer}>
        <Text style={[styles.trendIndicator, { color }]}>{indicator}</Text>
        <Text style={[styles.trendValue, { color }]}>
          {value > 0 ? '+' : ''}{value.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

/**
 * Metric row component
 */
function MetricRow({ label, value, formatter }) {
  const formattedValue = formatter ? formatter(value) : value;
  
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {formattedValue !== null && formattedValue !== undefined
          ? formattedValue
          : 'N/A'}
      </Text>
    </View>
  );
}

/**
 * Format large numbers (revenue, EBITDA, etc.)
 */
function formatCurrency(value) {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Format ratio values
 */
function formatRatio(value) {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(2);
}

export default function CompanyDetailScreen({ route, navigation }) {
  const { ticker, companyName } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [fundamentals, setFundamentals] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    quarterly: true,
    ttm: true,
    trends: true,
  });

  useEffect(() => {
    loadFundamentals();
  }, [ticker]);

  const loadFundamentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanyFundamentals(ticker);
      setFundamentals(data);
    } catch (err) {
      console.error('Error loading fundamentals:', err);
      setError('Failed to load company fundamentals');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading fundamentals...</Text>
      </View>
    );
  }

  if (error || !fundamentals) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'No data available'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadFundamentals}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { quarterly, ttm, trends } = fundamentals;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.ticker}>{ticker}</Text>
        {companyName && (
          <Text style={styles.companyName}>{companyName}</Text>
        )}
      </View>

      {/* TTM Metrics Section */}
      {ttm && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('ttm')}
          >
            <Text style={styles.sectionTitle}>
              Trailing Twelve Month (TTM) Metrics
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.ttm ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {expandedSections.ttm && (
            <View style={styles.sectionContent}>
              <MetricRow
                label="Revenue (TTM)"
                value={ttm.revenue}
                formatter={formatCurrency}
              />
              <MetricRow
                label="EPS (TTM)"
                value={ttm.eps}
                formatter={formatRatio}
              />
              <MetricRow
                label="EBITDA (TTM)"
                value={ttm.ebitda}
                formatter={formatCurrency}
              />
              <MetricRow
                label="Net Income (TTM)"
                value={ttm.net_income}
                formatter={formatCurrency}
              />
              <MetricRow
                label="PE Ratio"
                value={ttm.pe_ratio}
                formatter={formatRatio}
              />
              {ttm.peg_ratio && (
                <MetricRow
                  label="PEG Ratio"
                  value={ttm.peg_ratio}
                  formatter={formatRatio}
                />
              )}
            </View>
          )}
        </View>
      )}

      {/* Trends Section */}
      {trends && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('trends')}
          >
            <Text style={styles.sectionTitle}>Growth Trends</Text>
            <Text style={styles.expandIcon}>
              {expandedSections.trends ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {expandedSections.trends && (
            <View style={styles.sectionContent}>
              <TrendIndicator
                value={trends.revenue_qoq}
                label="Revenue QoQ"
              />
              <TrendIndicator
                value={trends.revenue_yoy}
                label="Revenue YoY"
              />
              <TrendIndicator value={trends.eps_qoq} label="EPS QoQ" />
              <TrendIndicator value={trends.eps_yoy} label="EPS YoY" />
              <TrendIndicator
                value={trends.ebitda_qoq}
                label="EBITDA QoQ"
              />
              <TrendIndicator
                value={trends.ebitda_yoy}
                label="EBITDA YoY"
              />
            </View>
          )}
        </View>
      )}

      {/* Quarterly Metrics Section */}
      {quarterly && quarterly.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('quarterly')}
          >
            <Text style={styles.sectionTitle}>
              Quarterly Metrics ({quarterly.length} quarters)
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.quarterly ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          {expandedSections.quarterly && (
            <View style={styles.sectionContent}>
              {quarterly.map((quarter, index) => (
                <View key={index} style={styles.quarterCard}>
                  <Text style={styles.quarterTitle}>
                    {quarter.quarter || `${quarter.period_start} - ${quarter.period_end}`}
                  </Text>
                  <MetricRow
                    label="Revenue"
                    value={quarter.revenue}
                    formatter={formatCurrency}
                  />
                  <MetricRow
                    label="EBITDA"
                    value={quarter.ebitda}
                    formatter={formatCurrency}
                  />
                  <MetricRow
                    label="Net Income"
                    value={quarter.net_income}
                    formatter={formatCurrency}
                  />
                  <MetricRow
                    label="EPS"
                    value={quarter.eps}
                    formatter={formatRatio}
                  />
                  {quarter.pe_ratio && (
                    <MetricRow
                      label="PE Ratio"
                      value={quarter.pe_ratio}
                      formatter={formatRatio}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {(!quarterly || quarterly.length === 0) && (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>
            No quarterly data available for this company.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ticker: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  companyName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
  },
  sectionContent: {
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIndicator: {
    fontSize: 18,
    marginRight: 8,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  quarterCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  quarterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
