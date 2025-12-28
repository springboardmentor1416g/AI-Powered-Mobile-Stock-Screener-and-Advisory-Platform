import React from 'react';
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../constants/colors';
import MetricRow from './MetricRow';

export default function StockCard({ item, highlightedFields = [] }) {
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 375;
  const cardWidth = width - (SPACING.lg * 2);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return null;
    const value = Number(num);
    if (value >= 1000) return (value / 1000).toFixed(2);
    return value.toFixed(2);
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined || isNaN(num)) return null;
    return Number(num).toFixed(2);
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined || isNaN(num)) return null;
    return Number(num).toFixed(2);
  };

  return (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <LinearGradient
        colors={isDarkMode ? ['#1e3a8a', '#1e40af'] : ['#dbeafe', '#bfdbfe']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.companyInfo}>
            <Text 
              style={[styles.ticker, { 
                color: isDarkMode ? '#fff' : '#1e40af',
                fontSize: isSmallScreen ? 20 : 24,
              }]}
              numberOfLines={1}
            >
              {item.ticker}
            </Text>
            <Text 
              style={[styles.companyName, { 
                color: isDarkMode ? '#e0e7ff' : '#3b82f6',
                fontSize: isSmallScreen ? 12 : 13,
              }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.cardContent, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.metricsContainer}>
          <MetricRow
            label="P/E Ratio"
            value={formatCurrency(item.pe_ratio)}
            isPrimary={true}
            isHighlighted={highlightedFields.includes('pe_ratio')}
          />
          <MetricRow
            label="ROE"
            value={formatPercentage(item.roe)}
            unit="%"
            isPrimary={true}
            isHighlighted={highlightedFields.includes('roe')}
          />
          <MetricRow
            label="Market Cap"
            value={formatNumber(item.market_cap)}
            unit=" Cr"
            isPrimary={true}
            isHighlighted={highlightedFields.includes('market_cap')}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.secondaryMetricsGrid}>
          <View style={styles.secondaryColumn}>
            <MetricRow
              label="P/B Ratio"
              value={formatCurrency(item.pb_ratio)}
              isHighlighted={highlightedFields.includes('pb_ratio')}
            />
            <MetricRow
              label="Revenue"
              value={formatNumber(item.revenue)}
              unit=" Cr"
              isHighlighted={highlightedFields.includes('revenue')}
            />
            <MetricRow
              label="EPS"
              value={formatCurrency(item.eps)}
              isHighlighted={highlightedFields.includes('eps')}
            />
          </View>
          <View style={styles.secondaryColumn}>
            <MetricRow
              label="ROA"
              value={formatPercentage(item.roa)}
              unit="%"
              isHighlighted={highlightedFields.includes('roa')}
            />
            <MetricRow
              label="Op. Margin"
              value={formatPercentage(item.operating_margin)}
              unit="%"
              isHighlighted={highlightedFields.includes('operating_margin')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradientHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  ticker: {
    fontWeight: '800',
    marginBottom: 2,
  },
  companyName: {
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.md,
  },
  metricsContainer: {
    marginBottom: SPACING.xs,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  secondaryMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  secondaryColumn: {
    flex: 1,
  },
});
