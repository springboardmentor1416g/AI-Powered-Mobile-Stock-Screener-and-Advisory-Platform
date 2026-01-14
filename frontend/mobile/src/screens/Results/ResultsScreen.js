import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { enrichScreenerResults } from '../../adapters/enrichScreenerResults';
import { generateCSV, exportToCSV } from '../../utils/csvExport';
import { saveResults } from '../../utils/storage';

export default function ResultsScreen({ route, navigation }) {
  const { results = [], query = '', timestamp } = route.params || {};
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Enrich results once
  const enrichedResults = useMemo(
    () => enrichScreenerResults(results, query),
    [results, query]
  );

  const handleCompanyPress = (item) => {
    navigation.navigate('CompanyDetail', {
      ticker: item.symbol,
      companyName: item.name,
    });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = generateCSV(enrichedResults, query, timestamp);
      const filename = `screener_results_${new Date().toISOString().split('T')[0]}.csv`;
      await exportToCSV(csvContent, filename, Share);
      Alert.alert('Success', 'Results exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export results');
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveResults(enrichedResults, query, timestamp);
      if (success) {
        Alert.alert('Success', 'Results saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save results');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with actions */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Screener Results</Text>
          <Text style={styles.count}>{enrichedResults.length} results</Text>
        </View>
        
        {query && (
          <Text style={styles.queryText} numberOfLines={2}>
            Query: {query}
          </Text>
        )}

        {/* Action buttons */}
        {enrichedResults.length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.actionButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExport}
              disabled={exporting}
            >
              <Text style={styles.actionButtonText}>
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results list */}
      {enrichedResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={enrichedResults}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleCompanyPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>

              {/* Core Metrics */}
              <View style={styles.metricsContainer}>
                {item.pe_ratio !== undefined && (
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricLabel}>PE</Text>
                    <Text style={styles.metricValue}>{item.pe_ratio}</Text>
                  </View>
                )}
              </View>

              {/* Derived Metrics */}
              {item.derived_metrics &&
                Object.keys(item.derived_metrics).length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Derived Metrics</Text>
                    <View style={styles.derivedMetricsContainer}>
                      {Object.entries(item.derived_metrics).map(
                        ([key, value]) => (
                          <View key={key} style={styles.derivedMetric}>
                            <Text style={styles.derivedMetricKey}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                            <Text style={styles.derivedMetricValue}>
                              {value}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                )}

              {/* Matched Conditions */}
              {item.matched_conditions?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Matched Conditions</Text>
                  {item.matched_conditions.map((cond, idx) => (
                    <View key={idx} style={styles.conditionRow}>
                      <Text style={styles.conditionBullet}>•</Text>
                      <Text style={styles.condition}>{cond}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Time Context */}
              {item.time_context && (
                <View style={styles.timeContextContainer}>
                  <Text style={styles.timeContextLabel}>Time Window:</Text>
                  <Text style={styles.timeContext}>{item.time_context}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  queryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  exportButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  empty: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#2196F3',
  },
  name: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  derivedMetricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  derivedMetric: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    minWidth: 100,
  },
  derivedMetricKey: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  derivedMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  conditionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  conditionBullet: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 8,
  },
  condition: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  timeContextContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeContextLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  timeContext: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
