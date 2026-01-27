import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { postJson } from "../../services/http";

const PortfolioCard = ({ item, onDelete, onView }) => {
  const isPositive = (item.unrealized_gain || 0) >= 0;
  
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.portfolioName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.portfolioDesc} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Positions</Text>
          <Text style={styles.statValue}>{item.position_count || 0}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Value</Text>
          <Text style={styles.statValue}>
            ${(item.total_value || 0).toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Gain/Loss</Text>
          <Text style={[styles.statValue, { color: isPositive ? "#10b981" : "#ef4444" }]}>
            {isPositive ? "+" : ""}{(item.unrealized_gain || 0).toFixed(0)}
          </Text>
        </View>
      </View>

      {/* View Button */}
      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>View Details</Text>
        <Text style={styles.viewButtonArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function PortfolioScreen() {
  const { user } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPortfolios();
  }, []);

  async function loadPortfolios() {
    try {
      setLoading(true);
      const response = await postJson("/api/v1/portfolio", {
        action: "list",
      });

      if (response.success) {
        setPortfolios(response.portfolios || []);
      } else {
        setError(response.error || "Failed to load portfolios");
      }
    } catch (e) {
      setError(e.message || "Error loading portfolios");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePortfolio() {
    if (!newPortfolioName.trim()) {
      setError("Portfolio name is required");
      return;
    }

    try {
      const response = await postJson("/api/v1/portfolio", {
        action: "create",
        name: newPortfolioName,
        description: newPortfolioDesc,
      });

      if (response.success) {
        setNewPortfolioName("");
        setNewPortfolioDesc("");
        setShowCreateModal(false);
        await loadPortfolios();
      } else {
        setError(response.error || "Failed to create portfolio");
      }
    } catch (e) {
      setError(e.message || "Error creating portfolio");
    }
  }

  async function handleDeletePortfolio(portfolioId) {
    try {
      const response = await postJson("/api/v1/portfolio", {
        action: "delete",
        portfolioId,
      });

      if (response.success) {
        await loadPortfolios();
      } else {
        setError(response.error || "Failed to delete portfolio");
      }
    } catch (e) {
      setError(e.message || "Error deleting portfolio");
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.iconText}>💼</Text>
          </View>
          <View>
            <Text style={styles.title}>My Portfolios</Text>
            <Text style={styles.subtitle}>Manage your investments</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setError("");
            setShowCreateModal(true);
          }}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {/* Content */}
      {portfolios.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No portfolios yet</Text>
          <Text style={styles.emptySubtext}>Create a portfolio to start tracking your investments</Text>
        </View>
      ) : (
        <FlatList
          data={portfolios}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PortfolioCard
              item={item}
              onDelete={() => handleDeletePortfolio(item.id)}
              onView={() => {}}
            />
          )}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}

      {/* Create Portfolio Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Portfolio</Text>

            <TextInput
              style={styles.input}
              placeholder="Portfolio Name"
              placeholderTextColor="#999"
              value={newPortfolioName}
              onChangeText={setNewPortfolioName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={newPortfolioDesc}
              onChangeText={setNewPortfolioDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreatePortfolio}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginTop: 2,
  },
  createButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: 13,
    color: "#991b1b",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  portfolioDesc: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  deleteBtn: {
    padding: 6,
    marginRight: -6,
  },
  deleteBtnIcon: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },
  viewButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  viewButtonArrow: {
    fontSize: 14,
    color: "white",
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    color: "#111",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#f59e0b",
  },
  confirmButtonText: {
    fontWeight: "800",
    color: "white",
    fontSize: 14,
  },
});

